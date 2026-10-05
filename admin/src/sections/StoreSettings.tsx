import { useEffect, useState } from "react";
import { adminData, adminUpdate } from "../lib/api";
import type { StoreSettingsRow } from "../lib/types";
import { Button, ErrorNote, Input, Loading } from "../components/ui";

type Form = Record<
  | "shipping_flat"
  | "free_threshold"
  | "length"
  | "breadth"
  | "height"
  | "weight"
  | "hsn_code"
  | "courier_code"
  | "warehouse_code"
  | "rto_warehouse_code",
  string
>;

const toForm = (s: StoreSettingsRow): Form => ({
  shipping_flat: String(s.shipping_flat_cents / 100),
  free_threshold:
    s.free_shipping_threshold_cents != null ? String(s.free_shipping_threshold_cents / 100) : "",
  length: String(s.default_box_length_cm),
  breadth: String(s.default_box_breadth_cm),
  height: String(s.default_box_height_cm),
  weight: String(s.default_box_weight_kg),
  hsn_code: s.hsn_code,
  courier_code: s.flexi_courier_code != null ? String(s.flexi_courier_code) : "",
  warehouse_code: s.flexi_warehouse_code ?? "",
  rto_warehouse_code: s.flexi_rto_warehouse_code ?? "",
});

const paise = (rupees: string) => Math.max(0, Math.round(parseFloat(rupees || "0") * 100));

export function StoreSettings() {
  const [form, setForm] = useState<Form | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminData<{ data: StoreSettingsRow | null }>("settings").then(
      (r) =>
        r.data
          ? setForm(toForm(r.data))
          : setError("store_settings row missing — run the latest migration."),
      (e) => setError(e.message),
    );
  }, []);

  if (error && !form) return <ErrorNote>{error}</ErrorNote>;
  if (!form) return <Loading />;

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaved(false);
    setForm({ ...form, [k]: e.target.value });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await adminUpdate("store_settings", 1, {
        shipping_flat_cents: paise(form.shipping_flat),
        free_shipping_threshold_cents:
          form.free_threshold === "" ? null : paise(form.free_threshold),
        default_box_length_cm: Number(form.length),
        default_box_breadth_cm: Number(form.breadth),
        default_box_height_cm: Number(form.height),
        default_box_weight_kg: Number(form.weight),
        hsn_code: form.hsn_code.trim() || "2403",
        flexi_courier_code: form.courier_code === "" ? null : Number(form.courier_code),
        flexi_warehouse_code: form.warehouse_code.trim() || null,
        flexi_rto_warehouse_code: form.rto_warehouse_code.trim() || null,
        updated_at: new Date().toISOString(),
      });
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    }
    setBusy(false);
  };

  return (
    <form onSubmit={save} className="max-w-2xl space-y-8">
      <section className="space-y-3">
        <h2 className="text-[0.62rem] tracking-luxe uppercase text-gold">
          Delivery fee (charged at checkout)
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input
            label="Delivery fee (₹)"
            type="number"
            min="0"
            step="0.01"
            value={form.shipping_flat}
            onChange={set("shipping_flat")}
          />
          <Input
            label="Free delivery above (₹, blank = never)"
            type="number"
            min="0"
            step="0.01"
            value={form.free_threshold}
            onChange={set("free_threshold")}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[0.62rem] tracking-luxe uppercase text-gold">
          Flexi shipment defaults
        </h2>
        <p className="text-xs text-foreground/50">
          Pre-filled when booking a shipment; can be changed per order.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input
            label="Length (cm)"
            type="number"
            step="0.1"
            min="0.1"
            value={form.length}
            onChange={set("length")}
          />
          <Input
            label="Breadth (cm)"
            type="number"
            step="0.1"
            min="0.1"
            value={form.breadth}
            onChange={set("breadth")}
          />
          <Input
            label="Height (cm)"
            type="number"
            step="0.1"
            min="0.1"
            value={form.height}
            onChange={set("height")}
          />
          <Input
            label="Weight (kg)"
            type="number"
            step="0.01"
            min="0.01"
            value={form.weight}
            onChange={set("weight")}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input label="HSN code" value={form.hsn_code} onChange={set("hsn_code")} />
          <Input
            label="Courier code"
            type="number"
            value={form.courier_code}
            onChange={set("courier_code")}
          />
          <Input
            label="Warehouse code"
            value={form.warehouse_code}
            onChange={set("warehouse_code")}
          />
          <Input
            label="RTO warehouse code"
            value={form.rto_warehouse_code}
            onChange={set("rto_warehouse_code")}
          />
        </div>
      </section>

      {error && <ErrorNote>{error}</ErrorNote>}
      <div className="flex items-center gap-4">
        <Button type="submit" variant="primary" busy={busy}>
          Save settings
        </Button>
        {saved && <span className="text-xs text-success">Saved</span>}
      </div>
    </form>
  );
}
