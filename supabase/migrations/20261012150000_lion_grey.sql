-- Lion mouth tip in Grey: ₹85 and 100 in stock.
INSERT INTO public.product_prices (sku, is_purchasable, price_cents, stock_quantity) VALUES
  ('accessories-lion-mouth-tip-grey', true, 8500, 100)
ON CONFLICT (sku) DO NOTHING;
