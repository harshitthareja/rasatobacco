import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * supabase.functions.invoke, but a non-2xx response yields the function's own
 * `{ error }` message instead of the generic "non-2xx status code" text.
 */
export async function invokeFunction<T>(
  name: string,
  body: Record<string, unknown>,
): Promise<{ data: T | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    let message = error.message;
    if (error instanceof FunctionsHttpError) {
      try {
        const payload = await error.context.json();
        if (payload?.error) message = payload.error;
      } catch {
        /* keep generic message */
      }
    }
    return { data: null, error: message };
  }
  if (data?.error) return { data: null, error: data.error };
  return { data: data as T, error: null };
}
