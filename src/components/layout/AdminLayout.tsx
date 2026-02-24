import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard, MessageCircle, Users, ArrowDownCircle, ArrowUpCircle,
  Shield, ShieldCheck, Gamepad2, Clock, Activity, Settings, ChevronLeft, ChevronRight,
  Menu, X, Tag, Box, Gift, FileText, Star, Globe, Wallet, LogOut, CreditCard, User, Key, Image,
  Calculator
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboard, getUnreadMessageCount } from "@/api/admin";
import { Badge } from "@/components/ui/badge";

interface AdminLayoutProps {
  role: "master" | "super" | "powerhouse";
}

const getNavItems = (role: string) => {
  const base = [
    { label: "Dashboard", path: "", icon: LayoutDashboard },
    { label: "Messages", path: "/messages", icon: MessageCircle },
  ];

  const profileItems = [
    { label: "Profile", path: "/profile", icon: User },
    { label: "Change Password", path: "/change-password", icon: Key },
  ];

  if (role === "powerhouse") {
    return [
      ...base,
      ...profileItems,
      { label: "Super Users", path: "/supers", icon: Users },
      { label: "Master Users", path: "/masters", icon: Users },
      { label: "Player Users", path: "/players", icon: Users },
      { label: "Payment Mode Verification", path: "/payment-mode-verification", icon: ShieldCheck },
      { label: "Deposits", path: "/deposits", icon: ArrowDownCircle },
      { label: "Withdrawals", path: "/withdrawals", icon: ArrowUpCircle },
      { label: "Bonus Request", path: "/bonus-requests", icon: Gift },
      { label: "Categories", path: "/categories", icon: Tag },
      { label: "Providers", path: "/providers", icon: Box },
      { label: "Games", path: "/games", icon: Gamepad2 },
      { label: "Slider", path: "/slider", icon: Image },
      { label: "Bonus Rules", path: "/bonus-rules", icon: Gift },
      { label: "Game Log", path: "/game-log", icon: Gamepad2 },
      { label: "Transactions", path: "/transactions", icon: Clock },
      { label: "Activity Log", path: "/activity", icon: Activity },
      { label: "Super Settings", path: "/super-settings", icon: Settings },
      { label: "Site Settings", path: "/site-settings", icon: Globe },
      { label: "CMS Pages", path: "/cms", icon: FileText },
      { label: "Testimonials", path: "/testimonials", icon: Star },
    ];
  }

  if (role === "super") {
    return [
      ...base,
      ...profileItems,
      { label: "Master Users", path: "/masters", icon: Users },
      { label: "Player Users", path: "/players", icon: Users },
      { label: "Payment Mode Verification", path: "/payment-mode-verification", icon: ShieldCheck },
      { label: "Deposits", path: "/deposits", icon: ArrowDownCircle },
      { label: "Withdrawals", path: "/withdrawals", icon: ArrowUpCircle },
      { label: "Bonus Request", path: "/bonus-requests", icon: Gift },
      { label: "Game Log", path: "/game-log", icon: Gamepad2 },
      { label: "Transactions", path: "/transactions", icon: Clock },
      { label: "Accounting", path: "/accounting", icon: Calculator },
      { label: "Activity Log", path: "/activity", icon: Activity },
    ];
  }

  return [
    ...base,
    ...profileItems,
    { label: "Player Users", path: "/players", icon: Users },
    { label: "Payment Methods", path: "/payment-modes", icon: CreditCard },
    { label: "Payment Mode Verification", path: "/payment-mode-verification", icon: ShieldCheck },
    { label: "Deposits", path: "/deposits", icon: ArrowDownCircle },
    { label: "Withdrawals", path: "/withdrawals", icon: ArrowUpCircle },
    { label: "Bonus Request", path: "/bonus-requests", icon: Gift },
    { label: "Game Log", path: "/game-log", icon: Gamepad2 },
    { label: "Transactions", path: "/transactions", icon: Clock },
    { label: "Accounting", path: "/accounting", icon: Calculator },
    { label: "Activity Log", path: "/activity", icon: Activity },
  ];
};

const formatBal = (v: string | number | null | undefined) => (v != null ? `₹${Number(v).toLocaleString()}` : "₹0");

const getBalanceHeaders = (role: string, user: { main_balance?: string; super_balance?: string | null; master_balance?: string | null; player_balance?: string | null; pl_balance?: string; total_balance?: string | number } | null) => {
  if (!user) return [];
  if (role === "powerhouse") return [
    { label: "Main", value: formatBal(user.main_balance) },
    { label: "Super Bal", value: formatBal(user.super_balance) },
    { label: "Master Bal", value: formatBal(user.master_balance) },
    { label: "Player Bal", value: formatBal(user.player_balance) },
    { label: "Total", value: formatBal(user.total_balance) },
  ];
  if (role === "super") return [
    { label: "Main", value: formatBal(user.main_balance) },
    { label: "Master Bal", value: formatBal(user.master_balance) },
    { label: "Player Bal", value: formatBal(user.player_balance) },
    { label: "Total", value: formatBal(user.total_balance) },
  ];
  return [
    { label: "Main", value: formatBal(user.main_balance) },
    { label: "Player Bal", value: formatBal(user.player_balance) },
    { label: "P/L", value: formatBal(user.pl_balance) },
    { label: "Total", value: formatBal(user.total_balance) },
  ];
};

export const AdminLayout = ({ role }: AdminLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const prefix = `/${role}`;
  const navItems = getNavItems(role);
  const balances = getBalanceHeaders(role, user);

  const { data: dashboard } = useQuery({
    queryKey: ["admin-dashboard", role],
    queryFn: () => getDashboard(role),
  });
  const { data: unreadMessages = 0 } = useQuery({
    queryKey: ["admin-messages-unread", role],
    queryFn: () => getUnreadMessageCount(role),
  });
  const badgeCounts: Record<string, number> = {
    "/messages": Number(unreadMessages) || 0,
    "/deposits": Number(dashboard?.pending_deposits) || 0,
    "/withdrawals": Number(dashboard?.pending_withdrawals) || 0,
    "/bonus-requests": Number(dashboard?.pending_bonus_requests) || 0,
  };

  const isActive = (path: string) => {
    const fullPath = prefix + path;
    return path === "" ? location.pathname === prefix || location.pathname === prefix + "/" : location.pathname.startsWith(fullPath);
  };

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col border-r border-border bg-sidebar transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}>
        <div className="h-14 flex items-center px-3 gap-2 border-b border-sidebar-border">
          <img src={"/karnali-logo.png"} alt="Karnali X" className="h-8 w-8 rounded flex-shrink-0" />
          {!collapsed && <span className="font-gaming font-bold text-xs neon-text tracking-wider truncate">{roleLabel}</span>}
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={prefix + item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-sidebar-accent text-sidebar-primary font-medium neon-glow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {badgeCounts[item.path] != null && badgeCounts[item.path] > 0 && (
                    <Badge variant="destructive" className="ml-auto text-[10px] min-w-5 h-5 justify-center px-1">
                      {badgeCounts[item.path] > 99 ? "99+" : badgeCounts[item.path]}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-12 flex items-center justify-center border-t border-sidebar-border text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar flex flex-col animate-slide-up">
            <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border">
              <div className="flex items-center gap-2">
                <img src={"/karnali-logo.png"} alt="" className="h-7 w-7 rounded" />
                <span className="font-gaming font-bold text-xs neon-text tracking-wider">{roleLabel}</span>
              </div>
              <button onClick={() => setMobileOpen(false)}><X className="h-5 w-5 text-sidebar-foreground" /></button>
            </div>
            <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={prefix + item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive(item.path)
                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {badgeCounts[item.path] != null && badgeCounts[item.path] > 0 && (
                    <Badge variant="destructive" className="text-[10px] min-w-5 h-5 justify-center px-1">
                      {badgeCounts[item.path] > 99 ? "99+" : badgeCounts[item.path]}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 glass-card border-b border-border/50">
          <div className="h-14 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <button className="md:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setMobileOpen(true)}>
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="font-display font-semibold text-lg hidden md:block">{roleLabel} Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Balance chips */}
              <div className="hidden sm:flex items-center gap-2">
                {balances.map((b) => (
                  <div key={b.label} className="px-2 py-1 rounded-md bg-muted text-xs">
                    <span className="text-muted-foreground">{b.label}: </span>
                    <span className="font-semibold text-primary">{b.value}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => { logout(); navigate("/login"); }} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Logout">
                <LogOut className="h-4 w-4" />
              </button>
              <div className="h-8 w-8 rounded-full gold-gradient flex items-center justify-center text-xs font-bold text-primary-foreground neon-glow-sm">
                {roleLabel[0]}
              </div>
            </div>
          </div>
          {/* Mobile balance row */}
          <div className="sm:hidden flex items-center gap-2 px-4 pb-2 overflow-x-auto">
            {balances.map((b) => (
              <div key={b.label} className="flex-shrink-0 px-2 py-1 rounded-md bg-muted text-[10px]">
                <span className="text-muted-foreground">{b.label}: </span>
                <span className="font-semibold text-primary">{b.value}</span>
              </div>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
