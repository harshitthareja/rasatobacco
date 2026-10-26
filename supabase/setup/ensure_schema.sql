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

-- Launch range: the 10 flavours in 20g only (flavours only — accessories
-- are switched on and off separately in admin).
UPDATE public.product_prices
SET is_purchasable = (
      sku ~ '^(majlis-(commissioner|paan-mint-cigar|paan-raas)|makhmal-(spring-water|kiwi|grape)|tarkib-(marbella|white-rose|dubai-special|lychee-bliss))-20g$'
    ),
    updated_at = now()
WHERE is_purchasable IS DISTINCT FROM (
      sku ~ '^(majlis-(commissioner|paan-mint-cigar|paan-raas)|makhmal-(spring-water|kiwi|grape)|tarkib-(marbella|white-rose|dubai-special|lychee-bliss))-20g$'
    )
  AND sku NOT LIKE 'accessories-%';

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

-- Charlie's "Ivory" finish was renamed "White": move its price/stock row and any
-- carts holding it to the new SKU (past orders keep the old name). Runs once.
UPDATE public.cart_items c
SET sku = 'accessories-charlie-mouth-tip-white'
WHERE c.sku = 'accessories-charlie-mouth-tip-ivory'
  AND NOT EXISTS (
    SELECT 1 FROM public.cart_items d
    WHERE d.user_id = c.user_id AND d.sku = 'accessories-charlie-mouth-tip-white'
  );
DELETE FROM public.cart_items WHERE sku = 'accessories-charlie-mouth-tip-ivory';
UPDATE public.product_prices
SET sku = 'accessories-charlie-mouth-tip-white', updated_at = now()
WHERE sku = 'accessories-charlie-mouth-tip-ivory'
  AND NOT EXISTS (
    SELECT 1 FROM public.product_prices WHERE sku = 'accessories-charlie-mouth-tip-white'
  );

-- The Joker mouth tip was briefly listed as two products ("Jester" for its
-- front, "Arabesque" for its back). Move their carts and the Jester price/stock
-- rows to the Joker SKUs, then drop the Arabesque rows. No-op once done.
DO $$
DECLARE finish text;
BEGIN
  FOREACH finish IN ARRAY ARRAY['black', 'grey'] LOOP
    UPDATE public.cart_items c
    SET sku = 'accessories-joker-mouth-tip-' || finish
    WHERE c.sku IN ('accessories-jester-mouth-tip-' || finish, 'accessories-arabesque-mouth-tip-' || finish)
      AND NOT EXISTS (
        SELECT 1 FROM public.cart_items d
        WHERE d.user_id = c.user_id AND d.sku = 'accessories-joker-mouth-tip-' || finish
      );
    DELETE FROM public.cart_items
    WHERE sku IN ('accessories-jester-mouth-tip-' || finish, 'accessories-arabesque-mouth-tip-' || finish);
    UPDATE public.product_prices
    SET sku = 'accessories-joker-mouth-tip-' || finish, updated_at = now()
    WHERE sku = 'accessories-jester-mouth-tip-' || finish
      AND NOT EXISTS (
        SELECT 1 FROM public.product_prices WHERE sku = 'accessories-joker-mouth-tip-' || finish
      );
    DELETE FROM public.product_prices
    WHERE sku IN ('accessories-jester-mouth-tip-' || finish, 'accessories-arabesque-mouth-tip-' || finish);
  END LOOP;
END $$;

-- Accessories → Mouth Tips (Lion Black/White/Grey/Glow, Charlie White/Black/Grey/Glow,
-- Joker Black/Grey/White/Glow).
-- ₹85 each; any two are ₹150 (applied by create-order). Price and stock are
-- managed in Admin → Products & Stock; values set there are left untouched.
INSERT INTO public.product_prices (sku, is_purchasable) VALUES
  ('accessories-lion-mouth-tip-black', true),
  ('accessories-lion-mouth-tip-white', true),
  ('accessories-lion-mouth-tip-grey', true),
  ('accessories-lion-mouth-tip-glow-in-the-dark', true),
  ('accessories-charlie-mouth-tip-white', true),
  ('accessories-charlie-mouth-tip-black', true),
  ('accessories-charlie-mouth-tip-grey', true),
  ('accessories-charlie-mouth-tip-glow-in-the-dark', true),
  ('accessories-joker-mouth-tip-black', true),
  ('accessories-joker-mouth-tip-grey', true),
  ('accessories-joker-mouth-tip-white', true),
  ('accessories-joker-mouth-tip-glow-in-the-dark', true)
ON CONFLICT (sku) DO NOTHING;

-- First-time launch values only (price still unset): ₹85 and 100 in stock,
-- so re-running never restocks a tip that has since sold out.
UPDATE public.product_prices
SET price_cents = 8500, stock_quantity = 100, updated_at = now()
WHERE price_cents IS NULL
  AND sku LIKE 'accessories-%-mouth-tip-%';


-- Checkout coupons (e.g. RASA15): the discount and code applied to an order.
-- total_cents already includes the discount.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS discount_cents integer NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
  ADD COLUMN IF NOT EXISTS coupon_code text;

-- ── Order writes in one transaction ─────────────────────────────────────────
-- create-order used to insert the order, then its items, then reserve stock
-- and clear the cart as separate requests from the edge function. An
-- interrupted request (tab closed, timeout) could leave an order without
-- items or stock untouched. These functions do it all-or-nothing in one call.

-- Reserves stock for a confirmed order and removes its items from the
-- buyer's cart (items not on sale yet stay there).
CREATE OR REPLACE FUNCTION public.finalize_order(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid;
BEGIN
  SELECT user_id INTO v_user FROM orders WHERE id = p_order_id;

  UPDATE product_prices p
  SET stock_quantity = greatest(0, p.stock_quantity - q.qty), updated_at = now()
  FROM (SELECT sku, sum(quantity) AS qty FROM order_items WHERE order_id = p_order_id GROUP BY sku) q
  WHERE p.sku = q.sku;

  DELETE FROM cart_items
  WHERE user_id = v_user
    AND sku IN (SELECT sku FROM order_items WHERE order_id = p_order_id);
END;
$$;

-- Places an order. p_order: order columns; p_items: [{sku, product_name,
-- collection_name, format, unit_price_cents, quantity}]. Cash on delivery is
-- confirmed at once: stock is checked under lock and reserved, and the
-- ordered items leave the cart. Online orders stay pending until paid
-- (mark_order_paid) and close out the buyer's earlier unpaid attempts.
-- Raises 'OUT_OF_STOCK:<skus>' when a COD item can't be covered.
CREATE OR REPLACE FUNCTION public.place_order(p_order jsonb, p_items jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := (p_order->>'user_id')::uuid;
  v_cod boolean := p_order->>'payment_method' = 'cod';
  v_short text;
  v_id uuid;
BEGIN
  IF jsonb_array_length(coalesce(p_items, '[]'::jsonb)) = 0 THEN
    RAISE EXCEPTION 'EMPTY_ORDER';
  END IF;

  IF v_cod THEN
    PERFORM 1 FROM product_prices
    WHERE sku IN (SELECT DISTINCT x->>'sku' FROM jsonb_array_elements(p_items) x)
    FOR UPDATE;

    SELECT string_agg(q.sku, ', ') INTO v_short
    FROM (SELECT x->>'sku' AS sku, sum((x->>'quantity')::int) AS qty
          FROM jsonb_array_elements(p_items) x GROUP BY 1) q
    LEFT JOIN product_prices p ON p.sku = q.sku
    WHERE coalesce(p.stock_quantity, 0) < q.qty;
    IF v_short IS NOT NULL THEN
      RAISE EXCEPTION 'OUT_OF_STOCK:%', v_short;
    END IF;
  ELSE
    UPDATE orders
    SET status = 'cancelled', payment_error = 'Superseded by a newer checkout', updated_at = now()
    WHERE user_id = v_user AND status = 'pending' AND payment_status = 'pending';
  END IF;

  INSERT INTO orders (
    user_id, status, payment_status, payment_method,
    subtotal_cents, discount_cents, coupon_code, shipping_charge_cents, total_cents, currency,
    shipping_name, shipping_phone, shipping_email, shipping_address_line1, shipping_address_line2,
    shipping_city, shipping_state, shipping_postal_code, shipping_country, notes
  ) VALUES (
    v_user,
    CASE WHEN v_cod THEN 'confirmed' ELSE 'pending' END,
    'pending',
    p_order->>'payment_method',
    (p_order->>'subtotal_cents')::int,
    coalesce((p_order->>'discount_cents')::int, 0),
    nullif(p_order->>'coupon_code', ''),
    (p_order->>'shipping_charge_cents')::int,
    (p_order->>'total_cents')::int,
    coalesce(p_order->>'currency', 'INR'),
    p_order->>'shipping_name', p_order->>'shipping_phone', p_order->>'shipping_email',
    p_order->>'shipping_address_line1', nullif(p_order->>'shipping_address_line2', ''),
    p_order->>'shipping_city', p_order->>'shipping_state', p_order->>'shipping_postal_code',
    coalesce(nullif(p_order->>'shipping_country', ''), 'India'), nullif(p_order->>'notes', '')
  )
  RETURNING id INTO v_id;

  INSERT INTO order_items (
    order_id, sku, product_name, collection_name, format, unit_price_cents, quantity, line_total_cents
  )
  SELECT v_id, x->>'sku', x->>'product_name', coalesce(x->>'collection_name', ''),
         coalesce(x->>'format', ''), (x->>'unit_price_cents')::int, (x->>'quantity')::int,
         (x->>'unit_price_cents')::int * (x->>'quantity')::int
  FROM jsonb_array_elements(p_items) x;

  IF v_cod THEN
    PERFORM public.finalize_order(v_id);
  END IF;

  RETURN v_id;
END;
$$;

-- Marks an online order paid exactly once (verify-payment and the Razorpay
-- webhook may both call it) and finalizes it in the same transaction.
-- Returns the order id, or NULL when no such order exists.
CREATE OR REPLACE FUNCTION public.mark_order_paid(p_razorpay_order_id text, p_payment_id text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  UPDATE orders
  SET payment_status = 'paid', status = 'confirmed', razorpay_payment_id = p_payment_id,
      payment_verified_at = now(), updated_at = now()
  WHERE razorpay_order_id = p_razorpay_order_id AND payment_status IN ('pending', 'failed')
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL THEN
    PERFORM public.finalize_order(v_id);
    RETURN v_id;
  END IF;

  SELECT id INTO v_id FROM orders WHERE razorpay_order_id = p_razorpay_order_id;
  RETURN v_id;
END;
$$;

-- Only the edge functions (service role) may call these.
REVOKE ALL ON FUNCTION public.finalize_order(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.place_order(jsonb, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.mark_order_paid(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_order(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_order_paid(text, text) TO service_role;
