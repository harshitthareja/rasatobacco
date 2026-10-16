// Checkout coupons. Kept free of Deno/Supabase imports: create-order applies
// them (authoritative) and the website mirrors them in src/lib/coupons.ts —
// keep the two in sync (a parity test checks).

export type Coupon = {
  code: string
  /** Percentage off the items subtotal (after the mouth tip pair offer). */
  percent: number
  /** Items subtotal needed to use the coupon, in paise. */
  minSubtotalCents: number
  description: string
}

export const COUPONS: Coupon[] = [
  {
    code: 'RASA15',
    percent: 15,
    minSubtotalCents: 24900,
    description: '15% off your cart on orders of ₹249 or more',
  },
]

export const findCoupon = (code: string) =>
  COUPONS.find((c) => c.code === code.trim().toUpperCase())

export type CouponResult =
  | { ok: true; code: string; discount: number }
  | { ok: false; error: string }

/** Discount (paise) a coupon gives on an items subtotal, or why it can't be used. */
export function applyCoupon(code: string, subtotalCents: number): CouponResult {
  const coupon = findCoupon(code)
  if (!coupon) return { ok: false, error: `Coupon ${code.trim().toUpperCase()} isn't valid` }
  if (subtotalCents < coupon.minSubtotalCents) {
    return {
      ok: false,
      error: `${coupon.code} needs a cart of ₹${coupon.minSubtotalCents / 100} or more`,
    }
  }
  return { ok: true, code: coupon.code, discount: Math.round((subtotalCents * coupon.percent) / 100) }
}
