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

type PriceMap = Record<string, ProductPrice>;

// Prices are shared across pages so moving between shop, product, cart and
// checkout doesn't refetch (and flash a spinner) every time. A cached copy is
// shown immediately and refreshed in the background once it is stale. The
// server re-checks prices and stock when the order is placed.
const STALE_MS = 30_000;
let cache: { prices: PriceMap; at: number } | null = null;
let inFlight: Promise<PriceMap> | null = null;

async function fetchPrices(): Promise<PriceMap> {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    const { data, error } = await supabase.from("product_prices").select("*");
    if (error) throw new Error(error.message);
    const map: PriceMap = {};
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
    cache = { prices: map, at: Date.now() };
    return map;
  })();
  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}

export function useProductPrices() {
  const [prices, setPrices] = useState<PriceMap>(() => cache?.prices ?? {});
  const [loading, setLoading] = useState(() => !cache);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!cache) setLoading(true);
    try {
      setPrices(await fetchPrices());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load prices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!cache || Date.now() - cache.at > STALE_MS) void refresh();
  }, [refresh]);

  return { prices, loading, error, refresh };
}
