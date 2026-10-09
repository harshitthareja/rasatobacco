import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useProductPrices } from "@/hooks/useProductPrices";
import { parseSku } from "@/data/catalog";
import { formatPrice } from "@/lib/money";
import { AuthModal } from "@/components/AuthModal";
import { shippingChargeFor, useShippingSettings } from "@/hooks/useStoreSettings";
import { mouthTipCount, pairOfferSavings } from "@/lib/offers";
import { MouthTipOfferNote } from "@/components/shop/MouthTipOffer";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [{ title: "Your Cart — RASA" }, { name: "robots", content: "noindex" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, loading: cartLoading, setQuantity, removeItem } = useCart();
  const { prices, loading: pricesLoading } = useProductPrices();
  const { settings: shippingSettings } = useShippingSettings();
  const [authOpen, setAuthOpen] = useState(!authLoading && !user);

  const loading = authLoading || cartLoading || pricesLoading;

  const resolved = items
    .map((item) => {
      const parsed = parseSku(item.sku);
      if (!parsed) return null;
      const price = prices[item.sku];
      return { ...item, ...parsed, price };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  // Only items that can actually be ordered count — the same rule checkout
  // and the server use, so the cart total always matches what's charged.
  const orderable = resolved.filter((r) => r.price?.price_cents != null && r.price.is_purchasable);
  const subtotalCents = orderable.reduce(
    (sum, r) => sum + (r.price!.price_cents as number) * r.quantity,
    0,
  );
  const offerCents = pairOfferSavings(
    orderable.map((r) => ({
      sku: r.sku,
      quantity: r.quantity,
      unit_price_cents: r.price!.price_cents as number,
    })),
  );
  const tipCount = mouthTipCount(orderable);
  const shippingCents = shippingChargeFor(subtotalCents - offerCents, shippingSettings);
  const totalCents = subtotalCents - offerCents + shippingCents;
  const hasUnpriced = resolved.some((r) => r.price?.price_cents == null || !r.price.is_purchasable);

  if (!authLoading && !user) {
    return (
      <main className="bg-ink text-foreground min-h-screen pt-40 pb-24 px-6 text-center">
        <p className="text-[0.65rem] tracking-luxe uppercase text-gold mb-4">Your Cart</p>
        <h1 className="font-serif text-4xl mb-6">Sign in to view your cart</h1>
        <button
          onClick={() => setAuthOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 border border-gold/50 text-gold text-[0.65rem] tracking-luxe uppercase hover:bg-gold hover:text-ink transition-all duration-300"
        >
          Sign In
        </button>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} reason="cart" />
      </main>
    );
  }

  return (
    <main className="bg-ink text-foreground min-h-screen pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <p className="text-[0.65rem] tracking-luxe uppercase text-gold mb-3">Your Cart</p>
        <h1 className="font-serif text-4xl mb-10">
          {resolved.length > 0
            ? `${resolved.length} item${resolved.length !== 1 ? "s" : ""}`
            : "Cart"}
        </h1>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
          </div>
        )}

        {!loading && resolved.length === 0 && (
          <div className="border border-border/50 bg-surface/30 p-12 text-center">
            <p className="font-serif text-xl mb-3">Your cart is empty</p>
            <p className="text-sm text-foreground/60 mb-8 max-w-md mx-auto">
              Browse the shop and add a few flavours to get started.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gold/50 text-gold text-[0.65rem] tracking-luxe uppercase hover:bg-gold hover:text-ink transition-all duration-300"
            >
              Go to Shop
            </Link>
          </div>
        )}

        {!loading && resolved.length > 0 && (
          <div className="grid lg:grid-cols-[1fr_320px] gap-10">
            <div className="space-y-4">
              {resolved.map((r) => (
                <div key={r.sku} className="flex gap-4 border border-border/40 p-4">
                  <div
                    className="relative w-20 h-24 shrink-0 overflow-hidden"
                    style={{
                      background: r.entry.image
                        ? undefined
                        : `color-mix(in oklab, ${r.entry.collection.bgVar} 35%, var(--ink))`,
                    }}
                  >
                    {r.entry.image ? (
                      <img src={r.entry.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-foreground/20" strokeWidth={1.25} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[0.55rem] tracking-wider-luxe uppercase mb-1"
                      style={{ color: r.entry.collection.accentVar }}
                    >
                      {r.entry.collection.name} · {r.format.toUpperCase()}
                    </p>
                    <Link
                      to="/product/$key"
                      params={{ key: r.entry.key }}
                      className="font-serif text-lg hover:text-gold transition-colors"
                    >
                      {r.entry.flavour.name}
                    </Link>

                    <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center border border-border/40">
                        <button
                          onClick={() => setQuantity(r.sku, r.quantity - 1)}
                          className="p-2 text-foreground/70 hover:text-gold transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{r.quantity}</span>
                        <button
                          onClick={() => setQuantity(r.sku, r.quantity + 1)}
                          className="p-2 text-foreground/70 hover:text-gold transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-serif text-gold">
                          {r.price?.price_cents != null
                            ? formatPrice(r.price.price_cents * r.quantity, r.price.currency)
                            : "Price pending"}
                        </span>
                        <button
                          onClick={() => removeItem(r.sku)}
                          aria-label="Remove item"
                          className="text-foreground/40 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-border/40 p-6 h-fit">
              <p className="text-[0.65rem] tracking-luxe uppercase text-foreground/50 mb-4">
                Order Summary
              </p>
              <div className="space-y-2 text-sm mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-foreground/70">Subtotal</span>
                  <span className="text-foreground/80">{formatPrice(subtotalCents, "INR")}</span>
                </div>
                {offerCents > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">Mouth tips · 2 for ₹150</span>
                    <span className="text-gold">−{formatPrice(offerCents, "INR")}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-foreground/70">Delivery</span>
                  <span className="text-foreground/80">
                    {shippingCents === 0 ? "Free" : formatPrice(shippingCents, "INR")}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border/30 pt-3">
                  <span className="text-foreground/70">Total</span>
                  <span className="font-serif text-lg text-gold">
                    {formatPrice(totalCents, "INR")}
                  </span>
                </div>
                {shippingSettings?.free_shipping_threshold_cents != null && shippingCents > 0 && (
                  <p className="text-[0.65rem] text-foreground/45">
                    Free delivery on orders above{" "}
                    {formatPrice(shippingSettings.free_shipping_threshold_cents, "INR")}.
                  </p>
                )}
              </div>

              <MouthTipOfferNote count={tipCount} className="mb-5" />

              {hasUnpriced && (
                <p className="text-[0.65rem] text-destructive/80 mb-4 leading-relaxed">
                  One or more items in your cart aren't available to order yet and won't be included
                  in your order.
                </p>
              )}

              <Link
                to="/checkout"
                className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-gold text-primary-foreground text-[0.7rem] tracking-luxe uppercase hover:bg-gold-soft transition-all duration-300"
              >
                Proceed to Checkout
              </Link>
              <Link
                to="/shop"
                className="w-full inline-flex items-center justify-center mt-3 px-6 py-3 border border-border/40 text-foreground/70 text-[0.65rem] tracking-luxe uppercase hover:border-gold/50 hover:text-gold transition-all duration-300"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
