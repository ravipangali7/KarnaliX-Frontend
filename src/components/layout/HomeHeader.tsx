import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Bell, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { liveOddsTicker } from "@/data/homePageMockData";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Games", path: "/games" },
];

function getDashboardPath(role: string): string {
  switch (role) {
    case "powerhouse": return "/powerhouse";
    case "super": return "/super";
    case "master": return "/master";
    case "player":
    default: return "/player";
  }
}

export const HomeHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;
  const dashboardPath = user?.role ? getDashboardPath(user.role) : "/player";
  const messagesPath = isLoggedIn ? `${dashboardPath}/messages` : "/login";
  const walletBalance = user?.total_balance != null ? `₹${Number(user.total_balance).toLocaleString()}` : "₹0.00";

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/10">
      <div className="container flex flex-col">
        <div className="flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="font-gaming font-bold text-white text-xs">KX</span>
            </div>
            <span className="font-gaming font-bold text-lg gradient-text tracking-tight hidden sm:inline">KarnaliX</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/bonus"
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location.pathname === "/bonus" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              Bonus
            </Link>
            <Link
              to={messagesPath}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location.pathname === messagesPath || location.pathname.startsWith(`${dashboardPath}/messages`) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              Message
            </Link>
            {isLoggedIn && (
              <>
                <Link
                  to={dashboardPath}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === dashboardPath || location.pathname.startsWith(`${dashboardPath}/`) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-white/10">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="font-roboto-mono text-sm font-semibold text-foreground">{walletBalance}</span>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-neon-green animate-pulse" />
            </Button>
            {!isLoggedIn && (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="neon" size="sm">Sign Up</Button>
                </Link>
              </>
            )}
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Live odds ticker */}
        <div className="h-9 border-t border-white/10 overflow-hidden bg-card/40">
          <div className="flex animate-ticker w-max py-1.5">
            {[...liveOddsTicker, ...liveOddsTicker].map((row, i) => (
              <div key={i} className="flex items-center gap-4 px-6 shrink-0 text-xs text-muted-foreground">
                {row.live && (
                  <span className="flex items-center gap-1 text-green-400 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" /> LIVE
                  </span>
                )}
                <span className="text-foreground/90">{row.home}</span>
                <span>vs</span>
                <span className="text-foreground/90">{row.away}</span>
                <span className="font-roboto-mono text-primary">{row.odds1}</span>
                <span className="font-roboto-mono">{row.odds2}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="lg:hidden border-t border-white/10 glass-strong p-4 space-y-1 animate-fade-in">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium",
                location.pathname === item.path ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5"
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link to="/bonus" onClick={() => setMenuOpen(false)} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium", location.pathname === "/bonus" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5")}>
            Bonus
          </Link>
          <Link to={messagesPath} onClick={() => setMenuOpen(false)} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium", location.pathname === messagesPath || location.pathname.startsWith(`${dashboardPath}/messages`) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5")}>
            Message
          </Link>
          {isLoggedIn && (
            <>
              <Link to={dashboardPath} onClick={() => setMenuOpen(false)} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium", location.pathname === dashboardPath || location.pathname.startsWith(`${dashboardPath}/`) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5")}>
                Dashboard
              </Link>
              <button type="button" onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-white/5 w-full text-left">
                Logout
              </button>
            </>
          )}
          <div className="flex items-center gap-2 pt-2 px-4">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="font-roboto-mono text-sm">{walletBalance}</span>
          </div>
          {!isLoggedIn && (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">Login</Button>
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1">
                <Button variant="neon" size="sm" className="w-full">Sign Up</Button>
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
};
