import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  name: string;
  icon: LucideIcon;
  href: string;
  gameCount: number;
  color: "cyan" | "purple" | "gold" | "green" | "red" | "pink";
  image?: string;
}

const colorClasses = {
  cyan: "from-primary to-primary/50 hover:glow-cyan border-primary/30",
  purple: "from-secondary to-secondary/50 hover:glow-purple border-secondary/30",
  gold: "from-accent to-orange-500/50 hover:glow-gold border-accent/30",
  green: "from-neon-green to-emerald-500/50 border-neon-green/30",
  red: "from-neon-red to-rose-500/50 border-neon-red/30",
  pink: "from-neon-pink to-pink-500/50 border-neon-pink/30",
};

const iconColorClasses = {
  cyan: "text-primary",
  purple: "text-secondary",
  gold: "text-accent",
  green: "text-neon-green",
  red: "text-neon-red",
  pink: "text-neon-pink",
};

export function CategoryCard({ name, icon: Icon, href, gameCount, color, image }: CategoryCardProps) {
  return (
    <Link to={href} className="group">
      <div className={`relative rounded-2xl overflow-hidden glass border ${colorClasses[color]} transition-all duration-300 hover:scale-105`}>
        {/* Background Image or Gradient */}
        {image ? (
          <div className="absolute inset-0">
            <img src={image} alt={name} className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-10 group-hover:opacity-20 transition-opacity`} />
        )}

        {/* Content */}
        <div className="relative p-6 flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            <Icon className={`w-8 h-8 ${iconColorClasses[color]}`} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">{name}</h3>
          <p className="text-sm text-muted-foreground">{gameCount}+ Games</p>
        </div>
      </div>
    </Link>
  );
}

export function CategoryCardWide({ name, icon: Icon, href, gameCount, color, image }: CategoryCardProps) {
  return (
    <Link to={href} className="group">
      <div className={`relative rounded-2xl overflow-hidden glass border ${colorClasses[color]} transition-all duration-300 hover:scale-[1.02]`}>
        {/* Background */}
        <div className="absolute inset-0">
          {image && (
            <img src={image} alt={name} className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity" />
          )}
          <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses[color]} opacity-10`} />
        </div>

        {/* Content */}
        <div className="relative p-6 flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
            <Icon className={`w-7 h-7 ${iconColorClasses[color]}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-foreground mb-0.5 truncate">{name}</h3>
            <p className="text-sm text-muted-foreground">{gameCount}+ Games</p>
          </div>
          <div className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all">
            →
          </div>
        </div>
      </div>
    </Link>
  );
}
