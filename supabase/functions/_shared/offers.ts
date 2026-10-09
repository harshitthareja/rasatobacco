// Copy of src/lib/offers.ts for the edge functions — keep the two in sync.
export const MOUTH_TIP_PAIR_PRICE_CENTS = 15000;

export const isMouthTipSku = (sku: string) =>
  sku.startsWith("accessories-") && sku.includes("-mouth-tip-");

export type OfferLine = { sku: string; quantity: number; unit_price_cents: number; offer?: boolean };

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

