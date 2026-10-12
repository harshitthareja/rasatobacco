-- Joker mouth tip in White and Glow in the Dark: ₹85 and 100 in stock.
INSERT INTO public.product_prices (sku, is_purchasable, price_cents, stock_quantity) VALUES
  ('accessories-joker-mouth-tip-white', true, 8500, 100),
  ('accessories-joker-mouth-tip-glow-in-the-dark', true, 8500, 100)
ON CONFLICT (sku) DO NOTHING;
