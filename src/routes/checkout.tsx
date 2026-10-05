import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useProductPrices } from "@/hooks/useProductPrices";
import { parseSku } from "@/data/catalog";
import { formatPrice } from "@/lib/money";
import { invokeFunction } from "@/lib/functions";
import { openRazorpayCheckout } from "@/lib/razorpay";
import {
  ONLINE_PAYMENTS_ENABLED,
  shippingChargeFor,
  useShippingSettings,
} from "@/hooks/useStoreSettings";
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

type PaymentMethod = "cod" | "razorpay";

type CreateOrderResponse = {
  order_id: string;
  payment_method: PaymentMethod;
  amount: number;
  currency: string;
  razorpay_order_id?: string;
  key_id?: string;
};

type Stage = "idle" | "creating" | "paying" | "verifying";

const STAGE_LABEL: Record<Stage, string> = {
  idle: "",
  creating: "Placing Order…",
  paying: "Awaiting Payment…",
  verifying: "Confirming Payment…",
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
  const { settings: shippingSettings, loading: settingsLoading } = useShippingSettings();
  const [form, setForm] = useState<ShippingForm>({
    ...emptyForm,
    name: (user?.user_metadata?.full_name as string) ?? "",
    email: user?.email ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingForm, string>>>({});
  const [stage, setStage] = useState<Stage>("idle");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const placing = stage !== "idle";
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(!authLoading && !user);

  const loading = authLoading || cartLoading || pricesLoading || settingsLoading;

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
  const shippingCents = shippingChargeFor(subtotalCents, shippingSettings);
  const totalCents = subtotalCents + shippingCents;

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
    if (!next.phone && !/^\d{10}$/.test(form.phone.replace(/\D/g, "").slice(-10))) {
      next.phone = "Enter a 10-digit mobile number";
    }
    if (!next.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      next.email = "Enter a valid email";
    }
    if (!next.postalCode && !/^\d{6}$/.test(form.postalCode.trim())) {
      next.postalCode = "Enter a 6-digit PIN code";
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

    setStage("creating");
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

      // 1. Server creates the order from the cart and authoritative prices —
      //    the client never sends an amount.
      const method: PaymentMethod = ONLINE_PAYMENTS_ENABLED ? paymentMethod : "cod";
      const { data: order, error: orderError } = await invokeFunction<CreateOrderResponse>(
        "create-order",
        { shipping: form, skuMeta, payment_method: method },
      );
      if (orderError || !order) {
        setPlaceError(orderError ?? "Could not place your order. Please try again.");
        setStage("idle");
        return;
      }

      // Cash on delivery: the order is already confirmed server-side.
      if (order.payment_method === "cod" || !order.razorpay_order_id) {
        await clear();
        navigate({ to: "/order-confirmation/$orderId", params: { orderId: order.order_id } });
        return;
      }

      // 2. Razorpay Standard Checkout modal.
      setStage("paying");
      const outcome = await openRazorpayCheckout({
        key: order.key_id || (import.meta.env.VITE_RAZORPAY_KEY_ID as string),
        amount: order.amount,
        currency: order.currency,
        order_id: order.razorpay_order_id,
        name: "RASA",
        description: `Order #${order.order_id.slice(0, 8)}`,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        notes: { order_id: order.order_id },
        theme: { color: "#c9a96b" },
      });

      if (outcome.type === "dismissed") {
        setPlaceError(
          outcome.failure
            ? `Payment failed: ${outcome.failure}. You have not been charged — please try again.`
            : "Payment was cancelled. Your cart is saved — you can try again whenever you're ready.",
        );
        setStage("idle");
        return;
      }

      // 3. Server verifies the HMAC signature before marking the order paid.
      setStage("verifying");
      const { error: verifyError } = await invokeFunction<{ ok: true; order_id: string }>(
        "verify-payment",
        outcome.response,
      );
      if (verifyError) {
        setPlaceError(
          `We couldn't confirm your payment (${verifyError}). If money was debited it will be reconciled automatically — payment reference ${outcome.response.razorpay_payment_id}.`,
        );
        setStage("idle");
        return;
      }

      await clear();
      navigate({ to: "/order-confirmation/$orderId", params: { orderId: order.order_id } });
    } catch (e) {
      console.error(e);
      setPlaceError(
        e instanceof Error && e.message
          ? e.message
          : "Could not complete payment. Please try again.",
      );
      setStage("idle");
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

              <div>
                <p className="block text-[0.65rem] tracking-luxe uppercase text-gold/80 mb-3">
                  Payment
                </p>
                <div className="space-y-2">
                  <PaymentOption
                    checked={!ONLINE_PAYMENTS_ENABLED || paymentMethod === "cod"}
                    onSelect={() => setPaymentMethod("cod")}
                    title="Cash on Delivery"
                    detail={`Pay ${formatPrice(totalCents, "INR")} in cash when your order arrives.`}
                  />
                  {ONLINE_PAYMENTS_ENABLED && (
                    <PaymentOption
                      checked={paymentMethod === "razorpay"}
                      onSelect={() => setPaymentMethod("razorpay")}
                      title="Pay Online"
                      detail="UPI, cards, net banking and wallets via Razorpay."
                    />
                  )}
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={placing || purchasableItems.length === 0}
                  className="group inline-flex items-center justify-center gap-3 px-10 py-4 bg-gold text-primary-foreground text-xs tracking-luxe uppercase hover:bg-gold-soft transition-colors duration-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {placing
                    ? STAGE_LABEL[stage]
                    : ONLINE_PAYMENTS_ENABLED && paymentMethod === "razorpay"
                      ? `Pay ${formatPrice(totalCents, "INR")}`
                      : `Place Order · ${formatPrice(totalCents, "INR")}`}
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
                By placing this order you confirm you are 18+ and the recipient is legally permitted
                to receive these products at the delivery address.
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
              <div className="space-y-2 border-t border-border/30 pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-foreground/70">Subtotal</span>
                  <span className="text-foreground/80">{formatPrice(subtotalCents, "INR")}</span>
                </div>
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
              </div>
              {shippingSettings?.free_shipping_threshold_cents != null && shippingCents > 0 && (
                <p className="mt-2 text-[0.65rem] text-foreground/45">
                  Free delivery on orders above{" "}
                  {formatPrice(shippingSettings.free_shipping_threshold_cents, "INR")}.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function PaymentOption({
  checked,
  onSelect,
  title,
  detail,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  detail: string;
}) {
  return (
    <label
      className={`flex items-start gap-3 border px-4 py-3 cursor-pointer transition-colors ${
        checked ? "border-gold/60 bg-gold/5" : "border-border/40 hover:border-gold/40"
      }`}
    >
      <input
        type="radio"
        name="payment"
        checked={checked}
        onChange={onSelect}
        className="mt-1 accent-[var(--gold)]"
      />
      <span>
        <span className="block text-sm">{title}</span>
        <span className="block text-xs text-foreground/55">{detail}</span>
      </span>
    </label>
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
