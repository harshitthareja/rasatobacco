import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ShippingSettings = {
  shipping_flat_cents: number;
  free_shipping_threshold_cents: number | null;
};

/**
 * Mirrors the delivery charge create-order computes server-side: the flat fee
 * applies unless the subtotal is above the free-delivery threshold.
 */
export function shippingChargeFor(subtotalCents: number, settings: ShippingSettings | null) {
  if (!settings || subtotalCents <= 0) return 0;
  const threshold = settings.free_shipping_threshold_cents;
  if (threshold != null && subtotalCents > threshold) return 0;
  return settings.shipping_flat_cents;
}

/** Online payment stays off until Razorpay approves the account. */
export const ONLINE_PAYMENTS_ENABLED = import.meta.env.VITE_ENABLE_RAZORPAY === "true";

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
