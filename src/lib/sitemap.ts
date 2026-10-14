import { CATALOG } from "@/data/catalog";
import { accessorySubcategories } from "@/data/accessories";
import { collections } from "@/data/collections";
import { productImageGalleries } from "@/data/productImages";
import { absoluteUrl } from "@/lib/seo";

type Url = {
  path: string;
  priority: number;
  changefreq: "daily" | "weekly" | "monthly";
  images?: string[];
};

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Every public, indexable page. Cart, checkout, account and login are left out. */
export function sitemapUrls(): Url[] {
  const pages: Url[] = [
    { path: "/", priority: 1, changefreq: "weekly" },
    { path: "/shop", priority: 0.9, changefreq: "daily" },
    { path: "/flavours", priority: 0.9, changefreq: "weekly" },
    { path: "/collections", priority: 0.8, changefreq: "weekly" },
    ...collections.map((c) => ({
      path: `/collections/${c.slug}`,
      priority: 0.8,
      changefreq: "weekly" as const,
    })),
    { path: "/accessories", priority: 0.7, changefreq: "weekly" },
    ...accessorySubcategories.map((s) => ({
      path: `/accessories/${s.slug}`,
      priority: 0.7,
      changefreq: "weekly" as const,
    })),
    { path: "/house-of-rasa", priority: 0.5, changefreq: "monthly" },
    { path: "/hookah", priority: 0.4, changefreq: "monthly" },
    { path: "/loyalty", priority: 0.4, changefreq: "monthly" },
    { path: "/partners", priority: 0.4, changefreq: "monthly" },
    { path: "/contact", priority: 0.4, changefreq: "monthly" },
  ];
  const products: Url[] = CATALOG.map((e) => ({
    path: `/product/${e.key}`,
    // Launched products rank above forthcoming ones.
    priority: e.flavour.available ? 0.8 : 0.4,
    changefreq: "weekly",
    images: [
      ...new Set(
        e.variantGalleries
          ? Object.values(e.variantGalleries).flat()
          : (productImageGalleries[e.key] ?? (e.image ? [e.image] : [])),
      ),
    ],
  }));
  return [...pages, ...products];
}

export function buildSitemap() {
  const entries = sitemapUrls()
    .map((u) => {
      const images = (u.images ?? [])
        .map(
          (img) =>
            `<image:image><image:loc>${escapeXml(absoluteUrl(img))}</image:loc></image:image>`,
        )
        .join("");
      return `<url><loc>${escapeXml(absoluteUrl(u.path))}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority.toFixed(1)}</priority>${images}</url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries}
</urlset>
`;
}
