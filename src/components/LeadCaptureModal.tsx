import { useEffect, useRef, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { X, ArrowRight, Mail } from "lucide-react";


const SESSION_KEY = "rasa_lead_modal_shown";
const VISIT_KEY = "rasa_visit_count";
const AGE_KEY = "rasa_age_verified";
const SUBSCRIBED_KEY = "rasa_newsletter_subscribed";

const isAgeVerified = () => {
  if (typeof window === "undefined") return false;
  try {
    return (
      window.localStorage.getItem(AGE_KEY) === "1" ||
      window.sessionStorage.getItem(AGE_KEY) === "1"
    );
  } catch {
    return false;
  }
};

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

export function LeadCaptureModal() {
  const [open, setOpen] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const location = useLocation();
  const firedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const count = Number(sessionStorage.getItem(VISIT_KEY) || "0") + 1;
    sessionStorage.setItem(VISIT_KEY, String(count));
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    if (isAlreadySubscribed()) {
      setAlreadySubscribed(true);
      return;
    }

    const trigger = () => {
      if (firedRef.current) return;
      if (sessionStorage.getItem(SESSION_KEY)) return;
      if (!isAgeVerified()) return;
      firedRef.current = true;
      sessionStorage.setItem(SESSION_KEY, "1");
      setOpen(true);
    };

    const timer = window.setTimeout(trigger, 100_000);

    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop + window.innerHeight) / h.scrollHeight;
      if (scrolled >= 0.6) trigger();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const visits = Number(sessionStorage.getItem(VISIT_KEY) || "0");
    if (visits >= 2) {
      window.setTimeout(trigger, 1500);
    }

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const onSubscribed = () => setAlreadySubscribed(true);
    window.addEventListener("rasa-newsletter-subscribed", onSubscribed);
    return () => window.removeEventListener("rasa-newsletter-subscribed", onSubscribed);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!ok) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSendError("");
    setSending(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase.functions.invoke('newsletter', {
        body: { email: email.trim(), source: 'popup' },
      });
      if (error) throw error;
      markSubscribed();
      setDone(true);
      setTimeout(() => setOpen(false), 2500);
    } catch {
      setSendError("Something went wrong. Please try again or email us directly.");
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-title"
    >
      <div
        className="absolute inset-0 bg-ink/80 backdrop-blur-md"
        onClick={() => setOpen(false)}
      />
      <div
        className="relative w-full max-w-lg p-8 md:p-10 animate-fade-up"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.22 0.006 60 / 0.85), oklch(0.14 0.005 60 / 0.92))",
          border: "1px solid oklch(0.78 0.09 48 / 0.45)",
          backdropFilter: "blur(20px)",
          boxShadow:
            "0 30px 80px -20px oklch(0 0 0 / 0.8), 0 0 60px -10px oklch(0.78 0.09 48 / 0.25)",
        }}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute top-4 right-4 text-foreground/60 hover:text-gold transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {alreadySubscribed ? (
          <>
            <p className="text-[0.65rem] tracking-luxe uppercase text-gold inline-flex items-center gap-2">
              <Mail className="h-3 w-3" /> Already Subscribed
            </p>
            <h2
              id="lead-title"
              className="mt-3 font-serif text-3xl md:text-4xl text-balance"
            >
              You're already subscribed.
            </h2>
            <p className="mt-4 text-sm text-foreground/80 leading-relaxed">
              You're already subscribed to our newsletter. We'll keep you updated with the latest from the House of RASA.
            </p>
            <button
              onClick={() => setOpen(false)}
              className="mt-8 inline-flex items-center justify-center px-8 py-3.5 border border-border text-foreground/80 text-[0.7rem] tracking-luxe uppercase hover:border-gold/50 hover:text-gold transition-all duration-500"
            >
              Close
            </button>
          </>
        ) : (
          <>
            <p className="text-[0.65rem] tracking-luxe uppercase text-gold inline-flex items-center gap-2">
              <Mail className="h-3 w-3" /> Stay Updated
            </p>
            <h2
              id="lead-title"
              className="mt-3 font-serif text-3xl md:text-4xl text-balance"
            >
              Stay Updated with RASA
            </h2>
            <p className="mt-4 text-sm text-foreground/80 leading-relaxed">
              Subscribe to receive product launches, collection releases, flavour
              updates, partnership opportunities, and industry news.
            </p>

            {done ? (
              <p className="mt-8 font-serif italic text-lg text-gold-soft">
                Thank you — you are now subscribed.
              </p>
            ) : (
              <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
                <div>
                  <label className="block text-[0.65rem] tracking-luxe uppercase text-gold/80 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Enter your email address"
                    className={`w-full bg-transparent border-b ${
                      error ? "border-destructive" : "border-border/70"
                    } py-3 text-foreground focus:border-gold outline-none transition-colors placeholder:text-muted-foreground/50`}
                  />
                  {error && (
                    <p className="mt-2 text-xs font-serif italic text-destructive">
                      {error}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={sending}
                    className="group inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-gold text-primary-foreground text-[0.7rem] tracking-luxe uppercase hover:bg-gold-soft transition-all duration-500 flex-1 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {sending ? "Sending…" : "Subscribe"}
                    {!sending && (
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center px-8 py-3.5 border border-border text-foreground/80 text-[0.7rem] tracking-luxe uppercase hover:border-gold/50 hover:text-gold transition-all duration-500"
                  >
                    Maybe Later
                  </button>
                </div>

                {sendError && (
                  <p className="text-xs font-serif italic text-destructive bg-destructive/10 border border-destructive/30 rounded-sm px-3 py-2">
                    {sendError}
                  </p>
                )}
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
