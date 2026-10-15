import { useCallback, useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type CartRow = { sku: string; quantity: number };

// One cart shared by every useCart() caller. A product grid mounts a cart
// control per card, and each used to fetch cart_items on its own.
//
// Signed-out shoppers get a guest cart kept in this browser, so they can add
// to cart without an account; sign-in is only asked for at checkout. When
// they sign in, the guest cart is merged into their account cart.
type CartState = { userId: string | null; items: CartRow[]; loading: boolean };
const EMPTY_CART: CartState = { userId: null, items: [], loading: true };
let cartState = EMPTY_CART;
const cartListeners = new Set<() => void>();
let inFlight: { userId: string; promise: Promise<void> } | null = null;
let merging: Promise<void> | null = null;

const GUEST_KEY = "rasa_guest_cart";

function readGuestCart(): CartRow[] {
  try {
    const rows = JSON.parse(localStorage.getItem(GUEST_KEY) ?? "[]");
    return Array.isArray(rows)
      ? rows.filter((r) => typeof r?.sku === "string" && Number.isInteger(r?.quantity) && r.quantity > 0)
      : [];
  } catch {
    return [];
  }
}

function writeGuestCart(rows: CartRow[]) {
  try {
    if (rows.length) localStorage.setItem(GUEST_KEY, JSON.stringify(rows));
    else localStorage.removeItem(GUEST_KEY);
  } catch {
    /* storage blocked (private mode): the cart lasts for this page only */
  }
}

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

/** Moves the guest cart into the signed-in user's cart (adding quantities). */
async function mergeGuestCart(userId: string) {
  const guest = readGuestCart();
  if (!guest.length) return;
  const { data: existing } = await supabase
    .from("cart_items")
    .select("sku, quantity")
    .eq("user_id", userId);
  const have = new Map((existing ?? []).map((r) => [r.sku, r.quantity]));
  for (const row of guest) {
    const current = have.get(row.sku);
    const { error } =
      current != null
        ? await supabase
            .from("cart_items")
            .update({ quantity: current + row.quantity, updated_at: new Date().toISOString() })
            .eq("user_id", userId)
            .eq("sku", row.sku)
        : await supabase
            .from("cart_items")
            .insert({ user_id: userId, sku: row.sku, quantity: row.quantity });
    if (error) {
      console.error("guest cart merge failed", error);
      return; // keep the guest cart so nothing is lost; retried next load
    }
  }
  writeGuestCart([]);
}

function setGuestItems(items: CartRow[]) {
  writeGuestCart(items);
  setCartState({ userId: null, items, loading: false });
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
      if (cartState.userId !== null || cartState.loading) setGuestItems(readGuestCart());
      return;
    }
    if (cartState.userId === userId) return;
    // On sign-in, fold the guest cart in once, then load the account cart.
    merging ??= mergeGuestCart(userId).finally(() => {
      merging = null;
    });
    void merging.then(() => loadCart(userId));
  }, [userId, authLoading]);

  // Until this user's cart has loaded, report it as loading rather than
  // showing another user's (or an empty) cart.
  const mine = state.userId === userId;
  const items = mine ? state.items : [];
  const loading = authLoading || !mine || state.loading;

  const refresh = useCallback(async () => {
    if (userId) {
      inFlight = null;
      await loadCart(userId);
    } else {
      setGuestItems(readGuestCart());
    }
  }, [userId]);

  const addItem = useCallback(
    async (sku: string, quantity = 1) => {
      if (!userId) {
        const rows = readGuestCart();
        const row = rows.find((r) => r.sku === sku);
        if (row) row.quantity += quantity;
        else rows.push({ sku, quantity });
        setGuestItems(rows);
        return;
      }
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
      if (!userId) {
        const rows = readGuestCart()
          .map((r) => (r.sku === sku ? { ...r, quantity } : r))
          .filter((r) => r.quantity > 0);
        setGuestItems(rows);
        return;
      }
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
      if (!userId) {
        setGuestItems(readGuestCart().filter((r) => r.sku !== sku));
        return;
      }
      await supabase.from("cart_items").delete().eq("user_id", userId).eq("sku", sku);
      await refresh();
    },
    [userId, refresh],
  );

  const clear = useCallback(async () => {
    if (!userId) {
      setGuestItems([]);
      return;
    }
    await supabase.from("cart_items").delete().eq("user_id", userId);
    await refresh();
  }, [userId, refresh]);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, count, loading, addItem, setQuantity, removeItem, clear, refresh };
}
