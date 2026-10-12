-- Charlie "Ivory" renamed "White"; new Arabesque and Jester mouth tips in
-- Black and Grey at ₹85 with 100 in stock (any two are ₹150 via create-order).
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

INSERT INTO public.product_prices (sku, is_purchasable, price_cents, stock_quantity) VALUES
  ('accessories-arabesque-mouth-tip-black', true, 8500, 100),
  ('accessories-arabesque-mouth-tip-grey', true, 8500, 100),
  ('accessories-jester-mouth-tip-black', true, 8500, 100),
  ('accessories-jester-mouth-tip-grey', true, 8500, 100)
ON CONFLICT (sku) DO NOTHING;
