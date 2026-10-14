import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        in: () =>
          Promise.resolve({
            data: [
              {
                price_cents: 8500,
                sale_price_cents: null,
                sale_ends_at: null,
                is_purchasable: true,
                stock_quantity: 100,
              },
              {
                price_cents: 8500,
                sale_price_cents: null,
                sale_ends_at: null,
                is_purchasable: true,
                stock_quantity: 0,
              },
              {
                price_cents: null,
                sale_price_cents: null,
                sale_ends_at: null,
                is_purchasable: false,
                stock_quantity: 0,
              },
            ],
          }),
      }),
    }),
  },
}));

import { CATALOG } from "@/data/catalog";
import { readableNotes, seo, SITE_URL } from "@/lib/seo";
import { loadProductOffer, productHead } from "@/lib/productSeo";
import { buildSitemap, sitemapUrls } from "@/lib/sitemap";

const meta = (head: ReturnType<typeof seo>, key: string) =>
  head.meta.find(
    (m) => ("name" in m && m.name === key) || ("property" in m && m.property === key),
  ) as { content: string } | undefined;
const jsonLd = (head: ReturnType<typeof seo>) =>
  head.scripts.map((s) => JSON.parse(s.children) as Record<string, unknown>);

describe("seo()", () => {
  it("sets an absolute canonical URL and image on the www domain", () => {
    const head = seo({ title: "T", description: "D", path: "/shop", image: "/assets/x.webp" });
    expect(head.links).toEqual([{ rel: "canonical", href: `${SITE_URL}/shop` }]);
    expect(meta(head, "og:image")?.content).toBe(`${SITE_URL}/assets/x.webp`);
    expect(meta(head, "robots")?.content).toBe("index, follow");
  });

  it("keeps private pages out of search with no canonical", () => {
    const head = seo({ title: "Cart", description: "D", path: "/cart", noindex: true });
    expect(meta(head, "robots")?.content).toBe("noindex, nofollow");
    expect(head.links).toEqual([]);
  });
});

describe("readableNotes", () => {
  it("turns tasting notes into a sentence fragment", () => {
    expect(readableNotes("Dark Berries · Exotic Fruits · Arabian Spice")).toBe(
      "dark berries, exotic fruits and Arabian spice",
    );
  });
});

describe("product pages", () => {
  it("give every product a keyword title and description", () => {
    for (const entry of CATALOG) {
      const head = productHead(entry.key);
      const title = head.meta.find((m) => "title" in m) as { title: string };
      const description = meta(head, "description")!.content;
      expect(title.title, entry.key).toMatch(/Hookah/);
      expect(title.title.length, entry.key).toBeLessThanOrEqual(80);
      expect(description, entry.key).toContain(entry.flavour.name);
    }
  });

  it("describe each product as a schema.org Product with breadcrumbs", () => {
    const [product, crumbs] = jsonLd(productHead("majlis-commissioner"));
    expect(product["@type"]).toBe("Product");
    expect(product.brand).toEqual({ "@type": "Brand", name: "RASA" });
    expect((product.image as string[]).length).toBe(4);
    expect(product.offers).toBeUndefined();
    expect(crumbs["@type"]).toBe("BreadcrumbList");
  });

  it("include the live price range and stock when it is known", async () => {
    const offer = await loadProductOffer("accessories-lion-mouth-tip");
    expect(offer).toEqual({ low: 85, high: 85, inStock: true, offerCount: 2 });
    const [product] = jsonLd(productHead("accessories-lion-mouth-tip", offer));
    expect(product.offers).toMatchObject({
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: 85,
      availability: "https://schema.org/InStock",
    });
  });

  it("mark unknown products noindex", () => {
    expect(meta(productHead("nope"), "robots")?.content).toBe("noindex, nofollow");
  });
});

describe("sitemap", () => {
  it("lists every product and the main pages, and no private pages", () => {
    const paths = sitemapUrls().map((u) => u.path);
    for (const entry of CATALOG) expect(paths).toContain(`/product/${entry.key}`);
    for (const p of ["/", "/shop", "/flavours", "/accessories/mouth-tips"])
      expect(paths).toContain(p);
    for (const p of ["/cart", "/checkout", "/login"]) expect(paths).not.toContain(p);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("is well-formed XML with absolute URLs", () => {
    const xml = buildSitemap();
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBe(sitemapUrls().length);
    expect(locs.every((l) => l.startsWith(`${SITE_URL}/`))).toBe(true);
  });
});
