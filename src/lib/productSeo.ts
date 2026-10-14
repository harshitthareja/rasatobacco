import { findCatalogEntry, CATALOG, entrySku, type CatalogEntry } from "@/data/catalog";
import { productImageGalleries } from "@/data/productImages";
import type { Collection } from "@/data/collections";
import { absoluteUrl, breadcrumbs, readableNotes, seo, SITE_URL } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";

export type ProductOffer = { low: number; high: number; inStock: boolean; offerCount: number };

/**
 * Current price range and stock for a product, for its structured data (Google
 * shows prices in results only when the page states them). Never throws — a
 * page without an offer is still valid.
 */
export async function loadProductOffer(key: string): Promise<ProductOffer | null> {
  const entry = findCatalogEntry(key);
  if (!entry || !entry.flavour.available) return null;
  try {
    const skus = entry.formats.map((f) => entrySku(entry, f));
    const { data } = await supabase
      .from("product_prices")
      .select("price_cents, sale_price_cents, sale_ends_at, is_purchasable, stock_quantity")
      .in("sku", skus);
    const now = Date.now();
    const live = (data ?? []).filter((p) => p.is_purchasable && p.price_cents != null);
    if (!live.length) return null;
    const prices = live.map((p) =>
      p.sale_price_cents != null && p.sale_ends_at && new Date(p.sale_ends_at).getTime() > now
        ? p.sale_price_cents
        : (p.price_cents as number),
    );
    return {
      low: Math.min(...prices) / 100,
      high: Math.max(...prices) / 100,
      inStock: live.some((p) => p.stock_quantity > 0),
      offerCount: live.length,
    };
  } catch {
    return null;
  }
}

const isAccessory = (e: CatalogEntry) => e.collection.slug === "accessories";

function productImages(entry: CatalogEntry) {
  const photos = entry.variantGalleries
    ? Object.values(entry.variantGalleries).flat()
    : (productImageGalleries[entry.key] ?? (entry.image ? [entry.image] : []));
  return [...new Set(photos)].map(absoluteUrl);
}

export function productHead(key: string, offer?: ProductOffer | null) {
  const entry = findCatalogEntry(key);
  if (!entry) {
    return seo({
      title: "Product not found | RASA",
      description: "This RASA product could not be found.",
      path: `/product/${key}`,
      noindex: true,
    });
  }

  const { flavour, collection } = entry;
  const notes = readableNotes(flavour.notes);
  const path = `/product/${entry.key}`;
  const accessory = isAccessory(entry);

  const title = accessory
    ? `${flavour.name} for Hookah — ${entry.formats.join(", ")} | RASA`
    : `${flavour.name} Hookah Flavour — ${collection.name} Shisha Tobacco | RASA`;
  const description = accessory
    ? `${flavour.name}: a hand-sculpted hookah mouth tip with ${notes}. Available in ${entry.formats.join(", ")}. Any 2 mouth tips for ₹150 — order online from RASA, India.`
    : `${flavour.name} is a ${collection.name} series hookah flavour by RASA with notes of ${notes}. Premium shisha tobacco — ${flavour.available ? "order online in India" : "coming soon"}.`;

  const images = productImages(entry);
  const product = {
    "@type": "Product",
    "@id": `${SITE_URL}${path}#product`,
    name: accessory ? flavour.name : `${flavour.name} Hookah Flavour`,
    description,
    image: images,
    url: absoluteUrl(path),
    sku: entrySku(entry, entry.formats[0]),
    brand: { "@type": "Brand", name: "RASA" },
    category: accessory ? "Hookah Accessories > Mouth Tips" : "Hookah Tobacco > Shisha Flavours",
    ...(offer
      ? {
          offers: {
            "@type": offer.offerCount > 1 ? "AggregateOffer" : "Offer",
            priceCurrency: "INR",
            ...(offer.offerCount > 1
              ? { lowPrice: offer.low, highPrice: offer.high, offerCount: offer.offerCount }
              : { price: offer.low }),
            availability: offer.inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            url: absoluteUrl(path),
            seller: { "@id": `${SITE_URL}/#organization` },
          },
        }
      : {}),
    ...(accessory
      ? {}
      : {
          additionalProperty: [
            { "@type": "PropertyValue", name: "Series", value: collection.name },
          ],
        }),
  };

  const trail: [string, string][] = accessory
    ? [
        ["Home", "/"],
        ["Accessories", "/accessories"],
        [entry.subcategory ?? "Accessories", `/accessories/${entry.subcategorySlug ?? ""}`],
        [flavour.name, path],
      ]
    : [
        ["Home", "/"],
        ["Hookah Flavours", "/flavours"],
        [collection.name, `/collections/${collection.slug}`],
        [flavour.name, path],
      ];

  return seo({
    title,
    description,
    path,
    image: images[0],
    type: "product",
    jsonLd: [product, breadcrumbs(trail)],
  });
}

export function collectionHead(collection: Collection) {
  const launched = collection.flavours.filter((f) => f.available).map((f) => f.name);
  const path = `/collections/${collection.slug}`;
  const items = CATALOG.filter((e) => e.collection.slug === collection.slug);
  return seo({
    title: `${collection.name} Hookah Flavours — ${collection.expression} | RASA`,
    description: `${collection.intro} Shop ${collection.name} shisha tobacco flavours online: ${launched.join(", ")}.`,
    path,
    image: collection.logo,
    jsonLd: [
      {
        "@type": "CollectionPage",
        name: `${collection.name} Hookah Flavours`,
        url: absoluteUrl(path),
        mainEntity: {
          "@type": "ItemList",
          itemListElement: items.map((e, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${e.flavour.name} Hookah Flavour`,
            url: absoluteUrl(`/product/${e.key}`),
          })),
        },
      },
      breadcrumbs([
        ["Home", "/"],
        ["Hookah Flavours", "/flavours"],
        [collection.name, path],
      ]),
    ],
  });
}

/** ItemList of every product, for the shop and flavours listings. */
export function productListJsonLd(entries: CatalogEntry[], name: string) {
  return {
    "@type": "ItemList",
    name,
    itemListElement: entries.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: isAccessory(e) ? e.flavour.name : `${e.flavour.name} Hookah Flavour`,
      url: absoluteUrl(`/product/${e.key}`),
    })),
  };
}
