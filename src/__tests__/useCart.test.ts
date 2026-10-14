import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  user: { id: "u1" } as { id: string } | null,
  rows: [{ sku: "majlis-commissioner-20g", quantity: 2 }],
  select: vi.fn(),
  insert: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: mocks.user, loading: false }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => {
            mocks.select();
            return Promise.resolve({ data: mocks.rows });
          },
        }),
      }),
      insert: mocks.insert,
    }),
  },
}));

import { useCart } from "@/hooks/useCart";

describe("useCart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.user = { id: "u1" };
  });

  it("loads the cart once for many components and shares it", async () => {
    const hooks = Array.from({ length: 6 }, () => renderHook(() => useCart()));
    await waitFor(() => expect(hooks[5].result.current.loading).toBe(false));
    expect(hooks.every((h) => h.result.current.count === 2)).toBe(true);
    expect(mocks.select).toHaveBeenCalledTimes(1);
  });

  it("updates every component after adding an item", async () => {
    const a = renderHook(() => useCart());
    const b = renderHook(() => useCart());
    await waitFor(() => expect(a.result.current.loading).toBe(false));
    mocks.rows = [...mocks.rows, { sku: "accessories-lion-mouth-tip-black", quantity: 1 }];
    await act(() => a.result.current.addItem("accessories-lion-mouth-tip-black"));
    expect(mocks.insert).toHaveBeenCalledWith(
      expect.objectContaining({ sku: "accessories-lion-mouth-tip-black", quantity: 1 }),
    );
    await waitFor(() => expect(b.result.current.count).toBe(3));
  });
});
