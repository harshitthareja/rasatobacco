-- Checkout coupons (e.g. RASA15): the discount and code applied to an order.
-- total_cents already includes the discount.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS discount_cents integer NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
  ADD COLUMN IF NOT EXISTS coupon_code text;
