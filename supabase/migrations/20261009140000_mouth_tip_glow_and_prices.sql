-- Lion Mouth Tip in Glow in the Dark, and launch pricing for every mouth tip:
-- ₹85 each. The "any 2 mouth tips for ₹150" offer is applied by create-order.
INSERT INTO public.product_prices (sku, is_purchasable) VALUES
  ('accessories-lion-mouth-tip-glow-in-the-dark', true)
ON CONFLICT (sku) DO NOTHING;

-- First-time launch values only (price still unset): ₹85 and 100 in stock,
-- so re-running never restocks a tip that has since sold out.
UPDATE public.product_prices
SET price_cents = 8500, stock_quantity = 100, updated_at = now()
WHERE price_cents IS NULL
  AND sku LIKE 'accessories-%-mouth-tip-%';

