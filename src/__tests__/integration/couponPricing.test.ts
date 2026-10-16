/** The order function's coupon rules (supabase/functions/_shared). */
import { describe, it, expect } from "vitest";
import { priceCart, type PriceRow } from "../../../supabase/functions/_shared/pricing.ts";
import { applyCoupon } from "../../../supabase/functions/_shared/coupons.ts";

const row = (sku: string, rupees: number): PriceRow => ({
  sku,
  price_cents: rupees * 100,
  sale_price_cents: null,
  sale_ends_at: null,
  is_purchasable: true,
  stock_quantity: 100,
});
const PRICES = [row("majlis-commissioner-20g", 85), row("accessories-lion-mouth-tip-black", 85)];
const SETTINGS = { shipping_flat_cents: 4900, free_shipping_threshold_cents: 24900 };
const price = (cart: [string, number][], coupon: string | null) =>
  priceCart(
    cart.map(([sku, quantity]) => ({ sku, quantity })),
    PRICES,
    SETTINGS,
    undefined,
    Date.now(),
    coupon,
  );

describe("RASA15", () => {
  it("takes 15% off the items, keeping delivery", () => {
    // 3 × ₹85 = ₹255 → 15% is ₹38.25, rounded to ₹38; delivery free above ₹249.
    const r = price([["majlis-commissioner-20g", 3]], "RASA15");
    expect(r).toMatchObject({
      ok: true,
      subtotal: 25500,
      discount: 3800,
      couponCode: "RASA15",
      shippingCharge: 0,
      total: 21700,
    });
  });

  it("applies after the mouth tip pair offer", () => {
    // 2 tips = ₹150 + 2 × ₹85 = ₹320 → −₹48.
    const r = price(
      [
        ["accessories-lion-mouth-tip-black", 2],
        ["majlis-commissioner-20g", 2],
      ],
      "RASA15",
    );
    expect(r).toMatchObject({ ok: true, subtotal: 32000, discount: 4800, total: 27200 });
  });

  it("is refused below ₹249, so the buyer is never charged more than shown", () => {
    expect(price([["majlis-commissioner-20g", 2]], "RASA15")).toEqual({
      ok: false,
      status: 409,
      error: "RASA15 needs a cart of ₹249 or more",
    });
  });

  it("works at exactly ₹249 and ignores case and spaces", () => {
    expect(applyCoupon(" rasa15 ", 24900)).toEqual({ ok: true, code: "RASA15", discount: 3700 });
  });

  it("rejects unknown codes and leaves orders without a coupon unchanged", () => {
    expect(price([["majlis-commissioner-20g", 3]], "FREE100")).toMatchObject({
      ok: false,
      status: 409,
    });
    expect(price([["majlis-commissioner-20g", 3]], null)).toMatchObject({
      ok: true,
      discount: 0,
      couponCode: null,
      total: 25500,
    });
  });
});
