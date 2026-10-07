import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  insert: vi.fn().mockResolvedValue({ error: null }),
  invoke: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({ insert: mocks.insert })),
    functions: { invoke: mocks.invoke },
  },
}));

import { subscribeToNewsletter } from "@/lib/newsletter";

describe("Newsletter subscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.insert.mockResolvedValue({ error: null });
    mocks.invoke.mockResolvedValue({ error: null });
  });

  it("validates email format", () => {
    const isValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    expect(isValid("test@example.com")).toBe(true);
    expect(isValid("invalid-email")).toBe(false);
    expect(isValid("")).toBe(false);
    expect(isValid("a@b.c")).toBe(true);
  });

  it("saves a normalized subscription and requests a confirmation email", async () => {
    const result = await subscribeToNewsletter("  MEMBER@Example.com ", "footer");

    expect(mocks.insert).toHaveBeenCalledWith({
      email: "member@example.com",
      source: "footer",
    });
    expect(mocks.invoke).toHaveBeenCalledWith("newsletter", {
      body: { email: "member@example.com", source: "footer" },
    });
    expect(result.confirmationSent).toBe(true);
  });

  it("keeps the subscription successful when confirmation email delivery fails", async () => {
    mocks.invoke.mockResolvedValue({ error: new Error("mail unavailable") });

    const result = await subscribeToNewsletter("member@example.com", "popup");

    expect(result.confirmationSent).toBe(false);
  });

  it("accepts an email that is already subscribed", async () => {
    mocks.insert.mockResolvedValue({ error: { code: "23505" } });

    await expect(
      subscribeToNewsletter("member@example.com", "footer"),
    ).resolves.toEqual({ confirmationSent: true });
  });
});
