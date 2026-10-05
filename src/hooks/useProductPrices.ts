import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ProductPrice = {
  sku: string;
  price_cents: number | null;
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
    (data ?? []).forEach((p) => {
      map[p.sku] = p;
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
