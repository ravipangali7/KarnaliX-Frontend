import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Home, MessageCircle, Wallet, Clock, User, Gamepad2, Shield, Key, CreditCard, BarChart3, LogOut, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const tabs = [
  { label: "Home", path: "/player", icon: Home },
  { label: "Messages", path: "/player/messages", icon: MessageCircle },
  { label: "Wallet", path: "/player/wallet", icon: Wallet },
  { label: "History", path: "/player/transactions", icon: Clock },
  { label: "Profile", path: "/player/profile", icon: User },
];

const sidebarLinks = [
  { label: "Dashboard", path: "/player", icon: Home },
  { label: "Wallet", path: "/player/wallet", icon: Wallet },
  { label: "Messages", path: "/player/messages", icon: MessageCircle },
  { label: "Transactions", path: "/player/transactions", icon: Clock },
  { label: "Game Results", path: "/player/game-results", icon: BarChart3 },
  { label: "Payment Modes", path: "/player/payment-modes", icon: CreditCard },
  { label: "Refer", path: "/player/referral", icon: Users },
  { label: "Change Password", path: "/player/change-password", icon: Key },
  { label: "Profile", path: "/player/profile", icon: User },
];

const formatBal = (v: string | number | null | undefined) => (v != null ? `₹${Number(v).toLocaleString()}` : "₹0");

export const PlayerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout, refreshUser } = useAuth();
  const total = user?.total_balance != null ? formatBal(user.total_balance) : "₹0";
  const main = formatBal(user?.main_balance);
  const bonus = formatBal(user?.bonus_balance);

  const isActive = (path: string) => location.pathname === path;

  // When user returns from game tab (visibility or focus), refetch wallet and auth so header/sidebar balance updates
  useEffect(() => {
    let visibilityTimeoutId: ReturnType<typeof setTimeout> | null = null;
    const refetchBalance = () => {
      queryClient.invalidateQueries({ queryKey: ["playerWallet"] });
      queryClient.invalidateQueries({ queryKey: ["player-wallet"] });
      refreshUser?.();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        if (visibilityTimeoutId) clearTimeout(visibilityTimeoutId);
        visibilityTimeoutId = setTimeout(() => {
          refetchBalance();
          visibilityTimeoutId = null;
        }, 500);
      }
    };
    const onFocus = () => refetchBalance();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
      if (visibilityTimeoutId) clearTimeout(visibilityTimeoutId);
    };
  }, [queryClient, refreshUser]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Desktop Sidebar (no logo – site header shows branding) */}
      <aside className="hidden md:flex flex-col w-64 bg-navy text-navy-foreground border-r border-sidebar-border flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Balance card in sidebar */}
        <div className="p-4">
          <div className="rounded-xl gold-gradient p-4 neon-glow-sm">
            <p className="text-primary-foreground/60 text-[10px] font-medium">Total Balance</p>
            <p className="font-gaming font-bold text-2xl text-primary-foreground">{total}</p>
            <div className="flex gap-3 mt-2 text-[10px] text-primary-foreground/70">
              <span>Main: {main}</span>
              <span>Bonus: {bonus}</span>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive(link.path)
                  ? "bg-sidebar-primary/10 text-sidebar-primary neon-glow-sm"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <link.icon className={`h-4 w-4 ${isActive(link.path) ? "text-sidebar-primary" : ""}`} />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <Link to="/" className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent transition-colors">
            <Gamepad2 className="h-4 w-4" />
            <span>Play Games</span>
          </Link>
          <button onClick={() => { logout(); navigate("/login"); }} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area (mobile: no extra top bar – logo + balance live in PublicHeader) */}
      <div className="flex-1 flex flex-col min-h-screen md:min-h-0">
        {/* Desktop top bar – same horizontal spacing as site header/footer */}
        <header className="hidden md:flex sticky top-0 z-50 glass-card border-b border-border/50 h-14 items-center justify-between container px-4 mx-auto w-full max-w-[100%]">
          <div>
            <h1 className="font-display font-bold text-lg capitalize">
              {location.pathname.split("/").pop()?.replace(/-/g, " ") || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="text-sm font-gaming font-bold text-primary">{total}</span>
            </div>
            <div className="h-8 w-8 rounded-full gold-gradient flex items-center justify-center text-xs font-bold text-primary-foreground">P1</div>
          </div>
        </header>

        {/* Content – container + px-4 to match header/footer margins */}
        <main className="flex-1 pb-20 md:pb-6 overflow-y-auto">
          <div className="container px-4 mx-auto w-full max-w-[100%]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom tab bar (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50 nav-bottom-safe md:hidden">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                isActive(tab.path)
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <tab.icon className={`h-5 w-5 ${isActive(tab.path) ? "scale-110 drop-shadow-[0_0_8px_hsl(220,90%,56%)]" : ""} transition-transform`} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};
