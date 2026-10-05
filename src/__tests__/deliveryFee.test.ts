import { describe, expect, it } from "vitest";
import { shippingChargeFor } from "@/hooks/useStoreSettings";

const settings = { shipping_flat_cents: 4900, free_shipping_threshold_cents: 24900 };

describe("delivery fee", () => {
  it("charges ₹49 at or below ₹249", () => {
    expect(shippingChargeFor(7225, settings)).toBe(4900); // 1 × ₹72.25
    expect(shippingChargeFor(21675, settings)).toBe(4900); // 3 × ₹72.25
    expect(shippingChargeFor(24900, settings)).toBe(4900); // exactly ₹249
  });

  it("is free above ₹249", () => {
    expect(shippingChargeFor(24901, settings)).toBe(0);
    expect(shippingChargeFor(28900, settings)).toBe(0); // 4 × ₹72.25
  });

  it("is zero for an empty cart", () => {
    expect(shippingChargeFor(0, settings)).toBe(0);
  });
});
