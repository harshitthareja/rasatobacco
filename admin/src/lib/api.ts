import { supabase } from "./supabase";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

const base = () => `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

/**
 * Calls an admin edge function with the signed-in admin's access token. The
 * functions check public.user_roles server-side; nothing here is trusted.
 */
export async function callFunction<T>(
  name: string,
  opts: {
    method?: "GET" | "POST";
    query?: Record<string, string | number | undefined>;
    body?: unknown;
  } = {},
): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new ApiError("Signed out", 401);

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(opts.query ?? {})) {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  }
  const res = await fetch(`${base()}/${name}${qs.size ? `?${qs}` : ""}`, {
    method: opts.method ?? (opts.body ? "POST" : "GET"),
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok || payload?.error) {
    throw new ApiError(payload?.error ?? `Request failed (${res.status})`, res.status);
  }
  return payload as T;
}

export const adminData = <T>(
  section: string,
  query: Record<string, string | number | undefined> = {},
) => callFunction<T>("admin-data", { query: { section, ...query } });

export const adminUpdate = (
  table: string,
  id: string | number,
  updates: Record<string, unknown>,
  idColumn?: string,
) => callFunction<{ ok: true }>("admin-update", { body: { table, id, updates, idColumn } });

export const adminShipping = <T>(action: string, body: Record<string, unknown> = {}) =>
  callFunction<T>("admin-shipping", { body: { action, ...body } });
