-- Cash on delivery + delivery fee rule.
--
-- payment_method: 'cod' orders are confirmed at checkout (stock reserved,
-- cart emptied) with payment_status 'pending' until the courier collects
-- the cash; tracking marks them paid on delivery. 'razorpay' orders follow
-- the online-payment flow (kept for when Razorpay is approved).
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'razorpay'
    CHECK (payment_method IN ('razorpay', 'cod'));
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON public.orders (payment_method);

-- Delivery: ₹49 for orders of ₹249 or less, free above ₹249.
-- (Free shipping applies when the subtotal is strictly above the threshold.)
UPDATE public.store_settings
SET shipping_flat_cents = 4900,
    free_shipping_threshold_cents = 24900,
    updated_at = now()
WHERE id = 1;
