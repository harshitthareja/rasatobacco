-- Charlie Mouth Tip in Black: ₹85 and 100 in stock at launch, like the
-- other mouth tips (any two are ₹150, applied by create-order).
INSERT INTO public.product_prices (sku, is_purchasable, price_cents, stock_quantity) VALUES
  ('accessories-charlie-mouth-tip-black', true, 8500, 100)
ON CONFLICT (sku) DO NOTHING;
