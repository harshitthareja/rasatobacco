import { describe, it, expect } from "vitest";
import { applyPairOffer, mouthTipCount, pairOfferSavings } from "@/lib/offers";

const tip = (sku: string, quantity: number) => ({
  sku: `accessories-${sku}-mouth-tip-black`,
  quantity,
  unit_price_cents: 8500,
});

const total = (lines: { quantity: number; unit_price_cents: number }[]) =>
  lines.reduce((s, l) => s + l.quantity * l.unit_price_cents, 0);

describe("mouth tip pair offer", () => {
  it("charges ₹85 for a single tip", () => {
    expect(total(applyPairOffer([tip("lion", 1)]))).toBe(8500);
  });

  it("charges ₹150 for two tips of the same design", () => {
    expect(total(applyPairOffer([tip("lion", 2)]))).toBe(15000);
  });

  it("pairs mixed designs", () => {
    expect(total(applyPairOffer([tip("lion", 1), tip("charlie", 1)]))).toBe(15000);
  });

  it("charges the odd one out at full price", () => {
    const lines = applyPairOffer([tip("lion", 3)]);
    expect(total(lines)).toBe(23500);
    expect(lines).toHaveLength(2);
  });

  it("leaves other products alone", () => {
    const flavour = { sku: "majlis-commissioner-20g", quantity: 2, unit_price_cents: 8500 };
    expect(applyPairOffer([flavour])).toEqual([flavour]);
    expect(pairOfferSavings([flavour, tip("lion", 2)])).toBe(2000);
    expect(mouthTipCount([flavour, tip("lion", 3)])).toBe(3);
  });
});
