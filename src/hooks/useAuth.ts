import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const RETURN_KEY = "rasa_login_return";

async function syncUserRow(u: User) {
  try {
    await supabase.from("users").upsert(
      {
        id: u.id,
        email: u.email!,
        full_name:
          (u.user_metadata?.full_name as string) ??
          (u.user_metadata?.name as string) ??
          null,
        avatar_url: (u.user_metadata?.avatar_url as string) ?? null,
        provider: (u.app_metadata?.provider as string) ?? "google",
        last_sign_in: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
  } catch (e) {
    console.warn("user row sync failed", e);
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Subscribe FIRST so we don't miss the initial SIGNED_IN event.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      const u = session?.user ?? null;
      setUser(u);
      setLoading(false);
      if (event === "SIGNED_IN" && u) {
        // Defer to avoid blocking the auth callback.
        setTimeout(() => void syncUserRow(u), 0);
      }
    });

    // 2. Then hydrate current session.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      // Only overwrite if we don't already have a stored return path,
      // and never store "/login" as a destination.
      const existing = sessionStorage.getItem(RETURN_KEY);
      if (!existing) {
        const here = window.location.pathname;
        sessionStorage.setItem(RETURN_KEY, here === "/login" ? "/" : here);
      }
    } catch {
      /* ignore */
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      console.error("Google sign-in error", error);
      throw error;
    }
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
  }, []);

  const signUpWithPassword = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return { needsEmailConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) throw error;
    } catch (e) {
      console.error("signOut error", e);
    }
    setUser(null);
    try {
      sessionStorage.removeItem(RETURN_KEY);
    } catch {
      /* ignore */
    }
    // Return to a fresh, provider-neutral form after clearing in-memory state.
    window.location.replace("/login");
  }, []);

  return {
    user,
    loading,
    signInWithGoogle,
    signInWithPassword,
    signUpWithPassword,
    signOut,
  };
}
