import { Link } from "@tanstack/react-router";
import { Image as ImageIcon } from "lucide-react";
import type { CatalogEntry } from "@/data/catalog";
import type { ProductPrice } from "@/hooks/useProductPrices";
import { AddToCartControl } from "@/components/shop/AddToCartControl";

export function ProductCard({
  entry,
  prices,
  pricesLoading,
}: {
  entry: CatalogEntry;
  prices: Record<string, ProductPrice>;
  pricesLoading: boolean;
}) {
  const { flavour, collection, image, key } = entry;

  return (
    <article
      className={`group/card border border-border/40 bg-surface/10 flex flex-col transition-all duration-500 ${
        flavour.available ? "hover:border-gold/40 hover:bg-surface/20" : "opacity-60"
      }`}
    >
      <Link to="/product/$key" params={{ key }} className="block">
        <div
          className="relative aspect-[4/5] overflow-hidden border-b border-border/30"
          style={{
            background: image
              ? undefined
              : `radial-gradient(ellipse at 50% 30%, color-mix(in oklab, ${collection.accentVar} 16%, transparent), transparent 70%), color-mix(in oklab, ${collection.bgVar} 35%, var(--ink))`,
          }}
        >
          {image ? (
            <img
              src={image}
              alt={`${flavour.name} — ${collection.name}`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 border border-dashed border-foreground/15 m-3">
              <ImageIcon className="h-6 w-6 text-foreground/25" strokeWidth={1.25} />
              <p className="text-[0.55rem] tracking-wider-luxe uppercase text-foreground/30 text-center px-4">
                Product photography
                <br />
                coming soon
              </p>
            </div>
          )}

          <span
            className="absolute top-3 left-3 text-[0.55rem] tracking-wider-luxe uppercase px-2 py-1 bg-ink/70 backdrop-blur-sm"
            style={{ color: collection.accentVar }}
          >
            {entry.subcategory ?? collection.name}
          </span>

          {!flavour.available && (
            <span className="absolute top-3 right-3 text-[0.55rem] tracking-wider-luxe uppercase px-2 py-1 border border-foreground/30 bg-ink/70 backdrop-blur-sm text-foreground/60">
              Forthcoming
            </span>
          )}
        </div>
      </Link>

      <div className="p-6 flex-1 flex flex-col">
        <Link to="/product/$key" params={{ key }}>
          <h3
            className={`font-serif text-2xl leading-tight mb-2 transition-colors duration-300 ${
              flavour.available
                ? "text-foreground group-hover/card:text-gold"
                : "text-foreground/70"
            }`}
          >
            {flavour.name}
          </h3>
        </Link>
        <p
          className={`text-xs leading-relaxed tracking-wide mb-5 ${flavour.available ? "text-foreground/60" : "text-foreground/40"}`}
        >
          {flavour.notes}
        </p>

        <div className="mt-auto">
          {pricesLoading ? (
            <div className="w-5 h-5 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
          ) : (
            <AddToCartControl entry={entry} prices={prices} compact />
          )}
        </div>
      </div>
    </article>
  );
}
