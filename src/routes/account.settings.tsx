import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account/settings")({
  head: () => ({
    meta: [
      { title: "My Account — RASA" },
      { name: "description", content: "Manage your RASA profile, loyalty tier, and points." },
      { property: "og:title", content: "My Account — RASA" },
      { property: "og:description", content: "Manage your RASA profile, loyalty tier, and points." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

const TIER_COLORS: Record<string, string> = {
  Bronze: "#CD7F32", Silver: "#C0C0C0", Gold: "#c9a96e", Platinum: "#DEA193"
};

function SettingsPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [member, setMember] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user?.email) return;
    supabase.from("loyalty_members").select("*").eq("email", user.email).maybeSingle().then(({ data }) => setMember(data));
  }, [user]);

  if (loading || !user) return <div className="min-h-screen bg-ink flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" /></div>;

  const name = (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || "";
  const avatar = user.user_metadata?.avatar_url as string | undefined;
  const tierColor = member ? (TIER_COLORS[member.tier] ?? "#c9a96e") : "#c9a96e";

  return (
    <div className="min-h-screen bg-ink pt-32 pb-24 px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <p className="text-[0.65rem] tracking-luxe uppercase text-gold mb-2">Account</p>
          <h1 className="font-serif text-4xl text-foreground">My Account</h1>
        </div>

        <div className="border border-border/50 bg-surface/20 p-8">
          <div className="flex items-center gap-5 mb-8 pb-8 border-b border-border/40">
            {avatar ? (
              <img src={avatar} alt="" className="w-16 h-16 rounded-full object-cover border border-gold/30" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-xl font-medium">
                {(name || user.email || "U")[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-serif text-xl">{name || "Guest"}</p>
              <p className="text-sm text-foreground/60">{user.email}</p>
              <p className="text-[0.6rem] tracking-luxe uppercase text-foreground/40 mt-1 capitalize">{(user.app_metadata?.provider as string) || "google"} account</p>
            </div>
          </div>
          <dl className="grid sm:grid-cols-2 gap-6 text-sm">
            <div><dt className="text-[0.65rem] tracking-luxe uppercase text-foreground/50 mb-1">Full Name</dt><dd>{name || "—"}</dd></div>
            <div><dt className="text-[0.65rem] tracking-luxe uppercase text-foreground/50 mb-1">Email</dt><dd>{user.email}</dd></div>
          </dl>
          <p className="mt-6 text-xs text-foreground/40 italic">Profile details are managed through your Google account.</p>
        </div>

        {member ? (
          <div className="border p-8" style={{ borderColor: `${tierColor}40`, background: `${tierColor}08` }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[0.6rem] tracking-luxe uppercase mb-1" style={{ color: tierColor }}>Loyalty · {member.tier} Member</p>
                <p className="font-serif text-4xl" style={{ color: tierColor }}>{(member.points ?? 0).toLocaleString()} pts</p>
              </div>
              <Link to="/loyalty" className="text-[0.65rem] tracking-luxe uppercase border px-4 py-2 transition-colors hover:border-gold hover:text-gold" style={{ borderColor: `${tierColor}50`, color: tierColor }}>
                View Dashboard →
              </Link>
            </div>
            <p className="text-xs text-foreground/50">Referral Code: <span className="font-mono text-foreground/80">{member.referral_code}</span></p>
          </div>
        ) : (
          <div className="border border-border/40 p-8 text-center">
            <p className="font-serif text-xl text-foreground mb-3">Not yet a loyalty member</p>
            <p className="text-sm text-foreground/60 mb-6">Join to earn points, unlock tier benefits, and access exclusive perks.</p>
            <Link to="/loyalty" className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-ink text-[0.65rem] tracking-luxe uppercase hover:bg-gold-soft transition-colors">
              Join the Program
            </Link>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <Link to="/contact" className="border border-border/40 p-6 hover:border-gold/40 transition-colors group">
            <p className="font-serif text-lg mb-1 group-hover:text-gold transition-colors">Submit Enquiry</p>
            <p className="text-xs text-foreground/60">Contact the RASA sales team</p>
          </Link>
          <Link to="/loyalty" className="border border-border/40 p-6 hover:border-gold/40 transition-colors group">
            <p className="font-serif text-lg mb-1 group-hover:text-gold transition-colors">Loyalty Program</p>
            <p className="text-xs text-foreground/60">View your points and tier</p>
          </Link>
        </div>

        <div className="pt-4">
          <button onClick={signOut} className="text-[0.65rem] tracking-luxe uppercase text-destructive/70 hover:text-destructive transition-colors">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
