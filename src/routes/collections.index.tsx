import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { collections, type Collection, type Flavour } from "@/data/collections";
import { flavourKey } from "@/data/sku";
import { productImages } from "@/data/productImages";
import { ProductHoverPreview } from "@/components/shop/ProductHoverPreview";
import { CinematicSmoke } from "@/components/CinematicSmoke";
import { Reveal, RevealChild, RevealGroup } from "@/components/motion/Reveal";
import { motion } from "framer-motion";

export const Route = createFileRoute("/collections/")({
  head: () => ({
    meta: [
      { title: "Collections — Three Expressions, One House | RASA" },
      {
        name: "description",
        content:
          "Discover featured flavours across the three RASA collections — Majlis, Makhmal, and Tarkib.",
      },
      { property: "og:title", content: "Collections — RASA" },
      {
        property: "og:description",
        content: "Majlis, Makhmal, Tarkib — featured flavours from the House of RASA.",
      },
    ],
  }),
  component: Collections,
});

function Collections() {
  return (
    <>
      {/* PAGE HERO */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-ink pt-32 pb-16">
        <CinematicSmoke intensity={0.7} tone="copper" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, color-mix(in oklab, var(--gold) 14%, transparent), transparent 70%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 grain opacity-60" />
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="text-[0.65rem] tracking-wider-luxe uppercase text-gold mb-6"
          >
            The Collections
          </motion.p>
          <motion.h1
            className="font-serif font-light leading-[0.95] tracking-[-0.02em]"
            style={{ fontSize: "clamp(3rem, 9vw, 7rem)" }}
            initial={{ opacity: 0, y: 40, filter: "blur(14px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            Three Expressions.
            <span className="block italic text-gold-soft">One House.</span>
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="luxe-divider max-w-[6rem] mx-auto my-8 origin-center"
          />
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="text-foreground/85 leading-relaxed max-w-2xl mx-auto"
          >
            Within the House of RASA exist three distinct expressions — each a luxury world of its
            own, crafted for domestic and international partners who recognise the difference.
          </motion.p>
        </div>
      </section>

      {collections.map((c) => (
        <Reveal key={c.slug} amount={0.15}>
          <CollectionPreview c={c} />
        </Reveal>
      ))}

      {/* CLOSING */}
      <section className="bg-ink border-t border-border/40 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-foreground/75 leading-relaxed">
            Three distinct universes — one disciplined house. Each collection is curated for
            hospitality, retail, and wholesale partners worldwide.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-gold text-primary-foreground text-[0.7rem] tracking-luxe uppercase hover:bg-gold-soft transition-colors duration-500"
            >
              Request Catalogue <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/partners"
              className="inline-flex items-center justify-center px-8 py-3.5 border border-foreground/30 text-[0.7rem] tracking-luxe uppercase hover:border-gold hover:text-gold transition-all duration-500"
            >
              Become a Partner
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function CollectionPreview({ c }: { c: Collection }) {
  const secondaryVar = `var(--${c.slug}-secondary)`;
  const sectionBg = `radial-gradient(ellipse at 15% 0%, ${secondaryVar} 0%, transparent 50%), radial-gradient(ellipse at 90% 100%, color-mix(in oklab, ${c.accentVar} 12%, transparent) 0%, transparent 55%), linear-gradient(180deg, color-mix(in oklab, ${c.bgVar} 80%, var(--ink)) 0%, color-mix(in oklab, ${c.bgVar} 55%, var(--ink)) 60%, var(--ink) 100%)`;

  return (
    <section
      className="relative overflow-hidden border-t border-foreground/10"
      style={{ background: sectionBg }}
    >
      <div className={`pointer-events-none absolute inset-0 opacity-20 ${c.pattern}`} />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.55), transparent 65%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-10 py-16 md:py-20">
        {/* HEAD: logo + title */}
        <div className="grid md:grid-cols-[auto_1fr] gap-8 md:gap-10 items-center mb-10 md:mb-12">
          <div className="relative w-44 md:w-56 aspect-square flex items-center justify-center">
            <div
              className="absolute inset-[-15%] pointer-events-none rounded-full"
              style={{
                background: `radial-gradient(circle at center, ${c.bgVar} 0%, color-mix(in oklab, ${c.bgVar} 55%, transparent) 40%, transparent 70%)`,
                filter: "blur(8px)",
              }}
            />
            <img
              src={c.logo}
              alt={`${c.name} emblem`}
              width={612}
              height={408}
              className="relative w-full h-full object-contain crisp-img"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div>
            <p
              className="text-[0.65rem] tracking-[0.45em] uppercase mb-3"
              style={{ color: c.accentVar }}
            >
              {c.label}
            </p>
            <h2 className="font-serif text-5xl md:text-6xl leading-[1.02]">{c.name}</h2>
            <p className="mt-3 font-serif text-xl md:text-2xl" style={{ color: c.accentVar }}>
              {c.expression}
            </p>
            <p className="mt-3 max-w-2xl text-foreground/80 leading-relaxed">{c.intro}</p>
          </div>
        </div>

        {/* FEATURED FLAVOURS — 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {c.featured.slice(0, 4).map((f) => (
            <PreviewFlavourCard key={f.name} flavour={f} c={c} />
          ))}
        </div>

        {/* EXPLORE BUTTON */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-foreground/65 max-w-md">
            A curated preview from the {c.name} cellar. The complete collection is revealed inside.
          </p>
          <Link
            to={c.path}
            className="group inline-flex items-center gap-3 px-8 py-3.5 border text-[0.7rem] tracking-luxe uppercase transition-all duration-500"
            style={{
              borderColor: `color-mix(in oklab, ${c.accentVar} 55%, transparent)`,
              color: c.accentVar,
            }}
          >
            Explore All {c.name} Flavours
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function PreviewFlavourCard({ flavour, c }: { flavour: Flavour; c: Collection }) {
  const key = flavourKey(c.slug, flavour.name);
  return (
    <Link
      to="/product/$key"
      params={{ key }}
      className="group relative block overflow-hidden p-5 border border-foreground/10 hover:border-foreground/30 bg-ink/35 backdrop-blur-sm hover:-translate-y-1 transition-all duration-500"
    >
      <ProductHoverPreview image={productImages[key]} />
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, color-mix(in oklab, ${c.accentVar} 18%, transparent), transparent 70%)`,
        }}
      />
      <div className="relative">
        <h4 className="font-serif text-xl leading-tight group-hover:text-gold-soft transition-colors">
          {flavour.name}
        </h4>
        <p className="mt-2 text-xs text-foreground/65 leading-relaxed min-h-[2.5rem]">
          {flavour.notes}
        </p>
        <span
          className="mt-4 inline-flex items-center gap-2 text-[0.6rem] tracking-luxe uppercase"
          style={{ color: c.accentVar }}
        >
          View Product{" "}
          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
