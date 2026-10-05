import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

export function Spinner({ small = false }: { small?: boolean }) {
  return (
    <div
      className={`${small ? "h-4 w-4" : "h-8 w-8"} rounded-full border-2 border-gold/30 border-t-gold animate-spin`}
    />
  );
}

export function Loading() {
  return (
    <div className="flex justify-center py-20">
      <Spinner />
    </div>
  );
}

const TONES = {
  gold: "text-gold border-gold/40",
  green: "text-success border-success/40",
  blue: "text-info border-info/40",
  red: "text-destructive border-destructive/40",
  muted: "text-foreground/50 border-border",
} as const;
export type Tone = keyof typeof TONES;

export function Badge({ children, tone = "muted" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={`inline-block text-[0.6rem] tracking-luxe uppercase px-2 py-0.5 border ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

export const ORDER_STATUS_TONE: Record<string, Tone> = {
  pending: "gold",
  confirmed: "blue",
  processing: "blue",
  shipped: "gold",
  delivered: "green",
  cancelled: "muted",
};

export const PAYMENT_TONE: Record<string, Tone> = {
  paid: "green",
  pending: "gold",
  failed: "red",
  refunded: "muted",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "danger";
  busy?: boolean;
};

export function Button({
  variant = "outline",
  busy,
  children,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  const styles = {
    primary: "bg-gold text-ink hover:bg-gold-soft border border-gold",
    outline: "border border-gold/40 text-gold hover:bg-gold/10",
    ghost: "border border-border text-foreground/60 hover:text-gold hover:border-gold/50",
    danger: "border border-destructive/40 text-destructive hover:bg-destructive/10",
  }[variant];
  return (
    <button
      {...rest}
      disabled={disabled || busy}
      className={`inline-flex items-center justify-center gap-2 text-[0.62rem] tracking-luxe uppercase px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles} ${className}`}
    >
      {busy && <Spinner small />}
      {children}
    </button>
  );
}

export function Input({
  label,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const input = (
    <input
      {...rest}
      className={`w-full bg-transparent border border-border text-sm px-3 py-2 outline-none focus:border-gold transition-colors ${rest.className ?? ""}`}
    />
  );
  if (!label) return input;
  return (
    <label className="block">
      <span className="block text-[0.6rem] tracking-luxe uppercase text-foreground/50 mb-1.5">
        {label}
      </span>
      {input}
    </label>
  );
}

export function Select({
  label,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  const select = (
    <select
      {...rest}
      className={`w-full bg-ink border border-border text-sm px-3 py-2 outline-none focus:border-gold transition-colors ${rest.className ?? ""}`}
    >
      {children}
    </select>
  );
  if (!label) return select;
  return (
    <label className="block">
      <span className="block text-[0.6rem] tracking-luxe uppercase text-foreground/50 mb-1.5">
        {label}
      </span>
      {select}
    </label>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="border border-border p-8 text-sm text-foreground/50 text-center">{children}</p>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p className="border border-destructive/40 bg-destructive/5 text-destructive text-sm px-4 py-3">
      {children}
    </p>
  );
}

export function Pager({
  page,
  count,
  pageSize = 20,
  onPage,
}: {
  page: number;
  count: number;
  pageSize?: number;
  onPage: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(count / pageSize));
  if (pages <= 1) return null;
  return (
    <div className="flex items-center gap-3 mt-6 text-xs text-foreground/50">
      <Button variant="ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </Button>
      <span>
        Page {page} of {pages} · {count} total
      </span>
      <Button variant="ghost" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Next
      </Button>
    </div>
  );
}
