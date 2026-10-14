import { createFileRoute, Link } from "@tanstack/react-router";
import { ACCESSORY_CATALOG } from "@/data/catalog";
import { accessorySubcategories } from "@/data/accessories";

export const Route = createFileRoute("/accessories/")({
  head: () => ({
    meta: [
      { title: "Accessories — The Atelier of RASA" },
      {
        name: "description",
        content:
          "A curated atelier of accessories that complete the RASA ritual. Hand-sculpted mouth tips in Lion, Charlie and Joker designs.",
      },
      { property: "og:title", content: "Accessories — RASA" },
      {
        property: "og:description",
        content: "Curated accessories that complete the RASA ritual.",
      },
    ],
  }),
  component: Accessories,
});

// Only categories with products are listed; new ones appear once stocked.
const categories = accessorySubcategories
  .map((sub) => ({
    sub,
    count: ACCESSORY_CATALOG.filter((e) => e.subcategorySlug === sub.slug).length,
  }))
  .filter((c) => c.count > 0);

function Accessories() {
  return (
    <>
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-ink">
        <div className="absolute inset-0 smoke-bg opacity-50" />
        <div className="absolute inset-0 grain" />
        <div className="relative z-10 text-center px-6 max-w-3xl animate-fade-up">
          <p className="text-[0.65rem] tracking-luxe uppercase text-gold mb-8">The Atelier</p>
          <h1 className="font-serif text-6xl md:text-[8rem] leading-none">Accessories</h1>
          <div className="luxe-divider max-w-[6rem] mx-auto my-10" />
          <p className="font-serif italic text-xl text-gold-soft">
            Every detail completes the ritual.
          </p>
        </div>
      </section>

      <section className="py-28 md:py-36 bg-background">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="flex flex-wrap justify-center gap-6">
            {categories.map(({ sub, count }) => (
              <Link
                key={sub.slug}
                to="/accessories/$category"
                params={{ category: sub.slug }}
                className="group relative overflow-hidden bg-surface/20 border border-border/30 p-6 sm:p-10 aspect-square w-full max-w-sm flex flex-col justify-end hover:border-gold/40 transition-colors duration-700"
              >
                {sub.image && (
                  <>
                    <img
                      src={sub.image}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-70 transition-all duration-700 group-hover:scale-105 group-hover:opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
                  </>
                )}
                <div className="relative">
                  <h3 className="font-serif text-3xl group-hover:text-gold transition-colors">
                    {sub.name}
                  </h3>
                  <p className="mt-3 text-[0.6rem] tracking-luxe uppercase text-gold">
                    {count} design{count !== 1 ? "s" : ""} · Shop now
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
