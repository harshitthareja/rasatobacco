import { Link } from "@tanstack/react-router";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { collections, type Collection, type Flavour } from "@/data/collections";
import { flavourKey } from "@/data/sku";
import { productImages } from "@/data/productImages";
import { useProductPrices, type ProductPrice } from "@/hooks/useProductPrices";
import { AddToCartControl } from "@/components/shop/AddToCartControl";
import { CinematicSmoke } from "@/components/CinematicSmoke";
import { Reveal, RevealChild, RevealGroup } from "@/components/motion/Reveal";

import chapterMajlis from "@/assets/chapter-majlis.jpg";
import chapterMakhmal from "@/assets/chapter-makhmal.jpg";
import chapterTarkib from "@/assets/chapter-tarkib.jpg";

const heroImages: Record<Collection["slug"], string> = {
  majlis: chapterMajlis,
  makhmal: chapterMakhmal,
  tarkib: chapterTarkib,
};

const heroTones: Record<Collection["slug"], "burgundy" | "aubergine" | "midnight"> = {
  majlis: "burgundy",
  makhmal: "aubergine",
  tarkib: "midnight",
};

export function CollectionExperience({ collection }: { collection: Collection }) {
  return (
    <section className="relative bg-ink">
      <CinematicHero collection={collection} />

      <BodySections collection={collection} />
    </section>
  );
}

/* ── Cinematic per-collection hero ────────────────────────────────── */

function CinematicHero({ collection }: { collection: Collection }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const titleBlur = useTransform(scrollYProgress, [0, 1], ["blur(0px)", "blur(12px)"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.4, 0]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);

  const letters = collection.name.split("");
  const image = heroImages[collection.slug];
  const tone = heroTones[collection.slug];

  return (
    <div ref={ref} className="relative min-h-[100svh] overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: bgY, scale: bgScale }}>
        <img
          src={image}
          alt=""
          width={1024}
          height={1536}
          className="h-full w-full object-cover object-center opacity-90"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/25 to-ink" />
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background: `radial-gradient(ellipse at 50% 55%, transparent 28%, oklch(0.06 0.004 60 / 0.85) 80%), radial-gradient(ellipse at 20% 100%, ${collection.bgVar} 0%, transparent 55%)`,
          }}
        />
      </motion.div>

      <CinematicSmoke intensity={0.7} tone={tone} />
      <div className="pointer-events-none absolute inset-0 grain opacity-60" />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <motion.div
          style={{ y: titleY, filter: titleBlur, opacity: titleOpacity }}
          className="text-center will-change-transform"
        >
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-[0.6rem] tracking-wider-luxe uppercase mb-6"
            style={{ color: collection.accentVar }}
          >
            {collection.label} — {collection.expression}
          </motion.p>

          <motion.h1
            aria-label={collection.name}
            className="font-serif font-light leading-[0.85] tracking-[-0.03em] text-foreground"
            style={{ fontSize: "clamp(4.5rem, 18vw, 16rem)" }}
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1, delayChildren: 0.35 } },
            }}
          >
            {letters.map((l, i) => (
              <motion.span
                key={i}
                className="inline-block"
                variants={{
                  hidden: { opacity: 0, y: 60, filter: "blur(18px)", rotateX: -35 },
                  show: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    rotateX: 0,
                    transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
              >
                {l}
              </motion.span>
            ))}
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-6 h-px w-28 origin-center"
            style={{
              background: `linear-gradient(90deg, transparent, ${collection.accentVar} 50%, transparent)`,
            }}
          />

          <motion.p
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-serif italic text-xl md:text-3xl text-foreground/85 tracking-wide"
          >
            {collection.tagline}
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.8 }}
        className="absolute top-24 left-6 md:left-10"
      >
        <Link
          to="/collections"
          className="text-[0.6rem] tracking-luxe uppercase text-foreground/60 hover:text-foreground transition-colors"
        >
          ← All Collections
        </Link>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 inset-x-0 text-center text-[0.55rem] tracking-wider-luxe uppercase text-foreground/40"
      >
        Scroll to enter
      </motion.div>
    </div>
  );
}

/* ── Body sections (intro + flavours + closing) ───────────────────── */

function BodySections({ collection }: { collection: Collection }) {
  const secondaryVar = `var(--${collection.slug}-secondary)`;
  const sectionBg = `radial-gradient(ellipse at 20% 10%, ${secondaryVar} 0%, transparent 50%), radial-gradient(ellipse at 85% 90%, color-mix(in oklab, ${collection.accentVar} 8%, transparent) 0%, transparent 60%), linear-gradient(180deg, color-mix(in oklab, ${collection.bgVar} 60%, var(--ink)) 0%, var(--ink) 100%)`;
  const smokeRef = useRef<HTMLDivElement | null>(null);
  const smokeInView = useInView(smokeRef, { margin: "200px 0px", once: false });
  const { prices } = useProductPrices();

  return (
    <div ref={smokeRef} className="relative overflow-hidden" style={{ background: sectionBg }}>
      <div className={`pointer-events-none absolute inset-0 opacity-20 ${collection.pattern}`} />
      {smokeInView && (
        <CinematicSmoke intensity={0.3} tone={heroTones[collection.slug]} className="opacity-40" />
      )}

      {/* INTRO + SIGNATURE */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-10 pt-20 md:pt-28 pb-16 grid md:grid-cols-[1.4fr_1fr] gap-x-14 gap-y-10 items-start">
        <Reveal>
          <p className="font-serif text-2xl md:text-[1.65rem] leading-snug text-foreground/95 text-balance">
            {collection.intro}
          </p>
        </Reveal>
        <RevealGroup className="flex flex-col gap-3" stagger={0.08}>
          <RevealChild>
            <p
              className="text-[0.6rem] tracking-wider-luxe uppercase mb-1"
              style={{ color: collection.accentVar }}
            >
              Signature
            </p>
          </RevealChild>
          {collection.signature.map((s) => (
            <RevealChild key={s}>
              <div className="flex items-center gap-3 text-sm text-foreground/85">
                <span
                  className="h-px w-6"
                  style={{ background: collection.accentVar, opacity: 0.6 }}
                />
                {s}
              </div>
            </RevealChild>
          ))}
        </RevealGroup>
      </div>

      {/* PHILOSOPHY PULL-QUOTE */}
      <div className="relative z-10 border-t border-foreground/10">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 py-20 md:py-28 text-center">
          <Reveal>
            <p className="font-serif italic text-2xl md:text-4xl leading-snug text-foreground/85 text-balance">
              “{collection.philosophy}”
            </p>
          </Reveal>
        </div>
      </div>

      {/* ALL FLAVOURS */}
      <div id="all-flavours" className="relative z-10 border-t border-foreground/10 scroll-mt-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-10 py-16 md:py-20">
          <Reveal>
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
              <div>
                <p
                  className="text-[0.65rem] tracking-wider-luxe uppercase"
                  style={{ color: collection.accentVar }}
                >
                  The Complete {collection.name} Cellar
                </p>
                <h2 className="mt-3 font-serif font-light text-4xl md:text-5xl">
                  All {collection.name} Flavours
                </h2>
              </div>
            </div>
          </Reveal>

          <RevealGroup
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            stagger={0.08}
          >
            {[...collection.flavours]
              .sort((a, b) => Number(b.available) - Number(a.available))
              .map((p) => (
                <RevealChild key={p.name}>
                  <FlavourCard flavour={p} collection={collection} prices={prices} />
                </RevealChild>
              ))}
          </RevealGroup>
        </div>
      </div>

      {/* CLOSING CTA */}
      <div className="relative z-10 border-t border-foreground/10">
        <div className="mx-auto max-w-6xl px-6 lg:px-10 py-20 md:py-28">
          <Reveal>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div>
                <p className="font-serif font-light text-4xl md:text-5xl leading-tight">
                  {collection.closing}
                </p>
                <p
                  className="mt-3 font-serif italic text-xl md:text-2xl"
                  style={{ color: collection.accentVar }}
                >
                  {collection.name}.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/contact"
                  search={{ collection: collection.name }}
                  className="group inline-flex items-center justify-center gap-3 px-10 py-4 bg-gold text-primary-foreground text-[0.7rem] tracking-luxe uppercase hover:bg-gold-soft transition-colors duration-500"
                >
                  Request Information
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/partners"
                  className="inline-flex items-center justify-center px-10 py-4 border border-foreground/30 text-[0.7rem] tracking-luxe uppercase hover:border-gold hover:text-gold transition-all duration-500"
                >
                  Wholesale Inquiry
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* SISTER COLLECTIONS */}
      <div className="relative z-10 border-t border-foreground/10 bg-ink/40">
        <div className="mx-auto max-w-6xl px-6 lg:px-10 py-16">
          <Reveal>
            <p className="text-[0.65rem] tracking-luxe uppercase text-gold mb-8 text-center">
              Continue Exploring
            </p>
          </Reveal>
          <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4" stagger={0.1}>
            {collections
              .filter((c) => c.slug !== collection.slug)
              .map((c) => (
                <RevealChild key={c.slug}>
                  <Link
                    to={c.path}
                    className="card-luxe collection-card p-6 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={c.logo}
                        alt=""
                        width={612}
                        height={408}
                        loading="lazy"
                        className="h-12 w-auto opacity-90 group-hover:brightness-110 transition crisp-img"
                      />
                      <div>
                        <p className="font-serif text-xl group-hover:text-gold transition-colors">
                          {c.name}
                        </p>
                        <p className="text-[0.6rem] tracking-luxe uppercase text-gold/75">
                          {c.expression}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-foreground/60 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                  </Link>
                </RevealChild>
              ))}
          </RevealGroup>
        </div>
      </div>
    </div>
  );
}

function FlavourCard({
  flavour,
  collection,
  prices,
}: {
  flavour: Flavour;
  collection: Collection;
  prices: Record<string, ProductPrice>;
}) {
  const key = flavourKey(collection.slug, flavour.name);
  const entry = { collection, flavour, key, image: productImages[key] };

  if (!flavour.available) {
    return (
      <article className="card-luxe p-6 flex flex-col h-full opacity-60">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-serif text-2xl md:text-[1.5rem] leading-tight text-foreground/70">
            {flavour.name}
          </h4>
          <span className="shrink-0 text-[0.55rem] tracking-wider-luxe uppercase border border-foreground/25 text-foreground/50 px-2 py-1">
            Forthcoming
          </span>
        </div>
        <p className="mt-2 text-sm text-foreground/50 leading-relaxed">{flavour.notes}</p>
        <p className="mt-auto pt-6 text-[0.65rem] tracking-luxe uppercase text-foreground/40">
          Not yet available
        </p>
      </article>
    );
  }

  return (
    <article className="card-luxe p-6 flex flex-col h-full">
      <Link to="/product/$key" params={{ key }}>
        <h4 className="font-serif text-2xl md:text-[1.5rem] leading-tight hover:text-gold transition-colors">
          {flavour.name}
        </h4>
      </Link>
      <p className="mt-2 text-sm text-foreground/70 leading-relaxed">{flavour.notes}</p>
      <div className="mt-5">
        <AddToCartControl entry={entry} prices={prices} compact />
      </div>
    </article>
  );
}
