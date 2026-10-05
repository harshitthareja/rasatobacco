import { useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function TermsAndConditionsModal({ open, onClose }: Props) {
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
      aria-labelledby="tnc-title"
    >
      <div className="absolute inset-0 bg-ink/85 backdrop-blur-md" onClick={onClose} />
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
            <h2 id="tnc-title" className="font-serif text-2xl text-foreground">Terms &amp; Conditions</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-foreground/50 hover:text-gold transition-colors p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-8 py-6 text-sm text-foreground/80 leading-relaxed space-y-6">
          <p className="text-foreground/60 text-xs">Last Updated: 07 July, 2026</p>

          <p>Welcome to RASA ("RASA", "we", "our", or "us"). These Terms &amp; Conditions govern your use of this website. By accessing or using this website, you agree to comply with these Terms &amp; Conditions. If you do not agree with any part of these terms, please discontinue use of the website.</p>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">1. Website Purpose</h3>
            <p className="mb-2">The RASA website is provided for informational, brand, partnership, and communication purposes. Information presented on this website is intended to introduce visitors to the House of RASA, its collections, products, partnerships, and related activities.</p>
            <p>Nothing on this website should be interpreted as a binding offer, contractual commitment, or guarantee of product availability.</p>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">2. Age Restriction</h3>
            <p>This website contains content related to tobacco and hookah products. Access is intended only for individuals who are of legal age to access such content in their jurisdiction. By entering and using this website, you confirm that you meet the applicable legal age requirements.</p>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">3. Intellectual Property</h3>
            <p className="mb-3">All content appearing on this website, including but not limited to:</p>
            <ul className="space-y-1.5 pl-4 text-foreground/75 mb-3">
              {["Logos", "Brand names", "Trademarks", "Product names", "Designs", "Product imagery", "Text", "Graphics", "Visual assets", "Website design", "Layout and user interface"].map(item => (
                <li key={item} className="flex items-start gap-2"><span className="text-gold mt-1.5 shrink-0">·</span>{item}</li>
              ))}
            </ul>
            <p>are the exclusive property of RASA or are used with appropriate permission. No content may be copied, reproduced, distributed, modified, published, or used without prior written permission from RASA.</p>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">4. Website Content</h3>
            <p>RASA makes reasonable efforts to ensure that the information presented on this website is accurate and up to date. However, we do not guarantee the completeness, accuracy, reliability, or availability of any information, products, services, or content displayed. Content may be updated, modified, suspended, or removed at any time without prior notice.</p>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">5. Third-Party Links</h3>
            <p>This website may contain links to third-party websites, social media platforms, or external resources. These links are provided solely for user convenience. RASA does not control and is not responsible for the content, privacy practices, security, or availability of third-party websites. Users access such websites at their own discretion and risk.</p>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">6. Partnership Enquiries</h3>
            <p>Submitting a partnership enquiry through this website does not establish a partnership, distributorship, retail agreement, or any contractual relationship with RASA. All enquiries are subject to review, evaluation, and approval. RASA reserves the right to accept or decline partnership requests at its sole discretion.</p>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">7. User Conduct</h3>
            <p className="mb-3">By using this website, you agree not to:</p>
            <ul className="space-y-1.5 pl-4 text-foreground/75 mb-3">
              {["Use the website for unlawful purposes.", "Attempt unauthorized access to any part of the website or its systems.", "Interfere with website functionality or security.", "Upload or distribute malicious software.", "Misrepresent your identity or affiliation.", "Use website content without authorization."].map(item => (
                <li key={item} className="flex items-start gap-2"><span className="text-gold mt-1.5 shrink-0">·</span>{item}</li>
              ))}
            </ul>
            <p>RASA reserves the right to restrict or terminate access where misuse is identified.</p>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">8. Limitation of Liability</h3>
            <p className="mb-3">To the fullest extent permitted by applicable law, RASA shall not be liable for any direct, indirect, incidental, consequential, or special damages arising from:</p>
            <ul className="space-y-1.5 pl-4 text-foreground/75 mb-3">
              {["Use of the website.", "Inability to access the website.", "Reliance on website content.", "Technical interruptions.", "Errors, omissions, or inaccuracies."].map(item => (
                <li key={item} className="flex items-start gap-2"><span className="text-gold mt-1.5 shrink-0">·</span>{item}</li>
              ))}
            </ul>
            <p>Users access and use this website at their own risk.</p>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">9. Privacy</h3>
            <p>Your use of this website is also governed by the RASA Privacy Policy. By using this website, you acknowledge that you have read and understood the Privacy Policy.</p>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">10. Changes to These Terms</h3>
            <p>RASA reserves the right to modify these Terms &amp; Conditions at any time. Any updates will be published on this page with a revised effective date. Continued use of the website following updates constitutes acceptance of the revised Terms &amp; Conditions.</p>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">11. Governing Law</h3>
            <p>These Terms &amp; Conditions shall be governed by and interpreted in accordance with the applicable laws of the jurisdiction in which RASA operates. Any disputes arising from the use of this website shall be subject to the jurisdiction of the competent courts in that jurisdiction.</p>
          </div>

          <div>
            <h3 className="font-serif text-base text-gold mb-3">12. Contact Us</h3>
            <div className="space-y-1 text-foreground/75">
              <p className="font-serif text-foreground">RASA</p>
              <p>Email: <a href="mailto:admin@rasatobacco.com" className="text-gold hover:underline">admin@rasatobacco.com</a></p>
              <p>Phone: +91 9090204008</p>
              <p>Address: Suite No. 312A, Suncity Trade Tower, Gurugram — 122018</p>
            </div>
          </div>

          <div className="border border-gold/20 bg-gold/5 px-5 py-4">
            <p className="text-foreground/90 font-serif italic text-sm">By accessing or using the RASA website, you acknowledge that you have read, understood, and agreed to these Terms &amp; Conditions. If you do not agree with these Terms &amp; Conditions, please discontinue use of the website.</p>
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
