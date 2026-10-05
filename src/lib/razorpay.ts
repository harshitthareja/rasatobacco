// Razorpay Standard Checkout (https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/).
// Only the public key id ever reaches the browser — the key secret lives in
// the create-order / verify-payment Supabase edge functions.

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type RazorpayFailure = {
  error: {
    code?: string;
    description?: string;
    reason?: string;
    metadata?: Record<string, string>;
  };
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void; confirm_close?: boolean };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", cb: (response: RazorpayFailure) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

let loading: Promise<void> | null = null;

export function loadRazorpay(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.Razorpay) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = CHECKOUT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        loading = null;
        reject(
          new Error("Could not load the payment gateway. Check your connection and try again."),
        );
      };
      document.body.appendChild(script);
    });
  }
  return loading;
}

export type CheckoutOutcome =
  { type: "success"; response: RazorpaySuccess } | { type: "dismissed"; failure?: string };

/**
 * Opens the Razorpay modal and resolves once the buyer pays or closes it.
 * Razorpay lets buyers retry inside the modal after a failed attempt, so a
 * payment.failed event is remembered and reported only if they then close it.
 */
export async function openRazorpayCheckout(
  options: Omit<RazorpayOptions, "handler" | "modal">,
): Promise<CheckoutOutcome> {
  await loadRazorpay();
  return new Promise((resolve) => {
    let lastFailure: string | undefined;
    const rzp = new window.Razorpay!({
      ...options,
      handler: (response) => resolve({ type: "success", response }),
      modal: {
        confirm_close: true,
        ondismiss: () => resolve({ type: "dismissed", failure: lastFailure }),
      },
    });
    rzp.on("payment.failed", (response) => {
      lastFailure = response.error?.description ?? "Payment failed";
    });
    rzp.open();
  });
}
