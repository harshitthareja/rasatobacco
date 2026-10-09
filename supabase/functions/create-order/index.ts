import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { cors, getUser, json, serviceClient } from '../_shared/http.ts'
import { createRazorpayOrder, finalizeOrder, RazorpayError, razorpayKeyId } from '../_shared/razorpay.ts'
import { applyPairOffer } from '../_shared/offers.ts'

type SkuMeta = { productName?: string; collectionName?: string; format?: string }

// Creates an order from the caller's cart.
//  - payment_method 'cod': the order is confirmed immediately (stock reserved,
//    cart emptied); cash is collected by the courier on delivery.
//  - payment_method 'razorpay': a pending order plus a Razorpay order. Stock
//    and cart are only touched once verify-payment (or the webhook) confirms
//    a correctly signed payment.
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const user = await getUser(req)
    if (!user) return json({ error: 'Sign in required' }, 401)

    const db = serviceClient()
    const body = await req.json().catch(() => ({}))
    const shipping = body.shipping ?? {}
    const skuMeta: Record<string, SkuMeta> = body.skuMeta ?? {}
    const paymentMethod = body.payment_method === 'razorpay' ? 'razorpay' : 'cod'

    const required = ['name', 'phone', 'email', 'addressLine1', 'city', 'state', 'postalCode']
    const missing = required.filter((k) => !String(shipping[k] ?? '').trim())
    if (missing.length) return json({ error: `Missing shipping fields: ${missing.join(', ')}` }, 400)
    if (!/^\d{10}$/.test(String(shipping.phone).replace(/\D/g, '').slice(-10))) {
      return json({ error: 'Enter a valid 10-digit phone number' }, 400)
    }
    if (!/^\d{6}$/.test(String(shipping.postalCode).trim())) {
      return json({ error: 'Enter a valid 6-digit PIN code' }, 400)
    }

    // The cart is the trusted source of what's being bought — never trust
    // items/prices/quantities sent directly by the client.
    const { data: cartItems, error: cartErr } = await db
      .from('cart_items')
      .select('sku, quantity')
      .eq('user_id', user.id)
    if (cartErr) throw cartErr
    if (!cartItems || cartItems.length === 0) return json({ error: 'Your cart is empty' }, 400)

    const { data: prices, error: priceErr } = await db
      .from('product_prices')
      .select('sku, price_cents, sale_price_cents, sale_ends_at, is_purchasable, stock_quantity')
      .in('sku', cartItems.map((c) => c.sku))
    if (priceErr) throw priceErr
    const priceMap = new Map((prices ?? []).map((p) => [p.sku, p]))

    let lineItems: { sku: string; quantity: number; unit_price_cents: number; offer?: boolean }[] = []

    for (const item of cartItems) {
      const p = priceMap.get(item.sku)
      if (!p || !p.is_purchasable || p.price_cents == null) {
        return json({ error: `${skuMeta[item.sku]?.productName ?? item.sku} is not available for purchase right now` }, 409)
      }
      if (p.stock_quantity < item.quantity) {
        return json({ error: `Not enough stock for ${skuMeta[item.sku]?.productName ?? item.sku}` }, 409)
      }
      const onSale =
        p.sale_price_cents != null && p.sale_ends_at != null && new Date(p.sale_ends_at).getTime() > Date.now()
      const unit = onSale ? p.sale_price_cents : p.price_cents
      lineItems.push({ sku: item.sku, quantity: item.quantity, unit_price_cents: unit })
    }

    // Any two mouth tips for ₹150: paired tips become their own line at the offer price.
    lineItems = applyPairOffer(lineItems)
    const subtotal = lineItems.reduce((sum, li) => sum + li.unit_price_cents * li.quantity, 0)

    const { data: settings } = await db
      .from('store_settings')
      .select('shipping_flat_cents, free_shipping_threshold_cents')
      .eq('id', 1)
      .maybeSingle()
    const threshold = settings?.free_shipping_threshold_cents
    // Free delivery only when the subtotal is above the threshold.
    const shippingCharge =
      threshold != null && subtotal > threshold ? 0 : (settings?.shipping_flat_cents ?? 0)
    const total = subtotal + shippingCharge
    if (total < 100) return json({ error: 'Order total must be at least ₹1' }, 400)

    // A buyer who dismissed the payment window and retries would otherwise
    // leave a trail of unpaid orders — close out their earlier attempts.
    await db
      .from('orders')
      .update({ status: 'cancelled', payment_error: 'Superseded by a newer checkout', updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .eq('payment_status', 'pending')

    const { data: order, error: orderErr } = await db
      .from('orders')
      .insert({
        user_id: user.id,
        status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
        payment_status: 'pending',
        payment_method: paymentMethod,
        subtotal_cents: subtotal,
        shipping_charge_cents: shippingCharge,
        total_cents: total,
        currency: 'INR',
        shipping_name: String(shipping.name).trim(),
        shipping_phone: String(shipping.phone).trim(),
        shipping_email: String(shipping.email).trim(),
        shipping_address_line1: String(shipping.addressLine1).trim(),
        shipping_address_line2: shipping.addressLine2?.trim() || null,
        shipping_city: String(shipping.city).trim(),
        shipping_state: String(shipping.state).trim(),
        shipping_postal_code: String(shipping.postalCode).trim(),
        shipping_country: shipping.country?.trim() || 'India',
        notes: shipping.notes?.trim() || null,
      })
      .select('id')
      .single()
    if (orderErr || !order) throw orderErr ?? new Error('Order insert failed')

    const { error: itemsErr } = await db.from('order_items').insert(
      lineItems.map((li) => {
        const meta = skuMeta[li.sku] ?? {}
        return {
          order_id: order.id,
          sku: li.sku,
          product_name: meta.productName ?? li.sku,
          collection_name: meta.collectionName ?? '',
          format: li.offer ? `${meta.format ?? ''} · 2 for ₹150` : (meta.format ?? ''),
          unit_price_cents: li.unit_price_cents,
          quantity: li.quantity,
          line_total_cents: li.unit_price_cents * li.quantity,
        }
      }),
    )
    if (itemsErr) throw itemsErr

    if (paymentMethod === 'cod') {
      await finalizeOrder(db, order.id, user.id)
      return json({ ok: true, order_id: order.id, payment_method: 'cod', amount: total, currency: 'INR' })
    }

    let rzpOrder
    try {
      // Amounts are stored in paise already (the *_cents columns).
      rzpOrder = await createRazorpayOrder(total, order.id.slice(0, 40), { order_id: order.id, user_id: user.id })
    } catch (err) {
      await db
        .from('orders')
        .update({ status: 'cancelled', payment_status: 'failed', payment_error: String((err as Error).message) })
        .eq('id', order.id)
      if (err instanceof RazorpayError) return json({ error: err.message }, err.status)
      throw err
    }

    await db.from('orders').update({ razorpay_order_id: rzpOrder.id }).eq('id', order.id)

    return json({
      ok: true,
      order_id: order.id,
      payment_method: 'razorpay',
      razorpay_order_id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key_id: razorpayKeyId(),
    })
  } catch (err) {
    console.error('create-order error:', err)
    return json({ error: 'Unexpected error' }, 500)
  }
})
