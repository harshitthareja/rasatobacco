import { describe, it, expect, vi } from "vitest";

const mockInvoke = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke: mockInvoke },
  },
}));

describe("Newsletter subscription", () => {
  it("validates email format", () => {
    const isValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    expect(isValid("test@example.com")).toBe(true);
    expect(isValid("invalid-email")).toBe(false);
    expect(isValid("")).toBe(false);
    expect(isValid("a@b.c")).toBe(true);
  });

  it("rejects empty email", () => {
    const isValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    expect(isValid("")).toBe(false);
    expect(isValid("   ")).toBe(false);
  });
});
