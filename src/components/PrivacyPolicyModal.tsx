import { useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function PrivacyPolicyModal({ open, onClose }: Props) {
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
      className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-title"
    >
      <div
        className="absolute inset-0 bg-ink/85 backdrop-blur-md"
        onClick={onClose}
      />
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
            <h2 id="privacy-title" className="font-serif text-2xl text-foreground">Privacy Policy</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-foreground/50 hover:text-gold transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-8 py-6 text-sm text-foreground/80 leading-relaxed space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">

          <p className="text-foreground/60 text-xs">Last Updated: 07 July, 2026</p>

          <p>Welcome to RASA ("RASA", "we", "our", or "us"). Your privacy is important to us. This Privacy Policy explains how we collect, use, store, and protect information when you visit our website. By using this website, you agree to the terms outlined in this Privacy Policy.</p>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">1. Information We Collect</h3>
            <p className="mb-3">We may collect information that you voluntarily provide to us, including:</p>
            <ul className="space-y-1.5 pl-4 text-foreground/75">
              {["Full Name", "Email Address", "Phone Number", "Company Name", "Country", "Partnership Information", "Messages submitted through contact forms", "Information shared through WhatsApp, email, or other communication channels"].map(item => (
                <li key={item} className="flex items-start gap-2"><span className="text-gold mt-1.5 shrink-0">·</span>{item}</li>
              ))}
            </ul>
            <p className="mt-3 mb-3">We may also collect limited technical information automatically, including:</p>
            <ul className="space-y-1.5 pl-4 text-foreground/75">
              {["IP Address", "Browser Type", "Device Information", "Website Usage Data", "Cookies and Analytics Information"].map(item => (
                <li key={item} className="flex items-start gap-2"><span className="text-gold mt-1.5 shrink-0">·</span>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">2. How We Use Your Information</h3>
            <p className="mb-3">We use collected information to:</p>
            <ul className="space-y-1.5 pl-4 text-foreground/75">
              {["Respond to enquiries", "Process partnership requests", "Provide customer support", "Improve our website and services", "Maintain website security", "Communicate relevant business information when appropriate", "Comply with applicable legal requirements"].map(item => (
                <li key={item} className="flex items-start gap-2"><span className="text-gold mt-1.5 shrink-0">·</span>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">3. Cookies and Analytics</h3>
            <p>Our website may use cookies and similar technologies to improve user experience and understand website performance. These technologies may collect anonymous information regarding website usage, traffic patterns, and visitor interactions. Users may adjust their browser settings to refuse cookies; however, certain website features may not function properly.</p>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">4. Information Sharing</h3>
            <p className="mb-3">We do not sell, rent, or trade personal information. Information may only be shared:</p>
            <ul className="space-y-1.5 pl-4 text-foreground/75">
              {["With trusted service providers assisting website operations.", "When required by law or regulatory authorities.", "To protect the rights, safety, or security of RASA and its users."].map(item => (
                <li key={item} className="flex items-start gap-2"><span className="text-gold mt-1.5 shrink-0">·</span>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">5. Data Security</h3>
            <p>We take reasonable administrative, technical, and organizational measures to protect personal information from unauthorized access, disclosure, alteration, or destruction. However, no internet transmission or storage system can be guaranteed to be completely secure.</p>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">6. Third-Party Links</h3>
            <p>This website may contain links to third-party websites, including social media platforms. RASA is not responsible for the privacy practices or content of external websites. Users are encouraged to review the privacy policies of any third-party services they access.</p>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">7. Age Restriction</h3>
            <p>This website is intended only for individuals who are of legal age to access tobacco-related content in their jurisdiction. We do not knowingly collect personal information from minors. If we become aware that information has been provided by a minor, we will take reasonable steps to remove such information.</p>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">8. Your Rights</h3>
            <p className="mb-3">Subject to applicable laws, users may request:</p>
            <ul className="space-y-1.5 pl-4 text-foreground/75">
              {["Access to their personal information.", "Correction of inaccurate information.", "Deletion of personal information.", "Withdrawal of consent where applicable."].map(item => (
                <li key={item} className="flex items-start gap-2"><span className="text-gold mt-1.5 shrink-0">·</span>{item}</li>
              ))}
            </ul>
            <p className="mt-3">Requests may be submitted through the contact information provided below.</p>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">9. Contact Us</h3>
            <p className="mb-2">For questions regarding this Privacy Policy or your personal information, please contact:</p>
            <div className="space-y-1 text-foreground/75">
              <p className="font-serif text-foreground">RASA</p>
              <p>Email: <a href="mailto:admin@rasatobacco.com" className="text-gold hover:underline">admin@rasatobacco.com</a></p>
              <p>Phone: +91 9090204008</p>
              <p>Address: Suite No. 312A, Suncity Trade Tower, Gurugram — 122018</p>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">10. Changes to This Policy</h3>
            <p>RASA may update this Privacy Policy from time to time. Any updates will be published on this page with a revised effective date. Continued use of the website following updates constitutes acceptance of the revised Privacy Policy.</p>
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
