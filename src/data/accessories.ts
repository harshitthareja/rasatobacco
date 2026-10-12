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
import lionGreyFront from "@/assets/mouthtip-lion-grey-front.webp";
import lionGreySide from "@/assets/mouthtip-lion-grey-side.webp";
import lionGreyMane from "@/assets/mouthtip-lion-grey-mane.webp";
import lionGreyPack from "@/assets/mouthtip-lion-grey-pack.webp";
import charlieWhiteFront from "@/assets/mouthtip-charlie-white-front.webp";
import charlieWhiteSide from "@/assets/mouthtip-charlie-white-side.webp";
import charlieWhiteBack from "@/assets/mouthtip-charlie-white-back.webp";
import charlieWhitePack from "@/assets/mouthtip-charlie-white-pack.webp";
import charlieGlowFront from "@/assets/mouthtip-charlie-glow-front.webp";
import charlieGlowSide from "@/assets/mouthtip-charlie-glow-side.webp";
import charlieGlowBack from "@/assets/mouthtip-charlie-glow-back.webp";
import charlieBlackFront from "@/assets/mouthtip-charlie-black-front.webp";
import charlieBlackSide from "@/assets/mouthtip-charlie-black-side.webp";
import charlieBlackBack from "@/assets/mouthtip-charlie-black-back.webp";
import charlieBlackPack from "@/assets/mouthtip-charlie-black-pack.webp";
import charlieGreyFront from "@/assets/mouthtip-charlie-grey-front.webp";
import charlieGreySide from "@/assets/mouthtip-charlie-grey-side.webp";
import charlieGreyBack from "@/assets/mouthtip-charlie-grey-back.webp";
import charlieGreyPack from "@/assets/mouthtip-charlie-grey-pack.webp";
import jokerBlackFront from "@/assets/mouthtip-joker-black-front.webp";
import jokerBlackBack from "@/assets/mouthtip-joker-black-back.webp";
import jokerGreyFront from "@/assets/mouthtip-joker-grey-front.webp";
import jokerGreyBack from "@/assets/mouthtip-joker-grey-back.webp";
import jokerWhiteFront from "@/assets/mouthtip-joker-white-front.webp";
import jokerWhiteBack from "@/assets/mouthtip-joker-white-back.webp";

export type AccessorySubcategory = {
  slug: string;
  name: string;
  tagline: string;
  /** Tile photo on the Accessories page. */
  image?: string;
};

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
    image: lionWhiteFront,
  },
];

export const accessories: Accessory[] = [
  {
    name: "Lion Mouth Tip",
    notes: "Hand-finished lion head · Sculpted mane grip · Ribbed hose fit",
    available: true,
    subcategory: "mouth-tips",
    variants: ["Black", "White", "Grey", "Glow in the Dark"],
    variantLabel: "Finish",
    gallery: {
      Black: [lionBlackFront, lionBlackSide, lionBlackMane, lionBlackPack],
      White: [lionWhiteFront, lionWhiteSide, lionWhiteMane, lionWhitePack],
      Grey: [lionGreyFront, lionGreySide, lionGreyMane, lionGreyPack],
      "Glow in the Dark": [lionGlowFront, lionGlowSide, lionGlowMane, lionWhitePack],
    },
  },
  {
    name: "Charlie Mouth Tip",
    notes: "Top-hatted gentleman · Hand-detailed portrait · Tailored coat grip",
    available: true,
    subcategory: "mouth-tips",
    variants: ["White", "Black", "Grey", "Glow in the Dark"],
    variantLabel: "Finish",
    gallery: {
      White: [charlieWhiteFront, charlieWhiteSide, charlieWhiteBack, charlieWhitePack],
      Black: [charlieBlackFront, charlieBlackSide, charlieBlackBack, charlieBlackPack],
      Grey: [charlieGreyFront, charlieGreySide, charlieGreyBack, charlieGreyPack],
      "Glow in the Dark": [charlieGlowFront, charlieGlowSide, charlieGlowBack, charlieWhitePack],
    },
  },
  {
    name: "Joker Mouth Tip",
    notes: "Grinning portrait · Hand-carved scrollwork back · Ribbed hose fit",
    available: true,
    subcategory: "mouth-tips",
    variants: ["Black", "Grey", "White", "Glow in the Dark"],
    variantLabel: "Finish",
    gallery: {
      Black: [jokerBlackFront, jokerBlackBack],
      Grey: [jokerGreyFront, jokerGreyBack],
      White: [jokerWhiteFront, jokerWhiteBack],
      // No glow-in-the-dark photos yet; shows the white tip until they arrive.
      "Glow in the Dark": [jokerWhiteFront, jokerWhiteBack],
    },
  },
];
