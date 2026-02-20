import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getSiteSetting } from "@/api/site";
import { getMediaUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Bell, User, Search, Menu, X } from "lucide-react";

const secondaryNavItems = [
  { label: "Homepage", path: "/" },
  { label: "Live Matches", path: "/" },
  { label: "Live Casino", path: "/games" },
  { label: "Slots", path: "/games" },
  { label: "Esports", path: "/games" },
  { label: "Fish", path: "/games" },
  { label: "Mini Games", path: "/games" },
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

export const SecondPublicHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const dashboardPath = user ? getDashboardPath(user.role) : "/player";

  const { data: siteSetting } = useQuery({ queryKey: ["siteSetting"], queryFn: getSiteSetting });
  const logo = (siteSetting as { logo?: string } | undefined)?.logo;
  const logoUrl = logo ? getMediaUrl(logo) : "/karnali-logo.png";

  return (
    <header className="sticky top-0 z-50 bg-red-600 text-white border-b border-red-700">
      <div className="flex items-center justify-between h-14 px-4 gap-4">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="h-9 w-9 rounded bg-white/10 flex items-center justify-center">
            <img src={logoUrl} alt="KarnaliX" className="h-6 w-6 rounded object-contain" />
          </div>
          <span className="font-bold text-white hidden sm:inline">KarnaliX</span>
        </Link>

        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
            <input
              type="text"
              placeholder="Search for Your Team"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded bg-white/10 border border-white/20 text-white placeholder:text-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Link to={dashboardPath}>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 h-9">
                  <User className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline text-sm">Account</span>
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 h-9 text-sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-white text-red-600 hover:bg-white/90 h-9 font-semibold text-sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-9 w-9">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white/90 text-xs hidden sm:inline">
            EN
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden text-white h-9 w-9" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Secondary nav */}
      <nav className="hidden md:flex items-center gap-1 px-4 h-10 bg-red-700/50 border-t border-red-800/50">
        {secondaryNavItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
              location.pathname === item.path ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {menuOpen && (
        <div className="md:hidden border-t border-red-700 bg-red-700/80 p-4 space-y-2">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
            <input
              type="text"
              placeholder="Search for Your Team"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded bg-white/10 border border-white/20 text-white placeholder:text-white/60 text-sm"
            />
          </div>
          {secondaryNavItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded text-sm text-white/90 hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};
