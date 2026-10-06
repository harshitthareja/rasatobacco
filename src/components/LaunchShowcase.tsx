import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { CATALOG, type CatalogEntry } from "@/data/catalog";
import { Reveal, RevealChild, RevealGroup } from "@/components/motion/Reveal";

const launchKeys = ["majlis-commissioner", "makhmal-spring-water", "tarkib-lychee-bliss"];

const launchProducts = launchKeys
  .map((key) => CATALOG.find((entry) => entry.key === key))
  .filter((entry): entry is CatalogEntry => Boolean(entry?.flavour.available && entry.image));

export function LaunchShowcase() {
  return (
    <section id="launch" className="relative scroll-mt-20 overflow-hidden bg-ink px-6 pt-20 pb-10 md:pt-24 md:pb-12 lg:px-10">
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
            Meet the first <span className="italic text-gold-soft">expressions.</span>
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-sm leading-relaxed text-foreground/70 md:text-base">
            Three collections. Three distinctive flavours. Your journey into the House of RASA
            starts here.
          </p>
        </Reveal>

        <RevealGroup className="mt-12 grid gap-5 md:mt-16 md:grid-cols-3 lg:gap-6" stagger={0.16}>
          {launchProducts.map((product, index) => (
            <RevealChild key={product.key} className="h-full" y={48}>
              <article className="group flex h-full flex-col border border-foreground/10 bg-surface/20 transition-colors duration-500 hover:border-gold/40">
                <Link
                  to="/product/$key"
                  params={{ key: product.key }}
                  aria-label={`View ${product.flavour.name} from ${product.collection.name}`}
                  className="relative block aspect-[4/5] overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  <img
                    src={product.image}
                    alt={`${product.flavour.name} from the ${product.collection.name} collection`}
                    loading="lazy"
                    className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-[1.035]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-ink/20" />
                  <span className="absolute left-5 top-5 border border-gold/40 bg-ink/60 px-3 py-2 text-[0.55rem] uppercase tracking-wider-luxe text-gold-soft backdrop-blur-sm">
                    {product.collection.label}
                  </span>
                  <span className="absolute bottom-5 right-5 flex items-center gap-2 text-[0.6rem] uppercase tracking-luxe text-foreground/90 transition-colors group-hover:text-gold-soft">
                    Discover <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>

                <div className="flex flex-1 flex-col p-5 lg:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[0.6rem] uppercase tracking-wider-luxe text-gold">
                      {product.collection.name}
                    </p>
                    <span className="font-serif text-lg text-foreground/35">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-3 font-serif text-2xl leading-none text-foreground lg:text-3xl">
                    {product.flavour.name}
                  </h3>
                  <p className="mt-3 min-h-10 text-xs leading-relaxed text-foreground/60">
                    {product.flavour.notes}
                  </p>

                  <div className="mt-auto flex flex-col gap-2.5 pt-5">
                    <Link
                      to="/product/$key"
                      params={{ key: product.key }}
                      className="inline-flex items-center justify-center gap-2 bg-gold px-4 py-3 text-[0.6rem] font-medium uppercase tracking-luxe text-primary-foreground transition-colors duration-300 hover:bg-gold-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    >
                      Order now <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      to={product.collection.path}
                      className="inline-flex items-center justify-center border border-gold/35 px-4 py-3 text-center text-[0.6rem] uppercase tracking-luxe text-gold transition-colors duration-300 hover:border-gold hover:bg-gold/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    >
                      View all flavours
                    </Link>
                  </div>
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
