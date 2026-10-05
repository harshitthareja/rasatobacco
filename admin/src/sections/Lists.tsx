/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, type ReactNode } from "react";
import { adminUpdate, callFunction } from "../lib/api";
import { exportCSV, formatDate, skuLabel } from "../lib/format";
import { usePaged } from "../lib/usePaged";
import { Badge, Button, Empty, ErrorNote, Loading, Pager, type Tone } from "../components/ui";

const STATUS_TONE: Record<string, Tone> = {
  new: "gold",
  contacted: "blue",
  approved: "green",
  rejected: "red",
  closed: "muted",
};

function ListShell({
  section,
  query,
  empty,
  children,
}: {
  section: string;
  query?: Record<string, string>;
  empty: string;
  children: (rows: any[], reload: () => Promise<void>) => ReactNode;
}) {
  const { rows, count, page, setPage, loading, error, reload } = usePaged<any>(section, query);
  if (loading) return <Loading />;
  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!rows.length) return <Empty>{empty}</Empty>;
  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="ghost" onClick={() => exportCSV(rows, section)}>
          Export CSV
        </Button>
      </div>
      {children(rows, reload)}
      <Pager page={page} count={count} onPage={setPage} />
    </div>
  );
}

function StatusButtons({
  table,
  row,
  statuses,
  reload,
}: {
  table: string;
  row: any;
  statuses: string[];
  reload: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex md:flex-col gap-2 flex-wrap">
      {statuses.map((s) => (
        <Button
          key={s}
          variant={row.status === s ? "outline" : "ghost"}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await adminUpdate(table, row.id, { status: s });
              await reload();
            } catch (e) {
              alert((e as Error).message);
            }
            setBusy(false);
          }}
        >
          {s}
        </Button>
      ))}
    </div>
  );
}

export function Carts() {
  return (
    <ListShell section="carts" empty="No active carts.">
      {(rows) => (
        <div className="border border-border divide-y divide-border">
          {rows.map((r) => (
            <div key={r.id} className="px-5 py-3">
              <p className="text-sm">
                {skuLabel(r.sku)} <span className="text-foreground/50">× {r.quantity}</span>
              </p>
              <p className="text-[0.65rem] text-foreground/40">
                {r.user?.email ?? r.user_id} · updated {formatDate(r.updated_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </ListShell>
  );
}

export function Enquiries() {
  return (
    <ListShell section="enquiries" empty="No enquiries yet.">
      {(rows, reload) => (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="border border-border p-5 grid md:grid-cols-[1fr_auto] gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-serif text-lg">{r.name}</p>
                  <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                </div>
                <p className="text-xs text-foreground/60">
                  {r.business} · {r.type} ·{" "}
                  <a href={`mailto:${r.email}`} className="text-gold hover:underline">
                    {r.email}
                  </a>{" "}
                  · {r.phone}
                </p>
                <p className="text-sm text-foreground/80 mt-2 whitespace-pre-wrap">{r.message}</p>
                <p className="text-[0.65rem] text-foreground/40 mt-2">{formatDate(r.created_at)}</p>
              </div>
              <StatusButtons
                table="enquiries"
                row={r}
                statuses={["new", "contacted", "closed"]}
                reload={reload}
              />
            </div>
          ))}
        </div>
      )}
    </ListShell>
  );
}

export function Partners() {
  return (
    <ListShell section="partners" empty="No partner registrations yet.">
      {(rows, reload) => (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="border border-border p-5 grid md:grid-cols-[1fr_auto] gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-serif text-lg">{r.name}</p>
                  <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                </div>
                <p className="text-xs text-foreground/60">
                  {r.company} · {r.business_type} · {r.city}, {r.state}
                </p>
                <p className="text-xs text-foreground/60">
                  <a href={`mailto:${r.email}`} className="text-gold hover:underline">
                    {r.email}
                  </a>{" "}
                  · {r.phone}
                </p>
                {r.message && <p className="text-sm text-foreground/80 mt-2">{r.message}</p>}
                <p className="text-[0.65rem] text-foreground/40 mt-2">{formatDate(r.created_at)}</p>
              </div>
              <StatusButtons
                table="partner_registrations"
                row={r}
                statuses={["new", "contacted", "approved", "rejected"]}
                reload={reload}
              />
            </div>
          ))}
        </div>
      )}
    </ListShell>
  );
}

export function Subscribers() {
  return (
    <ListShell section="subscribers" empty="No subscribers yet.">
      {(rows) => (
        <div className="border border-border divide-y divide-border">
          {rows.map((r) => (
            <div key={r.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm">{r.email}</p>
                <p className="text-[0.65rem] text-foreground/40">
                  {r.source} · {formatDate(r.subscribed_at)}
                </p>
              </div>
              <a
                href={`mailto:${r.email}`}
                className="text-[0.6rem] tracking-luxe uppercase text-gold/70 hover:text-gold"
              >
                Email
              </a>
            </div>
          ))}
        </div>
      )}
    </ListShell>
  );
}

function AwardButtons({ row, reload }: { row: any; reload: () => Promise<void> }) {
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const award = async (reason: string, points_override?: number) => {
    setBusy(true);
    try {
      await callFunction("loyalty-award", { body: { member_id: row.id, reason, points_override } });
      await reload();
    } catch (e) {
      alert((e as Error).message);
    }
    setBusy(false);
  };
  return (
    <div className="flex md:flex-col gap-2 flex-wrap">
      <Button variant="ghost" disabled={busy} onClick={() => award("review")}>
        +Review (50)
      </Button>
      <Button variant="ghost" disabled={busy} onClick={() => award("instagram_tag")}>
        +Instagram (75)
      </Button>
      <Button variant="ghost" disabled={busy} onClick={() => award("birthday")}>
        +Birthday (200)
      </Button>
      <div className="flex gap-1">
        <input
          type="number"
          min="1"
          placeholder="pts"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="w-16 bg-transparent border border-border text-xs px-2 py-1.5 outline-none focus:border-gold"
        />
        <Button
          variant="ghost"
          disabled={busy}
          onClick={() => {
            const pts = parseInt(custom, 10);
            if (pts > 0) award("purchase", pts).then(() => setCustom(""));
          }}
        >
          +Purchase
        </Button>
      </div>
    </div>
  );
}

export function Loyalty() {
  return (
    <ListShell section="loyalty" empty="No loyalty members yet.">
      {(rows, reload) => (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="border border-border p-5 grid md:grid-cols-[1fr_auto] gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-serif text-lg">{r.name}</p>
                  <Badge tone="gold">{r.tier}</Badge>
                  <span className="text-sm font-serif text-gold">{r.points} pts</span>
                </div>
                <p className="text-xs text-foreground/60">
                  {r.email} · {r.phone} {r.city ? `· ${r.city}` : ""}
                </p>
                {r.instagram_handle && (
                  <p className="text-xs text-foreground/50">@{r.instagram_handle}</p>
                )}
                <p className="text-[0.65rem] text-foreground/40 mt-1">
                  Referral: {r.referral_code} · Joined {formatDate(r.created_at)}
                </p>
              </div>
              <AwardButtons row={r} reload={reload} />
            </div>
          ))}
        </div>
      )}
    </ListShell>
  );
}

export function UsersList() {
  return (
    <ListShell section="users" empty="No registered users yet.">
      {(rows) => (
        <div className="border border-border divide-y divide-border">
          {rows.map((r) => (
            <div key={r.id} className="px-5 py-3 flex items-center gap-4">
              {r.avatar_url ? (
                <img
                  src={r.avatar_url}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover border border-gold/20"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-sm">
                  {(r.full_name || r.email || "?")[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-serif truncate">{r.full_name || "—"}</p>
                <p className="text-xs text-foreground/60 truncate">{r.email}</p>
              </div>
              <div className="text-right">
                <p className="text-[0.6rem] tracking-luxe uppercase text-foreground/40">
                  {r.provider}
                </p>
                <p className="text-[0.6rem] text-foreground/30">{formatDate(r.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </ListShell>
  );
}
