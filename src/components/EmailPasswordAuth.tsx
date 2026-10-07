import { useState } from "react";

type AuthMode = "signin" | "signup";

type Props = {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ needsEmailConfirmation: boolean }>;
};

export function EmailPasswordAuth({ signIn, signUp }: Props) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError(null);
    setMessage(null);
    setPassword("");
    setConfirmPassword("");
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        const result = await signUp(email, password);
        if (result.needsEmailConfirmation) {
          setMessage("Check your email to confirm your account, then sign in.");
          setPassword("");
          setConfirmPassword("");
        }
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Authentication failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div
        className="mb-3 grid grid-cols-2 border border-border/60 p-1"
        aria-label="Choose authentication mode"
      >
        {(["signin", "signup"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => changeMode(item)}
            className={`px-3 py-2 text-[0.65rem] uppercase tracking-luxe transition-colors ${
              mode === item ? "bg-gold text-ink" : "text-foreground/55 hover:text-gold"
            }`}
          >
            {item === "signin" ? "Sign In" : "Create Account"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-2.5 text-left">
        <label className="block">
          <span className="mb-1 block text-[0.6rem] uppercase tracking-luxe text-gold/80">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            autoComplete="email"
            required
            className="w-full border border-border/70 bg-ink/50 px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-gold"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[0.6rem] uppercase tracking-luxe text-gold/80">
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={8}
            className="w-full border border-border/70 bg-ink/50 px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-gold"
            placeholder="Minimum 8 characters"
          />
        </label>

        {mode === "signup" && (
          <label className="block">
            <span className="mb-1 block text-[0.6rem] uppercase tracking-luxe text-gold/80">
              Confirm Password
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.currentTarget.value)}
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full border border-border/70 bg-ink/50 px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-gold"
              placeholder="Repeat your password"
            />
          </label>
        )}

        {error && <p role="alert" className="text-xs text-red-400/90">{error}</p>}
        {message && <p role="status" className="text-xs leading-relaxed text-gold">{message}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-gold px-6 py-3 text-[0.7rem] font-medium uppercase tracking-luxe text-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
        </button>
      </form>
    </div>
  );
}
