import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Button, ErrorNote, Input } from "./ui";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (err) setError(err.message);
    setBusy(false);
  };

  const google = async () => {
    setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (err) setError(err.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={signIn}
        className="w-full max-w-sm border border-gold/30 bg-surface/40 p-10 space-y-5"
      >
        <div className="text-center mb-4">
          <p className="text-[0.6rem] tracking-luxe uppercase text-gold mb-3">RASA</p>
          <h1 className="font-serif text-3xl">Admin Console</h1>
        </div>
        <Input
          label="Email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <ErrorNote>{error}</ErrorNote>}
        <Button type="submit" variant="primary" busy={busy} className="w-full py-3">
          Sign In
        </Button>
        <div className="flex items-center gap-3 text-[0.6rem] tracking-luxe uppercase text-foreground/30">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>
        <Button type="button" variant="ghost" onClick={google} className="w-full py-3">
          Continue with Google
        </Button>
        <p className="text-[0.65rem] text-foreground/40 text-center leading-relaxed">
          Access is limited to accounts with the admin role.
        </p>
      </form>
    </div>
  );
}
