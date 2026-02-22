import { Link } from "react-router-dom";
import { Gift, Users, Trophy, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PromoShape } from "@/data/homePageMockData";
import { promosGrid as defaultPromos } from "@/data/homePageMockData";
import { cn } from "@/lib/utils";

const variantStyles: Record<string, string> = {
  welcome: "from-violet-600/90 to-purple-800/90 border-violet-500/30",
  referral: "from-emerald-600/90 to-teal-800/90 border-emerald-500/30",
  tournament: "from-amber-600/90 to-orange-800/90 border-amber-500/30",
  cashback: "from-cyan-600/90 to-blue-800/90 border-cyan-500/30",
};

const variantIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  welcome: Gift,
  referral: Users,
  tournament: Trophy,
  cashback: Percent,
};

interface PromoBannerProps {
  promo: PromoShape;
  className?: string;
  fullWidth?: boolean;
}

export function PromoBanner({ promo, className, fullWidth }: PromoBannerProps) {
  const variant = promo.variant ?? "welcome";
  const Icon = variantIcons[variant] ?? Gift;
  const style = variantStyles[variant] ?? variantStyles.welcome;

  const content = (
    <div className={cn("rounded-xl border overflow-hidden bg-gradient-to-r", style, className)}>
      <div className={cn("p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4", fullWidth && "md:px-10")}>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Icon className="h-7 w-7 text-white" />
          </div>
          <div>
            {promo.badge && (
              <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">{promo.badge}</p>
            )}
            <h3 className="text-white font-bold text-xl">
              {promo.title}
              {promo.highlight && <span className="text-amber-300 ml-1">{promo.highlight}</span>}
            </h3>
            {promo.subtitle && <p className="text-white/90 text-sm">{promo.subtitle}</p>}
            {promo.description && <p className="text-white/70 text-sm mt-1 max-w-md">{promo.description}</p>}
          </div>
        </div>
        {promo.cta && promo.href && (
          <Link to={promo.href} className="shrink-0">
            <Button variant="gold" size="lg" className="text-white border-0">
              {promo.cta}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );

  if (promo.href && !promo.cta) {
    return <Link to={promo.href}>{content}</Link>;
  }
  return content;
}

export function PromoBannerGrid({ promos: promosProp }: { promos?: PromoShape[] | null }) {
  const promos = promosProp && promosProp.length > 0 ? promosProp : defaultPromos;
  return (
    <section className="container px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promos.map((promo, i) => (
          <PromoBanner key={i} promo={promo} />
        ))}
      </div>
    </section>
  );
}
