/**
 * End-to-end shopping flows through the real components, hooks and pricing
 * rules, against an in-memory Supabase whose create-order runs the edge
 * function's own pricing code. Covers what can't be clicked through on the
 * live site without a signed-in account: cart, the 2-for-₹150 offer and
 * checkout totals matching what the server charges.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { RouteComponent } from "@tanstack/react-router";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { createFakeSupabase, price } from "./fakeSupabase";

// These render whole pages; on a loaded machine a test can pass the 5s default.
vi.setConfig({ testTimeout: 30_000 });

const holder = vi.hoisted(() => ({ fake: null as ReturnType<typeof createFakeSupabase> | null }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: new Proxy(
    {},
    { get: (_, prop) => (holder.fake!.client as Record<string | symbol, unknown>)[prop] },
  ),
}));

import { AddToCartControl } from "@/components/shop/AddToCartControl";
import { findCatalogEntry } from "@/data/catalog";
import { useProductPrices } from "@/hooks/useProductPrices";
import { Route as CartRoute } from "@/routes/cart";
import { Route as CheckoutRoute } from "@/routes/checkout";

const LION_BLACK = "accessories-lion-mouth-tip-black";
const COMMISSIONER_20G = "majlis-commissioner-20g";
const COMMISSIONER_60G = "majlis-commissioner-60g"; // not on sale yet

const PRICES = [
  price(COMMISSIONER_20G, 85),
  price(COMMISSIONER_60G, null, 0, false),
  price(LION_BLACK, 85),
  price("accessories-lion-mouth-tip-white", 85),
  price("accessories-lion-mouth-tip-grey", 85),
  price("accessories-lion-mouth-tip-glow-in-the-dark", 85),
  price("accessories-charlie-mouth-tip-white", 85),
];

let userSeq = 0;
function setup(opts: { signedIn?: boolean; cart?: [string, number][] } = {}) {
  const fake = createFakeSupabase({
    prices: PRICES,
    signedIn: opts.signedIn,
    userId: `user-${++userSeq}`,
  });
  for (const [sku, quantity] of opts.cart ?? []) {
    fake.db.cart_items.push({ user_id: fake.user.id, sku, quantity, created_at: quantity });
  }
  holder.fake = fake;
  return fake;
}

/** Renders a page inside a minimal router; any navigation lands on a stub. */
async function renderPage(Page: RouteComponent) {
  const root = createRootRoute({ component: () => <Outlet /> });
  const page = createRoute({ getParentRoute: () => root, path: "/", component: Page });
  const elsewhere = createRoute({
    getParentRoute: () => root,
    path: "$",
    component: () => <p>navigated away</p>,
  });
  const router = createRouter({
    routeTree: root.addChildren([page, elsewhere]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  await act(async () => {
    render(<RouterProvider router={router} />);
    await router.load();
  });
  return router;
}

function LionControl() {
  const { prices, loading } = useProductPrices();
  if (loading) return <p>loading prices</p>;
  return (
    <AddToCartControl entry={findCatalogEntry("accessories-lion-mouth-tip")!} prices={prices} />
  );
}

const cartRows = (fake: ReturnType<typeof createFakeSupabase>) =>
  Object.fromEntries(
    fake.db.cart_items.filter((r) => r.user_id === fake.user.id).map((r) => [r.sku, r.quantity]),
  );

beforeEach(() => {
  holder.fake = null;
});

describe("product → cart", () => {
  it("adds a mouth tip, suggests a second for ₹150, and applies the offer", async () => {
    const fake = setup();
    await renderPage(LionControl);
    await screen.findByText("Any 2 mouth tips for ₹150");

    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));
    await waitFor(() => expect(cartRows(fake)).toEqual({ [LION_BLACK]: 1 }));
    expect(await screen.findByText("Buy 2 for ₹150")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add another" }));
    await waitFor(() => expect(cartRows(fake)).toEqual({ [LION_BLACK]: 2 }));
    expect(await screen.findByText(/2 for ₹150 applied/)).toBeInTheDocument();
  });

  it("adds the finish the shopper picked", async () => {
    const fake = setup();
    await renderPage(LionControl);
    fireEvent.click(await screen.findByRole("button", { name: /^grey/i }));
    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));
    await waitFor(() => expect(cartRows(fake)).toEqual({ "accessories-lion-mouth-tip-grey": 1 }));
  });

  it("asks a signed-out shopper to sign in instead of adding to the cart", async () => {
    const fake = setup({ signedIn: false });
    await renderPage(LionControl);
    fireEvent.click(await screen.findByRole("button", { name: /add to cart/i }));
    expect(await screen.findByText(/sign in to add items to your cart/i)).toBeInTheDocument();
    expect(fake.db.cart_items).toHaveLength(0);
  });
});

describe("cart page", () => {
  it("totals the cart with the pair offer and delivery, skipping items not on sale", async () => {
    setup({
      cart: [
        [LION_BLACK, 2],
        [COMMISSIONER_20G, 1],
        [COMMISSIONER_60G, 1],
      ],
    });
    await renderPage(CartRoute.options.component as RouteComponent);
    const summary = (await screen.findByText("Order Summary")).parentElement!;
    // 3 × ₹85 = ₹255, pair offer −₹20 → ₹235, under the ₹249 free-delivery line → +₹49.
    expect(within(summary).getByText("₹255")).toBeInTheDocument();
    expect(within(summary).getByText("−₹20")).toBeInTheDocument();
    expect(within(summary).getByText("₹49")).toBeInTheDocument();
    expect(within(summary).getByText("₹284")).toBeInTheDocument();
    expect(within(summary).getByText(/aren't available to order yet/)).toBeInTheDocument();
  });

  it("nudges toward a second mouth tip when there is an odd one", async () => {
    setup({ cart: [[LION_BLACK, 1]] });
    await renderPage(CartRoute.options.component as RouteComponent);
    expect(await screen.findByText("Buy 2 for ₹150")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Choose a mouth tip" })).toBeInTheDocument();
  });
});

describe("checkout → order", () => {
  async function fillAndPlace() {
    const fields: [RegExp, string][] = [
      [/full name/i, "Test Buyer"],
      [/^phone/i, "9876543210"],
      [/^email/i, "buyer@example.com"],
      [/address line 1/i, "12 Test Street"],
      [/^city/i, "Gurugram"],
      [/^state/i, "Haryana"],
      [/postal code/i, "122016"],
    ];
    for (const [label, value] of fields) {
      fireEvent.change(await screen.findByLabelText(label), { target: { value } });
    }
    const place = screen.getByRole("button", { name: /place order/i });
    const shownTotal = place.textContent!.match(/₹[\d,]+/)![0];
    fireEvent.click(place);
    return shownTotal;
  }

  it("charges exactly the total shown, applies the offer and keeps unreleased items in the cart", async () => {
    const fake = setup({
      cart: [
        [LION_BLACK, 2],
        [COMMISSIONER_20G, 1],
        [COMMISSIONER_60G, 1],
      ],
    });
    const router = await renderPage(CheckoutRoute.options.component as RouteComponent);

    const shownTotal = await fillAndPlace();
    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/order-confirmation\//));

    const [order] = fake.db.orders;
    expect(shownTotal).toBe("₹284");
    expect(order.total_cents).toBe(28400);
    expect(fake.db.order_items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sku: LION_BLACK,
          quantity: 2,
          unit_price_cents: 7500,
          format: "Black · 2 for ₹150",
        }),
        expect.objectContaining({ sku: COMMISSIONER_20G, quantity: 1, unit_price_cents: 8500 }),
      ]),
    );
    expect(fake.db.order_items).toHaveLength(2);
    // Ordered items left the cart; the pack that isn't on sale yet stayed.
    expect(cartRows(fake)).toEqual({ [COMMISSIONER_60G]: 1 });
    // Stock was reserved.
    expect(fake.db.product_prices.find((p) => p.sku === LION_BLACK)!.stock_quantity).toBe(98);
  });

  it("shows the server's error when there isn't enough stock", async () => {
    setup({ cart: [[LION_BLACK, 500]] });
    const router = await renderPage(CheckoutRoute.options.component as RouteComponent);
    await fillAndPlace();
    expect(await screen.findByText(/not enough stock for lion mouth tip/i)).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/");
  });

  it("blocks the order until required details are valid", async () => {
    const fake = setup({ cart: [[COMMISSIONER_20G, 1]] });
    await renderPage(CheckoutRoute.options.component as RouteComponent);
    fireEvent.change(await screen.findByLabelText(/full name/i), { target: { value: "Test" } });
    fireEvent.click(screen.getByRole("button", { name: /place order/i }));
    expect((await screen.findAllByText("Required")).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/^phone/i)).toHaveAttribute("aria-invalid", "true");

    fireEvent.change(screen.getByLabelText(/^phone/i), { target: { value: "12345" } });
    fireEvent.click(screen.getByRole("button", { name: /place order/i }));
    expect(await screen.findByText("Enter a 10-digit mobile number")).toBeInTheDocument();
    expect(fake.calls).toHaveLength(0);
  });;
});
