import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type SkuMeta = { productName?: string; collectionName?: string; format?: string }

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return new Response(JSON.stringify({ error: 'Sign in required' }), {
        status: 401, headers: { ...cors, 'Content-Type': 'application/json' }
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!
    const db = createClient(supabaseUrl, serviceKey)
    const authClient = createClient(supabaseUrl, anonKey)

    const { data: { user }, error: userErr } = await authClient.auth.getUser(token)
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401, headers: { ...cors, 'Content-Type': 'application/json' }
      })
    }

    const body = await req.json()
    const shipping = body.shipping ?? {}
    const skuMeta: Record<string, SkuMeta> = body.skuMeta ?? {}

    const required = ['name', 'phone', 'email', 'addressLine1', 'city', 'state', 'postalCode']
    const missing = required.filter((k) => !shipping[k])
    if (missing.length) {
      return new Response(JSON.stringify({ error: `Missing shipping fields: ${missing.join(', ')}` }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' }
      })
    }

    // The cart is the trusted source of what's being bought — never trust
    // items/prices/quantities sent directly by the client.
    const { data: cartItems, error: cartErr } = await db
      .from('cart_items')
      .select('sku, quantity')
      .eq('user_id', user.id)

    if (cartErr) throw cartErr
    if (!cartItems || cartItems.length === 0) {
      return new Response(JSON.stringify({ error: 'Your cart is empty' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' }
      })
    }

    const skus = cartItems.map((c) => c.sku)
    const { data: prices, error: priceErr } = await db
      .from('product_prices')
      .select('sku, price_cents, is_purchasable, stock_quantity')
      .in('sku', skus)

    if (priceErr) throw priceErr
    const priceMap = new Map((prices ?? []).map((p) => [p.sku, p]))

    const lineItems: { sku: string; quantity: number; unit_price_cents: number }[] = []
    let subtotal = 0

    for (const item of cartItems) {
      const p = priceMap.get(item.sku)
      if (!p || !p.is_purchasable || p.price_cents == null) {
        return new Response(JSON.stringify({ error: `${item.sku} is not available for purchase right now` }), {
          status: 409, headers: { ...cors, 'Content-Type': 'application/json' }
        })
      }
      if (p.stock_quantity < item.quantity) {
        return new Response(JSON.stringify({ error: `Not enough stock for ${item.sku}` }), {
          status: 409, headers: { ...cors, 'Content-Type': 'application/json' }
        })
      }
      lineItems.push({ sku: item.sku, quantity: item.quantity, unit_price_cents: p.price_cents })
      subtotal += p.price_cents * item.quantity
    }

    const { data: order, error: orderErr } = await db
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        subtotal_cents: subtotal,
        currency: 'INR',
        shipping_name: shipping.name,
        shipping_phone: shipping.phone,
        shipping_email: shipping.email,
        shipping_address_line1: shipping.addressLine1,
        shipping_address_line2: shipping.addressLine2 ?? null,
        shipping_city: shipping.city,
        shipping_state: shipping.state,
        shipping_postal_code: shipping.postalCode,
        shipping_country: shipping.country ?? 'India',
        notes: shipping.notes ?? null,
      })
      .select('id')
      .single()

    if (orderErr || !order) throw orderErr ?? new Error('Order insert failed')

    const itemsToInsert = lineItems.map((li) => {
      const meta = skuMeta[li.sku] ?? {}
      return {
        order_id: order.id,
        sku: li.sku,
        product_name: meta.productName ?? li.sku,
        collection_name: meta.collectionName ?? '',
        format: meta.format ?? '',
        unit_price_cents: li.unit_price_cents,
        quantity: li.quantity,
        line_total_cents: li.unit_price_cents * li.quantity,
      }
    })

    const { error: itemsErr } = await db.from('order_items').insert(itemsToInsert)
    if (itemsErr) throw itemsErr

    // Best-effort stock decrement (fine for v1; a single flash-sale race
    // window is not a concern at current scale).
    for (const li of lineItems) {
      const p = priceMap.get(li.sku)!
      await db.from('product_prices').update({ stock_quantity: p.stock_quantity - li.quantity }).eq('sku', li.sku)
    }

    await db.from('cart_items').delete().eq('user_id', user.id)

    return new Response(JSON.stringify({ ok: true, order_id: order.id, subtotal_cents: subtotal }), {
      status: 200, headers: { ...cors, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('create-order error:', err)
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' }
    })
  }
})
