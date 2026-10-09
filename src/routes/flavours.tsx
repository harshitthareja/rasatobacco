import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { collections } from "@/data/collections";
import { flavourKey } from "@/data/sku";
import { productImages } from "@/data/productImages";
import { ProductHoverPreview } from "@/components/shop/ProductHoverPreview";
import { partnerWhatsAppUrl } from "@/data/contact";

export const Route = createFileRoute("/flavours")({
  head: () => ({
    meta: [
      { title: "Hookah Flavours — House of RASA" },
      { property: "og:title", content: "RASA Hookah Flavours" },
    ],
  }),
  component: FlavoursPage,
});

// Flatten all flavours without mentioning collection
const ALL_FLAVOURS = collections
  .flatMap((c) =>
    c.flavours.map((f) => {
      const key = flavourKey(c.slug, f.name);
      return {
        name: f.name,
        notes: f.notes,
        available: f.available,
        key,
        image: productImages[key],
      };
    }),
  )
  .filter((f, i, arr) => arr.findIndex((x) => x.name === f.name) === i) // deduplicate by name
  .sort((a, b) => Number(b.available) - Number(a.available));

function FlavoursPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return ALL_FLAVOURS;
    return ALL_FLAVOURS.filter(
      (f) => f.name.toLowerCase().includes(term) || f.notes.toLowerCase().includes(term),
    );
  }, [search]);

  return (
    <main className="bg-ink text-foreground min-h-screen">
      {/* Filters — sticky only on wide screens so they never cover products on phones. */}
      <section className="relative lg:sticky lg:top-20 z-30 bg-ink/95 backdrop-blur-xl border-b border-border/30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40"
              viewBox="0 0 16 16"
              fill="none"
            >
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search flavours or notes…"
              className="w-full bg-transparent border border-border/50 focus:border-gold pl-9 pr-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/40"
            />
          </div>

          <p className="text-[0.6rem] tracking-luxe uppercase text-foreground/40 shrink-0 sm:ml-auto">
            {filtered.length} flavour{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      {/* Flavours Grid */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-serif text-2xl text-foreground/60 mb-3">No flavours found.</p>
            <button
              onClick={() => setSearch("")}
              className="text-[0.65rem] tracking-luxe uppercase text-gold hover:text-gold-soft transition-colors"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((flavour) =>
              flavour.available ? (
                <Link
                  key={flavour.name}
                  to="/product/$key"
                  params={{ key: flavour.key }}
                  className="group relative overflow-hidden border border-border/40 hover:border-gold/40 transition-all duration-500 bg-surface/10 hover:bg-surface/20 flex flex-col"
                >
                  <ProductHoverPreview image={flavour.image} />
                  <div className="relative z-10 p-6 flex-1">
                    <div className="w-8 h-px bg-gold/60 mb-4" />
                    <h3 className="font-serif text-2xl text-foreground group-hover:text-gold transition-colors duration-300 mb-2">
                      {flavour.name}
                    </h3>
                    <p className="text-xs text-foreground/60 leading-relaxed tracking-wide">
                      {flavour.notes}
                    </p>
                  </div>
                  <div className="relative z-10 px-6 py-4 border-t border-border/30">
                    <span className="inline-flex items-center gap-2 text-[0.65rem] tracking-luxe uppercase text-gold/80 group-hover:text-gold transition-colors duration-300">
                      View & Buy
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              ) : (
                <div
                  key={flavour.name}
                  className="group relative overflow-hidden border border-border/25 bg-surface/5 flex flex-col opacity-60"
                >
                  <ProductHoverPreview image={flavour.image} />
                  <div className="relative z-10 p-6 flex-1">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-8 h-px bg-foreground/25 mt-3" />
                      <span className="text-[0.55rem] tracking-wider-luxe uppercase border border-foreground/25 text-foreground/50 px-2 py-1">
                        Forthcoming
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl text-foreground/70 mb-2">{flavour.name}</h3>
                    <p className="text-xs text-foreground/45 leading-relaxed tracking-wide">
                      {flavour.notes}
                    </p>
                  </div>
                  <div className="relative z-10 px-6 py-4 border-t border-border/20">
                    <p className="text-[0.65rem] tracking-luxe uppercase text-foreground/35">
                      Not yet available
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-6 text-center border-t border-border/30">
        <p className="text-[0.65rem] tracking-luxe uppercase text-gold mb-4">
          Wholesale & Bulk Orders
        </p>
        <h2 className="font-serif text-3xl md:text-4xl mb-6">Looking for larger quantities?</h2>
        <p className="text-sm text-foreground/65 max-w-md mx-auto mb-8 leading-relaxed">
          RASA offers wholesale pricing for retailers, lounges, and distributors across India and
          internationally.
        </p>
        <a
          href={partnerWhatsAppUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-ink text-[0.7rem] tracking-luxe uppercase hover:bg-gold-soft transition-all duration-500 group"
        >
          Become a Partner
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </a>
      </section>
    </main>
  );
}
