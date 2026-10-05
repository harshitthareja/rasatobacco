import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { parseSku } from "@/data/catalog";
import { formatPrice } from "@/lib/money";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — RASA" },
      { name: "description", content: "Internal RASA administration panel." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const ADMIN_KEY = "rasa_admin_2024";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type Section =
  | "overview"
  | "orders"
  | "products"
  | "carts"
  | "enquiries"
  | "partners"
  | "subscribers"
  | "loyalty"
  | "users";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Orders" },
  { id: "products", label: "Products" },
  { id: "carts", label: "Carts" },
  { id: "enquiries", label: "Enquiries" },
  { id: "partners", label: "Partners" },
  { id: "subscribers", label: "Subscribers" },
  { id: "loyalty", label: "Loyalty Members" },
  { id: "users", label: "Users" },
];

const STATUS_COLORS: Record<string, string> = {
  new: "#c9a96e",
  contacted: "#60a5fa",
  closed: "#6b7280",
  approved: "#34d399",
  rejected: "#f87171",
  pending: "#c9a96e",
  confirmed: "#60a5fa",
  processing: "#60a5fa",
  shipped: "#a78bfa",
  delivered: "#34d399",
  cancelled: "#6b7280",
};

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

function exportCSV(data: any[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [section, setSection] = useState<Section>("overview");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("rasa_admin") === "1") setAuthed(true);
    } catch {
      /* ignore */
    }
  }, []);

  const callAdminData = useCallback(async (sec: Section, pg = 1) => {
    setLoading(true);
    setData(null);
    try {
      const url = `${SUPABASE_URL}/functions/v1/admin-data?section=${sec}&page=${pg}`;
      const res = await fetch(url, {
        headers: {
          "x-admin-key": ADMIN_KEY,
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
        },
      });
      setData(await res.json());
    } catch (e) {
      console.error("admin fetch error", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) callAdminData(section, page);
  }, [authed, section, page, callAdminData]);

  const updateRow = async (
    table: string,
    id: string,
    updates: Record<string, unknown>,
    idColumn?: string,
  ) => {
    await fetch(`${SUPABASE_URL}/functions/v1/admin-update`, {
      method: "POST",
      headers: {
        "x-admin-key": ADMIN_KEY,
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ table, id, updates, idColumn }),
    });
    callAdminData(section, page);
  };

  const awardPoints = async (memberId: string, reason: string, pointsOverride?: number) => {
    await supabase.functions.invoke("loyalty-award", {
      body: { member_id: memberId, reason, points_override: pointsOverride },
    });
    callAdminData(section, page);
  };

  const tryLogin = () => {
    if (pw === ADMIN_KEY) {
      try {
        sessionStorage.setItem("rasa_admin", "1");
      } catch {
        /* ignore */
      }
      setAuthed(true);
    } else {
      setPwErr("Incorrect password.");
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-4">
        <div
          className="w-full max-w-sm border border-gold/30 p-10 text-center"
          style={{ background: "rgba(14,11,9,0.9)" }}
        >
          <p className="text-[0.6rem] tracking-luxe uppercase text-gold mb-4">RASA</p>
          <h1 className="font-serif text-3xl mb-8">Admin Access</h1>
          <input
            type="password"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              setPwErr("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") tryLogin();
            }}
            placeholder="Enter admin password"
            className="w-full bg-transparent border-b border-border/60 focus:border-gold py-3 text-foreground outline-none text-center tracking-widest mb-4"
          />
          {pwErr && <p className="text-xs text-destructive mb-4">{pwErr}</p>}
          <button
            onClick={tryLogin}
            className="w-full py-3 bg-gold text-ink text-[0.7rem] tracking-luxe uppercase hover:bg-gold-soft transition-colors"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-foreground">
      <div className="fixed left-0 top-0 h-full w-56 border-r border-border/40 bg-ink/95 z-10 flex flex-col overflow-y-auto">
        <div className="px-6 py-8 border-b border-border/40">
          <p className="font-serif text-lg text-gold">RASA</p>
          <p className="text-[0.6rem] tracking-luxe uppercase text-foreground/50 mt-1">
            Admin Panel
          </p>
        </div>
        <nav className="flex-1 py-4">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSection(s.id);
                setPage(1);
                setData(null);
              }}
              className={`w-full text-left px-6 py-3 text-[0.7rem] tracking-luxe uppercase transition-colors ${
                section === s.id
                  ? "text-gold bg-gold/10 border-r-2 border-gold"
                  : "text-foreground/60 hover:text-gold hover:bg-gold/5"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-border/40">
          <button
            onClick={() => {
              try {
                sessionStorage.removeItem("rasa_admin");
              } catch {
                /* ignore */
              }
              setAuthed(false);
            }}
            className="text-[0.65rem] tracking-luxe uppercase text-destructive/70 hover:text-destructive transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="ml-56 p-8">
        <div className="mb-8">
          <p className="text-[0.6rem] tracking-luxe uppercase text-gold mb-1">Admin</p>
          <h1 className="font-serif text-3xl">{SECTIONS.find((s) => s.id === section)?.label}</h1>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
          </div>
        )}

        {!loading && data?.data && data.data.length > 0 && section !== "overview" && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => exportCSV(data.data, section)}
              className="text-[0.65rem] tracking-luxe uppercase px-5 py-2.5 border border-gold/40 text-gold hover:bg-gold/10 transition-colors flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2v8m0 0L5 7m3 3 3-3M2 12h12"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Export CSV
            </button>
          </div>
        )}

        {!loading && data && section === "overview" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { label: "Orders", value: data.orders, color: "#34d399" },
              {
                label: "Revenue",
                value: formatPrice(data.revenue_cents ?? 0, "INR"),
                color: "#34d399",
              },
              { label: "Total Enquiries", value: data.enquiries, color: "#c9a96e" },
              { label: "Partner Registrations", value: data.partners, color: "#DEA193" },
              { label: "Subscribers", value: data.subscribers, color: "#60a5fa" },
              { label: "Loyalty Members", value: data.loyalty_members, color: "#34d399" },
              { label: "Registered Users", value: data.users, color: "#a78bfa" },
            ].map((card) => (
              <div
                key={card.label}
                className="border border-border/40 p-6"
                style={{ background: `${card.color}08` }}
              >
                <p className="text-3xl font-serif mb-2" style={{ color: card.color }}>
                  {card.value}
                </p>
                <p className="text-[0.65rem] tracking-luxe uppercase text-foreground/60">
                  {card.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {!loading && data?.data && section === "orders" && (
          <div className="space-y-3">
            {data.data.length === 0 && <p className="text-foreground/50 text-sm">No orders yet.</p>}
            {data.data.map((row: any) => (
              <div
                key={row.id}
                className="border border-border/40 p-5 grid md:grid-cols-[1fr_auto] gap-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <p className="font-serif text-lg">#{row.id.slice(0, 8)}</p>
                    <span
                      className="text-[0.6rem] tracking-luxe uppercase px-2 py-0.5 border"
                      style={{
                        color: STATUS_COLORS[row.status] ?? "#888",
                        borderColor: `${STATUS_COLORS[row.status] ?? "#888"}40`,
                      }}
                    >
                      {row.status}
                    </span>
                    <span className="font-serif text-gold">
                      {formatPrice(row.subtotal_cents, row.currency)}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/60 mb-1">
                    {row.shipping_name} · {row.shipping_phone} ·{" "}
                    <a href={`mailto:${row.shipping_email}`} className="text-gold hover:underline">
                      {row.shipping_email}
                    </a>
                  </p>
                  <p className="text-xs text-foreground/50 mb-2">
                    {row.shipping_address_line1}
                    {row.shipping_address_line2 ? `, ${row.shipping_address_line2}` : ""},{" "}
                    {row.shipping_city}, {row.shipping_state} {row.shipping_postal_code},{" "}
                    {row.shipping_country}
                  </p>
                  <div className="space-y-1 mt-2">
                    {(row.order_items ?? []).map((item: any) => (
                      <p key={item.id} className="text-sm text-foreground/80">
                        {item.product_name} · {item.collection_name} · {item.format} ×{" "}
                        {item.quantity} — {formatPrice(item.line_total_cents, row.currency)}
                      </p>
                    ))}
                  </div>
                  <p className="text-[0.65rem] text-foreground/40 mt-2">
                    {new Date(row.created_at).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {ORDER_STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateRow("orders", row.id, { status: s })}
                      className={`text-[0.6rem] tracking-luxe uppercase px-4 py-2 border transition-colors ${row.status === s ? "border-gold text-gold" : "border-border/40 text-foreground/50 hover:border-gold/50 hover:text-gold"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && data?.data && section === "products" && (
          <ProductsTable
            rows={data.data}
            onSave={(sku, updates) => updateRow("product_prices", sku, updates, "sku")}
          />
        )}

        {!loading && data?.data && section === "carts" && (
          <div className="border border-border/40 divide-y divide-border/30">
            {data.data.length === 0 && (
              <p className="text-foreground/50 text-sm p-6">No active carts.</p>
            )}
            {data.data.map((row: any) => {
              const parsed = parseSku(row.sku);
              return (
                <div key={row.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {parsed
                        ? `${parsed.entry.flavour.name} (${parsed.entry.collection.name}, ${parsed.format})`
                        : row.sku}
                      <span className="text-foreground/50"> × {row.quantity}</span>
                    </p>
                    <p className="text-[0.65rem] text-foreground/40 mt-0.5">
                      {row.user?.email ?? row.user_id} · updated{" "}
                      {new Date(row.updated_at).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && data?.data && section === "enquiries" && (
          <div className="space-y-3">
            {data.data.length === 0 && (
              <p className="text-foreground/50 text-sm">No enquiries yet.</p>
            )}
            {data.data.map((row: any) => (
              <div
                key={row.id}
                className="border border-border/40 p-5 grid md:grid-cols-[1fr_auto] gap-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-serif text-lg">{row.name}</p>
                    <span
                      className="text-[0.6rem] tracking-luxe uppercase px-2 py-0.5 border"
                      style={{
                        color: STATUS_COLORS[row.status] ?? "#888",
                        borderColor: `${STATUS_COLORS[row.status] ?? "#888"}40`,
                      }}
                    >
                      {row.status}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/60 mb-1">
                    {row.business} · {row.type} ·{" "}
                    <a href={`mailto:${row.email}`} className="text-gold hover:underline">
                      {row.email}
                    </a>{" "}
                    · {row.phone}
                  </p>
                  <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{row.message}</p>
                  <p className="text-[0.65rem] text-foreground/40 mt-2">
                    {new Date(row.created_at).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {["new", "contacted", "closed"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateRow("enquiries", row.id, { status: s })}
                      className={`text-[0.6rem] tracking-luxe uppercase px-4 py-2 border transition-colors ${row.status === s ? "border-gold text-gold" : "border-border/40 text-foreground/50 hover:border-gold/50 hover:text-gold"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && data?.data && section === "partners" && (
          <div className="space-y-3">
            {data.data.length === 0 && (
              <p className="text-foreground/50 text-sm">No partner registrations yet.</p>
            )}
            {data.data.map((row: any) => (
              <div
                key={row.id}
                className="border border-border/40 p-5 grid md:grid-cols-[1fr_auto] gap-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-serif text-lg">{row.name}</p>
                    <span
                      className="text-[0.6rem] tracking-luxe uppercase px-2 py-0.5 border"
                      style={{
                        color: STATUS_COLORS[row.status] ?? "#888",
                        borderColor: `${STATUS_COLORS[row.status] ?? "#888"}40`,
                      }}
                    >
                      {row.status}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/60 mb-1">
                    {row.company} · {row.business_type} · {row.city}, {row.state}
                  </p>
                  <p className="text-xs text-foreground/60">
                    <a href={`mailto:${row.email}`} className="text-gold hover:underline">
                      {row.email}
                    </a>{" "}
                    · {row.phone}
                  </p>
                  {row.message && <p className="text-sm text-foreground/80 mt-2">{row.message}</p>}
                  <p className="text-[0.65rem] text-foreground/40 mt-2">
                    {new Date(row.created_at).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {["new", "contacted", "approved", "rejected"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateRow("partner_registrations", row.id, { status: s })}
                      className={`text-[0.6rem] tracking-luxe uppercase px-4 py-2 border transition-colors ${row.status === s ? "border-gold text-gold" : "border-border/40 text-foreground/50 hover:border-gold/50 hover:text-gold"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && data?.data && section === "subscribers" && (
          <div className="border border-border/40 divide-y divide-border/30">
            {data.data.length === 0 && (
              <p className="text-foreground/50 text-sm p-6">No subscribers yet.</p>
            )}
            {data.data.map((row: any) => (
              <div key={row.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">{row.email}</p>
                  <p className="text-[0.65rem] text-foreground/40 mt-0.5">
                    {row.source} · {new Date(row.subscribed_at).toLocaleString("en-IN")}
                  </p>
                </div>
                <a
                  href={`mailto:${row.email}`}
                  className="text-[0.6rem] tracking-luxe uppercase text-gold/70 hover:text-gold transition-colors"
                >
                  Email
                </a>
              </div>
            ))}
          </div>
        )}

        {!loading && data?.data && section === "loyalty" && (
          <div className="space-y-3">
            {data.data.length === 0 && (
              <p className="text-foreground/50 text-sm">No loyalty members yet.</p>
            )}
            {data.data.map((row: any) => (
              <div
                key={row.id}
                className="border border-border/40 p-5 grid md:grid-cols-[1fr_auto] gap-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-serif text-lg">{row.name}</p>
                    <span className="text-[0.6rem] tracking-luxe uppercase px-2 py-0.5 border border-gold/30 text-gold">
                      {row.tier}
                    </span>
                    <span className="text-sm font-serif text-gold">{row.points} pts</span>
                  </div>
                  <p className="text-xs text-foreground/60">
                    {row.email} · {row.phone} {row.city ? `· ${row.city}` : ""}
                  </p>
                  {row.instagram_handle && (
                    <p className="text-xs text-foreground/50 mt-0.5">@{row.instagram_handle}</p>
                  )}
                  <p className="text-[0.65rem] text-foreground/40 mt-1">
                    Referral: {row.referral_code} · Joined{" "}
                    {new Date(row.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => awardPoints(row.id, "review")}
                    className="text-[0.6rem] tracking-luxe uppercase px-4 py-2 border border-border/40 text-foreground/50 hover:border-gold/50 hover:text-gold transition-colors"
                  >
                    +Review (50)
                  </button>
                  <button
                    onClick={() => awardPoints(row.id, "instagram_tag")}
                    className="text-[0.6rem] tracking-luxe uppercase px-4 py-2 border border-border/40 text-foreground/50 hover:border-gold/50 hover:text-gold transition-colors"
                  >
                    +Instagram (75)
                  </button>
                  <button
                    onClick={() => awardPoints(row.id, "birthday")}
                    className="text-[0.6rem] tracking-luxe uppercase px-4 py-2 border border-border/40 text-foreground/50 hover:border-gold/50 hover:text-gold transition-colors"
                  >
                    +Birthday (200)
                  </button>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      placeholder="pts"
                      min="1"
                      id={`custom-${row.id}`}
                      className="w-16 bg-transparent border border-border/40 text-foreground text-xs px-2 py-1.5 outline-none focus:border-gold transition-colors"
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(
                          `custom-${row.id}`,
                        ) as HTMLInputElement;
                        const pts = parseInt(input.value);
                        if (!pts || pts <= 0) return;
                        awardPoints(row.id, "purchase", pts);
                        input.value = "";
                      }}
                      className="text-[0.6rem] tracking-luxe uppercase px-3 py-1.5 border border-border/40 text-foreground/50 hover:border-gold/50 hover:text-gold transition-colors"
                    >
                      +Purchase
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && data?.data && section === "users" && (
          <div className="border border-border/40 divide-y divide-border/30">
            {data.data.length === 0 && (
              <p className="text-foreground/50 text-sm p-6">No registered users yet.</p>
            )}
            {data.data.map((row: any) => (
              <div key={row.id} className="px-6 py-4 flex items-center gap-4">
                {row.avatar_url ? (
                  <img
                    src={row.avatar_url}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover border border-gold/20"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-sm">
                    {(row.full_name || row.email || "?")[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-serif">{row.full_name || "—"}</p>
                  <p className="text-xs text-foreground/60">{row.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-[0.6rem] tracking-luxe uppercase text-foreground/40">
                    {row.provider}
                  </p>
                  <p className="text-[0.6rem] text-foreground/30 mt-0.5">
                    {new Date(row.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && data?.data && data.data.length > 0 && section !== "overview" && (
          <div className="flex gap-3 mt-6">
            {page > 1 && (
              <button
                onClick={() => setPage((p) => p - 1)}
                className="text-[0.65rem] tracking-luxe uppercase px-5 py-2.5 border border-border/40 text-foreground/60 hover:text-gold hover:border-gold/50 transition-colors"
              >
                Previous
              </button>
            )}
            {data.data.length === 20 && (
              <button
                onClick={() => setPage((p) => p + 1)}
                className="text-[0.65rem] tracking-luxe uppercase px-5 py-2.5 border border-border/40 text-foreground/60 hover:text-gold hover:border-gold/50 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

type ProductEdit = { price: string; stock: string; purchasable: boolean };

function defaultEdit(row: any): ProductEdit {
  return {
    price: row.price_cents != null ? String(row.price_cents / 100) : "",
    stock: String(row.stock_quantity ?? 0),
    purchasable: row.is_purchasable,
  };
}

function ProductsTable({
  rows,
  onSave,
}: {
  rows: any[];
  onSave: (sku: string, updates: Record<string, unknown>) => void;
}) {
  const [edits, setEdits] = useState<Record<string, ProductEdit>>({});

  const getEdit = (row: any) => edits[row.sku] ?? defaultEdit(row);

  const setEdit = (sku: string, patch: Partial<ProductEdit>) => {
    setEdits((e) => {
      const row = rows.find((r) => r.sku === sku);
      const base =
        e[sku] ?? (row ? defaultEdit(row) : { price: "", stock: "0", purchasable: true });
      return { ...e, [sku]: { ...base, ...patch } };
    });
  };

  const save = (row: any) => {
    const edit = getEdit(row);
    const parsedRupees = parseFloat(edit.price);
    onSave(row.sku, {
      price_cents:
        Number.isFinite(parsedRupees) && edit.price !== "" ? Math.round(parsedRupees * 100) : null,
      stock_quantity: parseInt(edit.stock, 10) || 0,
      is_purchasable: edit.purchasable,
      updated_at: new Date().toISOString(),
    });
  };

  return (
    <div className="border border-border/40 divide-y divide-border/30">
      <div className="px-5 py-3 grid grid-cols-[1fr_120px_100px_90px_90px] gap-3 text-[0.6rem] tracking-luxe uppercase text-foreground/40">
        <span>SKU</span>
        <span>Price (₹)</span>
        <span>Stock</span>
        <span>Buyable</span>
        <span />
      </div>
      {rows.map((row) => {
        const parsed = parseSku(row.sku);
        const edit = getEdit(row);
        return (
          <div
            key={row.sku}
            className="px-5 py-3 grid grid-cols-[1fr_120px_100px_90px_90px] gap-3 items-center"
          >
            <div className="min-w-0">
              <p className="text-sm truncate">
                {parsed ? `${parsed.entry.flavour.name} — ${parsed.format.toUpperCase()}` : row.sku}
              </p>
              <p className="text-[0.6rem] text-foreground/35 font-mono truncate">{row.sku}</p>
            </div>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Unset"
              value={edit.price}
              onChange={(e) => setEdit(row.sku, { price: e.target.value })}
              className="bg-transparent border border-border/40 text-foreground text-sm px-2 py-1.5 outline-none focus:border-gold transition-colors"
            />
            <input
              type="number"
              min="0"
              step="1"
              value={edit.stock}
              onChange={(e) => setEdit(row.sku, { stock: e.target.value })}
              className="bg-transparent border border-border/40 text-foreground text-sm px-2 py-1.5 outline-none focus:border-gold transition-colors"
            />
            <button
              onClick={() => setEdit(row.sku, { purchasable: !edit.purchasable })}
              className={`text-[0.6rem] tracking-luxe uppercase px-2 py-1.5 border transition-colors ${
                edit.purchasable ? "border-gold text-gold" : "border-border/40 text-foreground/50"
              }`}
            >
              {edit.purchasable ? "Yes" : "No"}
            </button>
            <button
              onClick={() => save(row)}
              className="text-[0.6rem] tracking-luxe uppercase px-3 py-1.5 border border-gold/40 text-gold hover:bg-gold/10 transition-colors"
            >
              Save
            </button>
          </div>
        );
      })}
    </div>
  );
}
