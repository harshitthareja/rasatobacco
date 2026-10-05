import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import bandCopper from "@/assets/band-copper.jpg";

export function ChapterLabels({
  left,
  right,
  top = "top-24",
}: {
  left: string;
  right: string;
  top?: string;
}) {
  const cls = "text-[0.6rem] tracking-wider-luxe uppercase text-foreground/60";
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 ${top} z-10 flex justify-between px-6 lg:px-10`}
    >
      <span className={cls}>{left}</span>
      <span className={cls}>{right}</span>
    </div>
  );
}

function Word({
  word,
  progress,
  start,
  end,
  reduced,
}: {
  word: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
  reduced: boolean;
}) {
  const opacity = useTransform(progress, [start, end], [0.14, 1]);
  return (
    <motion.span style={{ opacity: reduced ? 1 : opacity }} className="mr-[0.25em] inline-block">
      {word}
    </motion.span>
  );
}

function WordReveal({
  text,
  progress,
  from,
  to,
}: {
  text: string;
  progress: MotionValue<number>;
  from: number;
  to: number;
}) {
  const reduced = useReducedMotion() ?? false;
  const words = text.split(" ");
  const step = (to - from) / words.length;
  return (
    <>
      {words.map((w, i) => (
        <Word
          key={`${w}-${i}`}
          word={w}
          progress={progress}
          start={from + i * step}
          end={from + (i + 1) * step * 1.6}
          reduced={reduced}
        />
      ))}
    </>
  );
}

/* ───────── Chapter 01 — Origin: pinned, words light up as you scroll ───────── */

export function OriginChapter() {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const bgOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [0.12, 0.45, 0.2]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.25]);
  const bodyOpacity = useTransform(scrollYProgress, [0.62, 0.8], [0, 1]);
  const bodyY = useTransform(scrollYProgress, [0.62, 0.8], [24, 0]);

  return (
    <section ref={ref} className="relative h-[280vh] bg-ink">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0" style={{ opacity: bgOpacity, scale: bgScale }}>
          <img src={bandCopper} alt="" loading="lazy" className="h-full w-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-transparent to-ink/80" />
        <ChapterLabels left="About Origin" right="Chapter 01" />

        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <h2 className="max-w-6xl font-serif text-[clamp(2.5rem,8vw,7rem)] font-light uppercase leading-[0.98] text-balance">
            <WordReveal
              text="Forged in copper. Tempered in smoke."
              progress={scrollYProgress}
              from={0.05}
              to={0.6}
            />
          </h2>
          <motion.p
            style={{ opacity: bodyOpacity, y: bodyY }}
            className="mt-10 max-w-md text-sm leading-relaxed text-foreground/80 md:text-base"
          >
            From ember to expression, every RASA blend is composed with the patience of an atelier
            and the precision of a jeweller.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

/* ───────── Chapter 02 — Discipline: one pinned scene, four stages ───────── */

const stages = [
  {
    numeral: "I",
    name: "Sourcing",
    body: "Hand-selected leaf from origin growers, graded by season, cured to a house standard.",
  },
  {
    numeral: "II",
    name: "Composition",
    body: "Blended in small ateliers — fruit, spice and resin balanced like a perfumer's accord.",
  },
  {
    numeral: "III",
    name: "Maceration",
    body: "Slow infusion in molasses and glycerin until aroma settles into the leaf.",
  },
  {
    numeral: "IV",
    name: "Ritual",
    body: "Sealed, hallmarked, and dispatched only when it carries the house signature.",
  },
];

export function DisciplineChapter() {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) =>
    setActive(Math.min(stages.length - 1, Math.max(0, Math.floor(v * stages.length)))),
  );
  const barScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const stage = stages[active];

  return (
    <section ref={ref} className="relative h-[420vh] bg-background">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 40%, color-mix(in oklab, var(--gold) 12%, transparent), transparent 60%)",
          }}
        />
        <ChapterLabels left="About Discipline" right="Chapter 02" />

        <AnimatePresence mode="wait">
          <motion.span
            key={`ghost-${active}`}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 0.07, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center font-serif text-[clamp(14rem,48vw,44rem)] leading-none text-gold"
          >
            {stage.numeral}
          </motion.span>
        </AnimatePresence>

        <div className="relative z-10 mx-auto grid h-full max-w-7xl items-center gap-10 px-6 pt-20 md:grid-cols-12 lg:px-10">
          <div className="md:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -30, filter: "blur(6px)" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-[0.6rem] uppercase tracking-wider-luxe text-gold">
                  Stage {stage.numeral} of IV
                </p>
                <h2 className="mt-5 font-serif text-[clamp(3rem,11vw,9rem)] font-light uppercase leading-[0.92]">
                  {stage.name}
                </h2>
                <p className="mt-8 max-w-md text-base leading-relaxed text-foreground/80 md:text-lg">
                  {stage.body}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <ol className="hidden flex-col gap-5 md:col-span-4 md:flex">
            {stages.map((s, i) => (
              <li
                key={s.name}
                className={`flex items-baseline gap-4 font-serif text-2xl transition-all duration-500 ${
                  i === active ? "translate-x-2 text-gold" : "text-foreground/30"
                }`}
              >
                <span className="w-8 text-sm tracking-luxe">{s.numeral}</span>
                {s.name}
              </li>
            ))}
          </ol>
        </div>

        <div className="absolute inset-x-6 bottom-10 h-px bg-foreground/10 lg:inset-x-10">
          <motion.div style={{ scaleX: barScale }} className="h-full origin-left bg-gold" />
        </div>
      </div>
    </section>
  );
}

/* ───────── Chapter 03 — Collections: background washes burgundy → aubergine → navy ───────── */

export type CollectionSlide = {
  name: string;
  expression: string;
  oneLiner: string;
  body: string;
  image: string;
  path: "/collections/majlis" | "/collections/makhmal" | "/collections/tarkib";
};

export function CollectionsChapter({ items }: { items: CollectionSlide[] }) {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) =>
    setActive(Math.min(items.length - 1, Math.max(0, Math.floor(v * items.length)))),
  );
  const background = useTransform(
    scrollYProgress,
    [0, 0.27, 0.4, 0.6, 0.73, 1],
    ["#5B1823", "#5B1823", "#3A123F", "#3A123F", "#081A3B", "#081A3B"],
  );
  const c = items[active];

  return (
    <motion.section
      ref={ref}
      style={{ backgroundColor: background }}
      className="relative h-[420vh]"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ink/50" />
        <ChapterLabels left="About Collections" right="Chapter 03" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center gap-6 px-6 pt-20 md:grid md:grid-cols-12 md:gap-12 lg:px-10">
          <div className="order-2 w-full md:order-1 md:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-[0.6rem] uppercase tracking-wider-luxe text-gold-soft">
                  {c.expression}
                </p>
                <h2 className="mt-3 font-serif text-[clamp(3rem,11vw,9rem)] font-light uppercase leading-[0.9]">
                  {c.name}
                </h2>
                <p className="mt-4 font-serif text-xl italic text-gold-soft md:text-2xl">
                  {c.oneLiner}
                </p>
                <p className="mt-4 hidden max-w-md text-sm font-light leading-relaxed text-foreground/80 md:block">
                  {c.body}
                </p>
                <Link
                  to={c.path}
                  className="group mt-6 inline-flex items-center gap-3 text-[0.65rem] uppercase tracking-luxe text-foreground/90 transition-colors duration-500 hover:text-gold"
                >
                  <span className="h-px w-8 bg-gold/70 transition-all duration-500 group-hover:w-14" />
                  Enter {c.name}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex flex-wrap gap-2">
              {items.map((it, i) => (
                <span
                  key={it.name}
                  className={`rounded-full border px-4 py-1.5 text-[0.65rem] uppercase tracking-luxe transition-colors duration-500 ${
                    i === active
                      ? "border-gold bg-gold text-primary-foreground"
                      : "border-foreground/25 text-foreground/60"
                  }`}
                >
                  {it.name}
                </span>
              ))}
            </div>
          </div>

          <div className="order-1 flex justify-center md:order-2 md:col-span-5 md:justify-end">
            <div className="relative aspect-[4/5] h-[28svh] overflow-hidden border border-gold/30 md:h-[62svh]">
              <AnimatePresence mode="popLayout">
                <motion.img
                  key={c.image}
                  src={c.image}
                  alt={`${c.name} — ${c.expression}`}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
