import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useProductPrices } from "@/hooks/useProductPrices";
import { parseSku } from "@/data/catalog";
import { formatPrice } from "@/lib/money";
import { supabase } from "@/integrations/supabase/client";
import { AuthModal } from "@/components/AuthModal";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [{ title: "Checkout — RASA" }, { name: "robots", content: "noindex" }],
  }),
  component: CheckoutPage,
});

type ShippingForm = {
  name: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  notes: string;
};

const emptyForm: ShippingForm = {
  name: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  notes: "",
};

function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { items, loading: cartLoading, clear } = useCart();
  const { prices, loading: pricesLoading } = useProductPrices();
  const [form, setForm] = useState<ShippingForm>({
    ...emptyForm,
    name: (user?.user_metadata?.full_name as string) ?? "",
    email: user?.email ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingForm, string>>>({});
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(!authLoading && !user);

  const loading = authLoading || cartLoading || pricesLoading;

  const resolved = items
    .map((item) => {
      const parsed = parseSku(item.sku);
      if (!parsed) return null;
      return { ...item, ...parsed, price: prices[item.sku] };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  const purchasableItems = resolved.filter(
    (r) => r.price?.price_cents != null && r.price.is_purchasable,
  );
  const subtotalCents = purchasableItems.reduce(
    (sum, r) => sum + (r.price!.price_cents as number) * r.quantity,
    0,
  );

  const onChange =
    (field: keyof ShippingForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((er) => ({ ...er, [field]: undefined }));
    };

  const validate = () => {
    const required: (keyof ShippingForm)[] = [
      "name",
      "phone",
      "email",
      "addressLine1",
      "city",
      "state",
      "postalCode",
    ];
    const next: Partial<Record<keyof ShippingForm, string>> = {};
    for (const field of required) {
      if (!form[field].trim()) next[field] = "Required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const placeOrder = async () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (purchasableItems.length === 0) {
      setPlaceError("Nothing in your cart is available to order right now.");
      return;
    }
    if (!validate()) return;

    setPlacing(true);
    setPlaceError(null);
    try {
      const skuMeta: Record<
        string,
        { productName: string; collectionName: string; format: string }
      > = {};
      for (const r of purchasableItems) {
        skuMeta[r.sku] = {
          productName: r.entry.flavour.name,
          collectionName: r.entry.collection.name,
          format: r.format,
        };
      }

      const { data, error } = await supabase.functions.invoke("create-order", {
        body: { shipping: form, skuMeta },
      });

      if (error || data?.error) {
        setPlaceError(
          data?.error ?? error?.message ?? "Could not place your order. Please try again.",
        );
        setPlacing(false);
        return;
      }

      await clear();
      navigate({ to: "/order-confirmation/$orderId", params: { orderId: data.order_id } });
    } catch (e) {
      console.error(e);
      setPlaceError("Could not place your order. Please try again.");
      setPlacing(false);
    }
  };

  if (!authLoading && !user) {
    return (
      <main className="bg-ink text-foreground min-h-screen pt-40 pb-24 px-6 text-center">
        <p className="text-[0.65rem] tracking-luxe uppercase text-gold mb-4">Checkout</p>
        <h1 className="font-serif text-4xl mb-6">Sign in to check out</h1>
        <button
          onClick={() => setAuthOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 border border-gold/50 text-gold text-[0.65rem] tracking-luxe uppercase hover:bg-gold hover:text-ink transition-all duration-300"
        >
          Sign In
        </button>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} reason="checkout" />
      </main>
    );
  }

  if (!loading && resolved.length === 0) {
    return (
      <main className="bg-ink text-foreground min-h-screen pt-40 pb-24 px-6 text-center">
        <p className="font-serif text-2xl mb-4">Your cart is empty</p>
        <Link
          to="/shop"
          className="text-[0.65rem] tracking-luxe uppercase text-gold hover:text-gold-soft"
        >
          ← Back to Shop
        </Link>
      </main>
    );
  }

  return (
    <main className="bg-ink text-foreground min-h-screen pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-[0.65rem] tracking-luxe uppercase text-gold mb-3">Checkout</p>
        <h1 className="font-serif text-4xl mb-10">Shipping Details</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_340px] gap-10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                placeOrder();
              }}
              noValidate
              className="card-luxe p-6 md:p-8 space-y-5"
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <Field
                  label="Full Name"
                  required
                  value={form.name}
                  onChange={onChange("name")}
                  error={errors.name}
                />
                <Field
                  label="Phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={onChange("phone")}
                  error={errors.phone}
                />
                <div className="sm:col-span-2">
                  <Field
                    label="Email"
                    type="email"
                    required
                    value={form.email}
                    onChange={onChange("email")}
                    error={errors.email}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Field
                    label="Address Line 1"
                    required
                    value={form.addressLine1}
                    onChange={onChange("addressLine1")}
                    error={errors.addressLine1}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Field
                    label="Address Line 2"
                    value={form.addressLine2}
                    onChange={onChange("addressLine2")}
                  />
                </div>
                <Field
                  label="City"
                  required
                  value={form.city}
                  onChange={onChange("city")}
                  error={errors.city}
                />
                <Field
                  label="State"
                  required
                  value={form.state}
                  onChange={onChange("state")}
                  error={errors.state}
                />
                <Field
                  label="Postal Code"
                  required
                  value={form.postalCode}
                  onChange={onChange("postalCode")}
                  error={errors.postalCode}
                />
                <Field
                  label="Country"
                  required
                  value={form.country}
                  onChange={onChange("country")}
                  error={errors.country}
                />
              </div>

              <div>
                <label className="block text-[0.65rem] tracking-luxe uppercase text-gold/80 mb-2">
                  Delivery Notes
                </label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={onChange("notes")}
                  placeholder="Landmark, preferred delivery window, etc."
                  className="w-full bg-transparent border-b border-border/60 py-3 text-foreground focus:border-gold outline-none transition-colors resize-none placeholder:text-muted-foreground/50"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={placing || purchasableItems.length === 0}
                  className="group inline-flex items-center justify-center gap-3 px-10 py-4 bg-gold text-primary-foreground text-xs tracking-luxe uppercase hover:bg-gold-soft transition-colors duration-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {placing ? "Placing Order…" : "Place Order"}
                  {placing ? (
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                  ) : (
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  )}
                </button>
              </div>
              {placeError && (
                <p className="text-xs font-serif italic text-destructive">{placeError}</p>
              )}
              <p className="text-xs text-foreground/60">
                Payment is collected after order confirmation — our team will follow up to complete
                payment and dispatch. By placing this order you confirm you are 18+ and the
                recipient is legally permitted to receive these products at the delivery address.
              </p>
            </form>

            <div className="border border-border/40 p-6 h-fit">
              <p className="text-[0.65rem] tracking-luxe uppercase text-foreground/50 mb-4">
                Order Summary
              </p>
              <div className="space-y-3 mb-5">
                {resolved.map((r) => (
                  <div key={r.sku} className="flex items-start justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate">{r.entry.flavour.name}</p>
                      <p className="text-[0.6rem] text-foreground/45 uppercase tracking-wide">
                        {r.format} × {r.quantity}
                        {r.price?.price_cents == null && " · price pending"}
                      </p>
                    </div>
                    <span className="shrink-0 text-foreground/80">
                      {r.price?.price_cents != null
                        ? formatPrice(r.price.price_cents * r.quantity, r.price.currency)
                        : "—"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-border/30 pt-4 text-sm">
                <span className="text-foreground/70">Subtotal</span>
                <span className="font-serif text-lg text-gold">
                  {formatPrice(subtotalCents, "INR")}
                </span>
              </div>
              <p className="mt-2 text-[0.65rem] text-foreground/45">
                Shipping calculated after confirmation.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-[0.65rem] tracking-luxe uppercase text-gold/80 mb-2">
        {label}
        {required && <span className="text-gold/60"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full bg-transparent border-b ${
          error ? "border-destructive" : "border-border/60"
        } py-3 text-foreground focus:border-gold outline-none transition-colors`}
      />
      {error && <p className="mt-2 text-xs font-serif italic text-destructive">{error}</p>}
    </div>
  );
}
