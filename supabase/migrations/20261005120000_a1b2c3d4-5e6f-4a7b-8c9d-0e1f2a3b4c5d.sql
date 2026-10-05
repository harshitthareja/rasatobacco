-- Ecommerce: product pricing/stock, cart, orders.
--
-- product_prices is the single source of truth for what things cost and
-- whether they can be bought — product copy (name, notes, collection) stays
-- in the frontend's static data (src/data/collections.ts) and is keyed to
-- this table by the same sku the frontend generates (see src/data/sku.ts).
--
-- Orders are never written directly by the client: the create-order edge
-- function reads the caller's own cart_items + the authoritative prices
-- here, computes the total itself, and writes the order with the service
-- role key. This is what stops a client from tampering with prices/totals
-- before a payment processor is wired up to charge them.

CREATE TABLE IF NOT EXISTS public.product_prices (
  sku text PRIMARY KEY,
  price_cents integer,
  currency text NOT NULL DEFAULT 'INR',
  stock_quantity integer NOT NULL DEFAULT 0,
  is_purchasable boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read product prices" ON public.product_prices FOR SELECT USING (true);
GRANT SELECT ON public.product_prices TO anon, authenticated;
GRANT ALL ON public.product_prices TO service_role;

CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sku text NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, sku)
);
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can read own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owner can insert own cart items" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can update own cart items" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can delete own cart items" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
  subtotal_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  shipping_name text NOT NULL,
  shipping_phone text NOT NULL,
  shipping_email text NOT NULL,
  shipping_address_line1 text NOT NULL,
  shipping_address_line2 text,
  shipping_city text NOT NULL,
  shipping_state text NOT NULL,
  shipping_postal_code text NOT NULL,
  shipping_country text NOT NULL DEFAULT 'India',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- Deliberately no INSERT/UPDATE policy for anon/authenticated — only the
-- create-order and admin-update edge functions (service role) write here.
CREATE POLICY "Owner can read own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sku text NOT NULL,
  product_name text NOT NULL,
  collection_name text NOT NULL,
  format text NOT NULL,
  unit_price_cents integer NOT NULL,
  quantity integer NOT NULL,
  line_total_cents integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can read own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;

CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- Seed one row per existing SKU (flavour x pack size), generated from the
-- current contents of src/data/collections.ts. price_cents is left NULL —
-- nothing is purchasable-with-a-price until an admin sets it under
-- Admin -> Products. Flavours already marked `available: false` there are
-- seeded as is_purchasable = false so they can't be bought even once a
-- price is set, until that flag is flipped too.
INSERT INTO public.product_prices (sku, is_purchasable) VALUES
  ('majlis-commissioner-20g', true),
  ('majlis-commissioner-60g', true),
  ('majlis-commissioner-250g', true),
  ('majlis-commissioner-500g', true),
  ('majlis-commissioner-1kg', true),
  ('majlis-paan-mint-cigar-20g', true),
  ('majlis-paan-mint-cigar-60g', true),
  ('majlis-paan-mint-cigar-250g', true),
  ('majlis-paan-mint-cigar-500g', true),
  ('majlis-paan-mint-cigar-1kg', true),
  ('majlis-brain-freezer-20g', false),
  ('majlis-brain-freezer-60g', false),
  ('majlis-brain-freezer-250g', false),
  ('majlis-brain-freezer-500g', false),
  ('majlis-brain-freezer-1kg', false),
  ('majlis-paan-raas-20g', true),
  ('majlis-paan-raas-60g', true),
  ('majlis-paan-raas-250g', true),
  ('majlis-paan-raas-500g', true),
  ('majlis-paan-raas-1kg', true),
  ('makhmal-double-apple-20g', false),
  ('makhmal-double-apple-60g', false),
  ('makhmal-double-apple-250g', false),
  ('makhmal-double-apple-500g', false),
  ('makhmal-double-apple-1kg', false),
  ('makhmal-spring-water-20g', true),
  ('makhmal-spring-water-60g', true),
  ('makhmal-spring-water-250g', true),
  ('makhmal-spring-water-500g', true),
  ('makhmal-spring-water-1kg', true),
  ('makhmal-ice-mango-20g', false),
  ('makhmal-ice-mango-60g', false),
  ('makhmal-ice-mango-250g', false),
  ('makhmal-ice-mango-500g', false),
  ('makhmal-ice-mango-1kg', false),
  ('makhmal-watermelon-20g', false),
  ('makhmal-watermelon-60g', false),
  ('makhmal-watermelon-250g', false),
  ('makhmal-watermelon-500g', false),
  ('makhmal-watermelon-1kg', false),
  ('makhmal-kiwi-20g', true),
  ('makhmal-kiwi-60g', true),
  ('makhmal-kiwi-250g', true),
  ('makhmal-kiwi-500g', true),
  ('makhmal-kiwi-1kg', true),
  ('makhmal-mint-20g', false),
  ('makhmal-mint-60g', false),
  ('makhmal-mint-250g', false),
  ('makhmal-mint-500g', false),
  ('makhmal-mint-1kg', false),
  ('makhmal-grape-20g', true),
  ('makhmal-grape-60g', true),
  ('makhmal-grape-250g', true),
  ('makhmal-grape-500g', true),
  ('makhmal-grape-1kg', true),
  ('makhmal-orange-20g', false),
  ('makhmal-orange-60g', false),
  ('makhmal-orange-250g', false),
  ('makhmal-orange-500g', false),
  ('makhmal-orange-1kg', false),
  ('makhmal-blueberry-20g', false),
  ('makhmal-blueberry-60g', false),
  ('makhmal-blueberry-250g', false),
  ('makhmal-blueberry-500g', false),
  ('makhmal-blueberry-1kg', false),
  ('tarkib-lychee-bliss-20g', true),
  ('tarkib-lychee-bliss-60g', true),
  ('tarkib-lychee-bliss-250g', true),
  ('tarkib-lychee-bliss-500g', true),
  ('tarkib-lychee-bliss-1kg', true),
  ('tarkib-white-rose-20g', true),
  ('tarkib-white-rose-60g', true),
  ('tarkib-white-rose-250g', true),
  ('tarkib-white-rose-500g', true),
  ('tarkib-white-rose-1kg', true),
  ('tarkib-marbella-20g', true),
  ('tarkib-marbella-60g', true),
  ('tarkib-marbella-250g', true),
  ('tarkib-marbella-500g', true),
  ('tarkib-marbella-1kg', true),
  ('tarkib-iconic-20g', false),
  ('tarkib-iconic-60g', false),
  ('tarkib-iconic-250g', false),
  ('tarkib-iconic-500g', false),
  ('tarkib-iconic-1kg', false),
  ('tarkib-dubai-special-20g', true),
  ('tarkib-dubai-special-60g', true),
  ('tarkib-dubai-special-250g', true),
  ('tarkib-dubai-special-500g', true),
  ('tarkib-dubai-special-1kg', true)
ON CONFLICT (sku) DO NOTHING;
