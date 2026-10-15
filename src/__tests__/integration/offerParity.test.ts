/**
 * The website (src/lib/offers.ts) and the order function
 * (supabase/functions/_shared/offers.ts) each carry the 2-for-₹150 rules. If
 * they ever drift, the cart would show one total and the buyer be charged
 * another — so run both over many random carts and require identical results.
 */
import { describe, it, expect } from "vitest";
import * as site from "@/lib/offers";
import * as server from "../../../supabase/functions/_shared/offers.ts";

const SKUS = [
  "accessories-lion-mouth-tip-black",
  "accessories-charlie-mouth-tip-glow-in-the-dark",
  "accessories-joker-mouth-tip-grey",
  "majlis-commissioner-20g",
  "makhmal-kiwi-20g",
];

function randomCart(seed: number) {
  let s = seed;
  const rand = () => (s = (s * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
  return SKUS.filter(() => rand() < 0.6).map((sku) => ({
    sku,
    quantity: 1 + Math.floor(rand() * 5),
    unit_price_cents: [7900, 8500, 9900][Math.floor(rand() * 3)],
  }));
}

describe("offer rules: website and order function agree", () => {
  it("uses the same pair price", () => {
    expect(site.MOUTH_TIP_PAIR_PRICE_CENTS).toBe(server.MOUTH_TIP_PAIR_PRICE_CENTS);
  });

  it("prices 500 random carts identically", () => {
    for (let seed = 1; seed <= 500; seed++) {
      const cart = randomCart(seed);
      expect(site.applyPairOffer(cart), `seed ${seed}`).toEqual(server.applyPairOffer(cart));
    }
  });
});
