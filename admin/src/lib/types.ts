export type OrderItem = {
  id: string;
  sku: string;
  product_name: string;
  collection_name: string;
  format: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
};

export type TrackingEvent = {
  id?: string;
  event_time: string;
  location: string;
  message: string;
  status: string;
  ship_status?: string;
};

export type Order = {
  id: string;
  user_id: string;
  status: string;
  payment_status: string;
  subtotal_cents: number;
  shipping_charge_cents: number;
  total_cents: number | null;
  currency: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_email: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  notes: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  payment_verified_at: string | null;
  payment_error: string | null;
  shipment_tracking_number: string | null;
  shipment_status: string | null;
  shipment_created_at: string | null;
  shipment_pickup_scheduled_at: string | null;
  shipment_label_url: string | null;
  shipment_events: TrackingEvent[] | null;
  shipment_synced_at: string | null;
  created_at: string;
  order_items: OrderItem[];
};

export type StoreSettingsRow = {
  id: number;
  shipping_flat_cents: number;
  free_shipping_threshold_cents: number | null;
  default_box_length_cm: number;
  default_box_breadth_cm: number;
  default_box_height_cm: number;
  default_box_weight_kg: number;
  hsn_code: string;
  flexi_courier_code: number | null;
  flexi_warehouse_code: string | null;
  flexi_rto_warehouse_code: string | null;
};

export type Warehouse = {
  warehouse_id: string;
  name: string;
  city?: string;
  zipcode?: string;
  default?: boolean;
};

export const orderTotal = (
  o: Pick<Order, "total_cents" | "subtotal_cents" | "shipping_charge_cents">,
) => o.total_cents ?? o.subtotal_cents + (o.shipping_charge_cents ?? 0);

export const hasActiveShipment = (o: Order) =>
  !!o.shipment_tracking_number && o.shipment_status !== "cancelled";
