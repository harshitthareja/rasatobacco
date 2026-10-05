import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/money";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/account/orders")({
  head: () => ({
    meta: [
      { title: "My Orders — RASA" },
      { name: "description", content: "Track your RASA orders and enquiries." },
    ],
  }),
  component: OrdersPage,
});

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "#c9a96e",
  confirmed: "#60a5fa",
  processing: "#60a5fa",
  shipped: "#a78bfa",
  delivered: "#34d399",
  cancelled: "#6b7280",
};

const ENQUIRY_STATUS_COLORS: Record<string, string> = {
  new: "#c9a96e",
  contacted: "#60a5fa",
  closed: "#6b7280",
};

type OrderWithItems = Tables<"orders"> & { order_items: Tables<"order_items">[] };

function OrdersPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"orders" | "enquiries">("orders");
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [enquiries, setEnquiries] = useState<Tables<"enquiries">[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      user.email
        ? supabase
            .from("enquiries")
            .select("*")
            .eq("email", user.email)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] as Tables<"enquiries">[] }),
    ]).then(([ordersRes, enquiriesRes]) => {
      setOrders((ordersRes.data as OrderWithItems[]) ?? []);
      setEnquiries(enquiriesRes.data ?? []);
      setDataLoading(false);
    });
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink pt-32 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-[0.65rem] tracking-luxe uppercase text-gold mb-3">Account</p>
        <h1 className="font-serif text-4xl text-foreground mb-8">My Orders</h1>

        <div className="flex gap-2 mb-10 border-b border-border/30">
          {(["orders", "enquiries"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-[0.65rem] tracking-luxe uppercase border-b-2 transition-colors ${
                tab === t
                  ? "border-gold text-gold"
                  : "border-transparent text-foreground/50 hover:text-foreground/80"
              }`}
            >
              {t === "orders" ? `Orders (${orders.length})` : `Enquiries (${enquiries.length})`}
            </button>
          ))}
        </div>

        {dataLoading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
          </div>
        )}

        {!dataLoading && tab === "orders" && orders.length === 0 && (
          <div className="border border-border/50 bg-surface/30 p-12 text-center">
            <p className="font-serif text-xl text-foreground mb-3">No orders yet</p>
            <p className="text-sm text-foreground/60 mb-8 max-w-md mx-auto">
              Your placed orders will appear here.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gold/50 text-gold text-[0.65rem] tracking-luxe uppercase hover:bg-gold hover:text-ink transition-all duration-300"
            >
              Go to Shop
            </Link>
          </div>
        )}

        {!dataLoading && tab === "orders" && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-border/40 p-6">
                <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                  <div>
                    <p className="font-serif text-lg">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-foreground/60 mt-0.5">
                      {new Date(order.created_at ?? "").toLocaleString("en-IN")}
                    </p>
                  </div>
                  <span
                    className="text-[0.6rem] tracking-luxe uppercase px-3 py-1 border shrink-0"
                    style={{
                      color: ORDER_STATUS_COLORS[order.status] ?? "#888",
                      borderColor: `${ORDER_STATUS_COLORS[order.status] ?? "#888"}40`,
                    }}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="space-y-1.5 mb-4">
                  {order.order_items.map((item) => (
                    <p key={item.id} className="text-sm text-foreground/75">
                      {item.product_name} · {item.format} × {item.quantity}
                    </p>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-border/30 pt-3">
                  <Link
                    to="/order-confirmation/$orderId"
                    params={{ orderId: order.id }}
                    className="text-[0.65rem] tracking-luxe uppercase text-gold/80 hover:text-gold transition-colors"
                  >
                    View Details
                  </Link>
                  <span className="font-serif text-gold">
                    {formatPrice(order.subtotal_cents, order.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!dataLoading && tab === "enquiries" && enquiries.length === 0 && (
          <div className="border border-border/50 bg-surface/30 p-12 text-center">
            <p className="font-serif text-xl text-foreground mb-3">No enquiries yet</p>
            <p className="text-sm text-foreground/60 mb-8 max-w-md mx-auto">
              Submit a contact enquiry and it will appear here.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gold/50 text-gold text-[0.65rem] tracking-luxe uppercase hover:bg-gold hover:text-ink transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>
        )}

        {!dataLoading && tab === "enquiries" && enquiries.length > 0 && (
          <div className="space-y-4">
            {enquiries.map((eq) => (
              <div key={eq.id} className="border border-border/40 p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-serif text-lg">{eq.business}</p>
                    <p className="text-xs text-foreground/60 mt-0.5">{eq.type}</p>
                  </div>
                  <span
                    className="text-[0.6rem] tracking-luxe uppercase px-3 py-1 border shrink-0"
                    style={{
                      color: ENQUIRY_STATUS_COLORS[eq.status ?? ""] ?? "#888",
                      borderColor: `${ENQUIRY_STATUS_COLORS[eq.status ?? ""] ?? "#888"}40`,
                    }}
                  >
                    {eq.status}
                  </span>
                </div>
                <p className="text-sm text-foreground/75 leading-relaxed">{eq.message}</p>
                <p className="text-[0.65rem] text-foreground/40 mt-3">
                  {new Date(eq.created_at ?? "").toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
