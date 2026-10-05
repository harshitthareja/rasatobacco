import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({ navigate: vi.fn() }),
  useRouterState: () => "/",
  Link: ({ children, to, ...rest }: any) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/AgeRestrictionPolicyModal", () => ({
  AgeRestrictionPolicyModal: () => null,
}));

vi.mock("@/assets/rasa-logo.png", () => ({ default: "rasa-logo.png" }));

import { AgeGate } from "@/components/AgeGate";

describe("AgeGate", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("renders the gate when not verified", () => {
    render(<AgeGate />);
    expect(screen.getByText(/content intended for adults/i)).toBeTruthy();
  });

  it("does not render when already verified in sessionStorage", () => {
    sessionStorage.setItem("rasa_age_verified", "1");
    const { container } = render(<AgeGate />);
    expect(container.firstChild).toBeNull();
  });

  it("Enter button is disabled until checkbox is checked", () => {
    render(<AgeGate />);
    const enterBtn = screen.getByRole("button", { name: /^enter$/i }) as HTMLButtonElement;
    expect(enterBtn.disabled).toBe(true);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(enterBtn.disabled).toBe(false);
  });

  it("checkbox toggles on click", () => {
    render(<AgeGate />);
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it("sets sessionStorage on Enter after checking", () => {
    render(<AgeGate />);
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /^enter$/i }));
    expect(sessionStorage.getItem("rasa_age_verified")).toBe("1");
  });
});
