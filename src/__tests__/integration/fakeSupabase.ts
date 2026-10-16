/**
 * In-memory Supabase for integration tests: real hooks and components run
 * against these tables, and the create-order function uses the edge
 * function's own pricing code (supabase/functions/_shared/pricing.ts).
 */
import { priceCart, type PriceRow } from "../../../supabase/functions/_shared/pricing.ts";

type Row = Record<string, unknown>;
type Tables = Record<string, Row[]>;

export const TEST_USER = {
  id: "user-1",
  email: "buyer@example.com",
  user_metadata: {},
  app_metadata: { provider: "email" },
};

export function price(
  sku: string,
  rupees: number | null,
  stock = 100,
  purchasable = true,
): PriceRow {
  return {
    sku,
    price_cents: rupees == null ? null : rupees * 100,
    sale_price_cents: null,
    sale_ends_at: null,
    is_purchasable: purchasable,
    stock_quantity: stock,
  };
}

export function createFakeSupabase(seed: {
  prices: PriceRow[];
  signedIn?: boolean;
  userId?: string;
}) {
  // The cart is shared per user across components, so each test signs in as its own user.
  const user = { ...TEST_USER, id: seed.userId ?? TEST_USER.id };
  let seq = 0;
  const db: Tables = {
    product_prices: seed.prices.map((p) => ({ ...p, currency: "INR" })),
    cart_items: [],
    store_settings: [{ id: 1, shipping_flat_cents: 4900, free_shipping_threshold_cents: 24900 }],
    orders: [],
    order_items: [],
    users: [],
  };
  let session: { user: typeof TEST_USER } | null = seed.signedIn === false ? null : { user };
  const calls: { fn: string; body: Record<string, unknown> }[] = [];

  class Query implements PromiseLike<{ data: unknown; error: null }> {
    private filters: ((r: Row) => boolean)[] = [];
    private op: "select" | "insert" | "update" | "delete" | "upsert" = "select";
    private payload: Row | Row[] | null = null;
    private single = false;
    private sort: [string, boolean] | null = null;
    constructor(private table: string) {}
    select() {
      return this;
    }
    eq(col: string, val: unknown) {
      this.filters.push((r) => r[col] === val);
      return this;
    }
    in(col: string, vals: unknown[]) {
      this.filters.push((r) => vals.includes(r[col]));
      return this;
    }
    order(col: string, opts: { ascending?: boolean } = {}) {
      this.sort = [col, opts.ascending ?? true];
      return this;
    }
    maybeSingle() {
      this.single = true;
      return this;
    }
    insert(p: Row | Row[]) {
      this.op = "insert";
      this.payload = p;
      return this;
    }
    update(p: Row) {
      this.op = "update";
      this.payload = p;
      return this;
    }
    upsert(p: Row) {
      this.op = "upsert";
      this.payload = p;
      return this;
    }
    delete() {
      this.op = "delete";
      return this;
    }
    private run() {
      const rows = (db[this.table] ??= []);
      const match = (r: Row) => this.filters.every((f) => f(r));
      if (this.op === "insert") {
        for (const r of [this.payload].flat() as Row[]) rows.push({ created_at: ++seq, ...r });
        return null;
      }
      if (this.op === "upsert") {
        const p = this.payload as Row;
        const i = rows.findIndex((r) => r.id === p.id);
        if (i >= 0) rows[i] = { ...rows[i], ...p };
        else rows.push(p);
        return null;
      }
      if (this.op === "update") {
        rows.filter(match).forEach((r) => Object.assign(r, this.payload));
        return null;
      }
      if (this.op === "delete") {
        db[this.table] = rows.filter((r) => !match(r));
        return null;
      }
      let out = rows.filter(match).map((r) => ({ ...r }));
      if (this.sort) {
        const [col, asc] = this.sort;
        out.sort((a, b) => ((a[col] as number) - (b[col] as number)) * (asc ? 1 : -1));
      }
      return this.single ? (out[0] ?? null) : out;
    }
    then<A, B>(
      onFulfilled?: ((v: { data: unknown; error: null }) => A | PromiseLike<A>) | null,
      onRejected?: ((e: unknown) => B | PromiseLike<B>) | null,
    ) {
      return Promise.resolve({ data: this.run(), error: null as null }).then(
        onFulfilled,
        onRejected,
      );
    }
  }

  // Mirrors supabase/functions/create-order for a cash-on-delivery order.
  function createOrder(body: Record<string, unknown>) {
    if (!session) return { error: "Sign in required" };
    const userId = session.user.id;
    const cart = db.cart_items.filter((r) => r.user_id === userId) as {
      sku: string;
      quantity: number;
    }[];
    const skuMeta = (body.skuMeta ?? {}) as Record<
      string,
      { productName?: string; format?: string }
    >;
    const priced = priceCart(
      cart,
      db.product_prices as unknown as PriceRow[],
      db.store_settings[0] as {
        shipping_flat_cents: number;
        free_shipping_threshold_cents: number;
      },
      (sku) => skuMeta[sku]?.productName ?? sku,
      Date.now(),
      typeof body.coupon === "string" ? body.coupon : null,
    );
    if (!priced.ok) return { error: priced.error };
    const orderId = `order-${++seq}`;
    db.orders.push({
      id: orderId,
      user_id: userId,
      total_cents: priced.total,
      subtotal_cents: priced.subtotal,
      discount_cents: priced.discount,
      coupon_code: priced.couponCode,
    });
    for (const li of priced.lineItems) {
      db.order_items.push({
        order_id: orderId,
        sku: li.sku,
        quantity: li.quantity,
        unit_price_cents: li.unit_price_cents,
        format: li.offer
          ? `${skuMeta[li.sku]?.format ?? ""} · 2 for ₹150`
          : skuMeta[li.sku]?.format,
      });
      const p = db.product_prices.find((r) => r.sku === li.sku)!;
      p.stock_quantity = (p.stock_quantity as number) - li.quantity;
    }
    // finalizeOrder: only the ordered items leave the cart.
    const ordered = new Set(priced.lineItems.map((l) => l.sku));
    db.cart_items = db.cart_items.filter(
      (r) => !(r.user_id === userId && ordered.has(r.sku as string)),
    );
    return {
      ok: true,
      order_id: orderId,
      payment_method: "cod",
      amount: priced.total,
      currency: "INR",
    };
  }

  const client = {
    from: (table: string) => new Query(table),
    auth: {
      getSession: async () => ({ data: { session } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: async () => {
        session = null;
        return { error: null };
      },
    },
    functions: {
      invoke: async (fn: string, { body }: { body: Record<string, unknown> }) => {
        calls.push({ fn, body });
        const data =
          fn === "create-order" ? createOrder(body) : { error: `unknown function ${fn}` };
        return { data, error: null };
      },
    },
  };

  return { client, db, calls, user };
}
