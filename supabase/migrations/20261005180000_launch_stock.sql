-- Launch stock so the priced, buyable packs can actually be ordered
-- (create-order rejects anything with stock below the requested quantity).
-- Only fills packs still at 0, so re-running never overwrites real counts;
-- adjust per SKU afterwards in Admin → Products & Stock.
UPDATE public.product_prices
SET stock_quantity = 100,
    updated_at = now()
WHERE is_purchasable
  AND price_cents IS NOT NULL
  AND stock_quantity = 0;
