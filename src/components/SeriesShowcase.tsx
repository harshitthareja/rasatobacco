import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { collections, type Collection } from "@/data/collections";
import { Reveal, RevealChild, RevealGroup } from "@/components/motion/Reveal";

const seriesOrder: Collection["slug"][] = ["majlis", "tarkib", "makhmal"];

const featuredSeries = seriesOrder
  .map((slug) => collections.find((series) => series.slug === slug))
  .filter((series): series is Collection => Boolean(series));

export function SeriesShowcase() {
  return (
    <section
      id="launch"
      className="relative scroll-mt-20 overflow-hidden bg-ink px-6 pb-10 pt-20 md:pb-12 md:pt-24 lg:px-10"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse at 50% 5%, color-mix(in oklab, var(--gold) 10%, transparent), transparent 55%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 grain opacity-20" />

      <div className="relative mx-auto max-w-5xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-[clamp(2.75rem,6vw,5.5rem)] font-light leading-[0.95] text-balance">
            Discover the three <span className="italic text-gold-soft">series.</span>
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-sm leading-relaxed text-foreground/70 md:text-base">
            Majlis, Tarkib and Makhmal—three distinctive expressions from the House of RASA.
          </p>
        </Reveal>

        <RevealGroup className="mt-12 grid gap-5 md:mt-16 md:grid-cols-3 lg:gap-6" stagger={0.16}>
          {featuredSeries.map((series, index) => (
            <RevealChild key={series.slug} className="h-full" y={48}>
              <article
                className={`group relative flex h-full flex-col overflow-hidden border border-foreground/10 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 ${series.pattern}`}
                style={{
                  background: `radial-gradient(ellipse at 50% 20%, color-mix(in oklab, ${series.accentVar} 20%, transparent), transparent 62%), linear-gradient(180deg, color-mix(in oklab, ${series.bgVar} 75%, var(--ink)), var(--ink))`,
                }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/45" />

                <Link
                  to={series.path}
                  aria-label={`Explore the ${series.name} series`}
                  className="relative flex aspect-[4/3] items-center justify-center px-8 pt-7 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  <div
                    className="pointer-events-none absolute h-48 w-48 rounded-full opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-65"
                    style={{ background: series.accentVar }}
                  />
                  <img
                    src={series.logo}
                    alt={`${series.name} series logo`}
                    width={612}
                    height={408}
                    loading="lazy"
                    decoding="async"
                    className="relative h-full max-h-52 w-full object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                </Link>

                <div className="relative flex flex-1 flex-col px-5 pb-5 text-center lg:px-6 lg:pb-6">
                  <p className="text-[0.58rem] uppercase tracking-wider-luxe text-gold/80">
                    Series {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 font-serif text-3xl leading-none text-foreground">
                    {series.name}
                  </h3>
                  <p className="mt-3 min-h-10 text-xs leading-relaxed text-foreground/65">
                    {series.expression}
                  </p>

                  <Link
                    to={series.path}
                    className="mt-5 inline-flex items-center justify-center gap-2 bg-gold px-4 py-3 text-[0.6rem] font-medium uppercase tracking-luxe text-primary-foreground transition-colors duration-300 hover:bg-gold-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    Order now <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            </RevealChild>
          ))}
        </RevealGroup>

        <Reveal className="mt-12 text-center" delay={0.15}>
          <Link
            to="/flavours"
            className="group inline-flex items-center gap-4 border-b border-gold/50 pb-3 text-[0.7rem] uppercase tracking-luxe text-gold transition-colors hover:text-gold-soft"
          >
            Explore all RASA flavours
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
