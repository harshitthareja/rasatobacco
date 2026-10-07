import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  signInWithGoogle: vi.fn().mockResolvedValue(undefined),
  signInWithPassword: vi.fn().mockResolvedValue(undefined),
  signUpWithPassword: vi.fn().mockResolvedValue({ needsEmailConfirmation: true }),
  signOut: vi.fn().mockResolvedValue(undefined),
  useAuthReturn: {
    user: null as any,
    loading: false,
    signInWithGoogle: null as any,
    signInWithPassword: null as any,
    signUpWithPassword: null as any,
    signOut: null as any,
  },
}));
mocks.useAuthReturn.signInWithGoogle = mocks.signInWithGoogle;
mocks.useAuthReturn.signInWithPassword = mocks.signInWithPassword;
mocks.useAuthReturn.signUpWithPassword = mocks.signUpWithPassword;
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

  it("signs in with email and password", async () => {
    render(<AuthModal open={true} onClose={() => {}} />);
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "member@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getAllByRole("button", { name: /^sign in$/i })[1]);
    await waitFor(() =>
      expect(mocks.signInWithPassword).toHaveBeenCalledWith(
        "member@example.com",
        "password123",
      ),
    );
  });

  it("creates an account with email and password", async () => {
    render(<AuthModal open={true} onClose={() => {}} />);
    fireEvent.click(screen.getAllByRole("button", { name: /create account/i })[0]);
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "new@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getAllByRole("button", { name: /^create account$/i })[1]);
    await waitFor(() =>
      expect(mocks.signUpWithPassword).toHaveBeenCalledWith(
        "new@example.com",
        "password123",
      ),
    );
    expect(await screen.findByText(/check your email/i)).toBeTruthy();
  });
});
