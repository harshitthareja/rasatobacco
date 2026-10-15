/** The RASA Privacy Policy text, used by the /privacy-policy page. */
export function PrivacyPolicyContent() {
  return (
    <div className="text-sm text-foreground/80 leading-relaxed space-y-6">
      <p className="text-foreground/60 text-xs">Last Updated: 07 July, 2026</p>

      <p>Welcome to RASA ("RASA", "we", "our", or "us"). Your privacy is important to us. This Privacy Policy explains how we collect, use, store, and protect information when you visit our website. By using this website, you agree to the terms outlined in this Privacy Policy.</p>

      <div>
        <h2 className="font-serif text-xl text-gold mb-3">1. Information We Collect</h2>
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
        <h2 className="font-serif text-xl text-gold mb-3">2. How We Use Your Information</h2>
        <p className="mb-3">We use collected information to:</p>
        <ul className="space-y-1.5 pl-4 text-foreground/75">
          {["Respond to enquiries", "Process partnership requests", "Provide customer support", "Improve our website and services", "Maintain website security", "Communicate relevant business information when appropriate", "Comply with applicable legal requirements"].map(item => (
            <li key={item} className="flex items-start gap-2"><span className="text-gold mt-1.5 shrink-0">·</span>{item}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-serif text-xl text-gold mb-3">3. Cookies and Analytics</h2>
        <p>Our website may use cookies and similar technologies to improve user experience and understand website performance. These technologies may collect anonymous information regarding website usage, traffic patterns, and visitor interactions. Users may adjust their browser settings to refuse cookies; however, certain website features may not function properly.</p>
      </div>

      <div>
        <h2 className="font-serif text-xl text-gold mb-3">4. Information Sharing</h2>
        <p className="mb-3">We do not sell, rent, or trade personal information. Information may only be shared:</p>
        <ul className="space-y-1.5 pl-4 text-foreground/75">
          {["With trusted service providers assisting website operations.", "When required by law or regulatory authorities.", "To protect the rights, safety, or security of RASA and its users."].map(item => (
            <li key={item} className="flex items-start gap-2"><span className="text-gold mt-1.5 shrink-0">·</span>{item}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-serif text-xl text-gold mb-3">5. Data Security</h2>
        <p>We take reasonable administrative, technical, and organizational measures to protect personal information from unauthorized access, disclosure, alteration, or destruction. However, no internet transmission or storage system can be guaranteed to be completely secure.</p>
      </div>

      <div>
        <h2 className="font-serif text-xl text-gold mb-3">6. Third-Party Links</h2>
        <p>This website may contain links to third-party websites, including social media platforms. RASA is not responsible for the privacy practices or content of external websites. Users are encouraged to review the privacy policies of any third-party services they access.</p>
      </div>

      <div>
        <h2 className="font-serif text-xl text-gold mb-3">7. Age Restriction</h2>
        <p>This website is intended only for individuals who are of legal age to access tobacco-related content in their jurisdiction. We do not knowingly collect personal information from minors. If we become aware that information has been provided by a minor, we will take reasonable steps to remove such information.</p>
      </div>

      <div>
        <h2 className="font-serif text-xl text-gold mb-3">8. Your Rights</h2>
        <p className="mb-3">Subject to applicable laws, users may request:</p>
        <ul className="space-y-1.5 pl-4 text-foreground/75">
          {["Access to their personal information.", "Correction of inaccurate information.", "Deletion of personal information.", "Withdrawal of consent where applicable."].map(item => (
            <li key={item} className="flex items-start gap-2"><span className="text-gold mt-1.5 shrink-0">·</span>{item}</li>
          ))}
        </ul>
        <p className="mt-3">Requests may be submitted through the contact information provided below.</p>
      </div>

      <div>
        <h2 className="font-serif text-xl text-gold mb-3">9. Contact Us</h2>
        <p className="mb-2">For questions regarding this Privacy Policy or your personal information, please contact:</p>
        <div className="space-y-1 text-foreground/75">
          <p className="font-serif text-foreground">RASA</p>
          <p>Email: <a href="mailto:admin@rasatobacco.com" className="text-gold hover:underline">admin@rasatobacco.com</a></p>
          <p>Phone: +91 9090204008</p>
          <p>Address: Suite No. 312A, Suncity Trade Tower, Gurugram — 122018</p>
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl text-gold mb-3">10. Changes to This Policy</h2>
        <p>RASA may update this Privacy Policy from time to time. Any updates will be published on this page with a revised effective date. Continued use of the website following updates constitutes acceptance of the revised Privacy Policy.</p>
      </div>
    </div>
  );
}
