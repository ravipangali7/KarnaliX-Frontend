import { Link } from "react-router-dom";
import type { GameCategory } from "@/api/games";

const quickLinks = [
  { label: "Home", path: "/" },
  { label: "Games", path: "/games" },
  { label: "Live Casino", path: "/games" },
  { label: "Bonus", path: "/bonus" },
  { label: "Wallet", path: "/wallet" },
];

interface SecondHomeSidebarProps {
  categories?: GameCategory[];
}

export function SecondHomeSidebar({ categories = [] }: SecondHomeSidebarProps) {
  return (
    <aside className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-display font-semibold text-sm text-foreground mb-3">Quick links</h3>
        <ul className="space-y-2">
          {quickLinks.map((item) => (
            <li key={item.path + item.label}>
              <Link
                to={item.path}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {categories.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display font-semibold text-sm text-foreground mb-3">Browse by category</h3>
          <ul className="space-y-2">
            {categories.slice(0, 6).map((cat) => (
              <li key={cat.id}>
                <Link
                  to={`/games?category=${cat.id}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="rounded-lg border border-border bg-card p-4">
        <Link to="/bonus" className="text-sm font-medium text-primary hover:underline">
          Promotions
        </Link>
      </div>
    </aside>
  );
}
