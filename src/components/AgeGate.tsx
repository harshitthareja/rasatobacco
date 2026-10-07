import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import rasaLogo from "@/assets/rasa-logo.png";
import { AgeRestrictionPolicyModal } from "@/components/AgeRestrictionPolicyModal";

const AGE_KEY = "rasa_age_verified";
const BYPASS = ["/age-restricted", "/login", "/test-email"];

const readVerified = () => {
  try {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(AGE_KEY) === "1";
  } catch {
    return false;
  }
};

const saveVerified = () => {
  try {
    window.sessionStorage.setItem(AGE_KEY, "1");
  } catch {}
};

export function AgeGate() {
  const [checked, setChecked] = useState(false);
  const [verified, setVerified] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const confirmedByWindow =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("age-confirmation") === "on";
  const confirmedByUrl = confirmedByWindow;

  useEffect(() => {
    if (confirmedByUrl) {
      saveVerified();
      setVerified(true);
      window.history.replaceState(null, "", pathname + window.location.hash);
      return;
    }

    if (readVerified()) {
      setVerified(true);
    }
  }, [confirmedByUrl, pathname]);

  const handleEnter = () => {
    if (!checked) return;

    saveVerified();
    setVerified(true);
    setExiting(true);
  };

  if (verified || confirmedByUrl || BYPASS.includes(pathname)) return null;

  return (
    <>
      <style>
        {`
          .age-gate-form .age-gate-enter {
            background: rgba(201,169,110,0.35);
            color: rgba(10,8,7,0.55);
            cursor: not-allowed;
          }

          .age-gate-form:has(#age-confirmation:checked) .age-gate-enter {
            background: #c9a96e;
            color: #0a0807;
            cursor: pointer;
          }
        `}
      </style>
      <div
        className={`fixed inset-0 z-[120] flex items-center justify-center px-6 transition-opacity duration-500 ${
          exiting ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        style={{ background: "rgba(10, 8, 7, 0.97)" }}
      >
        <div
          className="relative w-full max-w-lg border border-gold/30 px-6 py-8 text-center md:px-10 md:py-9"
          style={{
            background: "rgba(14, 11, 9, 0.96)",
            boxShadow:
              "0 30px 80px -20px rgba(0,0,0,0.8), 0 0 60px -10px rgba(211,161,136,0.15)",
          }}
        >
          <span className="pointer-events-none absolute left-0 top-0 h-px w-8 bg-gold" />
          <span className="pointer-events-none absolute left-0 top-0 h-8 w-px bg-gold" />
          <span className="pointer-events-none absolute right-0 top-0 h-px w-8 bg-gold" />
          <span className="pointer-events-none absolute right-0 top-0 h-8 w-px bg-gold" />
          <span className="pointer-events-none absolute bottom-0 left-0 h-px w-8 bg-gold" />
          <span className="pointer-events-none absolute bottom-0 left-0 h-8 w-px bg-gold" />
          <span className="pointer-events-none absolute bottom-0 right-0 h-px w-8 bg-gold" />
          <span className="pointer-events-none absolute bottom-0 right-0 h-8 w-px bg-gold" />

          <div className="mb-2 flex flex-col items-center">
            <img
              src={rasaLogo}
              alt="RASA"
              width={728}
              height={292}
              className="h-16 w-auto md:h-20"
            />
            <p className="mt-3 font-display text-base uppercase md:text-lg" style={{ color: "#DEA193" }}>
              SMOKE, PERFECTED
            </p>
          </div>

          <div className="luxe-divider my-6" />

          <p className="font-serif text-xl leading-snug text-balance text-foreground/95 md:text-2xl">
            This website contains content intended for adults.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Please confirm you are 18 years of age or older.
          </p>

          <div className="luxe-divider my-6" />

          <div className="age-gate-form">
            <div className="mx-auto flex w-full max-w-md items-start gap-3 text-left">
              <input
                id="age-confirmation"
                name="age-confirmation"
                type="checkbox"
                checked={checked}
                onChange={(event) => setChecked(event.currentTarget.checked)}
                className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-gold"
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                <label htmlFor="age-confirmation" className="cursor-pointer">
                  By checking this, you are agreeing to our{" "}
                </label>
                <button
                  type="button"
                  onClick={() => setPolicyOpen(true)}
                  className="cursor-pointer underline"
                  style={{ color: "#c9a96e" }}
                >
                  Age Restriction Policy
                </button>
                .
              </p>
            </div>

            <div
              className="sm:flex-row"
              style={{
                marginTop: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                justifyContent: "center",
              }}
            >
            <button
              type="button"
              onClick={handleEnter}
              disabled={!checked}
              className="age-gate-enter"
              style={{
                padding: "13px 40px",
                fontSize: "0.7rem",
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                fontWeight: 500,
                border: "none",
                transition: "all 0.3s ease",
              }}
            >
              Enter
            </button>
            <Link
              to="/age-restricted"
              style={{
                padding: "13px 32px",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.7rem",
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                background: "none",
                cursor: "pointer",
              }}
            >
              I'm Below 18
            </Link>
            </div>
          </div>

          <p
            style={{
              fontSize: "0.65rem",
              color: "rgba(255,255,255,0.4)",
              lineHeight: 1.6,
              maxWidth: "380px",
              margin: "22px auto 0",
            }}
          >
            By entering, you confirm that you are of legal age to view tobacco-related content in
            your jurisdiction.
          </p>
        </div>
      </div>

      <AgeRestrictionPolicyModal open={policyOpen} onClose={() => setPolicyOpen(false)} />
    </>
  );
}
