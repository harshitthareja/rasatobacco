-- Accessories → Mouth Tips: the Charlie Mouth Tip (Ivory, Glow in the Dark). Price and stock
-- are set in Admin → Products & Stock.
INSERT INTO public.product_prices (sku, is_purchasable) VALUES
  ('accessories-charlie-mouth-tip-ivory', true),
  ('accessories-charlie-mouth-tip-glow-in-the-dark', true)
ON CONFLICT (sku) DO NOTHING;
