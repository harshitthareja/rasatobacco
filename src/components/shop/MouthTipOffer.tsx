import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

/** Nudges the buyer toward the "any 2 mouth tips for ₹150" offer. */
export function MouthTipOfferNote({
  count,
  onAddAnother,
  busy = false,
  className = "",
}: {
  /** Mouth tips currently in the cart. */
  count: number;
  /** Adds one more of the tip being viewed; omit to only link to the range. */
  onAddAnother?: () => void;
  busy?: boolean;
  className?: string;
}) {
  if (count === 0) return null;

  if (count % 2 === 0) {
    return (
      <p className={`flex items-center gap-2 text-[0.65rem] tracking-wide text-gold ${className}`}>
        <Sparkles className="h-3.5 w-3.5 shrink-0" />2 for ₹150 applied to your mouth tips.
      </p>
    );
  }

  return (
    <div className={`border border-gold/40 bg-gold/5 p-4 ${className}`}>
      <p className="flex items-center gap-2 text-[0.6rem] tracking-luxe uppercase text-gold mb-1.5">
        <Sparkles className="h-3.5 w-3.5 shrink-0" />
        Buy 2 for ₹150
      </p>
      <p className="text-xs text-foreground/70 leading-relaxed mb-3">
        Add one more mouth tip — any design, any finish — and pay ₹150 for the pair.
      </p>
      <div className="flex flex-wrap gap-2">
        {onAddAnother && (
          <button
            type="button"
            onClick={onAddAnother}
            disabled={busy}
            className="px-4 py-2 bg-gold text-primary-foreground text-[0.6rem] tracking-luxe uppercase hover:bg-gold-soft transition-colors disabled:opacity-50"
          >
            Add another
          </button>
        )}
        <Link
          to="/accessories/$category"
          params={{ category: "mouth-tips" }}
          className="px-4 py-2 border border-gold/50 text-gold text-[0.6rem] tracking-luxe uppercase hover:bg-gold/10 transition-colors"
        >
          {onAddAnother ? "Pick a different one" : "Choose a mouth tip"}
        </Link>
      </div>
    </div>
  );
}
