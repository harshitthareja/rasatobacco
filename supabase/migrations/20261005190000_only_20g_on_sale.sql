-- Only 20g packs are on sale for now; 60g/250g/500g/1kg show "Coming soon".
-- create-order refuses any SKU that isn't is_purchasable, so this is enforced
-- server-side. To release a size later, set its price and turn "Buyable" on
-- in Admin → Products & Stock.
UPDATE public.product_prices
SET is_purchasable = false,
    updated_at = now()
WHERE sku !~ '-20g$'
  AND is_purchasable;
