import { useState } from "react";
import { Button, ErrorNote, Input } from "./ui";

// The PIN is a screen in front of the sign-in form. It is checked in the
// browser, so it hides the console from casual visitors; the account password
// and the admin role (checked by the edge functions) are what grant access.
// The unlock lives only in memory, so every page load asks for the PIN again.
const PIN = "8811";
const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 30_000;

export function PinLock({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Date.now() < lockedUntil) {
      setError("Too many attempts. Try again in a few seconds.");
      return;
    }
    if (pin === PIN) {
      onUnlock();
      return;
    }
    const next = attempts + 1;
    setPin("");
    if (next >= MAX_ATTEMPTS) {
      setAttempts(0);
      setLockedUntil(Date.now() + COOLDOWN_MS);
      setError("Too many attempts. Try again in 30 seconds.");
    } else {
      setAttempts(next);
      setError("Incorrect PIN.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm border border-gold/30 bg-surface/40 p-10 space-y-5"
      >
        <div className="text-center mb-4">
          <p className="text-[0.6rem] tracking-luxe uppercase text-gold mb-3">RASA</p>
          <h1 className="font-serif text-3xl">Enter PIN</h1>
        </div>
        <Input
          label="Access PIN"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={8}
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          required
        />
        {error && <ErrorNote>{error}</ErrorNote>}
        <Button type="submit" variant="primary" className="w-full py-3">
          Unlock
        </Button>
      </form>
    </div>
  );
}
