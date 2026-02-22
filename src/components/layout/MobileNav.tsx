import { Link, useLocation } from "react-router-dom";
import { Home, Gamepad2, Building2, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Home", path: "/", icon: Home },
  { label: "Games", path: "/games", icon: Gamepad2 },
  { label: "Providers", path: "/games?providers=1", icon: Building2 },
  { label: "Search", path: "/games?search=1", icon: Search },
  { label: "Account", path: "/login", icon: User },
];

export const MobileNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass-strong border-t border-white/10 nav-bottom-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-lg min-w-[56px] transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
