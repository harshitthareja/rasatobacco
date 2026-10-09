-- Accessories → Mouth Tips: the Lion Mouth Tip in Black and White.
-- SKUs follow src/data/accessories.ts (accessories-<product>-<finish>).
-- Prices start unset so the tips show "Coming soon" until an admin sets a
-- price and stock under Admin → Products & Stock.
INSERT INTO public.product_prices (sku, is_purchasable) VALUES
  ('accessories-lion-mouth-tip-black', true),
  ('accessories-lion-mouth-tip-white', true)
ON CONFLICT (sku) DO NOTHING;
