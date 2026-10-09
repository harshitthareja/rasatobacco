import { collections, formats, type Collection, type Flavour } from "@/data/collections";
import { accessories, accessorySubcategories } from "@/data/accessories";
import { flavourKey, productSku } from "@/data/sku";
import { productImages } from "@/data/productImages";

/** What a shop entry belongs to: a flavour series, or the accessories atelier. */
export type CatalogGroup = Pick<Collection, "name" | "label" | "bgVar" | "accentVar"> & {
  slug: Collection["slug"] | "accessories";
};

export type CatalogEntry = {
  collection: CatalogGroup;
  flavour: Flavour;
  key: string;
  image: string | undefined;
  /** Purchasable variants — pack sizes for flavours, finishes for accessories. */
  formats: string[];
  formatLabel: string;
  /** Accessory sub-category (e.g. "Mouth Tips"); undefined for flavours. */
  subcategory?: string;
  subcategorySlug?: string;
  /** Photos per variant, when a variant changes how the product looks. */
  variantGalleries?: Record<string, string[]>;
};

export const accessoriesGroup: CatalogGroup = {
  slug: "accessories",
  name: "Accessories",
  label: "The Atelier",
  bgVar: "var(--surface)",
  accentVar: "var(--gold)",
};

export function flavourEntry(collection: Collection, flavour: Flavour): CatalogEntry {
  const key = flavourKey(collection.slug, flavour.name);
  return {
    collection,
    flavour,
    key,
    image: productImages[key],
    formats,
    formatLabel: "Pack Size",
  };
}

export const ACCESSORY_CATALOG: CatalogEntry[] = accessories.map((a) => ({
  collection: accessoriesGroup,
  flavour: { name: a.name, notes: a.notes, available: a.available },
  key: flavourKey(accessoriesGroup.slug, a.name),
  image: a.gallery[a.variants[0]]?.[0],
  formats: a.variants,
  formatLabel: a.variantLabel,
  subcategory: accessorySubcategories.find((s) => s.slug === a.subcategory)?.name,
  subcategorySlug: a.subcategory,
  variantGalleries: a.gallery,
}));

export const CATALOG: CatalogEntry[] = [
  ...collections.flatMap((collection) =>
    collection.flavours.map((flavour) => flavourEntry(collection, flavour)),
  ),
  ...ACCESSORY_CATALOG,
];

export function findCatalogEntry(key: string) {
  return CATALOG.find((e) => e.key === key);
}

export function entrySku(entry: CatalogEntry, format: string) {
  return productSku(entry.collection.slug, entry.flavour.name, format);
}

/** Resolve a SKU (product key + variant) back to its catalog entry + variant. */
export function parseSku(sku: string): { entry: CatalogEntry; format: string } | undefined {
  for (const entry of CATALOG) {
    const format = entry.formats.find((f) => entrySku(entry, f) === sku);
    if (format) return { entry, format };
  }
  return undefined;
}

export { formats, productSku, flavourKey };
