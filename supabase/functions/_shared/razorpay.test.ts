// Run: deno test --allow-env supabase/functions/_shared/razorpay.test.ts
import { verifyPaymentSignature, verifyWebhookSignature } from './razorpay.ts'

const assert = (cond: boolean, msg: string) => {
  if (!cond) throw new Error(msg)
}

Deno.env.set('RAZORPAY_KEY_ID', 'rzp_test_key')
Deno.env.set('RAZORPAY_KEY_SECRET', 'test_secret')
Deno.env.set('RAZORPAY_WEBHOOK_SECRET', 'webhook_secret')

// Expected value: HMAC-SHA256("order_123|pay_456", "test_secret"), computed independently with
//   node -e "console.log(require('crypto').createHmac('sha256','test_secret').update('order_123|pay_456').digest('hex'))"
const EXPECTED = '6c343620f1910da483982cf25b9dc33d709afdd25930f08964ef60b65aefa831'

Deno.test('accepts a correct payment signature', async () => {
  assert(await verifyPaymentSignature('order_123', 'pay_456', EXPECTED), 'valid signature rejected')
})

Deno.test('rejects a tampered payment signature', async () => {
  assert(!(await verifyPaymentSignature('order_123', 'pay_999', EXPECTED)), 'wrong payment id accepted')
  assert(!(await verifyPaymentSignature('order_123', 'pay_456', EXPECTED.replace(/.$/, '0'))), 'bad signature accepted')
  assert(!(await verifyPaymentSignature('order_123', 'pay_456', '')), 'empty signature accepted')
})

Deno.test('verifies webhook signatures over the raw body', async () => {
  const body = '{"event":"payment.captured"}'
  assert(await verifyWebhookSignature(body, '63482aecf393ec15e418daab94dffe6cd7a1ddeec5ade268106920e9f1c8363d'), 'valid webhook rejected')
  assert(!(await verifyWebhookSignature(body + ' ', '63482aecf393ec15e418daab94dffe6cd7a1ddeec5ade268106920e9f1c8363d')), 'modified body accepted')
})
