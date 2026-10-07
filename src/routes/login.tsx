import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import rasaLogo from "@/assets/rasa-logo.png";
import { EmailPasswordAuth } from "@/components/EmailPasswordAuth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — RASA" },
      { property: "og:title", content: "Sign In — RASA" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const {
    user,
    loading,
    signInWithGoogle,
    signInWithPassword,
    signUpWithPassword,
  } = useAuth();
  const navigate = useNavigate();
  const redirected = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user || redirected.current) return;
    redirected.current = true;
    let returnTo = "/";
    try {
      returnTo = sessionStorage.getItem("rasa_login_return") || "/";
      sessionStorage.removeItem("rasa_login_return");
    } catch {
      /* ignore */
    }
    if (returnTo === "/login") returnTo = "/";
    navigate({ to: returnTo as "/" });
  }, [user, loading, navigate]);

  const handleGoogle = async () => {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setBusy(false);
      setError(e instanceof Error ? e.message : "Sign-in failed. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen bg-ink flex items-center justify-center overflow-hidden px-4 py-3">
      <div className="absolute inset-0 smoke-bg opacity-80 pointer-events-none" />
      <div className="absolute inset-0 grain pointer-events-none" />

      <div
        className="relative z-10 w-full max-w-md"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.22 0.006 60 / 0.85), oklch(0.14 0.005 60 / 0.95))",
          border: "1px solid oklch(0.78 0.09 48 / 0.35)",
          backdropFilter: "blur(24px)",
          boxShadow:
            "0 40px 100px -20px oklch(0 0 0 / 0.8), 0 0 60px -10px oklch(0.78 0.09 48 / 0.2)",
        }}
      >
        <div className="px-6 py-5 text-center sm:px-8">
          <div className="mb-2 flex justify-center">
            <img src={rasaLogo} alt="RASA" className="h-10 w-auto" draggable={false} />
          </div>
          <p className="mb-1 text-[0.6rem] uppercase tracking-luxe text-gold">Welcome</p>
          <h1 className="mb-1 font-serif text-3xl text-foreground">Your Account</h1>
          <p className="mb-4 text-xs leading-relaxed text-foreground/65">
            Sign in or create an account to manage your RASA experience.
          </p>

          {loading || (user && redirected.current) ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-6 h-6 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
            </div>
          ) : (
            <>
              <EmailPasswordAuth signIn={signInWithPassword} signUp={signUpWithPassword} />

              <div className="my-3 flex items-center gap-3 text-[0.6rem] uppercase tracking-luxe text-foreground/35">
                <span className="h-px flex-1 bg-border/60" />
                Or
                <span className="h-px flex-1 bg-border/60" />
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={busy}
                className="mb-2 flex w-full items-center justify-center gap-3 bg-white px-6 py-3 text-sm font-medium text-gray-800 transition-all duration-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}
              >
                {busy ? (
                  <span className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin" />
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                {busy ? "Signing in…" : "Continue with Google"}
              </button>

              {error && (
                <p className="text-xs text-red-400/90 mb-4">{error}</p>
              )}

              <p className="text-[0.6rem] text-foreground/35 leading-relaxed">
                By continuing, you agree to our Privacy Policy and Terms &
                Conditions.
              </p>
            </>
          )}

          <div className="luxe-divider mb-3 mt-4" />
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[0.65rem] tracking-luxe uppercase text-foreground/50 hover:text-gold transition-colors duration-300"
          >
            ← Back to Site
          </Link>
        </div>
      </div>
    </div>
  );
}
