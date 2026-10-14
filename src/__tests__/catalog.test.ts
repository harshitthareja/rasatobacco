import { describe, it, expect } from "vitest";
import { ACCESSORY_CATALOG, CATALOG, entrySku, parseSku } from "@/data/catalog";
import { productImageGalleries } from "@/data/productImages";
import { isMouthTipSku } from "@/lib/offers";

describe("catalog", () => {
  it("gives every product a unique key", () => {
    const keys = CATALOG.map((e) => e.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("maps every SKU back to its product and variant", () => {
    for (const entry of CATALOG) {
      for (const format of entry.formats) {
        const sku = entrySku(entry, format);
        expect(sku).toMatch(/^[a-z0-9-]+$/);
        expect(parseSku(sku)).toEqual({ entry, format });
      }
    }
  });

  it("treats every accessory SKU as a mouth tip for the pair offer", () => {
    for (const entry of ACCESSORY_CATALOG) {
      for (const format of entry.formats) {
        expect(isMouthTipSku(entrySku(entry, format))).toBe(true);
      }
    }
  });

  it("never treats a flavour SKU as a mouth tip", () => {
    for (const entry of CATALOG.filter((e) => e.collection.slug !== "accessories")) {
      expect(isMouthTipSku(entrySku(entry, entry.formats[0]))).toBe(false);
    }
  });

  it("shows front, back, textured and top photos for every launched flavour", () => {
    const launched = CATALOG.filter(
      (e) => e.collection.slug !== "accessories" && e.flavour.available,
    );
    expect(launched.length).toBeGreaterThan(0);
    for (const entry of launched) {
      const gallery = productImageGalleries[entry.key] ?? [];
      expect(gallery, entry.key).toHaveLength(4);
      expect(new Set(gallery).size, `${entry.key} repeats a photo`).toBe(4);
    }
  });

  it("has photos for every accessory finish", () => {
    for (const entry of ACCESSORY_CATALOG) {
      expect(entry.image).toBeTruthy();
      for (const format of entry.formats) {
        expect(entry.variantGalleries?.[format]?.length, `${entry.key} ${format}`).toBeGreaterThan(
          0,
        );
      }
    }
  });
});
