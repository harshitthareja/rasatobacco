/**
 * Accessories sold alongside the flavours. Each product's `variants` play the
 * role a pack size plays for a flavour: one SKU per variant, priced and
 * stocked separately in Admin → Products & Stock.
 */

import lionBlackFront from "@/assets/mouthtip-lion-black-front.webp";
import lionBlackSide from "@/assets/mouthtip-lion-black-side.webp";
import lionBlackMane from "@/assets/mouthtip-lion-black-mane.webp";
import lionBlackPack from "@/assets/mouthtip-lion-black-pack.webp";
import lionWhiteFront from "@/assets/mouthtip-lion-white-front.webp";
import lionWhiteSide from "@/assets/mouthtip-lion-white-side.webp";
import lionWhiteMane from "@/assets/mouthtip-lion-white-mane.webp";
import lionWhitePack from "@/assets/mouthtip-lion-white-pack.webp";
import lionGlowFront from "@/assets/mouthtip-lion-glow-front.webp";
import lionGlowSide from "@/assets/mouthtip-lion-glow-side.webp";
import lionGlowMane from "@/assets/mouthtip-lion-glow-mane.webp";
import charlieFront from "@/assets/mouthtip-charlie-front.webp";
import charlieSide from "@/assets/mouthtip-charlie-side.webp";
import charlieBack from "@/assets/mouthtip-charlie-back.webp";
import charliePack from "@/assets/mouthtip-charlie-pack.webp";
import charlieGlowFront from "@/assets/mouthtip-charlie-glow-front.webp";
import charlieGlowSide from "@/assets/mouthtip-charlie-glow-side.webp";
import charlieGlowBack from "@/assets/mouthtip-charlie-glow-back.webp";

export type AccessorySubcategory = { slug: string; name: string; tagline: string };

export type Accessory = {
  name: string;
  notes: string;
  available: boolean;
  subcategory: AccessorySubcategory["slug"];
  /** Variant names; each becomes a SKU suffix (e.g. "Black" → "-black"). */
  variants: string[];
  variantLabel: string;
  /** Photos per variant; the first is the primary shop image. */
  gallery: Record<string, string[]>;
};

export const accessorySubcategories: AccessorySubcategory[] = [
  {
    slug: "mouth-tips",
    name: "Mouth Tips",
    tagline: "A personal tip, sculpted to be held.",
  },
];

export const accessories: Accessory[] = [
  {
    name: "Lion Mouth Tip",
    notes: "Hand-finished lion head · Sculpted mane grip · Ribbed hose fit",
    available: true,
    subcategory: "mouth-tips",
    variants: ["Black", "White", "Glow in the Dark"],
    variantLabel: "Finish",
    gallery: {
      Black: [lionBlackFront, lionBlackSide, lionBlackMane, lionBlackPack],
      White: [lionWhiteFront, lionWhiteSide, lionWhiteMane, lionWhitePack],
      "Glow in the Dark": [lionGlowFront, lionGlowSide, lionGlowMane, lionWhitePack],
    },
  },
  {
    name: "Charlie Mouth Tip",
    notes: "Top-hatted gentleman · Hand-detailed portrait · Tailored coat grip",
    available: true,
    subcategory: "mouth-tips",
    variants: ["Ivory", "Glow in the Dark"],
    variantLabel: "Finish",
    gallery: {
      Ivory: [charlieFront, charlieSide, charlieBack, charliePack],
      "Glow in the Dark": [charlieGlowFront, charlieGlowSide, charlieGlowBack, charliePack],
    },
  },
];
