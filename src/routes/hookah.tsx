import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export const Route = createFileRoute("/hookah")({
  head: () => ({
    meta: [
      { title: "Hookah — A Showcase of the RASA Collection" },
      {
        name: "description",
        content:
          "Explore the Classic and Luxury Hookah Collections by RASA. Portable, Medium, and Large configurations — a luxury showcase.",
      },
      { property: "og:title", content: "Hookah — RASA" },
      {
        property: "og:description",
        content: "A showcase of the RASA Hookah Collection.",
      },
    ],
  }),
  component: HookahPage,
});

type Tier = "classic" | "luxury";
const sizes = ["Portable", "Medium", "Large"] as const;

function Container({ tier, size }: { tier: Tier; size: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border/50 hover:border-gold/40 transition-colors duration-700 bg-ink/60">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-6 px-8 md:px-12 py-10 text-left group"
      >
        <div>
          <p className="text-[0.6rem] tracking-luxe uppercase text-gold/70">
            {tier === "luxury" ? "Luxury Collection" : "Classic Collection"}
          </p>
          <h3 className="mt-3 font-serif text-3xl md:text-5xl group-hover:text-gold transition-colors">
            {size}
          </h3>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gold/70 transition-transform duration-500 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-8 md:px-12 pb-12 animate-fade-in">
          <div className="luxe-divider mb-10" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/30 min-h-[260px]">
            {/* Placeholder slots — designed to accept products later */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-ink/80 aspect-[3/4] flex flex-col items-center justify-center text-center p-6"
              >
                <p className="text-[0.6rem] tracking-luxe uppercase text-muted-foreground/50">
                  Forthcoming
                </p>
                <p className="mt-4 font-serif text-xl text-muted-foreground/60">
                  RASA {size} · {String(i).padStart(2, "0")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CollectionBlock({
  tier,
  title,
  subtitle,
  anchor,
}: {
  tier: Tier;
  title: string;
  subtitle: string;
  anchor: string;
}) {
  return (
    <section
      id={anchor}
      className="relative scroll-mt-24 py-28 md:py-36 border-t border-border/40"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <p className="text-[0.65rem] tracking-luxe uppercase text-gold">
          {tier === "luxury" ? "Series I" : "Series II"}
        </p>
        <h2 className="mt-6 font-serif text-5xl md:text-7xl">{title}</h2>
        <p className="mt-6 font-serif italic text-xl text-gold-soft">{subtitle}</p>

        <div className="mt-16 space-y-5">
          {sizes.map((s) => (
            <Container key={s} tier={tier} size={s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HookahPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-ink">
        <div className="absolute inset-0 smoke-bg opacity-50" />
        <div className="absolute inset-0 grain" />
        <div className="relative z-10 text-center px-6 max-w-3xl animate-fade-up">
          <p className="text-[0.65rem] tracking-luxe uppercase text-gold mb-8">
            The Vessels
          </p>
          <h1 className="font-serif text-6xl md:text-[10rem] leading-none">Hookah</h1>
          <div className="luxe-divider max-w-[6rem] mx-auto my-10" />
          <p className="font-serif italic text-xl md:text-2xl text-gold-soft">
            A showcase of the RASA Hookah Collection.
          </p>
        </div>
      </section>

      <CollectionBlock
        tier="classic"
        title="Classic Collection"
        subtitle="The Essential Expression of RASA"
        anchor="classic-collection"
      />

      <CollectionBlock
        tier="luxury"
        title="Luxury Collection"
        subtitle="The Flagship Expression of RASA"
        anchor="luxury-collection"
      />
    </>
  );
}
