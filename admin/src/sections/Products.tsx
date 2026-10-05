import { useState } from "react";
import { adminUpdate } from "../lib/api";
import { skuLabel } from "../lib/format";
import { usePaged } from "../lib/usePaged";
import { Button, Empty, ErrorNote, Loading, Pager } from "../components/ui";

type ProductRow = {
  sku: string;
  price_cents: number | null;
  currency: string;
  stock_quantity: number;
  is_purchasable: boolean;
  sale_price_cents: number | null;
  sale_ends_at: string | null;
};

type Edit = { price: string; sale: string; saleEnds: string; stock: string; purchasable: boolean };

// <input type="datetime-local"> works in local time without a zone.
const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const saleActive = (r: ProductRow) =>
  r.sale_price_cents != null && !!r.sale_ends_at && new Date(r.sale_ends_at).getTime() > Date.now();

const toEdit = (r: ProductRow): Edit => ({
  price: r.price_cents != null ? String(r.price_cents / 100) : "",
  sale: r.sale_price_cents != null ? String(r.sale_price_cents / 100) : "",
  saleEnds: toLocalInput(r.sale_ends_at),
  stock: String(r.stock_quantity ?? 0),
  purchasable: r.is_purchasable,
});

export function Products() {
  const { rows, count, page, setPage, loading, error, reload } = usePaged<ProductRow>("products");
  const [edits, setEdits] = useState<Record<string, Edit>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const edit = (r: ProductRow) => edits[r.sku] ?? toEdit(r);
  const patch = (r: ProductRow, p: Partial<Edit>) =>
    setEdits((e) => ({ ...e, [r.sku]: { ...edit(r), ...p } }));
  const dirty = (r: ProductRow) => {
    const e = edits[r.sku];
    if (!e) return false;
    const o = toEdit(r);
    return (Object.keys(o) as (keyof Edit)[]).some((k) => e[k] !== o[k]);
  };

  const save = async (r: ProductRow) => {
    const e = edit(r);
    const rupees = parseFloat(e.price);
    const saleRupees = parseFloat(e.sale);
    const hasSale = e.sale !== "" && Number.isFinite(saleRupees);
    if (hasSale && !e.saleEnds) {
      setSaveError(`${r.sku}: set when the sale ends`);
      return;
    }
    setSaving(r.sku);
    setSaveError(null);
    try {
      await adminUpdate(
        "product_prices",
        r.sku,
        {
          price_cents: e.price !== "" && Number.isFinite(rupees) ? Math.round(rupees * 100) : null,
          sale_price_cents: hasSale ? Math.round(saleRupees * 100) : null,
          sale_ends_at: hasSale ? new Date(e.saleEnds).toISOString() : null,
          stock_quantity: Math.max(0, parseInt(e.stock, 10) || 0),
          is_purchasable: e.purchasable,
          updated_at: new Date().toISOString(),
        },
        "sku",
      );
      setEdits(({ [r.sku]: _, ...rest }) => rest);
      await reload();
    } catch (err) {
      setSaveError(`${r.sku}: ${(err as Error).message}`);
    }
    setSaving(null);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!rows.length) return <Empty>No products.</Empty>;

  return (
    <div>
      {saveError && <ErrorNote>{saveError}</ErrorNote>}
      <p className="text-xs text-foreground/50 mb-4">
        A product can be bought only when it has a price, stock above zero and “Buyable” is on. A
        sale price applies until its end time, then the regular price returns automatically.
      </p>
      <div className="border border-border divide-y divide-border overflow-x-auto">
        <div className="min-w-[900px] px-5 py-3 grid grid-cols-[1fr_100px_100px_190px_80px_70px_80px] gap-3 text-[0.6rem] tracking-luxe uppercase text-foreground/40">
          <span>Product</span>
          <span>Price (₹)</span>
          <span>Sale (₹)</span>
          <span>Sale ends</span>
          <span>Stock</span>
          <span>Buyable</span>
          <span />
        </div>
        {rows.map((r) => {
          const e = edit(r);
          return (
            <div
              key={r.sku}
              className="min-w-[900px] px-5 py-3 grid grid-cols-[1fr_100px_100px_190px_80px_70px_80px] gap-3 items-center"
            >
              <div className="min-w-0">
                <p className="text-sm truncate">{skuLabel(r.sku)}</p>
                <p className="text-[0.6rem] text-foreground/35 font-mono truncate">
                  {r.sku}
                  {saleActive(r) && <span className="ml-2 text-gold">ON SALE</span>}
                </p>
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Unset"
                value={e.price}
                onChange={(ev) => patch(r, { price: ev.target.value })}
                className="bg-transparent border border-border text-sm px-2 py-1.5 outline-none focus:border-gold"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="None"
                value={e.sale}
                onChange={(ev) => patch(r, { sale: ev.target.value })}
                className="bg-transparent border border-border text-sm px-2 py-1.5 outline-none focus:border-gold"
              />
              <input
                type="datetime-local"
                value={e.saleEnds}
                onChange={(ev) => patch(r, { saleEnds: ev.target.value })}
                className="bg-transparent border border-border text-xs px-2 py-1.5 outline-none focus:border-gold"
              />
              <input
                type="number"
                min="0"
                step="1"
                value={e.stock}
                onChange={(ev) => patch(r, { stock: ev.target.value })}
                className={`bg-transparent border text-sm px-2 py-1.5 outline-none focus:border-gold ${
                  Number(e.stock) <= 0 ? "border-destructive/50" : "border-border"
                }`}
              />
              <button
                onClick={() => patch(r, { purchasable: !e.purchasable })}
                className={`text-[0.6rem] tracking-luxe uppercase px-2 py-1.5 border ${
                  e.purchasable ? "border-gold text-gold" : "border-border text-foreground/50"
                }`}
              >
                {e.purchasable ? "Yes" : "No"}
              </button>
              <Button
                variant={dirty(r) ? "primary" : "outline"}
                busy={saving === r.sku}
                onClick={() => save(r)}
              >
                Save
              </Button>
            </div>
          );
        })}
      </div>
      <Pager page={page} count={count} onPage={setPage} />
    </div>
  );
}
