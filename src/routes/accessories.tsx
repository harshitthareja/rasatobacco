import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/accessories")({
  head: () => ({
    meta: [
      { title: "Accessories — The Atelier of RASA" },
      {
        name: "description",
        content:
          "A curated atelier of accessories that complete the RASA ritual. Bowls, hoses, heat management, and more — forthcoming.",
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
          <p className="text-[0.65rem] tracking-luxe uppercase text-gold mb-8">
            The Atelier
          </p>
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
            {groups.map((g, i) => (
              <div
                key={g}
                className="group bg-background p-10 aspect-square flex flex-col justify-between hover:bg-surface/40 transition-colors duration-700"
              >
                <span className="text-[0.6rem] tracking-luxe text-gold/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-serif text-2xl md:text-3xl group-hover:text-gold transition-colors">
                    {g}
                  </h3>
                  <p className="mt-3 text-[0.6rem] tracking-luxe uppercase text-muted-foreground/60">
                    Forthcoming
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
