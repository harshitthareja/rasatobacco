import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const configError =
  !url || !key ? "Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in admin/.env" : null;

// Separate storage key so an admin session never collides with a storefront
// session if both apps are ever served from the same origin.
export const supabase = createClient(url ?? "http://localhost", key ?? "missing", {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: "rasa-admin-auth" },
});
