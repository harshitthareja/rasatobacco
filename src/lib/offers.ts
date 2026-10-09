/**
 * Mouth tip pair offer: any two mouth tips (mixed designs and finishes) for
 * ₹150. Paired tips are priced at half the pair price each; an odd one out
 * pays its own price.
 *
 * Keep in sync with supabase/functions/_shared/offers.ts, which applies the
 * same rule when the order is created (the server is authoritative).
 */

export const MOUTH_TIP_PAIR_PRICE_CENTS = 15000;

export const isMouthTipSku = (sku: string) =>
  sku.startsWith("accessories-") && sku.includes("-mouth-tip-");

export type OfferLine = {
  sku: string;
  quantity: number;
  unit_price_cents: number;
  offer?: boolean;
};

/**
 * Splits lines so every paired mouth tip is its own line at the offer price.
 * The pricier tips are paired first, so the buyer always gets the best deal.
 */
export function applyPairOffer<T extends OfferLine>(lines: T[]): T[] {
  const tips = lines.filter((l) => isMouthTipSku(l.sku));
  const pairedTotal = Math.floor(tips.reduce((n, l) => n + l.quantity, 0) / 2) * 2;
  if (pairedTotal === 0) return lines;

  const pairUnit = MOUTH_TIP_PAIR_PRICE_CENTS / 2;
  let left = pairedTotal;
  const pairedBySku = new Map<string, number>();
  for (const l of [...tips].sort((a, b) => b.unit_price_cents - a.unit_price_cents)) {
    const take = Math.min(l.quantity, left);
    pairedBySku.set(l.sku, take);
    left -= take;
  }

  return lines.flatMap((l) => {
    const paired = pairedBySku.get(l.sku) ?? 0;
    if (!paired || l.unit_price_cents <= pairUnit) return [l];
    const out: T[] = [{ ...l, quantity: paired, unit_price_cents: pairUnit, offer: true }];
    if (l.quantity > paired) out.push({ ...l, quantity: l.quantity - paired });
    return out;
  });
}

/** How much the pair offer saves on these lines. */
export function pairOfferSavings(lines: OfferLine[]) {
  const before = lines.reduce((s, l) => s + l.unit_price_cents * l.quantity, 0);
  const after = applyPairOffer(lines).reduce((s, l) => s + l.unit_price_cents * l.quantity, 0);
  return before - after;
}

/** Number of mouth tips across the given lines. */
export function mouthTipCount(lines: { sku: string; quantity: number }[]) {
  return lines.filter((l) => isMouthTipSku(l.sku)).reduce((n, l) => n + l.quantity, 0);
}
