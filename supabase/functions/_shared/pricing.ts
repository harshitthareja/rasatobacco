// Prices a cart for create-order. Kept free of Deno/Supabase imports so the
// website's integration tests run this exact code (src/__tests__/integration).
import { applyPairOffer } from './offers.ts'

export type CartRow = { sku: string; quantity: number }
export type PriceRow = {
  sku: string
  price_cents: number | null
  sale_price_cents: number | null
  sale_ends_at: string | null
  is_purchasable: boolean
  stock_quantity: number
}
export type StoreSettings = {
  shipping_flat_cents: number
  free_shipping_threshold_cents: number | null
} | null
export type LineItem = { sku: string; quantity: number; unit_price_cents: number; offer?: boolean }

export type PricedCart =
  | {
      ok: true
      lineItems: LineItem[]
      subtotal: number
      shippingCharge: number
      total: number
      /** Cart items that can't be ordered yet; they stay in the cart. */
      skipped: string[]
    }
  | { ok: false; status: number; error: string }

export function priceCart(
  cart: CartRow[],
  prices: PriceRow[],
  settings: StoreSettings,
  nameOf: (sku: string) => string = (sku) => sku,
  now = Date.now(),
): PricedCart {
  if (cart.length === 0) return { ok: false, status: 400, error: 'Your cart is empty' }
  const priceMap = new Map(prices.map((p) => [p.sku, p]))

  let lineItems: LineItem[] = []
  const skipped: string[] = []
  for (const item of cart) {
    const p = priceMap.get(item.sku)
    // Items that aren't on sale yet are left out, as the cart and checkout
    // pages tell the buyer — they don't block the rest of the order.
    if (!p || !p.is_purchasable || p.price_cents == null) {
      skipped.push(item.sku)
      continue
    }
    if (p.stock_quantity < item.quantity) {
      return { ok: false, status: 409, error: `Not enough stock for ${nameOf(item.sku)}` }
    }
    const onSale =
      p.sale_price_cents != null && p.sale_ends_at != null && new Date(p.sale_ends_at).getTime() > now
    const unit = onSale ? (p.sale_price_cents as number) : p.price_cents
    lineItems.push({ sku: item.sku, quantity: item.quantity, unit_price_cents: unit })
  }
  if (lineItems.length === 0) {
    return { ok: false, status: 409, error: 'Nothing in your cart is available for purchase right now' }
  }

  // Any two mouth tips for ₹150: paired tips become their own line at the offer price.
  lineItems = applyPairOffer(lineItems)
  const subtotal = lineItems.reduce((sum, li) => sum + li.unit_price_cents * li.quantity, 0)

  // Free delivery only when the subtotal is above the threshold.
  const threshold = settings?.free_shipping_threshold_cents
  const shippingCharge =
    threshold != null && subtotal > threshold ? 0 : (settings?.shipping_flat_cents ?? 0)
  const total = subtotal + shippingCharge
  if (total < 100) return { ok: false, status: 400, error: 'Order total must be at least ₹1' }

  return { ok: true, lineItems, subtotal, shippingCharge, total, skipped }
}
