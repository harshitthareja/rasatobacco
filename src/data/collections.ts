import majlisLogo from "@/assets/majlis-logo.png";
import makhmalLogo from "@/assets/makhmal-logo.png";
import tarkibLogo from "@/assets/tarkib-logo.png";

export type Flavour = { name: string; notes: string; available: boolean };

export type Collection = {
  slug: "majlis" | "makhmal" | "tarkib";
  path: "/collections/majlis" | "/collections/makhmal" | "/collections/tarkib";
  name: string;
  label: string;
  expression: string;
  tagline: string;
  intro: string;
  signature: string[];
  philosophy: string;
  featured: Flavour[];
  flavours: Flavour[];
  closing: string;
  bgVar: string;
  accentVar: string;
  pattern: string;
  logo: string;
};

export const formats = ["20g", "60g", "250g", "500g", "1kg"];

export const collections: Collection[] = [
  {
    slug: "majlis",
    path: "/collections/majlis",
    name: "Majlis",
    label: "Series I",
    expression: "The Expression of Heritage",
    tagline: "Tradition Lives On.",
    intro:
      "Majlis is a tribute to gathering. Rooted in heritage, warmed by hospitality, it carries the timeless character of an evening spent in good company.",
    signature: ["Heritage Profile", "Warm & Aromatic", "Crafted for Conviviality"],
    philosophy:
      "Some rituals never need reinvention. Majlis preserves them with the discipline of a house that respects its origins.",
    featured: [
      {
        name: "Commissioner",
        notes: "Dark Berries · Exotic Fruits · Arabian Spice",
        available: true,
      },
      {
        name: "Paan Mint Cigar",
        notes: "Royal Paan · Fresh Mint · Aged Cigar Leaf",
        available: true,
      },
      { name: "Paan Raas", notes: "Royal Paan · Gulkand · Sweet Supari", available: true },
    ],
    flavours: [
      {
        name: "Commissioner",
        notes: "Dark Berries · Exotic Fruits · Arabian Spice",
        available: true,
      },
      {
        name: "Paan Mint Cigar",
        notes: "Royal Paan · Fresh Mint · Aged Cigar Leaf",
        available: true,
      },
      {
        name: "Brain Freezer",
        notes: "Arctic Mint · Icy Menthol · Frosted Finish",
        available: false,
      },
      { name: "Paan Raas", notes: "Royal Paan · Gulkand · Sweet Supari", available: true },
    ],
    closing: "Tradition Lives On.",
    bgVar: "var(--majlis)",
    accentVar: "var(--majlis-accent)",
    pattern: "pattern-arabesque",
    logo: majlisLogo,
  },
  {
    slug: "makhmal",
    path: "/collections/makhmal",
    name: "Makhmal",
    label: "Series II",
    expression: "The Expression of Refinement",
    tagline: "Refinement Endures.",
    intro:
      "Makhmal is velvet made vapour. Quiet, composed, and effortlessly elegant — it is luxury without volume, refinement without effort.",
    signature: ["Velvet Profile", "Soft & Composed", "Crafted for Stillness"],
    philosophy:
      "True luxury requires no attention. It is found in balance, in comfort, in the confidence of simplicity executed well.",
    featured: [
      {
        name: "Spring Water",
        notes: "Crisp Mint · Cool Eucalyptus · Fresh Breeze",
        available: true,
      },
      { name: "Kiwi", notes: "Fresh Kiwi · Tropical Zest · Tangy Sweetness", available: true },
      { name: "Grape", notes: "Dark Grapes · Vineyard Sweetness · Juicy Finish", available: true },
    ],
    flavours: [
      { name: "Double Apple", notes: "Red Apple · Green Apple · Anise Spice", available: false },
      {
        name: "Spring Water",
        notes: "Crisp Mint · Cool Eucalyptus · Fresh Breeze",
        available: true,
      },
      { name: "Ice Mango", notes: "Golden Mango · Tropical Nectar · Icy Finish", available: false },
      {
        name: "Watermelon",
        notes: "Juicy Watermelon · Summer Melon · Crisp Finish",
        available: false,
      },
      { name: "Kiwi", notes: "Fresh Kiwi · Tropical Zest · Tangy Sweetness", available: true },
      { name: "Mint", notes: "Fresh Mint · Cooling Menthol · Crisp Finish", available: false },
      { name: "Grape", notes: "Dark Grapes · Vineyard Sweetness · Juicy Finish", available: true },
      {
        name: "Orange",
        notes: "Sun-Ripened Orange · Citrus Zest · Juicy Sweetness",
        available: false,
      },
      {
        name: "Blueberry",
        notes: "Wild Blueberry · Berry Nectar · Velvet Sweetness",
        available: false,
      },
    ],
    closing: "Refinement Endures.",
    bgVar: "var(--makhmal)",
    accentVar: "var(--makhmal-accent)",
    pattern: "pattern-velvet",
    logo: makhmalLogo,
  },
  {
    slug: "tarkib",
    path: "/collections/tarkib",
    name: "Tarkib",
    label: "Series III",
    expression: "The Expression of Innovation",
    tagline: "Discovery Never Ends.",
    intro:
      "Tarkib is curiosity bottled. Bold, modern, and progressive — it is the House of RASA looking forward, composing flavours the way a bartender composes a cocktail.",
    signature: ["Modern Profile", "Bold & Layered", "Crafted for Discovery"],
    philosophy:
      "Innovation begins with the willingness to question what exists. Tarkib is the proof that tradition and progress are not opposites.",
    featured: [
      {
        name: "Lychee Bliss",
        notes: "Exotic Lychee · White Blossom · Citrus Spark",
        available: true,
      },
      { name: "White Rose", notes: "White Rose · Velvet Petals · Soft Sweetness", available: true },
      { name: "Marbella", notes: "Blood Orange · Dark Grapes · Herbal Finish", available: true },
      {
        name: "Dubai Special",
        notes: "Arabian Fruits · Golden Dates · Oriental Spice",
        available: true,
      },
    ],
    flavours: [
      {
        name: "Lychee Bliss",
        notes: "Exotic Lychee · White Blossom · Citrus Spark",
        available: true,
      },
      { name: "White Rose", notes: "White Rose · Velvet Petals · Soft Sweetness", available: true },
      { name: "Marbella", notes: "Blood Orange · Dark Grapes · Herbal Finish", available: true },
      { name: "Iconic", notes: "Exotic Fruits · Citrus Zest · Velvet Sweetness", available: false },
      {
        name: "Dubai Special",
        notes: "Arabian Fruits · Golden Dates · Oriental Spice",
        available: true,
      },
    ],
    closing: "Discovery Never Ends.",
    bgVar: "var(--tarkib)",
    accentVar: "var(--tarkib-accent)",
    pattern: "pattern-geometric",
    logo: tarkibLogo,
  },
];

export const getCollection = (slug: string) => collections.find((c) => c.slug === slug);
