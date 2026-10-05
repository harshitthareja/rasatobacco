// Flexi (flexiworld.in) Customer ORDER API client.
// Base URL, login and warehouse codes come from Supabase function secrets.

export class FlexiError extends Error {
  constructor(message: string, public status: number, public details?: unknown) {
    super(message)
  }
}

const baseUrl = () =>
  (Deno.env.get('FLEXI_BASE_URL') ?? 'https://uat.flexiworld.in/api/v1/customer').replace(/\/$/, '')

// Edge function instances are reused between requests, so cache the token
// briefly instead of logging in on every call.
let cachedToken: { value: string; at: number } | null = null
const TOKEN_TTL_MS = 30 * 60 * 1000

async function login(): Promise<string> {
  const email = Deno.env.get('FLEXI_EMAIL')
  const password = Deno.env.get('FLEXI_PASSWORD')
  if (!email || !password) throw new FlexiError('Flexi credentials are not configured', 500)
  const res = await fetch(`${baseUrl()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok || !body.token) {
    throw new FlexiError(body.error ?? body.message ?? 'Flexi login failed', 502, body)
  }
  cachedToken = { value: body.token, at: Date.now() }
  return body.token
}

async function token(force = false) {
  if (!force && cachedToken && Date.now() - cachedToken.at < TOKEN_TTL_MS) return cachedToken.value
  return await login()
}

async function call<T>(method: 'GET' | 'POST', path: string, body?: unknown, retried = false): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    method,
    headers: { Authorization: `Bearer ${await token(retried)}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (res.status === 401 && !retried) return call<T>(method, path, body, true)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error(`Flexi ${path} failed`, res.status, data)
    throw new FlexiError(data.error ?? data.message ?? `Flexi request failed (${res.status})`, 502, data)
  }
  return data as T
}

export type FlexiAddress = {
  first_name: string
  last_name: string
  contact_no: string
  company: string
  gst: string
  address_1: string
  address_2: string
  pincode: string
  city: string
  state: string
}

export type FlexiItem = { item_name: string; qnt: number; amt: number; hsnCode: string; sku: string }

export type FlexiBox = {
  length: number
  breadth: number
  height: number
  weight: number
  invoice_no: string
  items: FlexiItem[]
}

export type FlexiShipmentRequest = {
  pay_mode: 'prepaid' | 'cod'
  order_no: string
  billing: FlexiAddress
  shipping: FlexiAddress
  currency: string
  policy_accepted: boolean
  total_amt: number
  ship_charges: number
  box_data: FlexiBox[]
  courier_code?: number
  warehouse_code: string
  rto_warehouse_code: string
}

export type FlexiTrackingEvent = {
  id: string
  awb_number: string
  event_time: string
  status_code: string
  location: string
  message: string
  status: string
  ship_status: string
  rto_awb: string
}

export const flexi = {
  warehouses: () => call<{ warehouses: Record<string, unknown>[] }>('GET', '/shipment/warehouses'),
  createShipment: (payload: FlexiShipmentRequest) =>
    call<{ message: string; tracking_number: string }>('POST', '/shipment/create', payload),
  schedulePickup: (trackingNumbers: string[]) =>
    call<{ message: string; failed?: string[] }>('POST', '/shipment/pickup', { tracking_numbers: trackingNumbers }),
  cancel: (trackingNumbers: string[]) =>
    call<{ message: string; failed?: string[] }>('POST', '/shipment/cancel', { tracking_numbers: trackingNumbers }),
  track: (trackingNumber: string) =>
    call<{ data: { shipper_details?: Record<string, unknown>; tracking_history?: FlexiTrackingEvent[] } }>(
      'POST',
      '/shipment/track',
      { tracking_number: trackingNumber },
    ),
  label: (trackingNumbers: string[]) =>
    call<{ label_url: string }>('POST', '/shipment/generate-label', { tracking_numbers: trackingNumbers }),
}

/** Most recent tracking event first (Flexi returns newest-first, but don't rely on it). */
export function sortTracking(events: FlexiTrackingEvent[] = []) {
  return [...events].sort((a, b) => Number(b.event_time) - Number(a.event_time))
}

/** Maps Flexi's latest ship_status / status onto our order + shipment status. */
export function deriveStatuses(latest: FlexiTrackingEvent | undefined) {
  if (!latest) return null
  const ship = (latest.ship_status || latest.status || '').toLowerCase()
  const shipmentStatus = ship || latest.status || 'unknown'
  let orderStatus: string | null = null
  if (ship.includes('delivered') && !ship.includes('rto')) orderStatus = 'delivered'
  else if (ship.includes('rto') || latest.rto_awb) orderStatus = null
  else if (ship.includes('transit') || ship.includes('out for delivery') || ship.includes('picked')) orderStatus = 'shipped'
  return { shipmentStatus, orderStatus }
}
