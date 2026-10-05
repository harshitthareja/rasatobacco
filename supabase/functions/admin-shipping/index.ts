import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { cors, json, requireAdmin, serviceClient } from '../_shared/http.ts'
import { flexi, FlexiError, type FlexiAddress } from '../_shared/flexi.ts'
import { syncTracking } from '../_shared/shipments.ts'

const ORDER_COLUMNS =
  'id, status, payment_status, subtotal_cents, shipping_charge_cents, total_cents, currency, shipping_name, shipping_phone, shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_postal_code, shipment_tracking_number, shipment_status, order_items(sku, product_name, format, quantity, unit_price_cents)'

const rupees = (paise: number) => Math.round(paise) / 100

function toAddress(o: Record<string, string | null>): FlexiAddress {
  const [first, ...rest] = String(o.shipping_name ?? '').trim().split(/\s+/)
  return {
    first_name: first || 'Customer',
    last_name: rest.join(' ') || '.',
    contact_no: String(o.shipping_phone ?? '').replace(/\D/g, '').slice(-10),
    company: '',
    gst: '',
    address_1: o.shipping_address_line1 ?? '',
    address_2: o.shipping_address_line2 ?? '',
    pincode: String(o.shipping_postal_code ?? '').trim(),
    city: o.shipping_city ?? '',
    state: o.shipping_state ?? '',
  }
}

const failedFor = (failed: unknown, trackingNumber: string) =>
  Array.isArray(failed) && failed.some((f) => String(f).includes(trackingNumber))

// Flexi shipment operations for the admin app. Every action requires an
// authenticated user with an 'admin' row in public.user_roles.
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const db = serviceClient()
  const auth = await requireAdmin(req, db)
  if ('response' in auth) return auth.response

  try {
    const body = await req.json().catch(() => ({}))
    const action = body.action as string
    const now = new Date().toISOString()

    if (action === 'warehouses') {
      return json(await flexi.warehouses())
    }

    if (action === 'create') {
      const { order_id, box, warehouse_code, rto_warehouse_code, courier_code, hsn_code } = body
      if (!order_id || !box || !warehouse_code) {
        return json({ error: 'order_id, box and warehouse_code are required' }, 400)
      }
      const dims = ['length', 'breadth', 'height', 'weight'].map((k) => Number(box[k]))
      if (dims.some((d) => !Number.isFinite(d) || d <= 0)) {
        return json({ error: 'Box length, breadth, height and weight must be positive numbers' }, 400)
      }

      const { data: order } = await db.from('orders').select(ORDER_COLUMNS).eq('id', order_id).maybeSingle()
      if (!order) return json({ error: 'Order not found' }, 404)
      if (order.payment_status !== 'paid') return json({ error: 'Only paid orders can be shipped' }, 409)
      if (order.status === 'cancelled') return json({ error: 'Order is cancelled' }, 409)
      if (order.shipment_tracking_number && order.shipment_status !== 'cancelled') {
        return json({ error: 'A shipment already exists for this order' }, 409)
      }

      const address = toAddress(order as unknown as Record<string, string | null>)
      const orderNo = order.id.replace(/-/g, '').slice(0, 12).toUpperCase()
      const [length, breadth, height, weight] = dims
      const result = await flexi.createShipment({
        pay_mode: 'prepaid',
        order_no: orderNo,
        billing: address,
        shipping: address,
        currency: order.currency ?? 'INR',
        policy_accepted: true,
        total_amt: rupees(order.total_cents ?? order.subtotal_cents + (order.shipping_charge_cents ?? 0)),
        ship_charges: rupees(order.shipping_charge_cents ?? 0),
        box_data: [
          {
            length,
            breadth,
            height,
            weight,
            invoice_no: orderNo,
            items: (order.order_items ?? []).map((i: Record<string, unknown>) => ({
              item_name: `${i.product_name}${i.format ? ` ${i.format}` : ''}`,
              qnt: Number(i.quantity),
              amt: rupees(Number(i.unit_price_cents)),
              hsnCode: String(hsn_code || '2403'),
              sku: String(i.sku),
            })),
          },
        ],
        ...(courier_code ? { courier_code: Number(courier_code) } : {}),
        warehouse_code: String(warehouse_code),
        rto_warehouse_code: String(rto_warehouse_code || warehouse_code),
      })
      if (!result.tracking_number) return json({ error: result.message ?? 'Flexi did not return a tracking number' }, 502)

      await db
        .from('orders')
        .update({
          shipment_tracking_number: result.tracking_number,
          shipment_status: 'manifested',
          shipment_created_at: now,
          shipment_pickup_scheduled_at: null,
          shipment_label_url: null,
          shipment_events: null,
          status: 'processing',
          updated_at: now,
        })
        .eq('id', order.id)
      return json({ ok: true, message: result.message, tracking_number: result.tracking_number })
    }

    // The remaining actions operate on orders that already have a shipment.
    const orderIds: string[] = body.order_ids ?? (body.order_id ? [body.order_id] : [])
    if (['pickup', 'cancel', 'label', 'track'].includes(action)) {
      if (orderIds.length === 0) return json({ error: 'order_id or order_ids is required' }, 400)
      const { data: orders } = await db
        .from('orders')
        .select('id, status, shipment_tracking_number, shipment_status')
        .in('id', orderIds)
      const shipped = (orders ?? []).filter((o) => o.shipment_tracking_number && o.shipment_status !== 'cancelled')
      if (shipped.length === 0) return json({ error: 'None of these orders has an active shipment' }, 409)
      const numbers = shipped.map((o) => o.shipment_tracking_number as string)

      if (action === 'pickup') {
        const res = await flexi.schedulePickup(numbers)
        const ok = shipped.filter((o) => !failedFor(res.failed, o.shipment_tracking_number!))
        if (ok.length) {
          await db
            .from('orders')
            .update({ shipment_pickup_scheduled_at: now, shipment_status: 'pending pickup', updated_at: now })
            .in('id', ok.map((o) => o.id))
        }
        return json({ ok: true, message: res.message, failed: res.failed ?? [] })
      }

      if (action === 'cancel') {
        const res = await flexi.cancel(numbers)
        const ok = shipped.filter((o) => !failedFor(res.failed, o.shipment_tracking_number!))
        if (ok.length) {
          // The order goes back to "confirmed" so a new shipment can be booked.
          await db
            .from('orders')
            .update({ shipment_status: 'cancelled', status: 'confirmed', updated_at: now })
            .in('id', ok.map((o) => o.id))
        }
        return json({ ok: true, message: res.message, failed: res.failed ?? [] })
      }

      if (action === 'label') {
        const res = await flexi.label(numbers)
        if (!res.label_url) return json({ error: 'Flexi did not return a label' }, 502)
        await db
          .from('orders')
          .update({ shipment_label_url: res.label_url, updated_at: now })
          .in('id', shipped.map((o) => o.id))
        return json({ ok: true, label_url: res.label_url })
      }

      if (action === 'track') {
        const results = []
        for (const o of shipped) results.push({ order_id: o.id, ...(await syncTracking(db, o)) })
        return json({ ok: true, results })
      }
    }

    if (action === 'sync_all') {
      const { data: active } = await db
        .from('orders')
        .select('id, status, shipment_tracking_number')
        .not('shipment_tracking_number', 'is', null)
        .not('status', 'in', '(delivered,cancelled)')
        .neq('shipment_status', 'cancelled')
        .limit(50)
      let synced = 0
      const errors: string[] = []
      for (const o of active ?? []) {
        try {
          await syncTracking(db, o)
          synced++
        } catch (err) {
          errors.push(`${o.shipment_tracking_number}: ${(err as Error).message}`)
        }
      }
      return json({ ok: true, synced, errors })
    }

    return json({ error: 'Unknown action' }, 400)
  } catch (err) {
    if (err instanceof FlexiError) return json({ error: err.message, details: err.details }, err.status)
    console.error('admin-shipping error:', err)
    return json({ error: 'Unexpected error' }, 500)
  }
})
