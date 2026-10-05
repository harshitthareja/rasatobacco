import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  signInWithGoogle: vi.fn().mockResolvedValue(undefined),
  signOut: vi.fn().mockResolvedValue(undefined),
  useAuthReturn: { user: null as any, loading: false, signInWithGoogle: null as any, signOut: null as any },
}));
mocks.useAuthReturn.signInWithGoogle = mocks.signInWithGoogle;
mocks.useAuthReturn.signOut = mocks.signOut;

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mocks.useAuthReturn,
}));

import { AuthModal } from "@/components/AuthModal";

describe("AuthModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<AuthModal open={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders and shows contact reason text when open", () => {
    render(<AuthModal open={true} onClose={() => {}} reason="contact" />);
    expect(screen.getByText(/send your enquiry/i)).toBeTruthy();
  });

  it("shows catalogue reason text", () => {
    render(<AuthModal open={true} onClose={() => {}} reason="catalogue" />);
    expect(screen.getByText(/request the full catalogue/i)).toBeTruthy();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(<AuthModal open={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText(/close/i));
    expect(onClose).toHaveBeenCalled();
  });

  it("triggers signInWithGoogle when Google button clicked", () => {
    render(<AuthModal open={true} onClose={() => {}} />);
    const btn = screen.getByRole("button", { name: /google/i });
    fireEvent.click(btn);
    expect(mocks.signInWithGoogle).toHaveBeenCalled();
  });
});
