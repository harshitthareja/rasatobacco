import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { cors, getUser, json, serviceClient } from '../_shared/http.ts'
import { FlexiError } from '../_shared/flexi.ts'
import { syncTracking } from '../_shared/shipments.ts'

const REFRESH_AFTER_MS = 15 * 60 * 1000

// Lets a buyer refresh courier tracking for one of their own orders.
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const user = await getUser(req)
    if (!user) return json({ error: 'Sign in required' }, 401)
    const { order_id } = await req.json().catch(() => ({}))
    if (!order_id) return json({ error: 'order_id is required' }, 400)

    const db = serviceClient()
    const { data: order } = await db
      .from('orders')
      .select('id, user_id, status, payment_method, shipment_tracking_number, shipment_status, shipment_events, shipment_synced_at')
      .eq('id', order_id)
      .maybeSingle()
    if (!order || order.user_id !== user.id) return json({ error: 'Order not found' }, 404)
    if (!order.shipment_tracking_number) return json({ tracking_number: null, events: [] })

    const stale =
      !order.shipment_synced_at || Date.now() - new Date(order.shipment_synced_at).getTime() > REFRESH_AFTER_MS
    if (stale && order.shipment_status !== 'cancelled') {
      try {
        const synced = await syncTracking(db, order)
        if (synced) {
          return json({
            tracking_number: order.shipment_tracking_number,
            status: synced.status ?? order.status,
            shipment_status: synced.shipment_status ?? order.shipment_status,
            events: synced.events,
          })
        }
      } catch (err) {
        // Fall back to the last stored events if the courier API is down.
        if (!(err instanceof FlexiError)) throw err
        console.error('order-tracking sync failed:', err.message)
      }
    }

    return json({
      tracking_number: order.shipment_tracking_number,
      status: order.status,
      shipment_status: order.shipment_status,
      events: order.shipment_events ?? [],
    })
  } catch (err) {
    console.error('order-tracking error:', err)
    return json({ error: 'Unexpected error' }, 500)
  }
})
