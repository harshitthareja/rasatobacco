-- ── Order writes in one transaction ─────────────────────────────────────────
-- create-order used to insert the order, then its items, then reserve stock
-- and clear the cart as separate requests from the edge function. An
-- interrupted request (tab closed, timeout) could leave an order without
-- items or stock untouched. These functions do it all-or-nothing in one call.

-- Reserves stock for a confirmed order and removes its items from the
-- buyer's cart (items not on sale yet stay there).
CREATE OR REPLACE FUNCTION public.finalize_order(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid;
BEGIN
  SELECT user_id INTO v_user FROM orders WHERE id = p_order_id;

  UPDATE product_prices p
  SET stock_quantity = greatest(0, p.stock_quantity - q.qty), updated_at = now()
  FROM (SELECT sku, sum(quantity) AS qty FROM order_items WHERE order_id = p_order_id GROUP BY sku) q
  WHERE p.sku = q.sku;

  DELETE FROM cart_items
  WHERE user_id = v_user
    AND sku IN (SELECT sku FROM order_items WHERE order_id = p_order_id);
END;
$$;

-- Places an order. p_order: order columns; p_items: [{sku, product_name,
-- collection_name, format, unit_price_cents, quantity}]. Cash on delivery is
-- confirmed at once: stock is checked under lock and reserved, and the
-- ordered items leave the cart. Online orders stay pending until paid
-- (mark_order_paid) and close out the buyer's earlier unpaid attempts.
-- Raises 'OUT_OF_STOCK:<skus>' when a COD item can't be covered.
CREATE OR REPLACE FUNCTION public.place_order(p_order jsonb, p_items jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := (p_order->>'user_id')::uuid;
  v_cod boolean := p_order->>'payment_method' = 'cod';
  v_short text;
  v_id uuid;
BEGIN
  IF jsonb_array_length(coalesce(p_items, '[]'::jsonb)) = 0 THEN
    RAISE EXCEPTION 'EMPTY_ORDER';
  END IF;

  IF v_cod THEN
    PERFORM 1 FROM product_prices
    WHERE sku IN (SELECT DISTINCT x->>'sku' FROM jsonb_array_elements(p_items) x)
    FOR UPDATE;

    SELECT string_agg(q.sku, ', ') INTO v_short
    FROM (SELECT x->>'sku' AS sku, sum((x->>'quantity')::int) AS qty
          FROM jsonb_array_elements(p_items) x GROUP BY 1) q
    LEFT JOIN product_prices p ON p.sku = q.sku
    WHERE coalesce(p.stock_quantity, 0) < q.qty;
    IF v_short IS NOT NULL THEN
      RAISE EXCEPTION 'OUT_OF_STOCK:%', v_short;
    END IF;
  ELSE
    UPDATE orders
    SET status = 'cancelled', payment_error = 'Superseded by a newer checkout', updated_at = now()
    WHERE user_id = v_user AND status = 'pending' AND payment_status = 'pending';
  END IF;

  INSERT INTO orders (
    user_id, status, payment_status, payment_method,
    subtotal_cents, discount_cents, coupon_code, shipping_charge_cents, total_cents, currency,
    shipping_name, shipping_phone, shipping_email, shipping_address_line1, shipping_address_line2,
    shipping_city, shipping_state, shipping_postal_code, shipping_country, notes
  ) VALUES (
    v_user,
    CASE WHEN v_cod THEN 'confirmed' ELSE 'pending' END,
    'pending',
    p_order->>'payment_method',
    (p_order->>'subtotal_cents')::int,
    coalesce((p_order->>'discount_cents')::int, 0),
    nullif(p_order->>'coupon_code', ''),
    (p_order->>'shipping_charge_cents')::int,
    (p_order->>'total_cents')::int,
    coalesce(p_order->>'currency', 'INR'),
    p_order->>'shipping_name', p_order->>'shipping_phone', p_order->>'shipping_email',
    p_order->>'shipping_address_line1', nullif(p_order->>'shipping_address_line2', ''),
    p_order->>'shipping_city', p_order->>'shipping_state', p_order->>'shipping_postal_code',
    coalesce(nullif(p_order->>'shipping_country', ''), 'India'), nullif(p_order->>'notes', '')
  )
  RETURNING id INTO v_id;

  INSERT INTO order_items (
    order_id, sku, product_name, collection_name, format, unit_price_cents, quantity, line_total_cents
  )
  SELECT v_id, x->>'sku', x->>'product_name', coalesce(x->>'collection_name', ''),
         coalesce(x->>'format', ''), (x->>'unit_price_cents')::int, (x->>'quantity')::int,
         (x->>'unit_price_cents')::int * (x->>'quantity')::int
  FROM jsonb_array_elements(p_items) x;

  IF v_cod THEN
    PERFORM public.finalize_order(v_id);
  END IF;

  RETURN v_id;
END;
$$;

-- Marks an online order paid exactly once (verify-payment and the Razorpay
-- webhook may both call it) and finalizes it in the same transaction.
-- Returns the order id, or NULL when no such order exists.
CREATE OR REPLACE FUNCTION public.mark_order_paid(p_razorpay_order_id text, p_payment_id text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  UPDATE orders
  SET payment_status = 'paid', status = 'confirmed', razorpay_payment_id = p_payment_id,
      payment_verified_at = now(), updated_at = now()
  WHERE razorpay_order_id = p_razorpay_order_id AND payment_status IN ('pending', 'failed')
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL THEN
    PERFORM public.finalize_order(v_id);
    RETURN v_id;
  END IF;

  SELECT id INTO v_id FROM orders WHERE razorpay_order_id = p_razorpay_order_id;
  RETURN v_id;
END;
$$;

-- Only the edge functions (service role) may call these.
REVOKE ALL ON FUNCTION public.finalize_order(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.place_order(jsonb, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.mark_order_paid(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_order(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_order_paid(text, text) TO service_role;
