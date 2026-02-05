import { Link, useLocation } from "react-router-dom";
import { Home, Gamepad2, Layers, Search, User } from "lucide-react";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Games", href: "/games", icon: Gamepad2 },
  { name: "Providers", href: "/games?view=providers", icon: Layers },
  { name: "Search", href: "/games?search=true", icon: Search },
  { name: "Account", href: "/dashboard", icon: User },
];

export function MobileNav() {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href.split("?")[0]);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`relative p-1.5 rounded-xl transition-all ${
                active ? "bg-primary/20" : ""
              }`}>
                <Icon className="w-5 h-5" />
                {active && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
                )}
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
