import { useCallback, useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type CartRow = { sku: string; quantity: number };

// One cart shared by every useCart() caller. A product grid mounts a cart
// control per card, and each used to fetch cart_items on its own.
type CartState = { userId: string | null; items: CartRow[]; loading: boolean };
const EMPTY_CART: CartState = { userId: null, items: [], loading: true };
let cartState = EMPTY_CART;
const cartListeners = new Set<() => void>();
let inFlight: { userId: string; promise: Promise<void> } | null = null;

function setCartState(next: Partial<CartState>) {
  cartState = { ...cartState, ...next };
  cartListeners.forEach((l) => l());
}

function subscribeCart(listener: () => void) {
  cartListeners.add(listener);
  return () => {
    cartListeners.delete(listener);
  };
}

async function loadCart(userId: string) {
  if (inFlight?.userId === userId) return inFlight.promise;
  const promise = (async () => {
    if (cartState.userId !== userId) setCartState({ userId, items: [], loading: true });
    const { data } = await supabase
      .from("cart_items")
      .select("sku, quantity")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    // Ignore a response for a user who has since signed out or switched.
    if (cartState.userId === userId) setCartState({ items: data ?? [], loading: false });
  })();
  inFlight = { userId, promise };
  try {
    await promise;
  } finally {
    if (inFlight?.promise === promise) inFlight = null;
  }
}

export function useCart() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const state = useSyncExternalStore(
    subscribeCart,
    () => cartState,
    () => EMPTY_CART,
  );

  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      if (cartState.userId !== null || cartState.loading) {
        setCartState({ userId: null, items: [], loading: false });
      }
      return;
    }
    if (cartState.userId !== userId) void loadCart(userId);
  }, [userId, authLoading]);

  // Until this user's cart has loaded, report it as loading rather than
  // showing another user's (or an empty) cart.
  const mine = state.userId === userId;
  const items = mine ? state.items : [];
  const loading = authLoading || (userId ? !mine || state.loading : false);

  const refresh = useCallback(async () => {
    if (userId) {
      inFlight = null;
      await loadCart(userId);
    }
  }, [userId]);

  const addItem = useCallback(
    async (sku: string, quantity = 1) => {
      if (!userId) throw new Error("Sign in required");
      const existing = cartState.items.find((i) => i.sku === sku);
      const { error } = existing
        ? await supabase
            .from("cart_items")
            .update({
              quantity: existing.quantity + quantity,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)
            .eq("sku", sku)
        : await supabase.from("cart_items").insert({ user_id: userId, sku, quantity });
      if (error) {
        console.error("cart write failed", error);
        throw new Error(error.message || "Could not add to cart");
      }
      await refresh();
    },
    [userId, refresh],
  );

  const setQuantity = useCallback(
    async (sku: string, quantity: number) => {
      if (!userId) return;
      if (quantity <= 0) {
        await supabase.from("cart_items").delete().eq("user_id", userId).eq("sku", sku);
      } else {
        await supabase
          .from("cart_items")
          .update({ quantity, updated_at: new Date().toISOString() })
          .eq("user_id", userId)
          .eq("sku", sku);
      }
      await refresh();
    },
    [userId, refresh],
  );

  const removeItem = useCallback(
    async (sku: string) => {
      if (!userId) return;
      await supabase.from("cart_items").delete().eq("user_id", userId).eq("sku", sku);
      await refresh();
    },
    [userId, refresh],
  );

  const clear = useCallback(async () => {
    if (!userId) return;
    await supabase.from("cart_items").delete().eq("user_id", userId);
    await refresh();
  }, [userId, refresh]);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, count, loading, addItem, setQuantity, removeItem, clear, refresh };
}
