import { createFileRoute, Link } from "@tanstack/react-router";
import { PrivacyPolicyContent } from "@/components/legal/PrivacyPolicyContent";
import { breadcrumbs, seo } from "@/lib/seo";

export const Route = createFileRoute("/privacy-policy")({
  head: () =>
    seo({
      title: "Privacy Policy | RASA",
      description:
        "How RASA collects, uses, stores and protects your information when you use rasatobacco.com, and how to contact us about your personal data.",
      path: "/privacy-policy",
      jsonLd: [
        breadcrumbs([
          ["Home", "/"],
          ["Privacy Policy", "/privacy-policy"],
        ]),
      ],
    }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <main className="bg-ink text-foreground min-h-screen pt-32 pb-24">
      <article className="mx-auto max-w-3xl px-6">
        <nav className="text-[0.6rem] tracking-luxe uppercase text-foreground/45 mb-8 flex items-center gap-2">
          <Link to="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground/70">Privacy Policy</span>
        </nav>
        <p className="text-[0.6rem] tracking-luxe uppercase text-gold mb-3">Legal</p>
        <h1 className="font-serif text-4xl md:text-5xl mb-10">Privacy Policy</h1>
        <PrivacyPolicyContent />
      </article>
    </main>
  );
}
