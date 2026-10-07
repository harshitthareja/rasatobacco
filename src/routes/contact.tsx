import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

import { SectionLabel } from "../components/SectionLabel";
import { catalogueWhatsAppUrl, contactInfo, partnerWhatsAppUrl } from "@/data/contact";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowRight,
  Mail,
  Phone,
  MessageCircle,
  Handshake,
  FileText,
  Truck,
  Building2,
  Store,
  Sparkles,
  Instagram,
} from "lucide-react";

type ContactSearch = {
  product?: string;
  collection?: string;
  format?: string;
};

export const Route = createFileRoute("/contact")({
  validateSearch: (s: Record<string, unknown>): ContactSearch => ({
    product: typeof s.product === "string" ? s.product : undefined,
    collection: typeof s.collection === "string" ? s.collection : undefined,
    format: typeof s.format === "string" ? s.format : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Contact — Sales, Distribution & Partnerships | RASA" },
      {
        name: "description",
        content:
          "Speak with the RASA sales atelier — distribution, hospitality, retail and wholesale enquiries across India and the Gulf.",
      },
      { property: "og:title", content: "Contact RASA Sales" },
      {
        property: "og:description",
        content:
          "Distribution, hospitality, retail and wholesale opportunities with the House of RASA.",
      },
    ],
  }),
  component: Contact,
});

type FormState = {
  name: string;
  business: string;
  email: string;
  phone: string;
  type: string;
  message: string;
};

const businessTypes = [
  "Distributor",
  "Hospitality / Lounge",
  "Retail Boutique",
  "Wholesale",
  "Media / Press",
  "Other",
];

const focusAreas = [
  {
    icon: Truck,
    title: "Sales Inquiries",
    body: "Pricing, allocations and order desks for serious buyers.",
  },
  {
    icon: Building2,
    title: "Distribution Partnerships",
    body: "Territory representation across India, Gulf and beyond.",
  },
  {
    icon: Sparkles,
    title: "Hospitality Collaborations",
    body: "Composed RASA programmes for lounges, hotels and clubs.",
  },
  {
    icon: Store,
    title: "Retail Opportunities",
    body: "Curated placements for boutique tobacconists and concept stores.",
  },
];

function Contact() {
  const search = useSearch({ from: "/contact" }) as ContactSearch;
  const prefilledMessage = (() => {
    const parts: string[] = [];
    if (search.product) parts.push(`Selected Product: ${search.product}`);
    if (search.collection) parts.push(`Selected Series: ${search.collection}`);
    if (search.format) parts.push(`Selected Format: ${search.format}`);
    return parts.length
      ? parts.join("\n") + "\n\nPlease share availability and wholesale pricing."
      : "";
  })();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    business: "",
    email: "",
    phone: "",
    type: "Distributor",
    message: prefilledMessage,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name:
          f.name ||
          (user.user_metadata?.full_name as string) ||
          (user.user_metadata?.name as string) ||
          "",
        email: f.email || user.email || "",
      }));
    }
  }, [user]);

  const onChange =
    (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
    };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = "Kindly share your full name.";
    if (!form.business.trim()) e.business = "Your business name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "A valid email address is required.";
    if (!form.phone.trim()) e.phone = "A contact number lets us respond swiftly.";
    if (!form.message.trim() || form.message.trim().length < 10)
      e.message = "Please share a few words about your enquiry.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSendError(null);
    setSending(true);
    try {
      const { error: fnError } = await supabase.functions.invoke("contact-form", {
        body: { ...form, user_id: user?.id ?? null },
      });
      if (fnError) throw fnError;
      setSubmitted(true);
    } catch {
      setSendError("Something went wrong. Please email us directly or try again.");
    } finally {
      setSending(false);
    }
  };

  const whatsappLink = contactInfo.whatsappUrl;

  const quickActions = [
    {
      icon: Phone,
      label: "Call Sales",
      sub: contactInfo.phone,
      href: `tel:${contactInfo.phoneRaw}`,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp Sales",
      sub: "Reply within the hour",
      href: whatsappLink,
      external: true,
    },
    {
      icon: Handshake,
      label: "Become a Partner",
      sub: "Distribution & retail",
      href: partnerWhatsAppUrl,
      external: true,
    },
    {
      icon: FileText,
      label: "Request Catalogue",
      sub: "Full house portfolio",
      href: catalogueWhatsAppUrl,
      external: true,
    },
  ];

  return (
    <section className="pt-28 pb-16 bg-ink min-h-screen">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* HEADER */}
        <div className="max-w-3xl">
          <SectionLabel>
            <span>Contact the House</span>
          </SectionLabel>
          <h1 className="mt-5 font-serif text-5xl md:text-6xl text-balance leading-[1.05]">
            Speak with the <em className="text-gold not-italic">RASA</em> sales atelier.
          </h1>
          <p className="mt-5 text-foreground/80 max-w-2xl leading-relaxed">
            Sales inquiries, distribution partnerships, hospitality collaborations and retail
            opportunities — a representative responds within one business day.
          </p>
        </div>

        {/* QUICK ACTIONS */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(({ icon: Icon, label, sub, href, external }) => (
            <a
              key={label}
              href={href}
              {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="card-luxe p-5 group flex flex-col gap-3"
            >
              <Icon className="h-5 w-5 text-gold" strokeWidth={1.25} />
              <div>
                <p className="font-serif text-lg leading-tight">{label}</p>
                <p className="mt-1 text-xs text-foreground/70">{sub}</p>
              </div>
              <span className="mt-auto pt-2 inline-flex items-center gap-2 text-[0.65rem] tracking-luxe uppercase text-gold/85 group-hover:text-gold transition-colors">
                Open <ArrowRight className="h-3 w-3" />
              </span>
            </a>
          ))}
        </div>

        {/* FORM + FOCUS */}
        <div className="mt-12 grid lg:grid-cols-[1.15fr_1fr] gap-12">
          <div>
            {submitted ? (
              <div className="card-luxe p-10 text-center animate-fade-up">
                <h2 className="font-serif text-3xl">Thank you.</h2>
                <p className="mt-4 text-foreground/80">
                  Your enquiry has reached our sales atelier. A representative will respond within
                  one business day.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="card-luxe p-6 md:p-8 space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field
                    label="Full Name"
                    required
                    value={form.name}
                    onChange={onChange("name")}
                    error={errors.name}
                  />
                  <Field
                    label="Business Name"
                    required
                    value={form.business}
                    onChange={onChange("business")}
                    error={errors.business}
                  />
                  <Field
                    label="Email"
                    type="email"
                    required
                    value={form.email}
                    onChange={onChange("email")}
                    error={errors.email}
                  />
                  <Field
                    label="Phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={onChange("phone")}
                    error={errors.phone}
                  />
                  <div className="sm:col-span-2">
                    <label className="block text-[0.65rem] tracking-luxe uppercase text-gold/80 mb-2">
                      Business Type
                    </label>
                    <select
                      value={form.type}
                      onChange={onChange("type")}
                      className="w-full bg-transparent border-b border-border/60 py-3 text-foreground focus:border-gold outline-none transition-colors"
                    >
                      {businessTypes.map((o) => (
                        <option key={o} value={o} className="bg-ink">
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[0.65rem] tracking-luxe uppercase text-gold/80 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={onChange("message")}
                    placeholder="Tell us about your territory, venue or enquiry…"
                    className={`w-full bg-transparent border-b ${
                      errors.message ? "border-destructive" : "border-border/60"
                    } py-3 text-foreground focus:border-gold outline-none transition-colors resize-none placeholder:text-muted-foreground/50`}
                  />
                  {errors.message && (
                    <p className="mt-2 text-xs font-serif italic text-destructive">
                      {errors.message}
                    </p>
                  )}
                </div>

                <div className="pt-3 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={sending}
                    className="group inline-flex items-center justify-center gap-3 px-10 py-4 bg-gold text-primary-foreground text-xs tracking-luxe uppercase hover:bg-gold-soft transition-colors duration-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {sending ? "Sending…" : "Submit Enquiry"}
                    {sending ? (
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                    ) : (
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    )}
                  </button>
                </div>
                {sendError && (
                  <p className="text-xs font-serif italic text-destructive">{sendError}</p>
                )}
                <p className="text-xs text-foreground/60">
                  By submitting you confirm you are 18+ and acting in a professional capacity.
                </p>
              </form>
            )}
          </div>

          {/* FOCUS AREAS */}
          <aside className="space-y-4">
            <p className="text-[0.65rem] tracking-luxe uppercase text-gold">What We Compose</p>
            <h2 className="font-serif text-3xl text-balance leading-tight">
              Built for serious trade partners.
            </h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              {focusAreas.map(({ icon: Icon, title, body }) => (
                <div key={title} className="card-luxe p-5">
                  <Icon className="h-5 w-5 text-gold mb-3" strokeWidth={1.25} />
                  <p className="font-serif text-lg leading-tight">{title}</p>
                  <p className="mt-2 text-sm text-foreground/75 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>

            <div className="card-luxe p-6 mt-4">
              <p className="text-[0.65rem] tracking-luxe uppercase text-gold mb-3">
                Direct Channels
              </p>
              <div className="space-y-3 text-sm">
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center gap-3 text-foreground/85 hover:text-gold transition-colors"
                >
                  <Mail className="h-4 w-4 text-gold" /> {contactInfo.email}
                </a>
                <a
                  href={`tel:${contactInfo.phoneRaw}`}
                  className="flex items-center gap-3 text-foreground/85 hover:text-gold transition-colors"
                >
                  <Phone className="h-4 w-4 text-gold" /> {contactInfo.phone}
                </a>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-foreground/85 hover:text-gold transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-gold" /> WhatsApp
                </a>
                <a
                  href={contactInfo.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-foreground/85 hover:text-gold transition-colors"
                >
                  <Instagram className="h-4 w-4 text-gold" /> @{contactInfo.instagramHandle}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-[0.65rem] tracking-luxe uppercase text-gold/80 mb-2">
        {label}
        {required && <span className="text-gold/60"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full bg-transparent border-b ${
          error ? "border-destructive" : "border-border/60"
        } py-3 text-foreground focus:border-gold outline-none transition-colors`}
      />
      {error && <p className="mt-2 text-xs font-serif italic text-destructive">{error}</p>}
    </div>
  );
}
