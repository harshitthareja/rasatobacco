-- Brings the website's Supabase database up to date. Safe to re-run:
-- structure uses IF NOT EXISTS, and data steps only fill values that are
-- still unset, so prices/stock changed later in admin are never overwritten.
-- Run via GitHub → Actions → "Supabase database setup".

-- Order flow: Razorpay payment + Flexi shipment tracking + store settings.
--
-- Flow: create-order inserts an order with status 'pending' /
-- payment_status 'pending' and a Razorpay order id. verify-payment (or the
-- razorpay-webhook) flips it to payment_status 'paid' / status 'confirmed',
-- decrements stock and empties the cart. Admins then book the shipment with
-- Flexi from the admin app (admin-shipping), which fills the shipment_* columns.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  ADD COLUMN IF NOT EXISTS razorpay_order_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS payment_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_error text,
  ADD COLUMN IF NOT EXISTS shipping_charge_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_cents integer,
  ADD COLUMN IF NOT EXISTS shipment_tracking_number text,
  ADD COLUMN IF NOT EXISTS shipment_status text,
  ADD COLUMN IF NOT EXISTS shipment_created_at timestamptz,
  ADD COLUMN IF NOT EXISTS shipment_pickup_scheduled_at timestamptz,
  ADD COLUMN IF NOT EXISTS shipment_label_url text,
  ADD COLUMN IF NOT EXISTS shipment_events jsonb,
  ADD COLUMN IF NOT EXISTS shipment_synced_at timestamptz;

UPDATE public.orders SET total_cents = subtotal_cents + shipping_charge_cents WHERE total_cents IS NULL;

CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order ON public.orders (razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders (payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON public.orders (shipment_tracking_number);

-- Admin roles. Grant with:
--   INSERT INTO public.user_roles (user_id, role)
--   SELECT id, 'admin' FROM auth.users WHERE email = 'you@example.com';
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.user_roles TO service_role;

-- The old shared admin password is replaced by per-user admin roles.
DELETE FROM public.admin_config WHERE key = 'admin_password_hash';

-- Single-row store settings: shipping fees shown at checkout and defaults
-- pre-filled when an admin books a Flexi shipment. Nothing secret lives here.
CREATE TABLE IF NOT EXISTS public.store_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  shipping_flat_cents integer NOT NULL DEFAULT 0 CHECK (shipping_flat_cents >= 0),
  free_shipping_threshold_cents integer CHECK (free_shipping_threshold_cents >= 0),
  default_box_length_cm numeric NOT NULL DEFAULT 20,
  default_box_breadth_cm numeric NOT NULL DEFAULT 15,
  default_box_height_cm numeric NOT NULL DEFAULT 10,
  default_box_weight_kg numeric NOT NULL DEFAULT 0.5,
  hsn_code text NOT NULL DEFAULT '2403',
  flexi_courier_code integer,
  flexi_warehouse_code text,
  flexi_rto_warehouse_code text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read store settings" ON public.store_settings;
CREATE POLICY "Public read store settings" ON public.store_settings FOR SELECT USING (true);
GRANT SELECT ON public.store_settings TO anon, authenticated;
GRANT ALL ON public.store_settings TO service_role;
INSERT INTO public.store_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;


-- Sale pricing columns
ALTER TABLE public.product_prices
  ADD COLUMN IF NOT EXISTS sale_price_cents integer CHECK (sale_price_cents >= 0),
  ADD COLUMN IF NOT EXISTS sale_ends_at timestamptz;

-- Cash on delivery
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'razorpay'
    CHECK (payment_method IN ('razorpay', 'cod'));
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON public.orders (payment_method);

-- Launch prices for 20g packs (only where no price is set yet)
UPDATE public.product_prices
SET price_cents = CASE WHEN sku LIKE 'makhmal-%' THEN 7900 ELSE 8500 END,
    sale_price_cents = CASE WHEN sku LIKE 'makhmal-%' THEN 6715 ELSE 7225 END,
    sale_ends_at = '2026-10-12 23:59:59+05:30',
    updated_at = now()
WHERE price_cents IS NULL
  AND sku ~ '^(majlis|makhmal|tarkib)-.*-20g$';

-- Launch range: the 10 flavours in 20g only
UPDATE public.product_prices
SET is_purchasable = (
      sku ~ '^(majlis-(commissioner|paan-mint-cigar|paan-raas)|makhmal-(spring-water|kiwi|grape)|tarkib-(marbella|white-rose|dubai-special|lychee-bliss))-20g$'
    ),
    updated_at = now()
WHERE is_purchasable IS DISTINCT FROM (
      sku ~ '^(majlis-(commissioner|paan-mint-cigar|paan-raas)|makhmal-(spring-water|kiwi|grape)|tarkib-(marbella|white-rose|dubai-special|lychee-bliss))-20g$'
    );

-- Launch stock (only packs still at 0)
UPDATE public.product_prices
SET stock_quantity = 100, updated_at = now()
WHERE is_purchasable AND price_cents IS NOT NULL AND stock_quantity = 0;

-- Delivery: ₹49 up to ₹249, free above
UPDATE public.store_settings
SET shipping_flat_cents = 4900, free_shipping_threshold_cents = 24900, updated_at = now()
WHERE id = 1 AND (shipping_flat_cents = 0 OR free_shipping_threshold_cents IS NULL);

-- Cart access for signed-in shoppers (re-asserted in case the original
-- policies or grants are missing on this project).
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner can read own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Owner can insert own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Owner can update own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Owner can delete own cart items" ON public.cart_items;
CREATE POLICY "Owner can read own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owner can insert own cart items" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can update own cart items" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can delete own cart items" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT SELECT ON public.orders, public.order_items TO authenticated;

-- Accessories → Mouth Tips (Lion Black/White/Glow, Charlie Ivory/Glow).
-- ₹85 each; any two are ₹150 (applied by create-order). Price and stock are
-- managed in Admin → Products & Stock; values set there are left untouched.
INSERT INTO public.product_prices (sku, is_purchasable) VALUES
  ('accessories-lion-mouth-tip-black', true),
  ('accessories-lion-mouth-tip-white', true),
  ('accessories-lion-mouth-tip-glow-in-the-dark', true),
  ('accessories-charlie-mouth-tip-ivory', true),
  ('accessories-charlie-mouth-tip-glow-in-the-dark', true)
ON CONFLICT (sku) DO NOTHING;

-- First-time launch values only (price still unset): ₹85 and 100 in stock,
-- so re-running never restocks a tip that has since sold out.
UPDATE public.product_prices
SET price_cents = 8500, stock_quantity = 100, updated_at = now()
WHERE price_cents IS NULL
  AND sku LIKE 'accessories-%-mouth-tip-%';

