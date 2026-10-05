import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ShippingSettings = {
  shipping_flat_cents: number;
  free_shipping_threshold_cents: number | null;
};

/** Mirrors the shipping charge create-order computes server-side. */
export function shippingChargeFor(subtotalCents: number, settings: ShippingSettings | null) {
  if (!settings) return 0;
  const threshold = settings.free_shipping_threshold_cents;
  if (threshold != null && subtotalCents >= threshold) return 0;
  return settings.shipping_flat_cents;
}

export function useShippingSettings() {
  const [settings, setSettings] = useState<ShippingSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("store_settings")
      .select("shipping_flat_cents, free_shipping_threshold_cents")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        setSettings(data ?? null);
        setLoading(false);
      });
  }, []);

  return { settings, loading };
}
