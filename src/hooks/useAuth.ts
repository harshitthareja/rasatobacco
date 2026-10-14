import { useCallback, useSyncExternalStore } from "react";
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
          (u.user_metadata?.full_name as string) ?? (u.user_metadata?.name as string) ?? null,
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

// One auth subscription shared by every component that calls useAuth().
// Product grids mount dozens of cart controls, and a subscription each meant
// dozens of listeners — and a users-row upsert per card on every SIGNED_IN.
type AuthState = { user: User | null; loading: boolean };
const INITIAL_AUTH: AuthState = { user: null, loading: true };
let authState = INITIAL_AUTH;
const authListeners = new Set<() => void>();
let stopAuth: (() => void) | null = null;

function setAuthState(next: Partial<AuthState>) {
  authState = { ...authState, ...next };
  authListeners.forEach((l) => l());
}

function startAuth() {
  let active = true;

  // 1. Subscribe FIRST so we don't miss the initial SIGNED_IN event.
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (!active) return;
    const u = session?.user ?? null;
    setAuthState({ user: u, loading: false });
    if (event === "SIGNED_IN" && u) {
      // Defer to avoid blocking the auth callback.
      setTimeout(() => void syncUserRow(u), 0);
    }
  });

  // 2. Then hydrate current session.
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!active) return;
    setAuthState({ user: session?.user ?? null, loading: false });
  });

  stopAuth = () => {
    active = false;
    subscription.unsubscribe();
  };
}

function subscribeAuth(listener: () => void) {
  authListeners.add(listener);
  if (authListeners.size === 1) startAuth();
  return () => {
    authListeners.delete(listener);
    if (authListeners.size === 0) {
      stopAuth?.();
      stopAuth = null;
      authState = INITIAL_AUTH;
    }
  };
}

export function useAuth() {
  const { user, loading } = useSyncExternalStore(
    subscribeAuth,
    () => authState,
    () => INITIAL_AUTH,
  );

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
    setAuthState({ user: null });
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
