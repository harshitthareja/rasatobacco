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
