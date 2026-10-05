export function formatPrice(paise: number | null | undefined, currency = "INR") {
  if (paise == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(paise / 100);
}

export const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

export const shortId = (id: string) => `#${id.slice(0, 8)}`;

/** "majlis-paan-mint-cigar-60g" → "Majlis · Paan Mint Cigar · 60G" (SKUs are slugified). */
export function skuLabel(sku: string) {
  const parts = sku.split("-");
  if (parts.length < 3) return sku;
  const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const format = parts.pop()!.toUpperCase();
  const collection = title(parts.shift()!);
  return `${collection} · ${parts.map(title).join(" ")} · ${format}`;
}

export function exportCSV(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const cell = (v: unknown) =>
    JSON.stringify(typeof v === "object" && v !== null ? JSON.stringify(v) : (v ?? ""));
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => cell(r[h])).join(",")),
  ].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
