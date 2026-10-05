import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

import houseAtelier from "@/assets/house-atelier.jpg";
import houseCraft from "@/assets/house-craft.jpg";
import bandCopper from "@/assets/band-copper.jpg";
import chapterMajlis from "@/assets/chapter-majlis.jpg";
import chapterMakhmal from "@/assets/chapter-makhmal.jpg";
import chapterTarkib from "@/assets/chapter-tarkib.jpg";

import { CinematicSmoke } from "@/components/CinematicSmoke";
import { Reveal, RevealChild, RevealGroup } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { AnimatedWordmark } from "@/components/AnimatedWordmark";

export const Route = createFileRoute("/house-of-rasa")({
  head: () => ({
    meta: [
      { title: "The House of RASA — Smoke, Perfected." },
      {
        name: "description",
        content:
          "The House of RASA is built on craftsmanship, character, consistency, and refinement. Three expressions — Majlis, Makhmal, Tarkib — one house.",
      },
      { property: "og:title", content: "The House of RASA" },
      {
        property: "og:description",
        content:
          "Three expressions, one house. The philosophy behind Smoke, Perfected.",
      },
      { property: "og:image", content: houseAtelier },
      { name: "twitter:image", content: houseAtelier },
    ],
  }),
  component: HouseOfRasa,
});

const pillars = [
  {
    no: "01",
    title: "Craftsmanship",
    body: "Every detail deserves attention — from the cut of the leaf to the curve of the bowl.",
  },
  {
    no: "02",
    title: "Character",
    body: "Every experience should leave an impression — composed, considered, unmistakable.",
  },
  {
    no: "03",
    title: "Consistency",
    body: "Excellence should never be occasional. Discipline is the only ritual that holds.",
  },
  {
    no: "04",
    title: "Refinement",
    body: "The pursuit never ends. Each batch is a draft of the next.",
  },
];

const process = [
  {
    step: "I",
    title: "Sourcing",
    body: "Hand-selected leaf from origin growers, graded by season, cured to a house standard.",
  },
  {
    step: "II",
    title: "Composition",
    body: "Blended in small ateliers — fruit, spice and resin balanced like a perfumer's accord.",
  },
  {
    step: "III",
    title: "Maceration",
    body: "Slow infusion in molasses and glycerin until aroma settles into the leaf.",
  },
  {
    step: "IV",
    title: "Ritual",
    body: "Sealed, hallmarked, and dispatched only when it carries the house signature.",
  },
];

const expressions = [
  {
    name: "Majlis",
    tag: "The Expression of Heritage",
    body: "Inspired by timeless traditions, rich character, and enduring authenticity.",
    image: chapterMajlis,
    accent: "var(--majlis-accent)",
    tone: "burgundy" as const,
    path: "/collections/majlis" as const,
  },
  {
    name: "Makhmal",
    tag: "The Expression of Refinement",
    body: "Smooth, elegant, and composed. A celebration of sophistication and balance.",
    image: chapterMakhmal,
    accent: "var(--makhmal-accent)",
    tone: "aubergine" as const,
    path: "/collections/makhmal" as const,
  },
  {
    name: "Tarkib",
    tag: "The Expression of Innovation",
    body: "Curious, experimental, and forward-thinking. Crafted for those who seek something new.",
    image: chapterTarkib,
    accent: "var(--tarkib-accent)",
    tone: "midnight" as const,
    path: "/collections/tarkib" as const,
  },
];

function HouseOfRasa() {
  return (
    <>
      <HeroBlock />
      <CraftedSection />
      <PillarsSection />
      <ProcessSection />
      <ExpressionsSection />
      <ClosingSection />
    </>
  );
}

/* ──────────────── HERO ──────────────── */

function HeroBlock() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.4, 0]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.2]);

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-ink"
    >
      <motion.div className="absolute inset-0" style={{ y: bgY, scale: bgScale }}>
        <img
          src={houseAtelier}
          alt=""
          width={1280}
          height={1600}
          fetchPriority="high"
          className="h-full w-full object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/40 to-ink" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 55%, transparent 25%, oklch(0.06 0.004 60 / 0.85) 80%)",
          }}
        />
      </motion.div>
      <CinematicSmoke intensity={0.95} tone="gold" />
      <div className="absolute inset-0 grain opacity-60" />

      <motion.div
        style={{ y: titleY, opacity: titleOpacity }}
        className="relative z-10 text-center px-6 pt-24 will-change-transform"
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-[0.6rem] tracking-wider-luxe uppercase text-gold/85 mb-8"
        >
          The Philosophy
        </motion.p>

        <AnimatedWordmark size="h-[18vw] max-h-64 min-h-24" reveal={false} />

        <motion.h1
          className="mt-8 font-serif font-light leading-[0.95] tracking-[-0.02em]"
          style={{ fontSize: "clamp(2.2rem, 6vw, 5rem)" }}
          initial={{ opacity: 0, y: 40, filter: "blur(14px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          The House
          <span className="block italic gradient-gold-text">of RASA.</span>
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="luxe-divider max-w-[8rem] mx-auto my-8 origin-center"
        />
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.4 }}
          className="font-display uppercase tracking-wider text-xl md:text-3xl text-gold-soft"
        >
          SMOKE, PERFECTED
        </motion.p>
      </motion.div>
    </section>
  );
}

/* ──────────────── CRAFTED BEYOND ──────────────── */

function CraftedSection() {
  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      <CinematicSmoke intensity={0.3} tone="copper" className="opacity-50" />
      <div className="relative mx-auto max-w-6xl px-6 lg:px-10 grid md:grid-cols-[1fr_1fr] gap-12 lg:gap-20 items-center">
        <RevealGroup stagger={0.12}>
          <RevealChild>
            <p className="text-[0.65rem] tracking-wider-luxe uppercase text-gold mb-6">I.</p>
          </RevealChild>
          <RevealChild>
            <h2 className="font-serif font-light text-4xl md:text-6xl text-balance leading-[1.02]">
              Crafted Beyond
              <span className="block italic gradient-gold-text">the Product.</span>
            </h2>
          </RevealChild>
          <RevealChild>
            <div className="mt-8 space-y-5 text-base md:text-lg leading-relaxed text-muted-foreground font-light max-w-md">
              <p className="text-foreground/90">
                Some experiences stay with us long after they end — not because of
                what was consumed, but because of how they made us feel.
              </p>
              <p className="font-serif italic text-xl md:text-2xl text-gold-soft leading-snug">
                The atmosphere. The company. The conversations.
              </p>
              <p>
                From flavour to craftsmanship, from ritual to atmosphere,
                excellence is never accidental. It is the result of intention.
              </p>
            </div>
          </RevealChild>
        </RevealGroup>

        <Reveal y={60}>
          <div className="relative aspect-[4/5] overflow-hidden">
            <Parallax range={50} scale className="h-full w-full">
              <img
                src={houseCraft}
                alt="Artisan hands preparing premium tobacco"
                width={1024}
                height={1280}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </Parallax>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
            <CinematicSmoke
              intensity={0.4}
              tone="copper"
              className="opacity-60 mix-blend-screen"
            />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-[0.6rem] tracking-wider-luxe uppercase gradient-gold-text">
                An Atelier of Atmosphere
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ──────────────── PILLARS ──────────────── */

function PillarsSection() {
  return (
    <section className="py-24 md:py-32 bg-ink relative overflow-hidden">
      <CinematicSmoke intensity={0.3} tone="gold" className="opacity-40" />
      <div className="relative mx-auto max-w-6xl px-6 lg:px-10">
        <RevealGroup className="max-w-2xl" stagger={0.1}>
          <RevealChild>
            <p className="text-[0.65rem] tracking-wider-luxe uppercase text-gold mb-6">II.</p>
          </RevealChild>
          <RevealChild>
            <h2 className="font-serif font-light text-4xl md:text-6xl text-balance leading-[1.02]">
              What{" "}
              <em className="not-italic gradient-gold-text font-display uppercase tracking-wider">
                SMOKE, PERFECTED
              </em>{" "}
              Means
            </h2>
          </RevealChild>
        </RevealGroup>

        <RevealGroup
          className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-px bg-border/30"
          stagger={0.1}
        >
          {pillars.map((p) => (
            <RevealChild key={p.title}>
              <div className="group bg-ink p-10 md:p-12 transition-all duration-700 hover:bg-surface/40 h-full relative overflow-hidden">
                <div
                  className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background:
                      "radial-gradient(circle, color-mix(in oklab, var(--gold) 25%, transparent) 0%, transparent 70%)",
                  }}
                />
                <span className="text-[0.6rem] tracking-wider-luxe text-gold/70 group-hover:text-gold transition-colors">
                  {p.no}
                </span>
                <h3 className="mt-5 font-serif font-light text-3xl md:text-4xl group-hover:text-gold-soft transition-colors">
                  {p.title}
                </h3>
                <p className="mt-4 text-muted-foreground leading-relaxed max-w-sm">
                  {p.body}
                </p>
                <div className="mt-6 h-px w-10 bg-gold/40 group-hover:w-24 group-hover:bg-gold transition-all duration-700" />
              </div>
            </RevealChild>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/* ──────────────── PROCESS ──────────────── */

function ProcessSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={bandCopper}
          alt=""
          width={1920}
          height={1080}
          loading="lazy"
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/85 to-ink" />
      </div>
      <CinematicSmoke intensity={0.5} tone="copper" className="opacity-60" />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-10">
        <RevealGroup className="max-w-2xl mb-20" stagger={0.1}>
          <RevealChild>
            <p className="text-[0.65rem] tracking-wider-luxe uppercase text-gold mb-6">III.</p>
          </RevealChild>
          <RevealChild>
            <h2 className="font-serif font-light text-4xl md:text-6xl text-balance leading-[1.02]">
              The Discipline of
              <span className="block italic gradient-gold-text">the House.</span>
            </h2>
          </RevealChild>
          <RevealChild>
            <p className="mt-6 text-foreground/75 max-w-md leading-relaxed">
              Four stages, one standard. Nothing leaves the atelier without
              passing through each.
            </p>
          </RevealChild>
        </RevealGroup>

        <RevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-gold/15" stagger={0.08}>
          {process.map((p) => (
            <RevealChild key={p.step}>
              <div className="bg-ink/85 backdrop-blur-sm p-8 md:p-10 h-full group hover:bg-ink transition-colors duration-700">
                <p
                  className="font-serif text-5xl gradient-gold-text group-hover:translate-x-1 transition-transform duration-500"
                >
                  {p.step}
                </p>
                <div className="mt-6 h-px w-8 bg-gold/40 group-hover:w-16 group-hover:bg-gold transition-all duration-700" />
                <h3 className="mt-6 font-serif text-2xl text-foreground group-hover:text-gold-soft transition-colors">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {p.body}
                </p>
              </div>
            </RevealChild>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/* ──────────────── THREE EXPRESSIONS (with imagery) ──────────────── */

function ExpressionsSection() {
  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-6 lg:px-10">
        <RevealGroup className="max-w-2xl" stagger={0.1}>
          <RevealChild>
            <p className="text-[0.65rem] tracking-wider-luxe uppercase text-gold mb-6">IV.</p>
          </RevealChild>
          <RevealChild>
            <h2 className="font-serif font-light text-4xl md:text-6xl text-balance leading-[1.02]">
              Three Expressions.
              <span className="block italic gradient-gold-text">One House.</span>
            </h2>
          </RevealChild>
        </RevealGroup>

        <RevealGroup className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5" stagger={0.12}>
          {expressions.map((e) => (
            <RevealChild key={e.name}>
              <Link
                to={e.path}
                className="group relative block aspect-[3/4] overflow-hidden card-luxe"
              >
                <Parallax range={30} scale className="h-full w-full">
                  <img
                    src={e.image}
                    alt={e.name}
                    width={1024}
                    height={1366}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                </Parallax>
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                <CinematicSmoke
                  intensity={0.45}
                  tone={e.tone}
                  className="opacity-70 mix-blend-screen"
                />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <p
                    className="text-[0.55rem] tracking-wider-luxe uppercase"
                    style={{ color: e.accent }}
                  >
                    {e.tag}
                  </p>
                  <h3 className="mt-3 font-serif font-light text-4xl md:text-5xl group-hover:text-gold-soft transition-colors">
                    {e.name}
                  </h3>
                  <p className="mt-3 text-sm text-foreground/75 leading-relaxed">
                    {e.body}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-[0.6rem] tracking-luxe uppercase text-foreground/80 group-hover:text-gold transition-colors">
                    Enter <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </RevealChild>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/* ──────────────── CLOSING ──────────────── */

function ClosingSection() {
  return (
    <section className="relative py-28 md:py-40 bg-ink overflow-hidden">
      <CinematicSmoke intensity={0.7} tone="gold" />
      <div className="absolute inset-0 grain opacity-60" />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, color-mix(in oklab, var(--gold) 14%, transparent), transparent 65%)",
        }}
      />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <RevealGroup stagger={0.18}>
          <RevealChild>
            <p className="font-serif font-light text-3xl md:text-6xl text-balance leading-tight text-foreground/90">
              Luxury is not defined by excess.
            </p>
          </RevealChild>
          <RevealChild>
            <p className="font-serif italic text-3xl md:text-6xl text-balance leading-tight gradient-gold-text">
              It is defined by attention.
            </p>
          </RevealChild>
          <RevealChild>
            <div className="luxe-divider max-w-[6rem] mx-auto my-10" />
          </RevealChild>
          <RevealChild>
            <p className="text-muted-foreground tracking-wide leading-relaxed">
              Attention to detail. Attention to experience. Attention to what matters.
            </p>
          </RevealChild>
          <RevealChild>
            <div className="mt-12 flex justify-center">
              <AnimatedWordmark size="h-16 md:h-24" />
            </div>
          </RevealChild>
          <RevealChild>
            <p className="font-display uppercase text-2xl md:text-4xl tracking-wider gradient-gold-text mt-8">
              SMOKE, PERFECTED
            </p>
          </RevealChild>
        </RevealGroup>
      </div>
    </section>
  );
}
