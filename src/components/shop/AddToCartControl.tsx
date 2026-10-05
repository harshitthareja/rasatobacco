import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { AuthModal } from "@/components/AuthModal";
import { formats, productSku, type CatalogEntry } from "@/data/catalog";
import { formatPrice } from "@/lib/money";
import type { ProductPrice } from "@/hooks/useProductPrices";

type Props = {
  entry: CatalogEntry;
  prices: Record<string, ProductPrice>;
  compact?: boolean;
};

export function AddToCartControl({ entry, prices, compact = false }: Props) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [format, setFormat] = useState(formats[1]);
  const [qty, setQty] = useState(1);
  const [authOpen, setAuthOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const sku = productSku(entry.collection.slug, entry.flavour.name, format);
  const price = prices[sku];
  const hasPrice = price?.price_cents != null;
  const purchasable = entry.flavour.available && !!price?.is_purchasable && hasPrice;
  const inStock = (price?.stock_quantity ?? 0) > 0;
  const canBuy = purchasable && inStock;

  const act = async (buyNow: boolean) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (!canBuy) return;
    setBusy(true);
    try {
      await addItem(sku, qty);
      if (buyNow) {
        navigate({ to: "/checkout" });
      } else {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1800);
      }
    } finally {
      setBusy(false);
    }
  };

  if (!entry.flavour.available) {
    return (
      <div className="pt-2">
        <span className="text-[0.6rem] tracking-wider-luxe uppercase border border-foreground/25 text-foreground/50 px-3 py-1.5 inline-block">
          Forthcoming
        </span>
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-5"}>
      <div>
        {!compact && (
          <p className="text-[0.55rem] tracking-wider-luxe uppercase mb-2 text-foreground/55">
            Pack Size
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {formats.map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`text-[0.65rem] tracking-luxe uppercase px-3 py-2 border transition-all duration-200 ${
                format === f
                  ? "border-gold text-gold bg-gold/10"
                  : "border-border/40 text-foreground/60 hover:border-gold/50 hover:text-gold"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-baseline gap-3">
        {hasPrice ? (
          <>
            <span className={`font-serif text-gold ${compact ? "text-xl" : "text-3xl"}`}>
              {formatPrice(price!.price_cents, price!.currency)}
            </span>
            {price!.on_sale && (
              <>
                <span className="text-sm text-foreground/45 line-through">
                  {formatPrice(price!.regular_price_cents, price!.currency)}
                </span>
                <span className="text-[0.6rem] tracking-luxe uppercase px-2 py-0.5 border border-gold/50 text-gold">
                  {Math.round((1 - price!.price_cents! / price!.regular_price_cents!) * 100)}% off
                </span>
              </>
            )}
          </>
        ) : (
          <span className="text-[0.65rem] tracking-luxe uppercase text-foreground/45">
            Price coming soon
          </span>
        )}
        {hasPrice && !inStock && (
          <span className="text-[0.6rem] tracking-luxe uppercase text-destructive/80">
            Out of stock
          </span>
        )}
      </div>

      {canBuy && (
        <div className="flex items-center gap-3">
          {!compact && (
            <p className="text-[0.55rem] tracking-wider-luxe uppercase text-foreground/55">Qty</p>
          )}
          <div className="flex items-center border border-border/40">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="p-2.5 text-foreground/70 hover:text-gold transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-10 text-center text-sm">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(price?.stock_quantity ?? 99, q + 1))}
              className="p-2.5 text-foreground/70 hover:text-gold transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      <div className={`flex gap-3 ${compact ? "flex-col" : "flex-col sm:flex-row"}`}>
        <button
          onClick={() => act(false)}
          disabled={!canBuy || busy}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gold/50 text-gold text-[0.65rem] tracking-luxe uppercase hover:bg-gold/10 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {justAdded ? (
            <>
              <Check className="h-3.5 w-3.5" /> Added
            </>
          ) : (
            <>
              <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
            </>
          )}
        </button>
        <button
          onClick={() => act(true)}
          disabled={!canBuy || busy}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold text-primary-foreground text-[0.65rem] tracking-luxe uppercase hover:bg-gold-soft transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Buy Now
        </button>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} reason="cart" />
    </div>
  );
}
