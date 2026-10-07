import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { findCatalogEntry, CATALOG } from "@/data/catalog";
import { productImageGalleries } from "@/data/productImages";
import { useProductPrices } from "@/hooks/useProductPrices";
import { AddToCartControl } from "@/components/shop/AddToCartControl";

export const Route = createFileRoute("/product/$key")({
  head: ({ params }) => {
    const entry = findCatalogEntry(params.key);
    return {
      meta: [
        {
          title: entry
            ? `${entry.flavour.name} — ${entry.collection.name} | RASA`
            : "Product — RASA",
        },
        { name: "description", content: entry?.flavour.notes ?? "RASA product." },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { key } = Route.useParams();
  const entry = findCatalogEntry(key);
  const { prices, loading } = useProductPrices();

  if (!entry) {
    return (
      <main className="bg-ink text-foreground min-h-screen pt-40 pb-24 px-6 text-center">
        <p className="font-serif text-3xl mb-4">Product not found</p>
        <Link
          to="/shop"
          className="text-[0.65rem] tracking-luxe uppercase text-gold hover:text-gold-soft"
        >
          ← Back to Shop
        </Link>
      </main>
    );
  }

  const { collection, flavour, image } = entry;
  const gallery = productImageGalleries[key] ?? (image ? [image] : []);
  const related = CATALOG.filter((candidate) => candidate.key !== key)
    .sort((a, b) => Number(b.flavour.available) - Number(a.flavour.available))
    .slice(0, 3);

  return (
    <main className="bg-ink text-foreground min-h-screen pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        <nav className="text-[0.6rem] tracking-luxe uppercase text-foreground/45 mb-8 flex items-center gap-2 flex-wrap">
          <Link to="/shop" className="hover:text-gold transition-colors">
            Shop
          </Link>
          <span>/</span>
          <span style={{ color: collection.accentVar }}>{collection.name}</span>
          <span>/</span>
          <span className="text-foreground/70">{flavour.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          <ProductGallery
            key={key}
            gallery={gallery}
            fallbackImage={image}
            flavourName={flavour.name}
            collectionName={collection.name}
            available={flavour.available}
            background={`radial-gradient(ellipse at 50% 30%, color-mix(in oklab, ${collection.accentVar} 16%, transparent), transparent 70%), color-mix(in oklab, ${collection.bgVar} 35%, var(--ink))`}
          />

          {/* Details */}
          <div>
            <p
              className="text-[0.65rem] tracking-wider-luxe uppercase mb-3"
              style={{ color: collection.accentVar }}
            >
              {collection.label} · {collection.name}
            </p>
            <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-4">{flavour.name}</h1>
            <p className="text-foreground/70 leading-relaxed mb-8">{flavour.notes}</p>

            <div className="border-t border-border/30 pt-8">
              {loading ? (
                <div className="w-6 h-6 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
              ) : (
                <AddToCartControl entry={entry} prices={prices} />
              )}
            </div>

            <div className="mt-10 pt-8 border-t border-border/30 space-y-2 text-xs text-foreground/50">
              <p>Dispatched from Gurugram, Haryana. Delivery timelines shared at checkout.</p>
              <p>Age verification required — RASA products are for adults 18 years and older.</p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-20 pt-12 border-t border-border/30">
            <p className="text-[0.6rem] tracking-luxe uppercase text-gold mb-6">
              More from RASA
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((r) => (
                <Link
                  key={r.key}
                  to="/product/$key"
                  params={{ key: r.key }}
                  className="group border border-border/40 hover:border-gold/40 transition-colors duration-300 p-5"
                >
                  <h4 className="font-serif text-xl group-hover:text-gold transition-colors">
                    {r.flavour.name}
                  </h4>
                  <p className="mt-1 text-xs text-foreground/55 line-clamp-2">{r.flavour.notes}</p>
                  {!r.flavour.available && (
                    <span className="mt-3 inline-block text-[0.55rem] tracking-wider-luxe uppercase text-foreground/40">
                      Forthcoming
                    </span>
                  )}
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                to="/flavours"
                className="inline-flex items-center justify-center border border-gold/50 px-8 py-3 text-[0.65rem] uppercase tracking-luxe text-gold transition-all duration-300 hover:bg-gold hover:text-ink"
              >
                View All Flavours
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function ProductGallery({
  gallery,
  fallbackImage,
  flavourName,
  collectionName,
  available,
  background,
}: {
  gallery: string[];
  fallbackImage?: string;
  flavourName: string;
  collectionName: string;
  available: boolean;
  background: string;
}) {
  const initialImage = gallery[0] ?? fallbackImage;
  const [selectedImage, setSelectedImage] = useState(initialImage);

  useEffect(() => {
    setSelectedImage(initialImage);
  }, [initialImage]);

  return (
    <div>
      <div
        className="relative aspect-square border border-border/30"
        style={{ background: selectedImage ? undefined : background }}
      >
        {selectedImage ? (
          <img
            src={selectedImage}
            alt={`${flavourName} — ${collectionName}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 border border-dashed border-foreground/15 m-4">
            <ImageIcon className="h-8 w-8 text-foreground/25" strokeWidth={1.25} />
            <p className="text-[0.6rem] tracking-wider-luxe uppercase text-foreground/30">
              Product photography coming soon
            </p>
          </div>
        )}
        {!available && (
          <span className="absolute top-4 right-4 text-[0.6rem] tracking-wider-luxe uppercase px-2.5 py-1.5 border border-foreground/30 bg-ink/70 backdrop-blur-sm text-foreground/60">
            Forthcoming
          </span>
        )}
      </div>
      {gallery.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {gallery.map((galleryImage, index) => (
            <button
              key={galleryImage}
              type="button"
              onClick={() => setSelectedImage(galleryImage)}
              className={`h-20 w-16 shrink-0 overflow-hidden border transition-colors ${
                selectedImage === galleryImage
                  ? "border-gold"
                  : "border-border/40 hover:border-gold/50"
              }`}
              aria-label={`View ${flavourName} image ${index + 1}`}
            >
              <img src={galleryImage} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
