import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { cors, getUser, json, serviceClient } from '../_shared/http.ts'
import { markOrderPaid, verifyPaymentSignature } from '../_shared/razorpay.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const user = await getUser(req)
    if (!user) return json({ error: 'Sign in required' }, 401)

    const body = await req.json().catch(() => ({}))
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return json({ error: 'Missing payment fields' }, 400)
    }

    const db = serviceClient()
    const { data: order } = await db
      .from('orders')
      .select('id, user_id')
      .eq('razorpay_order_id', razorpay_order_id)
      .maybeSingle()
    if (!order || order.user_id !== user.id) return json({ error: 'Order not found' }, 404)

    const valid = await verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
    if (!valid) return json({ error: 'Payment signature mismatch' }, 400)

    await markOrderPaid(db, razorpay_order_id, razorpay_payment_id)
    return json({ ok: true, order_id: order.id })
  } catch (err) {
    console.error('verify-payment error:', err)
    return json({ error: 'Unexpected error' }, 500)
  }
})
