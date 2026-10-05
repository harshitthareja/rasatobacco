import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ProductPrice = {
  sku: string;
  /** What the buyer pays right now (the sale price while a sale is running). */
  price_cents: number | null;
  /** Regular price; differs from price_cents only during a sale. */
  regular_price_cents: number | null;
  on_sale: boolean;
  sale_ends_at: string | null;
  currency: string;
  stock_quantity: number;
  is_purchasable: boolean;
};

export function useProductPrices() {
  const [prices, setPrices] = useState<Record<string, ProductPrice>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase.from("product_prices").select("*");
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    const map: Record<string, ProductPrice> = {};
    const now = Date.now();
    (data ?? []).forEach((p) => {
      const onSale =
        p.price_cents != null &&
        p.sale_price_cents != null &&
        p.sale_ends_at != null &&
        new Date(p.sale_ends_at).getTime() > now;
      map[p.sku] = {
        sku: p.sku,
        currency: p.currency,
        stock_quantity: p.stock_quantity,
        is_purchasable: p.is_purchasable,
        price_cents: onSale ? p.sale_price_cents : p.price_cents,
        regular_price_cents: p.price_cents,
        on_sale: onSale,
        sale_ends_at: onSale ? p.sale_ends_at : null,
      };
    });
    setPrices(map);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { prices, loading, error, refresh };
}
