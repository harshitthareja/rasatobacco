import { createFileRoute, Link } from "@tanstack/react-router";
import rasaLogo from "@/assets/rasa-logo.png";

export const Route = createFileRoute("/age-restricted")({
  head: () => ({
    meta: [
      { title: "Access Restricted — RASA" },
      { name: "description", content: "RASA is intended for adults of legal smoking age." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AgeRestricted,
});

function AgeRestricted() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-ink px-6">
      <div className="absolute inset-0 smoke-bg opacity-60" />
      <div
        className="absolute -inset-[20%] opacity-40 animate-smoke"
        style={{
          background:
            "radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.05), transparent 55%), radial-gradient(ellipse at 70% 60%, rgba(255,255,255,0.04), transparent 60%)",
        }}
      />
      <div className="absolute inset-0 grain" />

      <div className="relative z-10 max-w-xl w-full text-center animate-fade-up">
        <img src={rasaLogo} alt="RASA" width={728} height={292} loading="eager" decoding="async" className="h-16 w-auto mx-auto" />
        <div className="luxe-divider max-w-[6rem] mx-auto my-10" />
        <h1 className="font-serif text-5xl md:text-6xl text-foreground text-balance">
          Access Restricted
        </h1>
        <p className="mt-6 font-serif italic text-xl text-gold-soft">
          You must be 18 years of age or older to access RASA.
        </p>
        <p className="mt-6 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          Our products and content are intended solely for adults of legal smoking age.
        </p>

        <div className="mt-12">
          <Link
            to="/"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.sessionStorage.removeItem("rasa_age_verified");
              }
            }}
            className="inline-flex px-12 py-4 border border-gold/50 text-gold text-[0.7rem] tracking-luxe uppercase hover:bg-gold hover:text-primary-foreground transition-all duration-500"
          >
            Return
          </Link>
        </div>
      </div>
    </section>
  );
}
