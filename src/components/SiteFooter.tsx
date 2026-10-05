import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Instagram, Mail, Phone, MessageCircle, MapPin, ArrowRight } from "lucide-react";

import { contactInfo } from "@/data/contact";
import { AnimatedWordmark } from "@/components/AnimatedWordmark";
import { PrivacyPolicyModal } from "@/components/PrivacyPolicyModal";
import { AgeRestrictionPolicyModal } from "@/components/AgeRestrictionPolicyModal";
import { TermsAndConditionsModal } from "@/components/TermsAndConditionsModal";


export function SiteFooter() {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [ageOpen, setAgeOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  return (
    <footer className="relative bg-ink border-t border-border/60">
      <div className="absolute inset-x-0 top-0 luxe-divider" />
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-16 pb-10">
        {/* NEWSLETTER */}
        <Newsletter />

        <div className="mt-14 pt-12 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1 sm:col-span-2">
            <AnimatedWordmark size="h-14" halo={false} float={false} />
            <p className="mt-4 font-display uppercase tracking-wider text-base gradient-gold-text">SMOKE, PERFECTED</p>
            <p className="mt-5 text-sm text-foreground/75 leading-relaxed max-w-xs">
              A luxury hookah lifestyle house and premium distribution partner — built on craftsmanship, character and
              refinement.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[0.7rem] tracking-luxe uppercase text-gold mb-6">Navigation</h4>
            <ul className="space-y-3 text-sm text-foreground/75">
              <li>
                <Link to="/" className="hover:text-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/house-of-rasa" className="hover:text-gold transition-colors">
                  House of RASA
                </Link>
              </li>
              <li>
                <Link to="/coming-soon" search={{ category: "hookahs" }} className="hover:text-gold transition-colors">
                  Hookahs
                </Link>
              </li>
              <li>
                <Link
                  to="/coming-soon"
                  search={{ category: "accessories" }}
                  className="hover:text-gold transition-colors"
                >
                  Accessories
                </Link>
              </li>
              <li>
                <Link to="/loyalty" className="hover:text-gold transition-colors">
                  Loyalty
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-[0.7rem] tracking-luxe uppercase text-gold mb-6">Collections</h4>
            <ul className="space-y-3 text-sm text-foreground/75">
              <li>
                <Link to="/collections" className="hover:text-gold transition-colors">
                  View All
                </Link>
              </li>
              <li>
                <Link to="/collections/majlis" className="hover:text-gold transition-colors">
                  Majlis
                </Link>
              </li>
              <li>
                <Link to="/collections/makhmal" className="hover:text-gold transition-colors">
                  Makhmal
                </Link>
              </li>
              <li>
                <Link to="/collections/tarkib" className="hover:text-gold transition-colors">
                  Tarkib
                </Link>
              </li>
            </ul>
          </div>

          {/* Partnerships */}
          <div>
            <h4 className="text-[0.7rem] tracking-luxe uppercase text-gold mb-6">Partnerships</h4>
            <ul className="space-y-3 text-sm text-foreground/75">
              <li>
                <Link to="/partners" className="hover:text-gold transition-colors">
                  Become a Partner
                </Link>
              </li>
              <li>
                <Link to="/partners" hash="distributor" className="hover:text-gold transition-colors">
                  Distributors
                </Link>
              </li>
              <li>
                <Link to="/partners" hash="lounge" className="hover:text-gold transition-colors">
                  Hospitality
                </Link>
              </li>
              <li>
                <Link to="/partners" hash="retail" className="hover:text-gold transition-colors">
                  Retail
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold transition-colors">
                  Wholesale Inquiry
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact + Office */}
          <div>
            <h4 className="text-[0.7rem] tracking-luxe uppercase text-gold mb-6">Contact</h4>
            <ul className="space-y-3 text-sm text-foreground/75">
              <li className="flex items-start gap-3">
                <MapPin className="h-3.5 w-3.5 text-gold/80 shrink-0 mt-1" />
                <span className="leading-relaxed not-italic">
                  {contactInfo.address.company}
                  <br />
                  {contactInfo.address.line1}
                  <br />
                  {contactInfo.address.line2}
                  <br />
                  {contactInfo.address.line3}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-3.5 w-3.5 text-gold/80 shrink-0" />
                <a href={`mailto:${contactInfo.email}`} className="hover:text-gold transition-colors">
                  {contactInfo.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-3.5 w-3.5 text-gold/80 shrink-0" />
                <a href={`tel:${contactInfo.phoneRaw}`} className="hover:text-gold transition-colors">
                  {contactInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="h-3.5 w-3.5 text-gold/80 shrink-0" />
                <a
                  href={contactInfo.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Instagram className="h-3.5 w-3.5 text-gold/80 shrink-0" />
                <a
                  href={contactInfo.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  @{contactInfo.instagramHandle}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-foreground/65">
          <p>© {new Date().getFullYear()} RASA. All Rights Reserved.</p>
          <div className="flex gap-6 flex-wrap justify-center">
            <button
              onClick={() => setPrivacyOpen(true)}
              className="hover:text-gold transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setTermsOpen(true)}
              className="hover:text-gold transition-colors cursor-pointer"
            >
              Terms &amp; Conditions
            </button>
            <button
              onClick={() => setAgeOpen(true)}
              className="hover:text-gold transition-colors cursor-pointer"
            >
              Age Restriction Policy
            </button>
          </div>
        </div>
      </div>
      <PrivacyPolicyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <AgeRestrictionPolicyModal open={ageOpen} onClose={() => setAgeOpen(false)} />
      <TermsAndConditionsModal open={termsOpen} onClose={() => setTermsOpen(false)} />
    </footer>
  );
}

const SUBSCRIBED_KEY = "rasa_newsletter_subscribed";

const isAlreadySubscribed = () => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SUBSCRIBED_KEY) === "1";
  } catch {
    return false;
  }
};

const markSubscribed = () => {
  try {
    window.localStorage.setItem(SUBSCRIBED_KEY, "1");
    window.dispatchEvent(new Event("rasa-newsletter-subscribed"));
  } catch {}
};

function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  useEffect(() => {
    if (isAlreadySubscribed()) setAlreadySubscribed(true);
  }, []);

  useEffect(() => {
    const onSubscribed = () => setAlreadySubscribed(true);
    window.addEventListener("rasa-newsletter-subscribed", onSubscribed);
    return () => window.removeEventListener("rasa-newsletter-subscribed", onSubscribed);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("A valid email address is required.");
      return;
    }
    setError("");
    setSending(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase.functions.invoke('newsletter', {
        body: { email: email.trim(), source: 'footer' },
      });
      if (error) throw error;
      markSubscribed();
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid md:grid-cols-[1.1fr_1fr] gap-8 items-center">
      <div>
        <p className="text-[0.65rem] tracking-luxe uppercase text-gold">Stay Updated</p>
        <h3 className="mt-3 font-serif text-3xl md:text-4xl text-balance">Stay Updated with RASA</h3>
        <p className="mt-3 text-sm text-foreground/75 max-w-md leading-relaxed">
          Subscribe to receive product launches, collection releases, flavour updates, partnership opportunities, and
          industry news.
        </p>
      </div>
      {alreadySubscribed || done ? (
        <p className="font-serif italic text-lg text-gold-soft">
          {done ? "Thank you — you are now subscribed." : "You're subscribed to our premium updates."}
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-2">
          <div
            className={`flex items-center gap-3 border-b ${error ? "border-destructive" : "border-border/70 focus-within:border-gold"} transition-colors`}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              placeholder="Enter your email address"
              className="flex-1 bg-transparent py-3 text-foreground outline-none placeholder:text-muted-foreground/60"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 py-3 text-[0.7rem] tracking-luxe uppercase text-gold hover:text-gold-soft transition-colors disabled:opacity-60"
            >
              {sending ? "Sending…" : "Subscribe"} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          {error && <p className="text-xs font-serif italic text-destructive">{error}</p>}
        </form>
      )}
    </div>
  );
}
