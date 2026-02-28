import { Link } from "react-router-dom";
import { Gift, Wallet, Trophy, Percent, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PromoShape } from "@/data/homePageMockData";

const variantConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; gradient: string; accent: string; glow: string }> = {
  welcome: { icon: Gift, gradient: "from-violet-900/70 via-purple-900/50 to-background", accent: "text-violet-400", glow: "bg-violet-500/10" },
  deposit: { icon: Wallet, gradient: "from-amber-900/70 via-orange-900/50 to-background", accent: "text-amber-400", glow: "bg-amber-500/10" },
  tournament: { icon: Trophy, gradient: "from-amber-900/70 via-yellow-900/50 to-background", accent: "text-yellow-400", glow: "bg-yellow-500/10" },
  cashback: { icon: Percent, gradient: "from-cyan-900/70 via-blue-900/50 to-background", accent: "text-cyan-400", glow: "bg-cyan-500/10" },
};

function BonusCard({ promo, featured = false }: { promo: PromoShape; featured?: boolean }) {
  const variant = promo.variant ?? "welcome";
  const cfg = variantConfig[variant] ?? variantConfig.welcome;
  const Icon = cfg.icon;

  return (
    <div className={`relative rounded-2xl border border-white/10 overflow-hidden bg-gradient-to-br ${cfg.gradient} flex flex-col h-full`}>
      {/* Glow accent */}
      <div className={`absolute top-0 right-0 h-32 w-32 rounded-full ${cfg.glow} blur-2xl pointer-events-none`} />

      <div className={`relative z-10 p-6 flex flex-col gap-4 h-full ${featured ? "md:p-8" : ""}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className={`h-14 w-14 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center shrink-0`}>
            <Icon className={`h-7 w-7 ${cfg.accent}`} />
          </div>
          {promo.badge && (
            <span className={`text-[10px] font-bold uppercase tracking-widest ${cfg.accent} bg-white/5 border border-white/10 px-2 py-0.5 rounded-full`}>
              {promo.badge}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className={`font-bold text-white leading-tight ${featured ? "text-2xl" : "text-xl"}`}>
            {promo.title}
            {promo.highlight && (
              <span className="text-amber-300 ml-1">{promo.highlight}</span>
            )}
          </h3>
          {promo.subtitle && (
            <p className="mt-1.5 text-sm text-white/80">{promo.subtitle}</p>
          )}
          {promo.description && (
            <p className="mt-2 text-xs text-white/60 leading-relaxed">{promo.description}</p>
          )}
        </div>

        {/* CTA */}
        {promo.cta && promo.href && (
          <Link to={promo.href} className="w-full md:w-auto self-start">
            <Button className={`gap-2 border-0 w-full md:w-auto ${variant === "welcome" ? "bg-violet-500 hover:bg-violet-400 text-white" : "bg-amber-500 hover:bg-amber-400 text-black"}`}>
              {promo.cta}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

interface SecondHomeBonusSectionProps {
  welcomeDepositPromos: PromoShape[];
  tournamentPromo: PromoShape | null;
  cashbackPromo: PromoShape | null;
}

export function SecondHomeBonusSection({ welcomeDepositPromos, tournamentPromo, cashbackPromo }: SecondHomeBonusSectionProps) {
  const hasMain = welcomeDepositPromos.length > 0;
  const hasExtras = !!tournamentPromo || !!cashbackPromo;

  if (!hasMain && !hasExtras) return null;

  return (
    <section className="container px-4 py-8">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="font-display font-bold text-lg text-foreground">Bonuses &amp; Promotions</h2>
      </div>

      {/* Welcome | Deposit grid */}
      {hasMain && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {welcomeDepositPromos.map((promo, i) => (
            <BonusCard key={i} promo={promo} />
          ))}
        </div>
      )}

      {/* Tournament / Cashback full-width rows */}
      {hasExtras && (
        <div className={`${hasMain ? "mt-4" : ""} flex flex-col gap-4`}>
          {tournamentPromo && <BonusCard promo={tournamentPromo} featured />}
          {cashbackPromo && <BonusCard promo={cashbackPromo} featured />}
        </div>
      )}
    </section>
  );
}
