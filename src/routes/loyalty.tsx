import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, Star, Gift, Users, Instagram, Trophy, Cake, Copy, Check } from "lucide-react";

export const Route = createFileRoute("/loyalty")({
  head: () => ({
    meta: [
      { title: "Loyalty Program — House of RASA" },
      { property: "og:title", content: "RASA Loyalty Program" },
    ],
  }),
  component: LoyaltyPage,
});

const TIERS = [
  { name: "Bronze", requirement: "Join / ₹5,000 spent", benefits: ["Early product updates", "Welcome points bonus"], color: "#CD7F32", border: "#CD7F3250" },
  { name: "Silver", requirement: "₹5,000 spent", benefits: ["5% rewards on purchases", "Birthday gifts"], color: "#C0C0C0", border: "#C0C0C050" },
  { name: "Gold", requirement: "₹15,000 spent", benefits: ["Free shipping", "Exclusive flavours", "Priority access"], color: "#c9a96e", border: "#c9a96e50" },
  { name: "Platinum", requirement: "₹40,000 spent", benefits: ["VIP support", "Event invites", "Limited edition access"], color: "#DEA193", border: "#DEA19350" },
];

const EARN_WAYS = [
  { icon: <Star className="h-5 w-5" />, label: "Every Purchase", desc: "Earn points on every order", points: "Custom" },
  { icon: <Users className="h-5 w-5" />, label: "Refer Friends", desc: "Friend joins using your referral code", points: "150 pts" },
  { icon: <Gift className="h-5 w-5" />, label: "Write Reviews", desc: "Share your experience and earn", points: "50 pts" },
  { icon: <Instagram className="h-5 w-5" />, label: "Post & Tag RASA", desc: "Post on Instagram and tag @rasatobacco", points: "75 pts" },
  { icon: <Cake className="h-5 w-5" />, label: "Birthday Bonus", desc: "Special points on your birthday month", points: "200 pts" },
  { icon: <Trophy className="h-5 w-5" />, label: "Complete Profile", desc: "Earn points for a complete profile", points: "50 pts" },
];

const REDEEM_WAYS = [
  { label: "Discounts", desc: "Redeem points for order discounts" },
  { label: "Free Accessories", desc: "Bowls, hoses, mouthpieces and more" },
  { label: "Free Flavour Packs", desc: "Complimentary flavour packs of your choice" },
];

type Member = {
  id: string; name: string; email: string; phone: string;
  city: string | null; points: number; tier: string;
  total_spent: number; referral_code: string;
  instagram_handle: string | null; birthday: string | null;
};

type LogEntry = { id: string; points: number; reason: string; created_at: string; };

const TIER_COLORS: Record<string, string> = {
  Bronze: "#CD7F32", Silver: "#C0C0C0", Gold: "#c9a96e", Platinum: "#DEA193"
};

const REASON_LABELS: Record<string, string> = {
  signup: "Welcome Bonus", profile_complete: "Profile Complete",
  instagram_tag: "Instagram Post", review: "Review Submitted",
  referral: "Referral Bonus", birthday: "Birthday Bonus",
  purchase: "Purchase Reward",
};

function MemberDashboard({ member, history }: { member: Member; history: LogEntry[] }) {
  const [copied, setCopied] = useState(false);
  const tierColor = TIER_COLORS[member.tier] ?? "#c9a96e";
  const tierData = TIERS.find(t => t.name === member.tier);

  const copyCode = () => {
    navigator.clipboard.writeText(member.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div className="border p-8 relative overflow-hidden" style={{ borderColor: `${tierColor}40`, background: `${tierColor}08` }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10" style={{ background: tierColor }} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-[0.6rem] tracking-luxe uppercase mb-1" style={{ color: tierColor }}>House of RASA · {member.tier} Member</p>
            <h2 className="font-serif text-3xl">{member.name}</h2>
            <p className="text-sm text-foreground/60 mt-1">{member.email}</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-[0.6rem] tracking-luxe uppercase text-foreground/50 mb-1">Total Points</p>
            <p className="font-serif text-5xl" style={{ color: tierColor }}>{member.points.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t" style={{ borderColor: `${tierColor}25` }}>
          <div className="flex justify-between text-xs text-foreground/50 mb-2">
            <span>{member.tier}</span>
            {member.tier !== 'Platinum' && (
              <span>Next: {TIERS[TIERS.findIndex(t => t.name === member.tier) - 1]?.name}</span>
            )}
          </div>
          {tierData && (
            <ul className="flex flex-wrap gap-3 mt-3">
              {tierData.benefits.map(b => (
                <li key={b} className="text-[0.65rem] tracking-wide px-3 py-1 rounded-full border" style={{ borderColor: `${tierColor}40`, color: tierColor }}>
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="border border-border/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-[0.6rem] tracking-luxe uppercase text-gold mb-1">Your Referral Code</p>
          <p className="font-mono text-2xl tracking-widest text-foreground">{member.referral_code}</p>
          <p className="text-xs text-foreground/50 mt-1">Share this code — earn 150 points per friend who joins</p>
        </div>
        <button
          onClick={copyCode}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-gold/40 text-gold text-[0.65rem] tracking-luxe uppercase hover:bg-gold/10 transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy Code"}
        </button>
      </div>

      {history.length > 0 && (
        <div className="border border-border/40">
          <div className="px-6 py-4 border-b border-border/40">
            <p className="text-[0.65rem] tracking-luxe uppercase text-gold">Points History</p>
          </div>
          <div className="divide-y divide-border/30">
            {history.map(entry => (
              <div key={entry.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-serif">{REASON_LABELS[entry.reason] ?? entry.reason}</p>
                  <p className="text-xs text-foreground/50 mt-0.5">{new Date(entry.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <p className="font-serif text-lg text-gold">+{entry.points}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LoyaltyPage() {
  const { user } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [history, setHistory] = useState<LogEntry[]>([]);
  const [memberLoading, setMemberLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", birthday: "", instagram_handle: "", referred_by: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name: f.name || (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || "",
        email: f.email || user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!user?.email) return;
    setMemberLoading(true);
    supabase
      .from("loyalty_members")
      .select("*")
      .eq("email", user.email)
      .maybeSingle()
      .then(async ({ data }) => {
        if (data) {
          setMember(data as Member);
          const { data: log } = await supabase
            .from("loyalty_points_log")
            .select("*")
            .eq("member_id", data.id)
            .order("created_at", { ascending: false })
            .limit(20);
          setHistory((log ?? []) as LogEntry[]);
        }
        setMemberLoading(false);
      });
  }, [user]);

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) { setError("Name, email, and phone are required."); return; }
    setSending(true);
    setError("");

    const { data: newMember, error: insertErr } = await supabase
      .from("loyalty_members")
      .insert([{
        name: form.name, email: form.email, phone: form.phone,
        city: form.city || null, birthday: form.birthday || null,
        instagram_handle: form.instagram_handle || null,
        user_id: user?.id ?? null,
      }])
      .select()
      .single();

    if (insertErr) {
      setSending(false);
      if (insertErr.code === "23505") setError("This email is already registered in the loyalty program.");
      else setError("Something went wrong. Please try again.");
      return;
    }

    if (newMember) {
      await supabase.functions.invoke('loyalty-award', {
        body: { member_id: newMember.id, reason: 'signup' }
      });

      if (form.instagram_handle && form.birthday) {
        await supabase.functions.invoke('loyalty-award', {
          body: { member_id: newMember.id, reason: 'profile_complete' }
        });
      }

      // Handle referral — find referrer and award them 150 pts
      if (form.referred_by) {
        const { data: referrer } = await supabase
          .from("loyalty_members")
          .select("id")
          .eq("referral_code", form.referred_by.trim().toUpperCase())
          .single();
        if (referrer) {
          await supabase.functions.invoke('loyalty-award', {
            body: { member_id: referrer.id, reason: 'referral', points_override: 150 }
          });
          await supabase.from("loyalty_members").update({ referred_by: form.referred_by.trim() }).eq("id", newMember.id);
        }
      }

      const { data: updated } = await supabase.from("loyalty_members").select("*").eq("id", newMember.id).single();
      if (updated) setMember(updated as Member);
    }

    setSending(false);
    setSubmitted(true);
  };

  return (
    <main className="bg-ink text-foreground min-h-screen">
      <section className="relative pt-40 pb-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 grain opacity-40 pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-[0.65rem] tracking-luxe uppercase text-gold mb-4">Exclusive Membership</p>
          <h1 className="font-serif text-6xl md:text-8xl leading-none mb-6">Loyalty</h1>
          <p className="font-display text-sm tracking-luxe uppercase" style={{ color: "#DEA193" }}>SMOKE, PERFECTED</p>
          <p className="mt-8 text-foreground/75 max-w-xl mx-auto leading-relaxed">
            Join the House of RASA's exclusive loyalty program. Earn points, unlock rewards, and rise through tiers crafted for the discerning connoisseur.
          </p>
        </div>
      </section>

      <div className="luxe-divider max-w-md mx-auto" />

      {memberLoading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
        </div>
      )}

      {!memberLoading && member && <MemberDashboard member={member} history={history} />}

      {!memberLoading && !member && (
        <>
          <section className="py-20 px-6 max-w-5xl mx-auto">
            <p className="text-[0.65rem] tracking-luxe uppercase text-gold mb-3 text-center">Points</p>
            <h2 className="font-serif text-4xl text-center mb-12">How to Earn</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {EARN_WAYS.map(w => (
                <div key={w.label} className="border border-border/40 hover:border-gold/40 transition-colors p-6 bg-surface/20 relative">
                  <div className="text-gold mb-3">{w.icon}</div>
                  <p className="font-serif text-lg mb-1">{w.label}</p>
                  <p className="text-xs text-foreground/65 leading-relaxed mb-3">{w.desc}</p>
                  <span className="text-[0.6rem] tracking-luxe uppercase text-gold/70">{w.points}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="py-16 px-6 max-w-5xl mx-auto">
            <p className="text-[0.65rem] tracking-luxe uppercase text-gold mb-3 text-center">Rewards</p>
            <h2 className="font-serif text-4xl text-center mb-12">How to Redeem</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {REDEEM_WAYS.map(r => (
                <div key={r.label} className="border border-gold/20 bg-gold/5 p-6 text-center">
                  <p className="font-serif text-xl text-gold mb-2">{r.label}</p>
                  <p className="text-sm text-foreground/70 leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="luxe-divider max-w-md mx-auto" />

          <section className="py-20 px-6 max-w-5xl mx-auto">
            <p className="text-[0.65rem] tracking-luxe uppercase text-gold mb-3 text-center">Membership</p>
            <h2 className="font-serif text-4xl text-center mb-12">Tier Levels</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TIERS.map(t => (
                <div key={t.name} className="relative border p-6 transition-all duration-300 hover:scale-[1.02]" style={{ borderColor: t.border, background: `${t.color}08` }}>
                  <div className="w-8 h-px mb-4" style={{ background: t.color }} />
                  <p className="font-serif text-2xl mb-1" style={{ color: t.color }}>{t.name}</p>
                  <p className="text-[0.6rem] tracking-luxe uppercase text-foreground/50 mb-4">{t.requirement}</p>
                  <ul className="space-y-2">
                    {t.benefits.map(b => (
                      <li key={b} className="flex items-start gap-2 text-xs text-foreground/75">
                        <span style={{ color: t.color }} className="mt-0.5 shrink-0">·</span>{b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <div className="luxe-divider max-w-md mx-auto" />

          <section className="py-20 px-6 max-w-2xl mx-auto">
            <p className="text-[0.65rem] tracking-luxe uppercase text-gold mb-3 text-center">Join Now</p>
            <h2 className="font-serif text-4xl text-center mb-12">Become a Member</h2>

            {submitted ? (
              <div className="border border-gold/30 bg-gold/5 p-10 text-center">
                <p className="font-serif text-3xl text-gold mb-2">Welcome to RASA.</p>
                <p className="text-foreground/75 leading-relaxed mb-4">You are now a Bronze member. Your welcome points have been credited.</p>
                <p className="text-xs text-foreground/50">Refresh the page to view your member dashboard.</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { key: "name", label: "Full Name *", type: "text", placeholder: "Your full name" },
                    { key: "email", label: "Email Address *", type: "email", placeholder: "your@email.com" },
                    { key: "phone", label: "Phone Number *", type: "tel", placeholder: "+91 XXXXX XXXXX" },
                    { key: "city", label: "City", type: "text", placeholder: "Your city" },
                    { key: "birthday", label: "Birthday (for bonus points)", type: "date", placeholder: "" },
                    { key: "instagram_handle", label: "Instagram Handle (+75 pts)", type: "text", placeholder: "@yourusername" },
                    { key: "referred_by", label: "Referral Code (optional)", type: "text", placeholder: "Friend's referral code" },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label className="block text-[0.65rem] tracking-luxe uppercase text-gold/80 mb-2">{label}</label>
                      <input
                        type={type}
                        value={form[key as keyof typeof form]}
                        onChange={f(key as keyof typeof form)}
                        placeholder={placeholder}
                        className="w-full bg-transparent border-b border-border/60 focus:border-gold py-3 text-foreground outline-none transition-colors placeholder:text-muted-foreground/40"
                      />
                    </div>
                  ))}
                </div>

                <div className="border border-gold/20 bg-gold/5 px-5 py-4 text-sm text-foreground/70">
                  <p className="text-gold font-serif mb-1">You'll receive on joining:</p>
                  <p>· 100 points Welcome Bonus</p>
                  {form.instagram_handle && form.birthday && <p>· 50 points Profile Complete Bonus</p>}
                </div>

                {error && (
                  <p className="text-xs font-serif italic text-red-400 bg-red-950/60 border border-red-800/50 px-4 py-2.5">{error}</p>
                )}

                <div className="pt-4">
                  <button type="submit" disabled={sending} className="group w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-gold text-primary-foreground text-[0.7rem] tracking-luxe uppercase hover:bg-gold-soft transition-all duration-500 disabled:opacity-60 disabled:cursor-not-allowed">
                    {sending ? "Joining…" : "Join the Program"}
                    {!sending && <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />}
                  </button>
                </div>
              </form>
            )}
          </section>
        </>
      )}
    </main>
  );
}
