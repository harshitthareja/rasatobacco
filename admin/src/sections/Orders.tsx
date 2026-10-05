import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink, RefreshCw, Search } from "lucide-react";
import { adminData, adminShipping, adminUpdate } from "../lib/api";
import { exportCSV, formatDate, formatPrice, shortId } from "../lib/format";
import { usePaged } from "../lib/usePaged";
import {
  hasActiveShipment,
  orderTotal,
  type Order,
  type StoreSettingsRow,
  type TrackingEvent,
  type Warehouse,
} from "../lib/types";
import {
  Badge,
  Button,
  Empty,
  ErrorNote,
  Input,
  Loading,
  ORDER_STATUS_TONE,
  PAYMENT_TONE,
  Pager,
  Select,
} from "../components/ui";

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

type Notice = { tone: "ok" | "error"; text: string } | null;

export function Orders() {
  const [status, setStatus] = useState(() => {
    const preset = sessionStorage.getItem("rasa-admin-order-status");
    sessionStorage.removeItem("rasa-admin-order-status");
    return preset ?? "";
  });
  const [payment, setPayment] = useState("active");
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const { rows, count, page, setPage, loading, error, reload } = usePaged<Order>("orders", {
    status,
    payment,
    q: search,
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState<Notice>(null);
  const [bulkBusy, setBulkBusy] = useState<string | null>(null);
  const [settings, setSettings] = useState<StoreSettingsRow | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[] | null>(null);
  const [warehouseError, setWarehouseError] = useState<string | null>(null);

  useEffect(() => {
    adminData<{ data: StoreSettingsRow }>("settings").then(
      (r) => setSettings(r.data),
      () => {},
    );
  }, []);

  useEffect(() => setSelected(new Set()), [rows]);

  const warehousesRequested = useRef(false);
  const loadWarehouses = useCallback(() => {
    if (warehousesRequested.current) return;
    warehousesRequested.current = true;
    adminShipping<{ warehouses: Warehouse[] }>("warehouses").then(
      (r) => setWarehouses(r.warehouses ?? []),
      (e) => setWarehouseError(e.message),
    );
  }, []);

  const runBulk = async (action: "pickup" | "label" | "sync_all") => {
    setBulkBusy(action);
    setNotice(null);
    try {
      if (action === "sync_all") {
        const r = await adminShipping<{ synced: number; errors: string[] }>("sync_all");
        setNotice({
          tone: r.errors.length ? "error" : "ok",
          text: `Refreshed tracking for ${r.synced} shipment(s).${r.errors.length ? ` Errors: ${r.errors.join("; ")}` : ""}`,
        });
      } else if (action === "pickup") {
        const r = await adminShipping<{ message: string; failed: string[] }>("pickup", {
          order_ids: [...selected],
        });
        setNotice({
          tone: r.failed.length ? "error" : "ok",
          text: `${r.message}${r.failed.length ? ` — failed: ${r.failed.join("; ")}` : ""}`,
        });
      } else {
        const r = await adminShipping<{ label_url: string }>("label", { order_ids: [...selected] });
        window.open(r.label_url, "_blank", "noopener");
      }
      await reload();
    } catch (e) {
      setNotice({ tone: "error", text: (e as Error).message });
    }
    setBulkBusy(null);
  };

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-44">
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="to_ship">Ready to ship</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-40">
          <Select label="Payment" value={payment} onChange={(e) => setPayment(e.target.value)}>
            <option value="active">To fulfil (paid + COD)</option>
            <option value="cod">Cash on delivery</option>
            <option value="paid">Paid</option>
            <option value="pending">Unpaid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="">All checkouts</option>
          </Select>
        </div>
        <form
          className="flex items-end gap-2 flex-1 min-w-[220px]"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchDraft.trim());
          }}
        >
          <Input
            label="Search"
            placeholder="Name, email, phone, AWB, payment id"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
          />
          <Button type="submit" variant="ghost" aria-label="Search">
            <Search className="h-3.5 w-3.5" />
          </Button>
        </form>
        <Button variant="ghost" busy={bulkBusy === "sync_all"} onClick={() => runBulk("sync_all")}>
          <RefreshCw className="h-3.5 w-3.5" /> Sync tracking
        </Button>
        <Button
          variant="ghost"
          disabled={!rows.length}
          onClick={() => exportCSV(flatten(rows), "orders")}
        >
          Export CSV
        </Button>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 border border-gold/40 bg-gold/5 px-4 py-3">
          <span className="text-sm">{selected.size} shipment(s) selected</span>
          <Button busy={bulkBusy === "pickup"} onClick={() => runBulk("pickup")}>
            Schedule pickup
          </Button>
          <Button busy={bulkBusy === "label"} onClick={() => runBulk("label")}>
            Print labels
          </Button>
          <Button variant="ghost" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {notice && (
        <p
          className={`text-sm px-4 py-3 border ${
            notice.tone === "ok"
              ? "border-success/40 text-success"
              : "border-destructive/40 text-destructive"
          }`}
        >
          {notice.text}
        </p>
      )}

      {error && <ErrorNote>{error}</ErrorNote>}
      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <Empty>No orders match these filters.</Empty>
      ) : (
        <div className="space-y-3">
          {rows.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              selected={selected.has(o.id)}
              onToggle={() => toggle(o.id)}
              onChanged={reload}
              settings={settings}
              warehouses={warehouses}
              warehouseError={warehouseError}
              loadWarehouses={loadWarehouses}
            />
          ))}
        </div>
      )}
      <Pager page={page} count={count} onPage={setPage} />
    </div>
  );
}

function flatten(rows: Order[]) {
  return rows.map(({ order_items, shipment_events, ...o }) => ({
    ...o,
    items: order_items.map((i) => `${i.product_name} ${i.format} x${i.quantity}`).join("; "),
  }));
}

function OrderCard({
  order,
  selected,
  onToggle,
  onChanged,
  settings,
  warehouses,
  warehouseError,
  loadWarehouses,
}: {
  order: Order;
  selected: boolean;
  onToggle: () => void;
  onChanged: () => Promise<void>;
  settings: StoreSettingsRow | null;
  warehouses: Warehouse[] | null;
  warehouseError: string | null;
  loadWarehouses: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const active = hasActiveShipment(order);

  const setStatus = async (status: string) => {
    if (status === order.status) return;
    if (
      status === "cancelled" &&
      active &&
      !confirm(
        "This order has an active shipment. Cancel the shipment first if it should not be delivered. Continue?",
      )
    ) {
      return;
    }
    setStatusBusy(true);
    try {
      await adminUpdate("orders", order.id, { status, updated_at: new Date().toISOString() });
      await onChanged();
    } catch (e) {
      alert((e as Error).message);
    }
    setStatusBusy(false);
  };

  return (
    <div className={`border ${selected ? "border-gold/60" : "border-border"}`}>
      <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
        <input
          type="checkbox"
          checked={selected}
          disabled={!active}
          onChange={onToggle}
          title={active ? "Select for bulk pickup / labels" : "No active shipment"}
          className="accent-[var(--color-gold)] disabled:opacity-20"
        />
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 text-left">
          {open ? (
            <ChevronDown className="h-4 w-4 text-gold" />
          ) : (
            <ChevronRight className="h-4 w-4 text-foreground/40" />
          )}
          <span className="font-serif text-lg">{shortId(order.id)}</span>
        </button>
        {order.payment_method === "cod" && <Badge tone="gold">COD</Badge>}
        <Badge tone={PAYMENT_TONE[order.payment_status] ?? "muted"}>{order.payment_status}</Badge>
        <Badge tone={ORDER_STATUS_TONE[order.status] ?? "muted"}>{order.status}</Badge>
        {order.shipment_status && (
          <Badge tone={order.shipment_status === "cancelled" ? "red" : "blue"}>
            {order.shipment_status}
          </Badge>
        )}
        <span className="text-sm text-foreground/70 truncate max-w-[220px]">
          {order.shipping_name}
        </span>
        <span className="text-xs text-foreground/40">{order.shipping_city}</span>
        <span className="ml-auto flex items-center gap-4">
          <span className="text-xs text-foreground/40 hidden sm:inline">
            {formatDate(order.created_at)}
          </span>
          <span className="font-serif text-gold text-lg">
            {formatPrice(orderTotal(order), order.currency)}
          </span>
        </span>
      </div>

      {open && (
        <div className="border-t border-border grid lg:grid-cols-[1fr_1fr] gap-6 p-5">
          <div className="space-y-5 text-sm">
            <section>
              <h3 className="text-[0.6rem] tracking-luxe uppercase text-foreground/45 mb-2">
                Customer
              </h3>
              <p>{order.shipping_name}</p>
              <p className="text-foreground/70">
                <a href={`tel:${order.shipping_phone}`} className="hover:text-gold">
                  {order.shipping_phone}
                </a>{" "}
                ·{" "}
                <a href={`mailto:${order.shipping_email}`} className="text-gold hover:underline">
                  {order.shipping_email}
                </a>
              </p>
              <p className="text-foreground/60 mt-1">
                {order.shipping_address_line1}
                {order.shipping_address_line2 ? `, ${order.shipping_address_line2}` : ""},{" "}
                {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code},{" "}
                {order.shipping_country}
              </p>
              {order.notes && <p className="text-foreground/50 italic mt-1">“{order.notes}”</p>}
            </section>

            <section>
              <h3 className="text-[0.6rem] tracking-luxe uppercase text-foreground/45 mb-2">
                Items
              </h3>
              <div className="space-y-1">
                {order.order_items.map((i) => (
                  <div key={i.id} className="flex justify-between gap-3">
                    <span>
                      {i.product_name}{" "}
                      <span className="text-foreground/50">
                        · {i.collection_name} · {i.format} × {i.quantity}
                      </span>
                    </span>
                    <span className="text-foreground/70">
                      {formatPrice(i.line_total_cents, order.currency)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-foreground/60 pt-2 border-t border-border">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal_cents, order.currency)}</span>
                </div>
                <div className="flex justify-between text-foreground/60">
                  <span>Shipping</span>
                  <span>{formatPrice(order.shipping_charge_cents, order.currency)}</span>
                </div>
                <div className="flex justify-between text-gold">
                  <span>Total</span>
                  <span>{formatPrice(orderTotal(order), order.currency)}</span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[0.6rem] tracking-luxe uppercase text-foreground/45 mb-2">
                Payment
              </h3>
              <dl className="grid grid-cols-[130px_1fr] gap-y-1 text-foreground/70">
                <dt className="text-foreground/45">Method</dt>
                <dd>{order.payment_method === "cod" ? "Cash on delivery" : "Razorpay (online)"}</dd>
                <dt className="text-foreground/45">Status</dt>
                <dd>
                  {order.payment_status}
                  {order.payment_method === "cod" && order.payment_status !== "paid" && (
                    <span className="text-foreground/45">
                      {" "}
                      · collect {formatPrice(orderTotal(order), order.currency)}
                    </span>
                  )}
                </dd>
                <dt className="text-foreground/45">Razorpay order</dt>
                <dd className="font-mono text-xs break-all">{order.razorpay_order_id ?? "—"}</dd>
                <dt className="text-foreground/45">Payment id</dt>
                <dd className="font-mono text-xs break-all">{order.razorpay_payment_id ?? "—"}</dd>
                <dt className="text-foreground/45">Verified</dt>
                <dd>{formatDate(order.payment_verified_at)}</dd>
                {order.payment_error && (
                  <>
                    <dt className="text-foreground/45">Note</dt>
                    <dd className="text-destructive/80">{order.payment_error}</dd>
                  </>
                )}
              </dl>
            </section>

            <section>
              <h3 className="text-[0.6rem] tracking-luxe uppercase text-foreground/45 mb-2">
                Order status
              </h3>
              <div className="flex flex-wrap gap-2">
                {ORDER_STATUSES.map((s) => (
                  <Button
                    key={s}
                    variant={order.status === s ? "outline" : "ghost"}
                    disabled={statusBusy}
                    onClick={() => setStatus(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </section>
          </div>

          <ShipmentPanel
            order={order}
            onChanged={onChanged}
            settings={settings}
            warehouses={warehouses}
            warehouseError={warehouseError}
            loadWarehouses={loadWarehouses}
          />
        </div>
      )}
    </div>
  );
}

function ShipmentPanel({
  order,
  onChanged,
  settings,
  warehouses,
  warehouseError,
  loadWarehouses,
}: {
  order: Order;
  onChanged: () => Promise<void>;
  settings: StoreSettingsRow | null;
  warehouses: Warehouse[] | null;
  warehouseError: string | null;
  loadWarehouses: () => void;
}) {
  const active = hasActiveShipment(order);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<Notice>(null);

  const act = async (action: string, extra: Record<string, unknown> = {}) => {
    setBusy(action);
    setMessage(null);
    try {
      const r = await adminShipping<{
        message?: string;
        failed?: string[];
        label_url?: string;
        tracking_number?: string;
      }>(action, {
        order_id: order.id,
        ...extra,
      });
      if (r.label_url) window.open(r.label_url, "_blank", "noopener");
      if (r.failed?.length)
        setMessage({ tone: "error", text: `${r.message ?? ""} — failed: ${r.failed.join("; ")}` });
      else if (r.message || r.tracking_number) {
        setMessage({
          tone: "ok",
          text: `${r.message ?? "Done"}${r.tracking_number ? ` — AWB ${r.tracking_number}` : ""}`,
        });
      }
      await onChanged();
    } catch (e) {
      setMessage({ tone: "error", text: (e as Error).message });
    }
    setBusy(null);
  };

  return (
    <div className="border border-border bg-surface/30 p-5 space-y-4 h-fit">
      <h3 className="text-[0.6rem] tracking-luxe uppercase text-gold">Shipment · Flexi</h3>

      {order.payment_status !== "paid" && order.payment_method !== "cod" ? (
        <p className="text-sm text-foreground/55">
          Shipments can be booked once the order is paid.
        </p>
      ) : order.status === "cancelled" ? (
        <p className="text-sm text-foreground/55">Order is cancelled.</p>
      ) : active ? (
        <>
          <dl className="grid grid-cols-[110px_1fr] gap-y-1 text-sm">
            <dt className="text-foreground/45">AWB</dt>
            <dd className="font-mono">{order.shipment_tracking_number}</dd>
            <dt className="text-foreground/45">Status</dt>
            <dd>{order.shipment_status ?? "—"}</dd>
            <dt className="text-foreground/45">Booked</dt>
            <dd>{formatDate(order.shipment_created_at)}</dd>
            <dt className="text-foreground/45">Pickup</dt>
            <dd>
              {order.shipment_pickup_scheduled_at
                ? formatDate(order.shipment_pickup_scheduled_at)
                : "Not scheduled"}
            </dd>
            <dt className="text-foreground/45">Last sync</dt>
            <dd>{formatDate(order.shipment_synced_at)}</dd>
          </dl>
          <div className="flex flex-wrap gap-2">
            {!order.shipment_pickup_scheduled_at && (
              <Button variant="primary" busy={busy === "pickup"} onClick={() => act("pickup")}>
                Schedule pickup
              </Button>
            )}
            <Button busy={busy === "label"} onClick={() => act("label")}>
              Label
            </Button>
            {order.shipment_label_url && (
              <a
                href={order.shipment_label_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[0.62rem] tracking-luxe uppercase px-3 py-2 text-foreground/60 hover:text-gold"
              >
                Last label <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <Button variant="ghost" busy={busy === "track"} onClick={() => act("track")}>
              <RefreshCw className="h-3.5 w-3.5" /> Track
            </Button>
            <Button
              variant="danger"
              busy={busy === "cancel"}
              onClick={() => {
                if (confirm(`Cancel shipment ${order.shipment_tracking_number}?`)) act("cancel");
              }}
            >
              Cancel shipment
            </Button>
          </div>
          <Timeline events={order.shipment_events ?? []} />
        </>
      ) : (
        <BookShipmentForm
          order={order}
          settings={settings}
          warehouses={warehouses}
          warehouseError={warehouseError}
          loadWarehouses={loadWarehouses}
          busy={busy === "create"}
          onSubmit={(payload) => act("create", payload)}
        />
      )}

      {message && (
        <p className={`text-xs ${message.tone === "ok" ? "text-success" : "text-destructive"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}

function BookShipmentForm({
  order,
  settings,
  warehouses,
  warehouseError,
  loadWarehouses,
  busy,
  onSubmit,
}: {
  order: Order;
  settings: StoreSettingsRow | null;
  warehouses: Warehouse[] | null;
  warehouseError: string | null;
  loadWarehouses: () => void;
  busy: boolean;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  useEffect(() => {
    loadWarehouses();
  }, [loadWarehouses]);

  const [form, setForm] = useState(() => ({
    length: String(settings?.default_box_length_cm ?? 20),
    breadth: String(settings?.default_box_breadth_cm ?? 15),
    height: String(settings?.default_box_height_cm ?? 10),
    weight: String(settings?.default_box_weight_kg ?? 0.5),
    warehouse_code: settings?.flexi_warehouse_code ?? "",
    rto_warehouse_code: settings?.flexi_rto_warehouse_code ?? "",
    courier_code: settings?.flexi_courier_code != null ? String(settings.flexi_courier_code) : "",
    hsn_code: settings?.hsn_code ?? "2403",
  }));

  // Pre-select Flexi's default warehouse when settings don't name one.
  useEffect(() => {
    if (!form.warehouse_code && warehouses?.length) {
      const def = warehouses.find((w) => w.default) ?? warehouses[0];
      setForm((f) => ({ ...f, warehouse_code: String(def.warehouse_id) }));
    }
  }, [warehouses, form.warehouse_code]);

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          box: {
            length: form.length,
            breadth: form.breadth,
            height: form.height,
            weight: form.weight,
          },
          warehouse_code: form.warehouse_code,
          rto_warehouse_code: form.rto_warehouse_code || form.warehouse_code,
          courier_code: form.courier_code || undefined,
          hsn_code: form.hsn_code,
        });
      }}
    >
      {order.shipment_status === "cancelled" && (
        <p className="text-xs text-foreground/50">
          Previous shipment {order.shipment_tracking_number} was cancelled.
        </p>
      )}
      <div className="grid grid-cols-4 gap-2">
        <Input
          label="L (cm)"
          type="number"
          step="0.1"
          min="0.1"
          value={form.length}
          onChange={set("length")}
          required
        />
        <Input
          label="B (cm)"
          type="number"
          step="0.1"
          min="0.1"
          value={form.breadth}
          onChange={set("breadth")}
          required
        />
        <Input
          label="H (cm)"
          type="number"
          step="0.1"
          min="0.1"
          value={form.height}
          onChange={set("height")}
          required
        />
        <Input
          label="Kg"
          type="number"
          step="0.01"
          min="0.01"
          value={form.weight}
          onChange={set("weight")}
          required
        />
      </div>
      {warehouses && warehouses.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          <Select
            label="Pickup warehouse"
            value={form.warehouse_code}
            onChange={set("warehouse_code")}
            required
          >
            {warehouses.map((w) => (
              <option key={w.warehouse_id} value={w.warehouse_id}>
                {w.name} {w.city ? `· ${w.city}` : ""} {w.default ? "(default)" : ""}
              </option>
            ))}
          </Select>
          <Select
            label="RTO warehouse"
            value={form.rto_warehouse_code}
            onChange={set("rto_warehouse_code")}
          >
            <option value="">Same as pickup</option>
            {warehouses.map((w) => (
              <option key={w.warehouse_id} value={w.warehouse_id}>
                {w.name}
              </option>
            ))}
          </Select>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Warehouse code"
              value={form.warehouse_code}
              onChange={set("warehouse_code")}
              required
            />
            <Input
              label="RTO warehouse code"
              value={form.rto_warehouse_code}
              onChange={set("rto_warehouse_code")}
            />
          </div>
          {warehouseError && (
            <p className="text-xs text-destructive/80">
              Couldn't load Flexi warehouses: {warehouseError}
            </p>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Courier code (optional)"
          type="number"
          value={form.courier_code}
          onChange={set("courier_code")}
        />
        <Input label="HSN code" value={form.hsn_code} onChange={set("hsn_code")} required />
      </div>
      <Button type="submit" variant="primary" busy={busy} className="w-full py-2.5">
        Book shipment
      </Button>
    </form>
  );
}

function Timeline({ events }: { events: TrackingEvent[] }) {
  if (!events.length)
    return (
      <p className="text-xs text-foreground/45">No tracking events yet — use Track to refresh.</p>
    );
  const when = (t: string) => {
    const n = Number(t);
    return n > 0 ? new Date(n < 1e12 ? n * 1000 : n).toLocaleString("en-IN") : t;
  };
  return (
    <ol className="border-l border-gold/25 ml-1 space-y-3 max-h-72 overflow-y-auto pr-2">
      {events.map((ev, i) => (
        <li key={ev.id ?? i} className="pl-4 relative">
          <span
            className={`absolute -left-[4.5px] top-1.5 h-2 w-2 rounded-full ${i === 0 ? "bg-gold" : "bg-foreground/25"}`}
          />
          <p className="text-sm">{ev.message || ev.status}</p>
          <p className="text-[0.65rem] text-foreground/45">
            {ev.location} · {when(ev.event_time)}
          </p>
        </li>
      ))}
    </ol>
  );
}
