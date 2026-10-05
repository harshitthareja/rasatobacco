import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/money";
import type { Tables } from "@/integrations/supabase/types";
import { OrderTracking } from "@/components/shop/OrderTracking";

export const Route = createFileRoute("/order-confirmation/$orderId")({
  head: () => ({
    meta: [{ title: "Order Confirmed — RASA" }, { name: "robots", content: "noindex" }],
  }),
  component: OrderConfirmationPage,
});

type OrderWithItems = Tables<"orders"> & { order_items: Tables<"order_items">[] };

function OrderConfirmationPage() {
  const { orderId } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
        } else {
          setOrder(data as OrderWithItems);
        }
        setLoading(false);
      });
  }, [orderId, user, authLoading]);

  if (authLoading || loading) {
    return (
      <main className="bg-ink text-foreground min-h-screen pt-40 pb-24 px-6 flex justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
      </main>
    );
  }

  if (notFound || !order) {
    return (
      <main className="bg-ink text-foreground min-h-screen pt-40 pb-24 px-6 text-center">
        <p className="font-serif text-2xl mb-4">We couldn't find that order.</p>
        <Link
          to="/account/orders"
          className="text-[0.65rem] tracking-luxe uppercase text-gold hover:text-gold-soft"
        >
          View My Orders
        </Link>
      </main>
    );
  }

  const paid = order.payment_status === "paid";
  const total = order.total_cents ?? order.subtotal_cents + (order.shipping_charge_cents ?? 0);

  return (
    <main className="bg-ink text-foreground min-h-screen pt-32 pb-24 px-6">
      <div className="max-w-2xl mx-auto text-center">
        {paid ? (
          <CheckCircle2 className="h-12 w-12 text-gold mx-auto mb-6" strokeWidth={1.25} />
        ) : (
          <Clock className="h-12 w-12 text-gold/70 mx-auto mb-6" strokeWidth={1.25} />
        )}
        <p className="text-[0.65rem] tracking-luxe uppercase text-gold mb-3">
          {paid ? "Order Confirmed" : "Awaiting Payment"}
        </p>
        <h1 className="font-serif text-4xl mb-4">
          {paid ? `Thank you, ${order.shipping_name.split(" ")[0]}.` : "Payment not completed"}
        </h1>
        <p className="text-foreground/70 leading-relaxed mb-10">
          {paid ? (
            <>
              Your payment was received and your order is{" "}
              <span className="text-gold">{order.status}</span>. We'll email you as soon as it
              ships.
            </>
          ) : order.status === "cancelled" ? (
            "This checkout was not paid and has been closed. Your cart is saved — you can check out again any time."
          ) : (
            "We haven't received payment for this order yet. If money was debited, it will be confirmed here automatically within a few minutes."
          )}
        </p>

        <div className="border border-border/40 p-6 text-left">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[0.65rem] tracking-luxe uppercase text-foreground/50">
              Order #{order.id.slice(0, 8)}
            </p>
            <p className="text-[0.65rem] text-foreground/45">
              {new Date(order.created_at ?? "").toLocaleDateString("en-IN")}
            </p>
          </div>

          <div className="space-y-3 mb-5">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate">{item.product_name}</p>
                  <p className="text-[0.6rem] text-foreground/45 uppercase tracking-wide">
                    {item.collection_name} · {item.format} × {item.quantity}
                  </p>
                </div>
                <span className="shrink-0 text-foreground/80">
                  {formatPrice(item.line_total_cents, order.currency)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-border/30 pt-4 text-sm mb-6">
            <div className="flex items-center justify-between">
              <span className="text-foreground/70">Subtotal</span>
              <span>{formatPrice(order.subtotal_cents, order.currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground/70">Shipping</span>
              <span>
                {order.shipping_charge_cents
                  ? formatPrice(order.shipping_charge_cents, order.currency)
                  : "Free"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground/70">{paid ? "Paid" : "Total"}</span>
              <span className="font-serif text-lg text-gold">
                {formatPrice(total, order.currency)}
              </span>
            </div>
            {order.razorpay_payment_id && (
              <p className="text-[0.65rem] text-foreground/45">
                Payment ref: <span className="font-mono">{order.razorpay_payment_id}</span>
              </p>
            )}
          </div>

          <p className="text-[0.65rem] tracking-luxe uppercase text-foreground/50 mb-2">
            Shipping To
          </p>
          <p className="text-sm text-foreground/75 leading-relaxed">
            {order.shipping_name}
            <br />
            {order.shipping_address_line1}
            {order.shipping_address_line2 ? `, ${order.shipping_address_line2}` : ""}
            <br />
            {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
            <br />
            {order.shipping_country}
            <br />
            {order.shipping_phone}
          </p>

          {paid && (
            <div className="mt-6 border-t border-border/30 pt-5">
              <p className="text-[0.65rem] tracking-luxe uppercase text-foreground/50 mb-3">
                Delivery Tracking
              </p>
              <OrderTracking orderId={order.id} />
            </div>
          )}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/account/orders"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-gold text-primary-foreground text-[0.7rem] tracking-luxe uppercase hover:bg-gold-soft transition-colors"
          >
            View My Orders
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-8 py-3.5 border border-border/40 text-foreground/70 text-[0.7rem] tracking-luxe uppercase hover:border-gold/50 hover:text-gold transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
