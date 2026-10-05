/**
 * Product photography slots for the shop grid.
 *
 * The primary photo is used in shop cards. Product pages use the optional
 * gallery below to offer alternate views where they are available.
 */

import { flavourKey } from "@/data/sku";
import majlisCommissionerFront from "@/assets/majlis-commissioner-front.png";
import majlisCommissionerOpen from "@/assets/majlis-commissioner-open.png";
import majlisCommissionerBack from "@/assets/majlis-commissioner-back.png";
import majlisCommissionerLid from "@/assets/majlis-commissioner-lid.png";
import majlisPaanMintCigarFront from "@/assets/majlis-paan-mint-cigar-front.png";
import majlisPaanMintCigarOpen from "@/assets/majlis-paan-mint-cigar-open.png";
import majlisPaanRaasFront from "@/assets/majlis-paan-raas-front.png";
import majlisPaanRaasOpen from "@/assets/majlis-paan-raas-open.png";
import majlisBrainFreezerFront from "@/assets/majlis-brain-freezer-front.png";
import majlisBrainFreezerOpen from "@/assets/majlis-brain-freezer-open.png";
import makhmalKiwiFront from "@/assets/makhmal-kiwi-front.png";
import makhmalSpringWaterFront from "@/assets/makhmal-spring-water-front.png";
import makhmalGrapeFront from "@/assets/makhmal-grape-front.png";
import tarkibDubaiSpecialFront from "@/assets/tarkib-dubai-special-front.png";
import tarkibDubaiSpecialOpen from "@/assets/tarkib-dubai-special-open.png";
import tarkibWhiteRoseFront from "@/assets/tarkib-white-rose-front.png";
import tarkibWhiteRoseOpen from "@/assets/tarkib-white-rose-open.png";
import tarkibLycheeBlissFront from "@/assets/tarkib-lychee-bliss-front.png";
import tarkibLycheeBlissOpen from "@/assets/tarkib-lychee-bliss-open.png";
import tarkibMarbellaFront from "@/assets/tarkib-marbella-front.png";
import tarkibMarbellaOpen from "@/assets/tarkib-marbella-open.png";
import tarkibLid from "@/assets/tarkib-lid.png";
import tarkibBack from "@/assets/tarkib-back.png";

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

export const productImageGalleries: Record<string, string[]> = {
  "majlis-commissioner": [
    majlisCommissionerFront,
    majlisCommissionerOpen,
    majlisCommissionerBack,
    majlisCommissionerLid,
  ],
  "majlis-paan-mint-cigar": [majlisPaanMintCigarFront, majlisPaanMintCigarOpen],
  "majlis-paan-raas": [majlisPaanRaasFront, majlisPaanRaasOpen],
  "majlis-brain-freezer": [majlisBrainFreezerFront, majlisBrainFreezerOpen],
  "makhmal-kiwi": [makhmalKiwiFront],
  "makhmal-spring-water": [makhmalSpringWaterFront],
  "makhmal-grape": [makhmalGrapeFront],
  "tarkib-lychee-bliss": [
    tarkibLycheeBlissFront,
    tarkibLycheeBlissOpen,
    tarkibBack,
    tarkibLid,
  ],
  "tarkib-white-rose": [tarkibWhiteRoseFront, tarkibWhiteRoseOpen, tarkibBack, tarkibLid],
  "tarkib-marbella": [tarkibMarbellaFront, tarkibMarbellaOpen, tarkibBack, tarkibLid],
  "tarkib-dubai-special": [
    tarkibDubaiSpecialFront,
    tarkibDubaiSpecialOpen,
    tarkibBack,
    tarkibLid,
  ],
};

export const productImageKey = flavourKey;
