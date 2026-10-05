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
CREATE POLICY "Public read store settings" ON public.store_settings FOR SELECT USING (true);
GRANT SELECT ON public.store_settings TO anon, authenticated;
GRANT ALL ON public.store_settings TO service_role;
INSERT INTO public.store_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
