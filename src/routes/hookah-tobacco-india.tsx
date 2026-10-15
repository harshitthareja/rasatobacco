import { createFileRoute, Link } from "@tanstack/react-router";
import { CATALOG, entrySku } from "@/data/catalog";
import { contactInfo } from "@/data/contact";
import { useProductPrices } from "@/hooks/useProductPrices";
import { ProductCard } from "@/components/shop/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/money";
import { breadcrumbs, seo, SITE_URL } from "@/lib/seo";
import { productListJsonLd } from "@/lib/productSeo";

const PATH = "/hookah-tobacco-india";

// Launched products only — the page is about what can be ordered today.
const flavours = CATALOG.filter((e) => e.collection.slug !== "accessories" && e.flavour.available);
const mouthTips = CATALOG.filter((e) => e.collection.slug === "accessories" && e.flavour.available);

const CITIES = [
  "Gurugram",
  "Delhi",
  "Noida",
  "Faridabad",
  "Mumbai",
  "Bengaluru",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Chandigarh",
  "Lucknow",
  "Goa",
];

type Facts = {
  /** Lowest current price of a launched flavour pack, in paise. */
  flavourFrom: number | null;
  deliveryFee: number | null;
  freeDeliveryAbove: number | null;
};

/** Live prices and delivery terms for the copy and FAQ; never throws. */
async function loadFacts(): Promise<Facts> {
  try {
    const skus = flavours.flatMap((e) => e.formats.map((f) => entrySku(e, f)));
    const [{ data: prices }, { data: settings }] = await Promise.all([
      supabase
        .from("product_prices")
        .select("sku, price_cents, sale_price_cents, sale_ends_at, is_purchasable")
        .in("sku", skus),
      supabase
        .from("store_settings")
        .select("shipping_flat_cents, free_shipping_threshold_cents")
        .eq("id", 1)
        .maybeSingle(),
    ]);
    const now = Date.now();
    const live = (prices ?? [])
      .filter((p) => p.is_purchasable && p.price_cents != null)
      .map((p) =>
        p.sale_price_cents != null && p.sale_ends_at && new Date(p.sale_ends_at).getTime() > now
          ? p.sale_price_cents
          : (p.price_cents as number),
      );
    return {
      flavourFrom: live.length ? Math.min(...live) : null,
      deliveryFee: settings?.shipping_flat_cents ?? null,
      freeDeliveryAbove: settings?.free_shipping_threshold_cents ?? null,
    };
  } catch {
    return { flavourFrom: null, deliveryFee: null, freeDeliveryAbove: null };
  }
}

function faqs(facts: Facts): [string, string][] {
  const delivery =
    facts.deliveryFee != null
      ? facts.freeDeliveryAbove != null
        ? `Delivery is ${formatPrice(facts.deliveryFee)}, and free on orders above ${formatPrice(facts.freeDeliveryAbove)}.`
        : `Delivery is ${formatPrice(facts.deliveryFee)}.`
      : "The delivery charge is shown at checkout.";
  return [
    [
      "Do you deliver hookah tobacco to my city?",
      `Yes. RASA delivers across India — including ${CITIES.slice(0, 8).join(", ")} and more. Orders are dispatched from Gurugram, Haryana, and delivery timelines are shared at checkout. ${delivery}`,
    ],
    [
      "Is there a RASA shop I can visit?",
      `RASA is an online and wholesale house — there is no walk-in shop. Order online at rasatobacco.com, or contact our sales team on ${contactInfo.phone} for wholesale. Our office is in ${contactInfo.address.line1}, ${contactInfo.address.line2}, Gurugram.`,
    ],
    [
      "How much does RASA hookah tobacco cost?",
      facts.flavourFrom != null
        ? `RASA hookah flavours start at ${formatPrice(facts.flavourFrom)} for a 20g pack. Hand-sculpted mouth tips are ₹85 each, or any two for ₹150.`
        : "Current prices for every flavour and pack size are on the shop page. Hand-sculpted mouth tips are ₹85 each, or any two for ₹150.",
    ],
    [
      "How can I pay?",
      "Cash on delivery is available on every order — you pay the courier when your order arrives.",
    ],
    [
      "Do you supply hookah lounges, cafés and retailers?",
      "Yes. RASA partners with distributors, hookah lounges and retail stores across India and the Gulf, with wholesale pricing on larger quantities. Apply through the Partners page or contact our sales team.",
    ],
    [
      "Who can buy from RASA?",
      "RASA products are for adults aged 18 and over. Tobacco causes cancer.",
    ],
  ];
}

export const Route = createFileRoute("/hookah-tobacco-india")({
  loader: () => loadFacts(),
  head: ({ loaderData }) => {
    const facts = loaderData ?? { flavourFrom: null, deliveryFee: null, freeDeliveryAbove: null };
    return seo({
      title: "Buy Premium Hookah Tobacco Online in India — Delivered from Gurugram | RASA",
      description: `Premium hookah tobacco and shisha flavours delivered across India from Gurugram — Delhi NCR, Mumbai, Bengaluru and more.${facts.flavourFrom != null ? ` 20g packs from ${formatPrice(facts.flavourFrom)}.` : ""} Cash on delivery. Wholesale for lounges.`,
      path: PATH,
      jsonLd: [
        {
          "@type": "FAQPage",
          mainEntity: faqs(facts).map(([q, a]) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        },
        productListJsonLd([...flavours, ...mouthTips], "RASA hookah tobacco available in India"),
        {
          "@type": "OnlineStore",
          "@id": `${SITE_URL}/#store`,
          name: "RASA",
          url: SITE_URL,
          parentOrganization: { "@id": `${SITE_URL}/#organization` },
          areaServed: { "@type": "Country", name: "India" },
          paymentAccepted: "Cash on delivery",
          currenciesAccepted: "INR",
        },
        breadcrumbs([
          ["Home", "/"],
          ["Hookah Tobacco in India", PATH],
        ]),
      ],
    });
  },
  component: HookahTobaccoIndia,
});

function HookahTobaccoIndia() {
  const facts = Route.useLoaderData();
  const { prices, loading } = useProductPrices();

  return (
    <main className="bg-ink text-foreground min-h-screen pt-32 pb-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <header className="text-center max-w-3xl mx-auto">
          <p className="text-[0.6rem] tracking-luxe uppercase text-gold mb-3">
            Online · Wholesale · Delivered across India
          </p>
          <h1 className="font-serif text-4xl md:text-5xl leading-tight">
            Premium Hookah Tobacco, Delivered Across India
          </h1>
          <p className="mt-6 text-foreground/70 leading-relaxed">
            RASA is a Gurugram-based house of premium shisha tobacco. Our three series —{" "}
            <Link to="/collections/majlis" className="text-gold hover:text-gold-soft">
              Majlis
            </Link>
            ,{" "}
            <Link to="/collections/makhmal" className="text-gold hover:text-gold-soft">
              Makhmal
            </Link>{" "}
            and{" "}
            <Link to="/collections/tarkib" className="text-gold hover:text-gold-soft">
              Tarkib
            </Link>{" "}
            — are crafted for smooth, rich clouds, from royal paan and fresh mint to kiwi, grape,
            lychee and white rose. Order online and we dispatch from Gurugram to anywhere in India
            {facts.flavourFrom != null && <>, with 20g packs from {formatPrice(facts.flavourFrom)}</>}
            .
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/shop"
              className="px-8 py-3 bg-gold text-primary-foreground text-[0.65rem] tracking-luxe uppercase hover:bg-gold-soft transition-colors"
            >
              Shop all flavours
            </Link>
            <Link
              to="/partners"
              className="px-8 py-3 border border-gold/50 text-gold text-[0.65rem] tracking-luxe uppercase hover:bg-gold/10 transition-colors"
            >
              Wholesale &amp; lounges
            </Link>
          </div>
        </header>

        <section className="mt-20">
          <h2 className="font-serif text-3xl text-center mb-10">Hookah flavours available now</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {flavours.map((entry) => (
              <ProductCard key={entry.key} entry={entry} prices={prices} pricesLoading={loading} />
            ))}
          </div>
        </section>

        <section className="mt-20">
          <h2 className="font-serif text-3xl text-center mb-3">Hookah mouth tips</h2>
          <p className="text-center text-sm text-foreground/60 mb-10">
            Hand-sculpted Lion, Charlie and Joker designs — ₹85 each, any two for ₹150.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {mouthTips.map((entry) => (
              <div
                key={entry.key}
                className="w-full max-w-[18rem] sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)]"
              >
                <ProductCard entry={entry} prices={prices} pricesLoading={loading} />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="font-serif text-3xl mb-4">Where we deliver</h2>
            <p className="text-foreground/70 leading-relaxed mb-5">
              Every order ships from Gurugram, Haryana, to addresses across India. Delivery
              timelines for your PIN code are shown at checkout, and cash on delivery is available.
            </p>
            <ul className="flex flex-wrap gap-2">
              {CITIES.map((city) => (
                <li
                  key={city}
                  className="text-[0.6rem] tracking-luxe uppercase border border-border/40 px-3 py-1.5 text-foreground/70"
                >
                  {city}
                </li>
              ))}
              <li className="text-[0.6rem] tracking-luxe uppercase px-3 py-1.5 text-gold">
                + all of India
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-3xl mb-4">For lounges, cafés &amp; retailers</h2>
            <p className="text-foreground/70 leading-relaxed mb-5">
              RASA supplies hookah lounges, cafés, retail stores and distributors with wholesale
              pricing on larger quantities. RASA is an online and wholesale house — there is no
              walk-in shop — so speak to our sales team directly.
            </p>
            <address className="not-italic text-sm text-foreground/70 leading-relaxed">
              {contactInfo.address.company}
              <br />
              {contactInfo.address.line1}, {contactInfo.address.line2}
              <br />
              {contactInfo.address.line3}
              <br />
              <a href={`tel:${contactInfo.phoneRaw}`} className="text-gold hover:text-gold-soft">
                {contactInfo.phone}
              </a>{" "}
              ·{" "}
              <a href={`mailto:${contactInfo.email}`} className="text-gold hover:text-gold-soft">
                {contactInfo.email}
              </a>
            </address>
          </div>
        </section>

        <section className="mt-20 max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl text-center mb-8">Frequently asked questions</h2>
          <div className="divide-y divide-border/30 border-y border-border/30">
            {faqs(facts).map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="cursor-pointer list-none flex justify-between gap-4 font-serif text-xl">
                  {q}
                  <span className="text-gold transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-foreground/70 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
