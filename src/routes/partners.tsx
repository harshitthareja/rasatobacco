import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Partner — Join the House of RASA" },
      {
        name: "description",
        content:
          "Distributor, Lounge, and Retail partnerships with RASA across India and the Gulf region.",
      },
      { property: "og:title", content: "Partner — RASA" },
      {
        property: "og:description",
        content: "Distributor, Lounge and Retail partnerships with the House of RASA.",
      },
    ],
  }),
  component: Partners,
});

const programs = [
  {
    anchor: "distributor",
    title: "Distributor Partnerships",
    tag: "Territory & Trade",
    body: "We collaborate with established trade partners across India and the Gulf region. Distributor relationships are built on structured territorial support, brand discipline, and long-term alignment.",
  },
  {
    anchor: "lounge",
    title: "Lounge Partnerships",
    tag: "Hospitality & Experience",
    body: "RASA partners with discerning lounges and hospitality venues to deliver the complete experience — tobacco, hookah, and accessories — composed for guests who recognise the difference.",
  },
  {
    anchor: "retail",
    title: "Retail Partnerships",
    tag: "Boutique & Specialist",
    body: "We work with boutique retailers and specialty merchants whose presentation, clientele, and atmosphere align with the standards of the House of RASA.",
  },
];

function Partners() {
  const hash = useRouterState({ select: (s) => s.location.hash });

  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }, [hash]);

  return (
    <>
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-ink">
        <div className="absolute inset-0 smoke-bg opacity-50" />
        <div className="absolute inset-0 grain" />
        <div className="relative z-10 text-center px-6 max-w-3xl animate-fade-up">
          <p className="text-[0.65rem] tracking-luxe uppercase text-gold mb-8">
            Partnership
          </p>
          <h1 className="font-serif text-6xl md:text-[8rem] leading-none">Partner</h1>
          <div className="luxe-divider max-w-[6rem] mx-auto my-10" />
          <p className="font-serif italic text-xl md:text-2xl text-gold-soft">
            Join the House of RASA.
          </p>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="mx-auto max-w-5xl px-6 lg:px-10 space-y-24">
          {programs.map((p, i) => (
            <article
              id={p.anchor}
              key={p.anchor}
              className="scroll-mt-24 grid md:grid-cols-12 gap-10 items-start py-12 border-t border-border/40"
            >
              <div className="md:col-span-1">
                <span className="text-[0.6rem] tracking-luxe text-gold/60">
                  0{i + 1}
                </span>
              </div>
              <div className="md:col-span-4">
                <p className="text-[0.65rem] tracking-luxe uppercase text-gold">
                  {p.tag}
                </p>
                <h2 className="mt-4 font-serif text-3xl md:text-4xl leading-tight">
                  {p.title}
                </h2>
              </div>
              <div className="md:col-span-7">
                <p className="text-muted-foreground leading-loose">{p.body}</p>
                <Link
                  to="/contact"
                  className="luxe-underline inline-flex items-center gap-2 mt-8 text-gold text-[0.7rem] tracking-luxe uppercase"
                >
                  Enquire <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Why Partner */}
      <section className="py-24 bg-ink border-t border-border/40">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <p className="text-[0.65rem] tracking-luxe uppercase text-gold text-center">
            Why Partner With RASA
          </p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl text-center text-balance">
            A partnership built on craft, consistency and care.
          </h2>
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/30">
            {[
              ["Wholesale Pricing", "Tiered structures aligned with serious trade partners."],
              ["Exclusive Series", "Access to limited and territory-specific releases."],
              ["Dedicated Support", "A named account lead for every relationship."],
              ["Reliable Supply Chain", "Disciplined logistics across India and the Gulf."],
              ["Marketing Support", "Brand assets, training and co-branded campaigns."],
              ["Long-term Growth", "Structured to grow with you, season after season."],
            ].map(([t, d]) => (
              <div key={t} className="bg-ink p-10">
                <p className="font-serif text-2xl text-gold">{t}</p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration form */}
      <PartnerForm />

      <section className="py-32 bg-ink text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="font-serif text-4xl md:text-5xl text-balance">
            Begin a conversation with our sales team.
          </h2>
          <Link
            to="/contact"
            className="group inline-flex items-center gap-3 mt-10 px-12 py-5 bg-gold text-primary-foreground text-[0.7rem] tracking-luxe uppercase hover:bg-gold-soft transition-colors duration-500"
          >
            Contact Sales Team
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </>
  );
}

function PartnerForm() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [f, setF] = useState({
    name: "", company: "", phone: "", email: "",
    businessType: "Distributor", city: "", state: "", message: "",
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendError(null);
    setSending(true);
    try {
      const { error: fnError } = await supabase.functions.invoke('partner-form', {
        body: { ...f, user_id: null },
      });
      if (fnError) throw fnError;
      setSubmitted(true);
    } catch {
      setSendError("Something went wrong. Please try WhatsApp or email us directly.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="register" className="py-28 bg-background border-t border-border/40">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">

        <div className="text-center max-w-2xl mx-auto">
          <p className="text-[0.65rem] tracking-luxe uppercase text-gold">Partner Registration</p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl text-balance">
            Submit a partnership enquiry.
          </h2>
          <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
            Share your details below. Our sales atelier responds within one business day.
          </p>
        </div>

        {submitted ? (
          <div className="mt-16 border border-gold/30 bg-surface p-12 text-center animate-fade-up max-w-xl mx-auto">
            <h3 className="font-serif text-3xl">Thank you.</h3>
            <p className="mt-4 text-muted-foreground">
              Your enquiry has reached the House of RASA.
            </p>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mt-14 grid sm:grid-cols-2 gap-x-10 gap-y-7"
          >
            <PField label="Name *" value={f.name} onChange={set("name")} required />
            <PField label="Company *" value={f.company} onChange={set("company")} required />
            <PField label="Phone *" type="tel" value={f.phone} onChange={set("phone")} required />
            <PField label="Email *" type="email" value={f.email} onChange={set("email")} required />
            <div>
              <label className="block text-[0.65rem] tracking-luxe uppercase text-gold/80 mb-2">
                Business Type *
              </label>
              <select
                value={f.businessType}
                onChange={set("businessType")}
                className="w-full bg-transparent border-b border-border/60 py-3 text-foreground focus:border-gold outline-none transition-colors"
              >
                {["Distributor", "Lounge", "Retail", "Wholesale", "Other"].map((o) => (
                  <option key={o} value={o} className="bg-ink">{o}</option>
                ))}
              </select>
            </div>
            <PField label="City *" value={f.city} onChange={set("city")} required />
            <PField label="State *" value={f.state} onChange={set("state")} required />
            <div className="sm:col-span-2">
              <label className="block text-[0.65rem] tracking-luxe uppercase text-gold/80 mb-2">
                Message
              </label>
              <textarea
                rows={4}
                value={f.message}
                onChange={set("message")}
                placeholder="Tell us about your business and intent…"
                className="w-full bg-transparent border-b border-border/60 py-3 text-foreground focus:border-gold outline-none transition-colors resize-none"
              />
            </div>
            <div className="sm:col-span-2 pt-4 space-y-4">
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-3 px-12 py-4 bg-gold text-primary-foreground text-[0.7rem] tracking-luxe uppercase hover:bg-gold-soft transition-colors duration-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sending ? "Sending…" : "Submit Inquiry"}
                {sending ? (
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                ) : (
                  <ArrowRight className="h-3.5 w-3.5" />
                )}
              </button>
              {sendError && (
                <p className="text-xs font-serif italic text-destructive">{sendError}</p>
              )}
            </div>
          </form>

        )}
      </div>
    </section>
  );
}

function PField({
  label, value, onChange, type = "text", required = false,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[0.65rem] tracking-luxe uppercase text-gold/80 mb-2">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent border-b border-border/60 py-3 text-foreground focus:border-gold outline-none transition-colors"
      />
    </div>
  );
}
