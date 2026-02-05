import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Menu, 
  X, 
  Wallet, 
  Bell, 
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Gamepad2,
  Trophy,
  Gift,
  Headphones
} from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Games", href: "/games" },
  { name: "Sports", href: "/sports" },
  { name: "Live Casino", href: "/live-casino" },
  { name: "Promotions", href: "/promotions" },
  { name: "Affiliate", href: "/affiliate" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, getDashboardRoute, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold gradient-text">KarnaliX</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  location.pathname === link.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardRoute()}>
                  <Button variant="glass" size="sm" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-neon-red rounded-full" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="glass" size="sm" className="gap-2">
                  <Wallet className="w-4 h-4" />
                  <span className="font-mono">₹0.00</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-neon-red rounded-full" />
                </Button>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="neon" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Live Odds Ticker */}
        <div className="border-t border-border/50 overflow-hidden py-2">
          <div className="flex animate-ticker">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-8 whitespace-nowrap">
                <OddItem team1="India" team2="Australia" odds1="1.85" odds2="2.10" live />
                <OddItem team1="Man City" team2="Liverpool" odds1="2.20" odds2="1.75" />
                <OddItem team1="Lakers" team2="Warriors" odds1="1.95" odds2="1.90" live />
                <OddItem team1="Federer" team2="Nadal" odds1="2.05" odds2="1.80" />
                <OddItem team1="PSG" team2="Bayern" odds1="1.70" odds2="2.35" live />
                <OddItem team1="CSK" team2="MI" odds1="1.90" odds2="1.95" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-strong border-t border-border animate-fade-in">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    location.pathname === link.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
              {isAuthenticated ? (
                <>
                  <Link to={getDashboardRoute()} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full gap-2" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Login</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="neon" className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function OddItem({ team1, team2, odds1, odds2, live }: { 
  team1: string; 
  team2: string; 
  odds1: string; 
  odds2: string; 
  live?: boolean 
}) {
  return (
    <div className="flex items-center gap-3 px-4">
      {live && (
        <span className="flex items-center gap-1 text-xs font-medium text-neon-green">
          <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse" />
          LIVE
        </span>
      )}
      <span className="text-sm text-muted-foreground">{team1}</span>
      <span className="text-xs text-muted-foreground/60">vs</span>
      <span className="text-sm text-muted-foreground">{team2}</span>
      <div className="flex gap-2">
        <span className="px-2 py-0.5 bg-muted rounded text-xs font-mono text-primary">{odds1}</span>
        <span className="px-2 py-0.5 bg-muted rounded text-xs font-mono text-secondary">{odds2}</span>
      </div>
    </div>
  );
}
