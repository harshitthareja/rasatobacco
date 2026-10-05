import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { deriveStatuses, flexi, sortTracking } from './flexi.ts'

/** Pulls the latest Flexi tracking for an order and stores it on the row. */
export async function syncTracking(
  db: SupabaseClient,
  order: {
    id: string
    status: string
    shipment_tracking_number: string | null
    payment_method?: string | null
  },
) {
  if (!order.shipment_tracking_number) return null
  const res = await flexi.track(order.shipment_tracking_number)
  const events = sortTracking(res.data?.tracking_history)
  const derived = deriveStatuses(events[0])
  const updates: Record<string, unknown> = {
    shipment_events: events,
    shipment_synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  if (derived) {
    updates.shipment_status = derived.shipmentStatus
    // Never move an order backwards or out of cancelled.
    const rank: Record<string, number> = { confirmed: 1, processing: 2, shipped: 3, delivered: 4 }
    if (
      derived.orderStatus &&
      order.status !== 'cancelled' &&
      (rank[derived.orderStatus] ?? 0) > (rank[order.status] ?? 0)
    ) {
      updates.status = derived.orderStatus
      // Cash on delivery is collected by the courier at hand-over.
      if (derived.orderStatus === 'delivered' && order.payment_method === 'cod') {
        updates.payment_status = 'paid'
        updates.payment_verified_at = new Date().toISOString()
      }
    }
  }
  await db.from('orders').update(updates).eq('id', order.id)
  return {
    events,
    status: (updates.status as string | undefined) ?? order.status,
    shipment_status: (updates.shipment_status as string | undefined) ?? null,
  }
}
