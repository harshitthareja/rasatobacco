/**
 * Page metadata for search engines and link previews.
 *
 * Every indexable route builds its <head> through `seo()` so it always has a
 * keyword-bearing title and description, a canonical URL on the www domain,
 * and absolute Open Graph / Twitter image URLs (relative ones break previews).
 */

import heroHookah from "@/assets/hero-hookah.jpg";
import { contactInfo } from "@/data/contact";

export const SITE_URL = "https://www.rasatobacco.com";
export const SITE_NAME = "RASA";

export const absoluteUrl = (pathOrUrl: string) =>
  /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${SITE_URL}${pathOrUrl}`;

type SeoInput = {
  title: string;
  description: string;
  /** Path of this page, e.g. "/shop". Used for the canonical URL. */
  path: string;
  image?: string;
  type?: "website" | "product" | "article";
  /** Keep the page out of search results (cart, checkout, account…). */
  noindex?: boolean;
  /** JSON-LD objects describing the page (products, breadcrumbs…). */
  jsonLd?: object[];
};

export function seo({
  title,
  description,
  path,
  image = heroHookah,
  type = "website",
  noindex = false,
  jsonLd = [],
}: SeoInput) {
  const url = absoluteUrl(path);
  const img = absoluteUrl(image);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: noindex ? "noindex, nofollow" : "index, follow" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: type },
      { property: "og:image", content: img },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: img },
    ],
    links: noindex ? [] : [{ rel: "canonical", href: url }],
    scripts: jsonLd.map((data) => ({
      type: "application/ld+json",
      children: JSON.stringify({ "@context": "https://schema.org", ...data }),
    })),
  };
}

/** Breadcrumb trail for rich results, from [name, path] pairs. */
export function breadcrumbs(trail: [string, string][]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: absoluteUrl(path),
    })),
  };
}

/** Site-wide identity: who RASA is and how to search the site. */
export const organizationJsonLd = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "RASA",
  alternateName: ["House of RASA", "RASA Tobacco"],
  url: SITE_URL,
  logo: `${SITE_URL}/rasa-logo.png`,
  slogan: "Smoke, Perfected.",
  description:
    "RASA is an Indian house of premium hookah flavours and shisha tobacco — the Majlis, Makhmal and Tarkib series — plus hand-sculpted hookah mouth tips.",
  legalName: contactInfo.address.company,
  email: contactInfo.email,
  telephone: contactInfo.phoneRaw,
  sameAs: [`https://www.instagram.com/${contactInfo.instagramHandle}`],
  address: {
    "@type": "PostalAddress",
    streetAddress: `${contactInfo.address.line1}, ${contactInfo.address.line2}`,
    addressLocality: "Gurugram",
    addressRegion: "Haryana",
    postalCode: "122016",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: contactInfo.phoneRaw,
    email: contactInfo.email,
    contactType: "sales",
    areaServed: "IN",
    availableLanguage: ["en", "hi"],
  },
};

export const websiteJsonLd = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "RASA",
  url: SITE_URL,
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: "en-IN",
};

/** "Dark Berries · Exotic Fruits · Arabian Spice" → "dark berries, exotic fruits and Arabian spice" */
export function readableNotes(notes: string) {
  const parts = notes.split(" · ").map((p, i) =>
    // Keep proper nouns (Arabian, Royal…) capitalised after the first word.
    p
      .split(" ")
      .map((w, j) =>
        (i === 0 && j === 0) || !/^(Arabian|Dubai|Royal)$/.test(w) ? w.toLowerCase() : w,
      )
      .join(" "),
  );
  return parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}` : parts[0];
}
