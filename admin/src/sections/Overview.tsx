import { useEffect, useState } from "react";
import { adminData } from "../lib/api";
import { formatPrice } from "../lib/format";
import { ErrorNote, Loading } from "../components/ui";

type Stats = {
  orders: number;
  paid_orders: number;
  revenue_cents: number;
  cod_due_cents: number;
  to_ship: number;
  in_transit: number;
  delivered: number;
  enquiries: number;
  partners: number;
  subscribers: number;
  loyalty_members: number;
  users: number;
};

export function Overview({ go }: { go: (id: string) => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminData<Stats>("overview").then(setStats, (e) => setError(e.message));
  }, []);

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!stats) return <Loading />;

  const goOrders = (status: string) => {
    sessionStorage.setItem("rasa-admin-order-status", status);
    go("orders");
  };

  const cards: { label: string; value: string | number; accent?: boolean; onClick?: () => void }[] =
    [
      { label: "Revenue (paid)", value: formatPrice(stats.revenue_cents), accent: true },
      { label: "COD to Collect", value: formatPrice(stats.cod_due_cents ?? 0) },
      { label: "Orders", value: stats.paid_orders, onClick: () => goOrders("") },
      {
        label: "Ready to Ship",
        value: stats.to_ship,
        accent: stats.to_ship > 0,
        onClick: () => goOrders("to_ship"),
      },
      { label: "In Transit", value: stats.in_transit, onClick: () => goOrders("shipped") },
      { label: "Delivered", value: stats.delivered, onClick: () => goOrders("delivered") },
      { label: "All Checkouts", value: stats.orders },
      { label: "Enquiries", value: stats.enquiries, onClick: () => go("enquiries") },
      { label: "Partner Registrations", value: stats.partners, onClick: () => go("partners") },
      { label: "Subscribers", value: stats.subscribers, onClick: () => go("subscribers") },
      { label: "Loyalty Members", value: stats.loyalty_members, onClick: () => go("loyalty") },
      { label: "Registered Users", value: stats.users, onClick: () => go("users") },
    ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {cards.map((c) => (
        <button
          key={c.label}
          onClick={c.onClick}
          disabled={!c.onClick}
          className={`text-left border p-6 transition-colors ${
            c.accent ? "border-gold/40 bg-gold/5" : "border-border"
          } ${c.onClick ? "hover:border-gold/60 cursor-pointer" : "cursor-default"}`}
        >
          <p className={`text-3xl font-serif mb-2 ${c.accent ? "text-gold" : ""}`}>{c.value}</p>
          <p className="text-[0.62rem] tracking-luxe uppercase text-foreground/55">{c.label}</p>
        </button>
      ))}
    </div>
  );
}
