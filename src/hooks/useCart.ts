import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type CartRow = { sku: string; quantity: number };

const CART_EVENT = "rasa-cart-changed";
const notifyCartChanged = () => window.dispatchEvent(new Event(CART_EVENT));

export function useCart() {
  const { user } = useAuth();
  const [items, setItems] = useState<CartRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("cart_items")
      .select("sku, quantity")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    setItems(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener(CART_EVENT, handler);
    return () => window.removeEventListener(CART_EVENT, handler);
  }, [refresh]);

  const addItem = useCallback(
    async (sku: string, quantity = 1) => {
      if (!user) throw new Error("Sign in required");
      const existing = items.find((i) => i.sku === sku);
      if (existing) {
        await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + quantity, updated_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .eq("sku", sku);
      } else {
        await supabase.from("cart_items").insert({ user_id: user.id, sku, quantity });
      }
      notifyCartChanged();
      await refresh();
    },
    [user, items, refresh],
  );

  const setQuantity = useCallback(
    async (sku: string, quantity: number) => {
      if (!user) return;
      if (quantity <= 0) {
        await supabase.from("cart_items").delete().eq("user_id", user.id).eq("sku", sku);
      } else {
        await supabase
          .from("cart_items")
          .update({ quantity, updated_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .eq("sku", sku);
      }
      notifyCartChanged();
      await refresh();
    },
    [user, refresh],
  );

  const removeItem = useCallback(
    async (sku: string) => {
      if (!user) return;
      await supabase.from("cart_items").delete().eq("user_id", user.id).eq("sku", sku);
      notifyCartChanged();
      await refresh();
    },
    [user, refresh],
  );

  const clear = useCallback(async () => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    notifyCartChanged();
    await refresh();
  }, [user, refresh]);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, count, loading, addItem, setQuantity, removeItem, clear, refresh };
}
