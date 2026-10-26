-- Read-only health check printed by the "Supabase database setup" workflow.
SELECT json_build_object(
  'orders_columns', (SELECT array_agg(column_name ORDER BY column_name) FROM information_schema.columns
                     WHERE table_schema = 'public' AND table_name = 'orders'),
  'tables', (SELECT array_agg(table_name ORDER BY table_name) FROM information_schema.tables
             WHERE table_schema = 'public'),
  'orders_total', (SELECT count(*) FROM public.orders),
  'orders_by_status', (SELECT json_object_agg(k, n) FROM (
      SELECT status || '/' || payment_status AS k, count(*) AS n FROM public.orders GROUP BY 1) s),
  'latest_orders', (SELECT json_agg(o) FROM (
      SELECT id, status, payment_status, created_at FROM public.orders ORDER BY created_at DESC LIMIT 5) o),
  'cart_items', (SELECT count(*) FROM public.cart_items),
  -- Orders possibly cut off part-way before order writes became atomic.
  'orders_without_items', (SELECT json_agg(o) FROM (
      SELECT o.id, o.status, o.payment_method, o.payment_status, o.total_cents, o.shipping_name, o.created_at
      FROM public.orders o
      WHERE NOT EXISTS (SELECT 1 FROM public.order_items i WHERE i.order_id = o.id)
      ORDER BY o.created_at DESC LIMIT 50) o),
  'unpaid_online_orders_last_14d', (SELECT json_agg(o) FROM (
      SELECT id, status, payment_status, payment_error, total_cents, created_at FROM public.orders
      WHERE payment_method = 'razorpay' AND payment_status <> 'paid'
        AND created_at > now() - interval '14 days'
      ORDER BY created_at DESC LIMIT 50) o),
  'cod_orders_last_14d', (SELECT json_agg(o) FROM (
      SELECT o.id, o.status, o.total_cents, o.created_at,
             (SELECT count(*) FROM public.order_items i WHERE i.order_id = o.id) AS items
      FROM public.orders o
      WHERE o.payment_method = 'cod' AND o.created_at > now() - interval '14 days'
      ORDER BY o.created_at DESC LIMIT 50) o),
  'order_functions', (SELECT array_agg(proname ORDER BY proname) FROM pg_proc
      WHERE pronamespace = 'public'::regnamespace
        AND proname IN ('place_order', 'finalize_order', 'mark_order_paid')),
  'orderable_skus', (SELECT array_agg(sku ORDER BY sku) FROM public.product_prices
                     WHERE is_purchasable AND price_cents IS NOT NULL AND stock_quantity > 0),
  'store_settings', (SELECT row_to_json(s) FROM public.store_settings s WHERE id = 1),
  'admins', (SELECT count(*) FROM public.user_roles WHERE role = 'admin'),
  'cart_policies', (SELECT json_agg(json_build_object('name', policyname, 'cmd', cmd))
                    FROM pg_policies WHERE schemaname = 'public' AND tablename = 'cart_items'),
  'cart_rls_enabled', (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.cart_items'::regclass),
  'cart_grants_authenticated', (SELECT array_agg(privilege_type ORDER BY privilege_type)
                    FROM information_schema.role_table_grants
                    WHERE table_schema = 'public' AND table_name = 'cart_items' AND grantee = 'authenticated'),
  'auth_users', (SELECT count(*) FROM auth.users),
  'last_sign_in', (SELECT max(last_sign_in_at) FROM auth.users)
) AS health;
