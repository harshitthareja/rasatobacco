-- Joker mouth tip: merge the Jester (front) and Arabesque (back) listings into
-- one product, accessories-joker-mouth-tip-{black,grey}.
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

INSERT INTO public.product_prices (sku, is_purchasable, price_cents, stock_quantity) VALUES
  ('accessories-joker-mouth-tip-black', true, 8500, 100),
  ('accessories-joker-mouth-tip-grey', true, 8500, 100)
ON CONFLICT (sku) DO NOTHING;
