import { Check, Tag } from "lucide-react";
import { COUPONS } from "@/lib/coupons";
import { formatPrice } from "@/lib/money";

/**
 * Available coupons at checkout. A coupon the cart doesn't qualify for yet is
 * greyed out with how much more to add; otherwise it can be applied.
 */
export function CouponPicker({
  subtotalCents,
  applied,
  onApply,
  onRemove,
}: {
  /** Items subtotal after the mouth tip offer, before delivery. */
  subtotalCents: number;
  applied: string | null;
  onApply: (code: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="mt-5 border-t border-border/30 pt-5">
      <p className="flex items-center gap-2 text-[0.65rem] tracking-luxe uppercase text-foreground/50 mb-3">
        <Tag className="h-3.5 w-3.5" /> Coupons
      </p>
      <ul className="space-y-2">
        {COUPONS.map((c) => {
          const eligible = subtotalCents >= c.minSubtotalCents;
          const isApplied = applied === c.code && eligible;
          return (
            <li
              key={c.code}
              className={`flex items-center justify-between gap-3 border p-3 transition-colors ${
                isApplied
                  ? "border-gold/60 bg-gold/10"
                  : eligible
                    ? "border-gold/30"
                    : "border-border/30 opacity-50"
              }`}
              aria-disabled={!eligible}
            >
              <div className="min-w-0">
                <p className="font-mono text-sm tracking-widest text-gold">{c.code}</p>
                <p className="text-xs text-foreground/70">{c.description}</p>
                {!eligible && (
                  <p className="mt-1 text-[0.65rem] text-foreground/60">
                    Add {formatPrice(c.minSubtotalCents - subtotalCents, "INR")} more to unlock
                  </p>
                )}
              </div>
              {isApplied ? (
                <div className="flex items-center gap-3 shrink-0">
                  <span className="flex items-center gap-1 text-[0.6rem] tracking-luxe uppercase text-gold">
                    <Check className="h-3.5 w-3.5" /> Applied
                  </span>
                  <button
                    type="button"
                    onClick={onRemove}
                    className="text-[0.6rem] tracking-luxe uppercase text-foreground/50 hover:text-gold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onApply(c.code)}
                  disabled={!eligible}
                  className="shrink-0 px-4 py-2 border border-gold/50 text-gold text-[0.6rem] tracking-luxe uppercase transition-colors hover:bg-gold hover:text-primary-foreground disabled:cursor-not-allowed disabled:border-border/40 disabled:text-foreground/40 disabled:hover:bg-transparent"
                >
                  Apply
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
