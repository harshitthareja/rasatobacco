import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export class RazorpayError extends Error {
  constructor(message: string, public status: number) {
    super(message)
  }
}

function credentials() {
  const keyId = Deno.env.get('RAZORPAY_KEY_ID')
  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
  if (!keyId || !keySecret) throw new RazorpayError('Razorpay is not configured', 500)
  return { keyId, keySecret }
}

export function razorpayKeyId() {
  return credentials().keyId
}

/** POST https://api.razorpay.com/v1/orders — amount is in paise. */
export async function createRazorpayOrder(amountPaise: number, receipt: string, notes: Record<string, string>) {
  if (!Number.isInteger(amountPaise) || amountPaise < 100) {
    throw new RazorpayError('Order amount must be at least ₹1 (100 paise)', 400)
  }
  const { keyId, keySecret } = credentials()
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt, notes }),
  })
  const body = await res.json().catch(() => ({}))
  if (res.status === 401) throw new RazorpayError('Razorpay authentication failed', 401)
  if (!res.ok || !body.id) {
    console.error('Razorpay order error', res.status, body)
    throw new RazorpayError(body?.error?.description ?? 'Could not create payment order', 500)
  }
  return body as { id: string; amount: number; currency: string }
}

async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET) === razorpay_signature */
export async function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const { keySecret } = credentials()
  return safeEqual(await hmacHex(keySecret, `${orderId}|${paymentId}`), signature)
}

/** Webhooks are signed with the separate webhook secret over the raw body. */
export async function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
  if (!secret) return false
  return safeEqual(await hmacHex(secret, rawBody), signature)
}

/**
 * Marks an order paid exactly once (the pending→paid transition is a
 * conditional update, so verify-payment and the webhook can race safely),
 * then decrements stock and empties the buyer's cart.
 * Returns the order id, or null if no unpaid order matches.
 */
export async function markOrderPaid(db: SupabaseClient, razorpayOrderId: string, razorpayPaymentId: string) {
  const { data: updated, error } = await db
    .from('orders')
    .update({
      payment_status: 'paid',
      status: 'confirmed',
      razorpay_payment_id: razorpayPaymentId,
      payment_verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_order_id', razorpayOrderId)
    .in('payment_status', ['pending', 'failed'])
    .select('id, user_id')
  if (error) throw error

  if (!updated || updated.length === 0) {
    const { data: existing } = await db
      .from('orders')
      .select('id')
      .eq('razorpay_order_id', razorpayOrderId)
      .maybeSingle()
    return existing?.id ?? null
  }

  const order = updated[0]
  const { data: items } = await db.from('order_items').select('sku, quantity').eq('order_id', order.id)
  for (const item of items ?? []) {
    const { data: price } = await db
      .from('product_prices')
      .select('stock_quantity')
      .eq('sku', item.sku)
      .maybeSingle()
    if (price) {
      await db
        .from('product_prices')
        .update({ stock_quantity: Math.max(0, price.stock_quantity - item.quantity) })
        .eq('sku', item.sku)
    }
  }
  await db.from('cart_items').delete().eq('user_id', order.user_id)
  return order.id as string
}
