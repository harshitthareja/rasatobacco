import { createFileRoute, Link } from "@tanstack/react-router";
import { ACCESSORY_CATALOG } from "@/data/catalog";
import { accessorySubcategories } from "@/data/accessories";
import { useProductPrices } from "@/hooks/useProductPrices";
import { ProductCard } from "@/components/shop/ProductCard";

export const Route = createFileRoute("/accessories/$category")({
  head: ({ params }) => {
    const sub = accessorySubcategories.find((s) => s.slug === params.category);
    return {
      meta: [
        { title: sub ? `${sub.name} — Accessories | RASA` : "Accessories — RASA" },
        { name: "description", content: sub?.tagline ?? "RASA accessories." },
      ],
    };
  },
  component: AccessoryCategory,
});

function AccessoryCategory() {
  const { category } = Route.useParams();
  const sub = accessorySubcategories.find((s) => s.slug === category);
  const items = ACCESSORY_CATALOG.filter((e) => e.subcategorySlug === category);
  const { prices, loading } = useProductPrices();

  if (!sub) {
    return (
      <main className="bg-ink text-foreground min-h-screen pt-40 pb-24 px-6 text-center">
        <p className="font-serif text-3xl mb-4">Category not found</p>
        <Link
          to="/accessories"
          className="text-[0.65rem] tracking-luxe uppercase text-gold hover:text-gold-soft"
        >
          ← Back to Accessories
        </Link>
      </main>
    );
  }

  return (
    <main className="bg-ink text-foreground min-h-screen pt-32 pb-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <nav className="text-[0.6rem] tracking-luxe uppercase text-foreground/45 mb-8 flex items-center gap-2 flex-wrap">
          <Link to="/accessories" className="hover:text-gold transition-colors">
            Accessories
          </Link>
          <span>/</span>
          <span className="text-foreground/70">{sub.name}</span>
        </nav>

        <div className="text-center mb-14">
          <p className="text-[0.65rem] tracking-luxe uppercase text-gold mb-4">The Atelier</p>
          <h1 className="font-serif text-5xl md:text-6xl">{sub.name}</h1>
          <div className="luxe-divider max-w-[6rem] mx-auto my-8" />
          <p className="font-serif italic text-lg text-foreground/60">{sub.tagline}</p>
        </div>

        {items.length === 0 ? (
          <p className="text-center font-serif text-xl text-foreground/60">
            New designs are on their way.
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {items.map((entry) => (
              <div
                key={entry.key}
                className="w-full max-w-[18rem] sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)]"
              >
                <ProductCard entry={entry} prices={prices} pricesLoading={loading} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
