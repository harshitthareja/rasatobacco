import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  open: boolean;
  onClose: () => void;
  reason?: "contact" | "catalogue" | "cart" | "checkout";
};

export function AuthModal({ open, onClose, reason = "contact" }: Props) {
  const { signInWithGoogle, user } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (user && open) onClose();
  }, [user, open, onClose]);

  if (!open) return null;

  const reasonText =
    reason === "catalogue"
      ? "sign in to request the full catalogue"
      : reason === "cart"
        ? "sign in to add items to your cart"
        : reason === "checkout"
          ? "sign in to place your order"
          : "sign in to send your enquiry";

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch {
      setSigningIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-fade-in">
      <div className="absolute inset-0 bg-ink/85 backdrop-blur-md" onClick={onClose} />
      <div
        className="relative w-full max-w-md p-10 text-center animate-fade-up"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.22 0.006 60 / 0.97), oklch(0.14 0.005 60 / 0.99))",
          border: "1px solid oklch(0.78 0.09 48 / 0.3)",
          backdropFilter: "blur(20px)",
          boxShadow:
            "0 30px 80px -20px oklch(0 0 0 / 0.8), 0 0 60px -10px oklch(0.78 0.09 48 / 0.2)",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-foreground/50 hover:text-gold transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <span className="absolute top-0 left-0 w-6 h-px bg-gold" />
        <span className="absolute top-0 left-0 w-px h-6 bg-gold" />
        <span className="absolute top-0 right-0 w-6 h-px bg-gold" />
        <span className="absolute top-0 right-0 w-px h-6 bg-gold" />
        <span className="absolute bottom-0 left-0 w-6 h-px bg-gold" />
        <span className="absolute bottom-0 left-0 w-px h-6 bg-gold" />
        <span className="absolute bottom-0 right-0 w-6 h-px bg-gold" />
        <span className="absolute bottom-0 right-0 w-px h-6 bg-gold" />

        <p className="text-[0.6rem] tracking-luxe uppercase text-gold mb-4">House of RASA</p>
        <h2 className="font-serif text-3xl text-foreground mb-3">Welcome</h2>
        <p className="text-sm text-foreground/70 leading-relaxed mb-8">
          Please {reasonText}. We keep your details safe and use them only to personalise your
          experience.
        </p>

        <button
          onClick={handleGoogleSignIn}
          disabled={signingIn}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-800 text-sm font-medium hover:bg-gray-100 transition-colors duration-300 mb-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {signingIn ? (
            <>
              <span className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin shrink-0" />
              Redirecting to Google…
            </>
          ) : (
            <>
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <p className="text-[0.65rem] text-foreground/40 leading-relaxed">
          By continuing, you agree to our <span className="text-gold/70">Privacy Policy</span> and{" "}
          <span className="text-gold/70">Terms & Conditions</span>.
        </p>
      </div>
    </div>
  );
}
