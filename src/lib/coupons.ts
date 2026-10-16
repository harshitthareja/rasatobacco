// The checkout uses the order function's own coupon rules, so the discount
// shown always matches what create-order charges.
export {
  COUPONS,
  applyCoupon,
  findCoupon,
  type Coupon,
  type CouponResult,
} from "../../supabase/functions/_shared/coupons.ts";
