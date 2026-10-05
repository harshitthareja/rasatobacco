import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { CATALOG, type CatalogEntry } from "@/data/catalog";
import { useProductPrices } from "@/hooks/useProductPrices";
import { AddToCartControl } from "@/components/shop/AddToCartControl";
import { collections, type Collection } from "@/data/collections";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — House of RASA" },
      {
        name: "description",
        content:
          "Shop every RASA flavour across Majlis, Makhmal and Tarkib — order online, direct from the house.",
      },
      { property: "og:title", content: "Shop — House of RASA" },
    ],
  }),
  component: ShopPage,
});

type CollectionFilter = "all" | Collection["slug"];
type AvailFilter = "all" | "available" | "forthcoming";

function ShopPage() {
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>("all");
  const [availFilter, setAvailFilter] = useState<AvailFilter>("all");
  const { prices, loading } = useProductPrices();

  const items = useMemo(() => {
    return CATALOG.filter((item) => {
      if (collectionFilter !== "all" && item.collection.slug !== collectionFilter) return false;
      if (availFilter === "available" && !item.flavour.available) return false;
      if (availFilter === "forthcoming" && item.flavour.available) return false;
      return true;
    }).sort((a, b) => Number(b.flavour.available) - Number(a.flavour.available));
  }, [collectionFilter, availFilter]);

  const availableCount = CATALOG.filter((i) => i.flavour.available).length;

  return (
    <main className="bg-ink text-foreground min-h-screen">
      {/* Hero */}
      <section className="relative pt-40 pb-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 grain opacity-30 pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, oklch(0.74 0.08 45 / 0.12), transparent 60%)",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-[0.65rem] tracking-luxe uppercase text-gold mb-4">House of RASA</p>
          <h1 className="font-serif text-6xl md:text-8xl leading-none mb-6">Shop</h1>
          <p
            className="font-display text-sm tracking-luxe uppercase mb-8"
            style={{ color: "#DEA193" }}
          >
            SMOKE, PERFECTED
          </p>
          <p className="text-foreground/70 max-w-xl mx-auto leading-relaxed text-sm">
            {availableCount} flavours available to order now across Majlis, Makhmal and Tarkib, with
            the rest of the cellar arriving in stages.
          </p>
        </div>
      </section>

      <div className="luxe-divider max-w-md mx-auto" />

      {/* Filters */}
      <section className="sticky top-20 z-30 bg-ink/95 backdrop-blur-xl border-b border-border/30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-4">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-[0.6rem] tracking-luxe uppercase text-foreground/40 mr-1">
              Collection:
            </span>
            {(["all", ...collections.map((c) => c.slug)] as CollectionFilter[]).map((slug) => (
              <button
                key={slug}
                onClick={() => setCollectionFilter(slug)}
                className={`text-[0.6rem] tracking-luxe uppercase px-3 py-1.5 border transition-all duration-200 ${
                  collectionFilter === slug
                    ? "border-gold text-gold bg-gold/10"
                    : "border-border/40 text-foreground/60 hover:border-gold/50 hover:text-gold"
                }`}
              >
                {slug === "all" ? "All" : collections.find((c) => c.slug === slug)?.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center lg:ml-auto">
            <span className="text-[0.6rem] tracking-luxe uppercase text-foreground/40 mr-1">
              Status:
            </span>
            {(
              [
                ["all", "All"],
                ["available", "Available Now"],
                ["forthcoming", "Forthcoming"],
              ] as [AvailFilter, string][]
            ).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setAvailFilter(val)}
                className={`text-[0.6rem] tracking-luxe uppercase px-3 py-1.5 border transition-all duration-200 ${
                  availFilter === val
                    ? "border-gold text-gold bg-gold/10"
                    : "border-border/40 text-foreground/60 hover:border-gold/50 hover:text-gold"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="text-[0.6rem] tracking-luxe uppercase text-foreground/40 shrink-0">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        {items.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-serif text-2xl text-foreground/60 mb-3">
              No items match these filters.
            </p>
            <button
              onClick={() => {
                setCollectionFilter("all");
                setAvailFilter("all");
              }}
              className="text-[0.65rem] tracking-luxe uppercase text-gold hover:text-gold-soft transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ProductCard key={item.key} entry={item} prices={prices} pricesLoading={loading} />
            ))}
          </div>
        )}
      </section>

      {/* Bottom band */}
      <section className="py-20 px-6 text-center border-t border-border/30">
        <p className="text-[0.65rem] tracking-luxe uppercase text-gold mb-4">Trade & Bulk Orders</p>
        <h2 className="font-serif text-3xl md:text-4xl mb-6">Buying for a venue or store?</h2>
        <p className="text-sm text-foreground/65 max-w-md mx-auto mb-8 leading-relaxed">
          For wholesale pricing and larger quantities, RASA partners directly with retailers,
          lounges and distributors.
        </p>
        <Link
          to="/partners"
          className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-ink text-[0.7rem] tracking-luxe uppercase hover:bg-gold-soft transition-all duration-500"
        >
          Become a Partner
        </Link>
      </section>
    </main>
  );
}

function ProductCard({
  entry,
  prices,
  pricesLoading,
}: {
  entry: CatalogEntry;
  prices: ReturnType<typeof useProductPrices>["prices"];
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
            {collection.name}
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
