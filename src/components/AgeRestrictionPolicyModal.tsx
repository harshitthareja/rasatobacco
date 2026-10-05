import { useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AgeRestrictionPolicyModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-policy-title"
    >
      <div className="absolute inset-0 bg-ink/90 backdrop-blur-md" onClick={onClose} />
      <div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col"
        style={{
          background: "linear-gradient(180deg, oklch(0.22 0.006 60 / 0.97), oklch(0.14 0.005 60 / 0.99))",
          border: "1px solid oklch(0.78 0.09 48 / 0.3)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 30px 80px -20px oklch(0 0 0 / 0.8)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border/40 shrink-0">
          <div>
            <p className="text-[0.6rem] tracking-luxe uppercase text-gold mb-1">Legal</p>
            <h2 id="age-policy-title" className="font-serif text-2xl text-foreground">Age Restriction Policy</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-foreground/50 hover:text-gold transition-colors p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-8 py-6 text-sm text-foreground/80 leading-relaxed space-y-6">
          <p className="text-foreground/60 text-xs">Last Updated: 07 July, 2026</p>

          <p>Welcome to RASA ("RASA", "we", "our", or "us"). This Age Restriction Policy explains the requirements for accessing and using the RASA website. By entering this website, you acknowledge that you have read and agree to this policy.</p>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">1. Legal Age Requirement</h3>
            <p className="mb-3">Access to this website is restricted to individuals who are of legal age to view, purchase, possess, or use tobacco-related products in their country, state, province, or jurisdiction.</p>
            <p className="mb-3">By entering this website, you confirm that:</p>
            <ul className="space-y-1.5 pl-4 text-foreground/75">
              {[
                "You meet the applicable legal age requirements in your jurisdiction.",
                "You are legally permitted to access tobacco-related content.",
                "You are accessing the website on your own behalf.",
                "The information you provide regarding your age is accurate.",
              ].map(item => (
                <li key={item} className="flex items-start gap-2"><span className="text-gold mt-1.5 shrink-0">·</span>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">2. Age Verification</h3>
            <p>Visitors are required to confirm their age before accessing the website. The age confirmation process is intended to discourage access by individuals who are below the legal age requirement. RASA reserves the right to implement additional age verification measures at any time if deemed necessary.</p>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">3. Restrictions on Minors</h3>
            <p>Individuals who do not meet the applicable legal age requirement must immediately exit the website. RASA does not knowingly market, advertise, promote, or provide information to minors regarding tobacco or related products. Any attempt by a minor to access age-restricted content is unauthorized.</p>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">4. Responsible Communication</h3>
            <p>RASA promotes its products and brand only to adult consumers. Nothing contained on this website is intended to encourage, promote, or facilitate access to tobacco-related products by individuals who are below the legal age requirement.</p>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">5. Jurisdictional Compliance</h3>
            <p>Laws governing tobacco-related products vary by country and region. Visitors are responsible for ensuring that access to this website and any related content is lawful within their jurisdiction. RASA makes no representation that website content is appropriate or lawful in every location.</p>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">6. Limitation of Responsibility</h3>
            <p>While RASA takes reasonable measures to restrict access to age-restricted content, no online age verification system can completely prevent unauthorized access. Users remain responsible for providing accurate information regarding their eligibility to access the website.</p>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">7. Changes to This Policy</h3>
            <p>RASA reserves the right to update or modify this Age Restriction Policy at any time. Any changes will be published on this page with an updated revision date. Continued use of the website following updates constitutes acceptance of the revised policy.</p>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">8. Contact Us</h3>
            <div className="space-y-1 text-foreground/75">
              <p className="font-serif text-foreground">RASA</p>
              <p>Email: <a href="mailto:admin@rasatobacco.com" className="text-gold hover:underline">admin@rasatobacco.com</a></p>
              <p>Phone: +91 9090204008</p>
              <p>Address: Suite No. 312A, Suncity Trade Tower, Gurugram — 122018</p>
            </div>
          </div>

          <div className="border border-gold/20 bg-gold/5 px-5 py-4">
            <p className="text-foreground/90 font-serif italic text-sm">If you are not of legal age to access tobacco-related content in your jurisdiction, you must not enter or use this website. By proceeding beyond the age verification screen, you confirm that you satisfy all applicable legal age requirements.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-border/40 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center px-8 py-3 border border-border text-foreground/80 text-[0.7rem] tracking-luxe uppercase hover:border-gold/50 hover:text-gold transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
