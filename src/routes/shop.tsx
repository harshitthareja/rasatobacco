import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CATALOG, accessoriesGroup, type CatalogGroup } from "@/data/catalog";
import { useProductPrices } from "@/hooks/useProductPrices";
import { ProductCard } from "@/components/shop/ProductCard";
import { collections } from "@/data/collections";
import { partnerWhatsAppUrl } from "@/data/contact";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — House of RASA" },
      {
        name: "description",
        content:
          "Shop every RASA flavour across Majlis, Makhmal and Tarkib, plus accessories — order online, direct from the house.",
      },
      { property: "og:title", content: "Shop — House of RASA" },
    ],
  }),
  component: ShopPage,
});

type CollectionFilter = "all" | CatalogGroup["slug"];

const filterGroups: CatalogGroup[] = [...collections, accessoriesGroup];

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

  return (
    <main className="min-h-screen bg-ink pt-24 text-foreground">
      {/* Filters — sticky only on wide screens; on phones they wrap to several
          rows and would cover the products, so they scroll away instead. */}
      <section className="relative lg:sticky lg:top-20 z-30 bg-ink/95 backdrop-blur-xl border-b border-border/30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-4">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-[0.6rem] tracking-luxe uppercase text-foreground/40 mr-1">
              Series:
            </span>
            {(["all", ...filterGroups.map((g) => g.slug)] as CollectionFilter[]).map((slug) => (
              <button
                key={slug}
                onClick={() => setCollectionFilter(slug)}
                className={`text-[0.6rem] tracking-luxe uppercase px-3 py-1.5 border transition-all duration-200 ${
                  collectionFilter === slug
                    ? "border-gold text-gold bg-gold/10"
                    : "border-border/40 text-foreground/60 hover:border-gold/50 hover:text-gold"
                }`}
              >
                {slug === "all" ? "All" : filterGroups.find((g) => g.slug === slug)?.name}
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
        <a
          href={partnerWhatsAppUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-ink text-[0.7rem] tracking-luxe uppercase hover:bg-gold-soft transition-all duration-500"
        >
          Become a Partner
        </a>
      </section>
    </main>
  );
}
