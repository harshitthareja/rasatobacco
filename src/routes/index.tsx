import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import heroHookah from "@/assets/hero-hookah.jpg";
import { CinematicSmoke } from "@/components/CinematicSmoke";
import { RevealChild, RevealGroup } from "@/components/motion/Reveal";
import { AnimatedWordmark } from "@/components/AnimatedWordmark";
import { LaunchShowcase } from "@/components/LaunchShowcase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RASA — Smoke, Perfected." },
      {
        name: "description",
        content: "RASA — a luxury hookah lifestyle house. Three collections. One discipline. Smoke, perfected.",
      },
      { property: "og:title", content: "RASA — Smoke, Perfected." },
      {
        property: "og:description",
        content: "A luxury hookah lifestyle house — Majlis, Makhmal, Tarkib. Smoke, perfected.",
      },
      { property: "og:image", content: heroHookah },
      { name: "twitter:image", content: heroHookah },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <LaunchShowcase />
      <Invitation />
    </>
  );
}

/* ─────────────────────────────── HERO ─────────────────────────────── */

function Hero() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const titleScale = useTransform(scrollYProgress, [0, 1], [1, 1.02]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.4, 0]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.2]);

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden bg-ink">
      {/* Cinematic background image */}
      <motion.div className="absolute inset-0" style={{ y: bgY, scale: bgScale }}>
        <img
          src={heroHookah}
          alt=""
          width={1536}
          height={1024}
          className="h-full w-full object-cover object-center opacity-80"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/30 to-ink" />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 50% 55%, transparent 25%, oklch(0.06 0.004 60 / 0.85) 80%)",
          }}
        />
      </motion.div>

      {/* Golden smoke */}
      <CinematicSmoke intensity={0.9} tone="gold" />
      <div className="pointer-events-none absolute inset-0 grain opacity-60" />

      {/* MASSIVE RASA WORDMARK (logo PNG with shimmer + halo + float) */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <motion.div
          style={{
            y: titleY,
            scale: titleScale,
            opacity: titleOpacity,
          }}
          className="text-center will-change-transform"
        >
          <AnimatedWordmark size="h-[18vw] max-h-[18rem] min-h-[7rem]" halo float shimmer={false} reveal={false} />

          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1.4, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-8 h-px w-40 origin-center"
            style={{
              background: "linear-gradient(90deg, transparent, var(--gold) 50%, transparent)",
            }}
          />

          <motion.p
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.4, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-display uppercase text-2xl md:text-4xl gradient-gold-text tracking-wider"
          >
            SMOKE, PERFECTED
          </motion.p>
        </motion.div>
      </div>

      {/* Bottom CTAs and scroll cue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 2.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-10 inset-x-0 z-10 flex flex-col items-center gap-6"
      >
        <a
          href="#launch"
          className="group inline-flex items-center gap-3 text-[0.65rem] tracking-luxe uppercase text-foreground/90 hover:text-gold transition-colors duration-500"
        >
          <span className="h-px w-10 bg-gold/70 group-hover:w-16 transition-all duration-500" />
          Explore the launch
          <span className="h-px w-10 bg-gold/70 group-hover:w-16 transition-all duration-500" />
        </a>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="text-[0.55rem] tracking-wider-luxe uppercase text-foreground/40"
        >
          Scroll
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─────────────────────── INVITATION ─────────────────────── */

function Invitation() {
  return (
    <section className="relative bg-background pt-10 pb-24 md:pt-12 md:pb-32 overflow-hidden">
      <CinematicSmoke intensity={0.25} tone="copper" className="opacity-40" />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, color-mix(in oklab, var(--gold) 14%, transparent), transparent 65%)",
        }}
      />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <RevealGroup stagger={0.12}>
          <RevealChild>
            <p className="text-[0.6rem] tracking-wider-luxe uppercase text-gold">Partner Programme</p>
          </RevealChild>
          <RevealChild>
            <h2 className="mt-6 font-serif font-light text-4xl md:text-6xl leading-[1.05] text-balance">
              Become a partner
              <span className="block italic text-gold-soft">of the House.</span>
            </h2>
          </RevealChild>
          <RevealChild>
            <p className="mt-8 text-foreground/80 leading-relaxed max-w-xl mx-auto">
              A curated network of distributors, lounges and boutiques. We grow with you — with structured support,
              exclusive access, and the discipline of a luxury house.
            </p>
          </RevealChild>
          <RevealChild>
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/partners"
                className="group inline-flex items-center justify-center gap-3 px-12 py-4 bg-gold text-primary-foreground text-[0.65rem] tracking-luxe uppercase hover:bg-gold-soft transition-all duration-500"
              >
                Become a Partner
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-12 py-4 border border-foreground/25 text-[0.65rem] tracking-luxe uppercase hover:border-gold/70 hover:text-gold transition-all duration-500"
              >
                Wholesale Inquiry
              </Link>
            </div>
          </RevealChild>
        </RevealGroup>
      </div>
    </section>
  );
}
