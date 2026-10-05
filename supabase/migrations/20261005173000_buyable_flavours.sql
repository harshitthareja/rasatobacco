-- Buyable flavours (all pack sizes). Every other flavour is not buyable.
UPDATE public.product_prices
SET is_purchasable = (
      sku ~ '^(majlis-(commissioner|paan-mint-cigar|paan-raas)|makhmal-(spring-water|kiwi|grape)|tarkib-(marbella|white-rose|dubai-special|lychee-bliss))-(20g|60g|250g|500g|1kg)$'
    ),
    updated_at = now();
