import { collections, formats, type Collection, type Flavour } from "@/data/collections";
import { flavourKey, productSku } from "@/data/sku";
import { productImages } from "@/data/productImages";

export type CatalogEntry = {
  collection: Collection;
  flavour: Flavour;
  key: string;
  image: string | undefined;
};

export const CATALOG: CatalogEntry[] = collections.flatMap((collection) =>
  collection.flavours.map((flavour) => {
    const key = flavourKey(collection.slug, flavour.name);
    return { collection, flavour, key, image: productImages[key] };
  }),
);

export function findCatalogEntry(key: string) {
  return CATALOG.find((e) => e.key === key);
}

/** Resolve a SKU (flavour key + pack size) back to its catalog entry + format. */
export function parseSku(sku: string): { entry: CatalogEntry; format: string } | undefined {
  for (const format of formats) {
    const suffix = `-${format.toLowerCase()}`;
    if (sku.endsWith(suffix)) {
      const entry = findCatalogEntry(sku.slice(0, -suffix.length));
      if (entry) return { entry, format };
    }
  }
  return undefined;
}

export { formats, productSku, flavourKey };
