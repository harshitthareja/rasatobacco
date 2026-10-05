import { useCallback, useEffect, useState, type ComponentType } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  MessageSquare,
  Handshake,
  Mail,
  Award,
  Users,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { configError, supabase } from "./lib/supabase";
import { adminData, ApiError } from "./lib/api";
import { Login } from "./components/Login";
import { Button, ErrorNote, Loading } from "./components/ui";
import { Overview } from "./sections/Overview";
import { Orders } from "./sections/Orders";
import { Products } from "./sections/Products";
import { StoreSettings } from "./sections/StoreSettings";
import { Carts, Enquiries, Loyalty, Partners, Subscribers, UsersList } from "./sections/Lists";

type SectionDef = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  component: ComponentType<{ go: (id: string) => void }>;
};

const SECTIONS: SectionDef[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, component: Overview },
  { id: "orders", label: "Orders", icon: Package, component: Orders },
  { id: "products", label: "Products & Stock", icon: Tags, component: Products },
  { id: "carts", label: "Carts", icon: ShoppingCart, component: Carts },
  { id: "enquiries", label: "Enquiries", icon: MessageSquare, component: Enquiries },
  { id: "partners", label: "Partners", icon: Handshake, component: Partners },
  { id: "subscribers", label: "Subscribers", icon: Mail, component: Subscribers },
  { id: "loyalty", label: "Loyalty", icon: Award, component: Loyalty },
  { id: "users", label: "Users", icon: Users, component: UsersList },
  { id: "settings", label: "Store Settings", icon: Settings, component: StoreSettings },
];

const currentHash = () => {
  const id = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  return SECTIONS.some((s) => s.id === id) ? id : "overview";
};

type AccessState = "checking" | "granted" | "denied";

export function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [access, setAccess] = useState<AccessState>("checking");
  const [accessError, setAccessError] = useState<string | null>(null);
  const [section, setSection] = useState(currentHash);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setReady(true);
    });
    supabase.auth.getSession().then(({ data: d }) => {
      setSession(d.session);
      setReady(true);
    });
    const onHash = () => setSection(currentHash());
    window.addEventListener("hashchange", onHash);
    return () => {
      data.subscription.unsubscribe();
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return;
    setAccess("checking");
    adminData("overview")
      .then(() => setAccess("granted"))
      .catch((e: ApiError) => {
        setAccess("denied");
        setAccessError(e.status === 403 ? null : e.message);
      });
  }, [userId]);

  const go = useCallback((id: string) => {
    window.location.hash = `/${id}`;
    setNavOpen(false);
  }, []);

  const signOut = () => supabase.auth.signOut();

  if (configError) {
    return (
      <div className="p-10 max-w-xl mx-auto">
        <ErrorNote>{configError}</ErrorNote>
      </div>
    );
  }
  if (!ready) return <Loading />;
  if (!session) return <Login />;
  if (access === "checking") return <Loading />;
  if (access === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm text-center space-y-5">
          <h1 className="font-serif text-3xl">No admin access</h1>
          <p className="text-sm text-foreground/60">
            {accessError ??
              `${session.user.email} is signed in but doesn't have the admin role. Ask an existing admin to grant it.`}
          </p>
          <Button variant="ghost" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  const active = SECTIONS.find((s) => s.id === section) ?? SECTIONS[0];
  const Active = active.component;

  return (
    <div className="min-h-screen">
      <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between border-b border-border bg-ink/95 px-4 py-3">
        <p className="font-serif text-lg text-gold">RASA Admin</p>
        <button
          onClick={() => setNavOpen((o) => !o)}
          aria-label="Menu"
          className="p-2 text-foreground/70"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-60 border-r border-border bg-ink flex flex-col transition-transform lg:translate-x-0 ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-7 border-b border-border">
          <p className="font-serif text-xl text-gold">RASA</p>
          <p className="text-[0.6rem] tracking-luxe uppercase text-foreground/50 mt-1">
            Admin Console
          </p>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => go(s.id)}
              className={`w-full flex items-center gap-3 text-left px-6 py-2.5 text-[0.68rem] tracking-[0.18em] uppercase transition-colors ${
                section === s.id
                  ? "text-gold bg-gold/10 border-r-2 border-gold"
                  : "text-foreground/60 hover:text-gold hover:bg-gold/5"
              }`}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </button>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-border">
          <p className="text-[0.65rem] text-foreground/40 truncate mb-2">{session.user.email}</p>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-[0.62rem] tracking-luxe uppercase text-destructive/80 hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>
      {navOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}

      <main className="lg:ml-60 px-4 py-6 sm:p-8 max-w-[1400px]">
        <p className="text-[0.6rem] tracking-luxe uppercase text-gold mb-1">Admin</p>
        <h1 className="font-serif text-3xl mb-8">{active.label}</h1>
        <Active key={active.id} go={go} />
      </main>
    </div>
  );
}
