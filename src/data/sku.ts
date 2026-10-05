export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Stable per-flavour key, independent of pack size. Used for image slots. */
export function flavourKey(collectionSlug: string, flavourName: string) {
  return `${collectionSlug}-${slugify(flavourName)}`;
}

/** Stable per-SKU key (flavour + pack size). Used for pricing, stock, cart and orders. */
export function productSku(collectionSlug: string, flavourName: string, format: string) {
  return `${flavourKey(collectionSlug, flavourName)}-${format.toLowerCase()}`;
}
