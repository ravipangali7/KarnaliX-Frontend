import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Gamepad2, Gift, Wallet, User, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getSiteSetting } from "@/api/site";
import { getMediaUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";

const publicNavItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Games", path: "/games", icon: Gamepad2 },
  { label: "Bonus", path: "/bonus", icon: Gift },
  { label: "Wallet", path: "/wallet", icon: Wallet },
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

export const PublicHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;
  const dashboardPath = user ? getDashboardPath(user.role) : "/player";

  const { data: siteSetting } = useQuery({ queryKey: ["siteSetting"], queryFn: getSiteSetting });
  const logo = (siteSetting as { logo?: string } | undefined)?.logo;
  const logoUrl = logo ? getMediaUrl(logo) : "/karnali-logo.png";

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-border/50">
      <div className="container flex items-center justify-between h-14 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoUrl} alt="Karnali X" className="h-8 w-8 rounded" />
          <span className="font-gaming font-bold text-sm neon-text hidden sm:block tracking-wider">KARNALI X</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {publicNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === item.path
                  ? "bg-primary/10 text-primary neon-glow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Link to={dashboardPath}>
                <Button size="sm" variant="outline" className="text-xs font-semibold">
                  Dashboard
                </Button>
              </Link>
              <Button size="sm" variant="ghost" className="text-xs font-semibold text-muted-foreground hover:text-destructive" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button size="sm" variant="ghost" className="text-xs font-semibold">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="gold-gradient text-primary-foreground font-semibold text-xs neon-glow-sm">
                  Register
                </Button>
              </Link>
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="md:hidden border-t border-border/50 bg-card p-4 space-y-1 animate-slide-up">
          {publicNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <>
              <Link to={dashboardPath} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
                <User className="h-4 w-4" />
                Dashboard
              </Link>
              <button type="button" onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-muted w-full">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
                Login
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-primary hover:bg-primary/10">
                Register
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
};
