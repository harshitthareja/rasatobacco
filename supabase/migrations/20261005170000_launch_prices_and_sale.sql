-- Sale pricing: while now() < sale_ends_at, sale_price_cents is what the
-- buyer pays (create-order enforces this server-side); afterwards the
-- regular price_cents applies again automatically.
ALTER TABLE public.product_prices
  ADD COLUMN IF NOT EXISTS sale_price_cents integer CHECK (sale_price_cents >= 0),
  ADD COLUMN IF NOT EXISTS sale_ends_at timestamptz;

-- Launch prices for the 20g packs, with 15% off for one week
-- (until 12 Oct 2026, 23:59 IST).
--   Majlis  20g: ₹85 → ₹72.25
--   Makhmal 20g: ₹79 → ₹67.15
--   Tarkib  20g: ₹85 → ₹72.25
UPDATE public.product_prices
SET price_cents = CASE
      WHEN sku LIKE 'makhmal-%' THEN 7900
      ELSE 8500
    END,
    sale_price_cents = CASE
      WHEN sku LIKE 'makhmal-%' THEN 6715
      ELSE 7225
    END,
    sale_ends_at = '2026-10-12 23:59:59+05:30',
    updated_at = now()
WHERE sku LIKE '%-20g'
  AND (sku LIKE 'majlis-%' OR sku LIKE 'makhmal-%' OR sku LIKE 'tarkib-%');
