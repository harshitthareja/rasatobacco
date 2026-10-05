import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, Phone, Handshake, Home } from "lucide-react";
import rasaLogo from "@/assets/rasa-logo.png";

export const Route = createFileRoute("/coming-soon")({
  validateSearch: (s: Record<string, unknown>) => ({
    category: typeof s.category === "string" ? s.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Coming Soon — RASA" },
      {
        name: "description",
        content:
          "Our premium hookah and accessory collections are currently being prepared. Contact our sales team for product information and wholesale enquiries.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ComingSoon,
});

function ComingSoon() {
  const search = useRouterState({ select: (s) => s.location.search }) as { category?: string };
  const label = search?.category ? prettify(search.category) : "Premium Collection";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-ink px-6 py-24">
      <div className="absolute inset-0 smoke-bg opacity-50" />
      <div
        className="absolute -inset-[20%] opacity-30 animate-smoke"
        style={{
          background:
            "radial-gradient(ellipse at 30% 40%, rgba(211,161,136,0.08), transparent 55%), radial-gradient(ellipse at 70% 60%, rgba(0,0,0,0.4), transparent 60%)",
        }}
      />
      <div className="absolute inset-0 grain" />

      <div className="relative z-10 max-w-2xl w-full text-center animate-fade-up">
        <img src={rasaLogo} alt="RASA" width={728} height={292} loading="eager" decoding="async" className="h-16 w-auto mx-auto" />
        <div className="luxe-divider max-w-[6rem] mx-auto my-10" />
        <p className="text-[0.65rem] tracking-luxe uppercase text-gold">{label}</p>
        <h1 className="mt-6 font-serif text-5xl md:text-6xl text-foreground text-balance">
          Coming Soon
        </h1>
        <p className="mt-7 text-foreground/85 leading-relaxed max-w-lg mx-auto">
          Our premium hookah and accessory collections are currently being prepared.
        </p>
        <p className="mt-3 text-sm text-foreground/65 leading-relaxed max-w-lg mx-auto">
          For product information or wholesale enquiries, contact our sales team.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/contact"
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gold text-primary-foreground text-[0.7rem] tracking-luxe uppercase hover:bg-gold-soft transition-colors duration-500"
          >
            <Phone className="h-3.5 w-3.5" /> Contact Sales
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/partners"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-gold/40 text-gold text-[0.7rem] tracking-luxe uppercase hover:bg-gold hover:text-primary-foreground transition-all duration-500"
          >
            <Handshake className="h-3.5 w-3.5" /> Become a Partner
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-border/60 text-foreground/80 text-[0.7rem] tracking-luxe uppercase hover:border-gold/50 hover:text-gold transition-all duration-500"
          >
            <Home className="h-3.5 w-3.5" /> Return Home
          </Link>
        </div>
      </div>
    </section>
  );
}

function prettify(s: string) {
  return s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
