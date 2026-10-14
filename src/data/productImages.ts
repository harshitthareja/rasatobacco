/**
 * Product photography slots for the shop grid.
 *
 * The primary photo is used in shop cards. Product pages use the optional
 * gallery below to offer alternate views where they are available.
 */

import { flavourKey } from "@/data/sku";
import majlisCommissionerFront from "@/assets/majlis-commissioner-front.webp";
import majlisCommissionerOpen from "@/assets/majlis-commissioner-open.webp";
import majlisCommissionerBack from "@/assets/majlis-commissioner-back.webp";
import majlisCommissionerLid from "@/assets/majlis-commissioner-lid.webp";
import majlisPaanMintCigarFront from "@/assets/majlis-paan-mint-cigar-front.webp";
import majlisPaanMintCigarOpen from "@/assets/majlis-paan-mint-cigar-open.webp";
import majlisPaanRaasFront from "@/assets/majlis-paan-raas-front.webp";
import majlisPaanRaasTextured from "@/assets/majlis-paan-raas-textured.webp";
import majlisBrainFreezerFront from "@/assets/majlis-brain-freezer-front.webp";
import majlisBrainFreezerOpen from "@/assets/majlis-brain-freezer-open.webp";
import makhmalKiwiFront from "@/assets/makhmal-kiwi-front.webp";
import makhmalKiwiOpen from "@/assets/makhmal-kiwi.webp";
import makhmalSpringWaterFront from "@/assets/makhmal-spring-water-front.webp";
import makhmalSpringWaterOpen from "@/assets/makhmal-spring-water.webp";
import makhmalGrapeFront from "@/assets/makhmal-grape-front.webp";
import makhmalGrapeOpen from "@/assets/makhmal-grape.webp";
import makhmalBack from "@/assets/makhmal-back.webp";
import tarkibDubaiSpecialFront from "@/assets/tarkib-dubai-special-front.webp";
import tarkibDubaiSpecialOpen from "@/assets/tarkib-dubai-special-open.webp";
import tarkibWhiteRoseFront from "@/assets/tarkib-white-rose-front.webp";
import tarkibWhiteRoseOpen from "@/assets/tarkib-white-rose-open.webp";
import tarkibLycheeBlissFront from "@/assets/tarkib-lychee-bliss-front.webp";
import tarkibLycheeBlissOpen from "@/assets/tarkib-lychee-bliss-open.webp";
import tarkibMarbellaFront from "@/assets/tarkib-marbella-front.webp";
import tarkibMarbellaOpen from "@/assets/tarkib-marbella-open.webp";
import tarkibLid from "@/assets/tarkib-lid.webp";
import tarkibBack from "@/assets/tarkib-back.webp";

export const productImages: Record<string, string | undefined> = {
  // Majlis
  "majlis-commissioner": majlisCommissionerFront,
  "majlis-paan-mint-cigar": majlisPaanMintCigarFront,
  "majlis-brain-freezer": majlisBrainFreezerFront,
  "majlis-paan-raas": majlisPaanRaasFront,

  // Makhmal
  "makhmal-double-apple": undefined,
  "makhmal-spring-water": makhmalSpringWaterFront,
  "makhmal-ice-mango": undefined,
  "makhmal-watermelon": undefined,
  "makhmal-kiwi": makhmalKiwiFront,
  "makhmal-mint": undefined,
  "makhmal-grape": makhmalGrapeFront,
  "makhmal-orange": undefined,
  "makhmal-blueberry": undefined,

  // Tarkib
  "tarkib-lychee-bliss": tarkibLycheeBlissFront,
  "tarkib-white-rose": tarkibWhiteRoseFront,
  "tarkib-marbella": tarkibMarbellaFront,
  "tarkib-iconic": undefined,
  "tarkib-dubai-special": tarkibDubaiSpecialFront,
};

// The Majlis back label and the RASA lid carry no flavour name, so every
// Majlis flavour shares them (as Tarkib and Makhmal share their own backs).
// Makhmal tubs use the same RASA lid.
const majlisBack = majlisCommissionerBack;
const rasaLid = majlisCommissionerLid;

// Gallery order for every flavour: front, back, textured (open tub), top (lid).
export const productImageGalleries: Record<string, string[]> = {
  "majlis-commissioner": [majlisCommissionerFront, majlisBack, majlisCommissionerOpen, rasaLid],
  "majlis-paan-mint-cigar": [
    majlisPaanMintCigarFront,
    majlisBack,
    majlisPaanMintCigarOpen,
    rasaLid,
  ],
  "majlis-paan-raas": [majlisPaanRaasFront, majlisBack, majlisPaanRaasTextured, rasaLid],
  "majlis-brain-freezer": [majlisBrainFreezerFront, majlisBack, majlisBrainFreezerOpen, rasaLid],
  "makhmal-kiwi": [makhmalKiwiFront, makhmalBack, makhmalKiwiOpen, rasaLid],
  "makhmal-spring-water": [makhmalSpringWaterFront, makhmalBack, makhmalSpringWaterOpen, rasaLid],
  "makhmal-grape": [makhmalGrapeFront, makhmalBack, makhmalGrapeOpen, rasaLid],
  "tarkib-lychee-bliss": [tarkibLycheeBlissFront, tarkibBack, tarkibLycheeBlissOpen, tarkibLid],
  "tarkib-white-rose": [tarkibWhiteRoseFront, tarkibBack, tarkibWhiteRoseOpen, tarkibLid],
  "tarkib-marbella": [tarkibMarbellaFront, tarkibBack, tarkibMarbellaOpen, tarkibLid],
  "tarkib-dubai-special": [tarkibDubaiSpecialFront, tarkibBack, tarkibDubaiSpecialOpen, tarkibLid],
};

export const productImageKey = flavourKey;
