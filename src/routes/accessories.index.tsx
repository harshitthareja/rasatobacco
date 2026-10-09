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
          "A curated atelier of accessories that complete the RASA ritual. Sculpted mouth tips available now; bowls, hoses, heat management and more forthcoming.",
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

const groups = [
  "Bowls",
  "Hoses",
  "Mouth Tips",
  "Charcoal Holders",
  "Heat Management",
  "Tongs",
  "Cleaning Tools",
  "Travel Cases",
];

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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-border/30">
            {groups.map((g, i) => {
              const sub = accessorySubcategories.find((s) => s.name === g);
              const count = sub
                ? ACCESSORY_CATALOG.filter((e) => e.subcategorySlug === sub.slug).length
                : 0;
              const className =
                "group bg-background p-10 aspect-square flex flex-col justify-between hover:bg-surface/40 transition-colors duration-700";
              const tile = (
                <>
                  <span className="text-[0.6rem] tracking-luxe text-gold/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-serif text-2xl md:text-3xl group-hover:text-gold transition-colors">
                      {g}
                    </h3>
                    <p
                      className={`mt-3 text-[0.6rem] tracking-luxe uppercase ${
                        count ? "text-gold" : "text-muted-foreground/60"
                      }`}
                    >
                      {count
                        ? `${count} design${count !== 1 ? "s" : ""} · Shop now`
                        : "Forthcoming"}
                    </p>
                  </div>
                </>
              );
              return sub && count ? (
                <Link
                  key={g}
                  to="/accessories/$category"
                  params={{ category: sub.slug }}
                  className={className}
                >
                  {tile}
                </Link>
              ) : (
                <div key={g} className={className}>
                  {tile}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
