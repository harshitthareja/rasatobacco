import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

const mocks = vi.hoisted(() => {
  return {
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    onAuthStateChange: vi
      .fn()
      .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    signOut: vi.fn().mockResolvedValue({}),
    upsert: vi.fn().mockReturnValue({ error: null }),
    signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    signUp: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
  };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
      signOut: mocks.signOut,
      signInWithOAuth: mocks.signInWithOAuth,
      signInWithPassword: mocks.signInWithPassword,
      signUp: mocks.signUp,
    },
    from: () => ({ upsert: mocks.upsert }),
  },
}));

import { useAuth } from "@/hooks/useAuth";

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({ data: { session: null } });
    mocks.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it("initialises with loading true and user null", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it("sets loading false after session check", async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it("exposes all sign-in and sign-out functions", () => {
    const { result } = renderHook(() => useAuth());
    expect(typeof result.current.signInWithGoogle).toBe("function");
    expect(typeof result.current.signInWithPassword).toBe("function");
    expect(typeof result.current.signUpWithPassword).toBe("function");
    expect(typeof result.current.signOut).toBe("function");
  });

  it("calls supabase signInWithOAuth with google provider on signInWithGoogle()", async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await result.current.signInWithGoogle();
    expect(mocks.signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: "google" }),
    );
  });

  it("signs in with a trimmed email and password", async () => {
    const { result } = renderHook(() => useAuth());
    await result.current.signInWithPassword("  member@example.com ", "password123");
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: "member@example.com",
      password: "password123",
    });
  });

  it("creates an email account and reports when confirmation is required", async () => {
    const { result } = renderHook(() => useAuth());
    const response = await result.current.signUpWithPassword("new@example.com", "password123");
    expect(mocks.signUp).toHaveBeenCalledWith(
      expect.objectContaining({ email: "new@example.com", password: "password123" }),
    );
    expect(response.needsEmailConfirmation).toBe(true);
  });

  it("calls supabase signOut on signOut()", async () => {
    const replaceSpy = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, replace: replaceSpy, href: "http://localhost/" },
    });
    const { result } = renderHook(() => useAuth());
    await result.current.signOut();
    expect(mocks.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(replaceSpy).toHaveBeenCalledWith("/login");
  });

  it("shares one auth subscription across many components", async () => {
    const hooks = Array.from({ length: 5 }, () => renderHook(() => useAuth()));
    await waitFor(() => expect(hooks[4].result.current.loading).toBe(false));
    expect(mocks.onAuthStateChange).toHaveBeenCalledTimes(1);
    expect(mocks.getSession).toHaveBeenCalledTimes(1);
  });

  it("syncs the users row once per sign-in, not once per component", async () => {
    const user = { id: "u1", email: "a@b.c", user_metadata: {}, app_metadata: {} };
    const hooks = Array.from({ length: 5 }, () => renderHook(() => useAuth()));
    await waitFor(() => expect(hooks[0].result.current.loading).toBe(false));
    const onChange = mocks.onAuthStateChange.mock.calls[0][0];
    act(() => onChange("SIGNED_IN", { user }));
    await waitFor(() => expect(hooks[0].result.current.user).toEqual(user));
    await waitFor(() => expect(mocks.upsert).toHaveBeenCalledTimes(1));
  });
});
