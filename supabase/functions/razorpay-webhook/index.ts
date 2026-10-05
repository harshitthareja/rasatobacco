import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { json, serviceClient } from '../_shared/http.ts'
import { markOrderPaid, verifyWebhookSignature } from '../_shared/razorpay.ts'

// Safety net for buyers who pay but close the tab before verify-payment runs.
// Configure in Razorpay Dashboard → Webhooks with events payment.captured,
// order.paid and payment.failed, pointing at this function's URL, and set
// RAZORPAY_WEBHOOK_SECRET to the same secret. Deploy with --no-verify-jwt.
serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const raw = await req.text()
  const signature = req.headers.get('x-razorpay-signature') ?? ''
  if (!(await verifyWebhookSignature(raw, signature))) return json({ error: 'Invalid signature' }, 400)

  try {
    const event = JSON.parse(raw)
    const payment = event.payload?.payment?.entity
    const db = serviceClient()

    if ((event.event === 'payment.captured' || event.event === 'order.paid') && payment?.order_id) {
      await markOrderPaid(db, payment.order_id, payment.id)
    } else if (event.event === 'payment.failed' && payment?.order_id) {
      await db
        .from('orders')
        .update({ payment_error: payment.error_description ?? 'Payment failed', updated_at: new Date().toISOString() })
        .eq('razorpay_order_id', payment.order_id)
        .neq('payment_status', 'paid')
    }
    return json({ ok: true })
  } catch (err) {
    console.error('razorpay-webhook error:', err)
    return json({ error: 'Unexpected error' }, 500)
  }
})
