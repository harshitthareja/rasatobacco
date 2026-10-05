export function formatPrice(cents: number | null | undefined, currency = "INR") {
  if (cents == null) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
