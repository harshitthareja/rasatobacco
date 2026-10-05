import { createClient, type SupabaseClient, type User } from 'https://esm.sh/@supabase/supabase-js@2'

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })

export function serviceClient(): SupabaseClient {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
}

/** Resolves the signed-in Supabase user from the request's bearer token, or null. */
export async function getUser(req: Request): Promise<User | null> {
  const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
  if (!token) return null
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!
  const authClient = createClient(Deno.env.get('SUPABASE_URL')!, anonKey)
  const { data, error } = await authClient.auth.getUser(token)
  if (error || !data.user) return null
  return data.user
}

/**
 * Admin access is granted only by a row in public.user_roles, which no client
 * can read or write (RLS on, no policies) — it is managed via SQL/service role.
 * Returns a Response to send back when the caller is not an admin.
 */
export async function requireAdmin(
  req: Request,
  db: SupabaseClient,
): Promise<{ user: User } | { response: Response }> {
  const user = await getUser(req)
  if (!user) return { response: json({ error: 'Sign in required' }, 401) }
  const { data: role } = await db
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle()
  if (!role) return { response: json({ error: 'Not an administrator' }, 403) }
  return { user }
}
