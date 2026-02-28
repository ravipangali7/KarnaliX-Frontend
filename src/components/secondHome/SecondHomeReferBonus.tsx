import { Link } from "react-router-dom";
import { Users, Share2, Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PromoShape } from "@/data/homePageMockData";
import { promosGrid as defaultPromos } from "@/data/homePageMockData";

interface SecondHomeReferBonusProps {
  promos?: PromoShape[] | null;
}

export function SecondHomeReferBonus({ promos: promosProp }: SecondHomeReferBonusProps) {
  const promos = promosProp && promosProp.length > 0 ? promosProp : defaultPromos;
  const primary = promos[0];
  const rest = promos.slice(1);

  if (!primary) return null;

  return (
    <section className="container px-4 py-8">
      <div className="flex items-center gap-2 mb-5">
        <Share2 className="h-5 w-5 text-primary" />
        <h2 className="font-display font-bold text-lg text-foreground">Refer &amp; Earn</h2>
      </div>

      <div className="rounded-2xl overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-emerald-900/60 via-teal-900/40 to-background relative">
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
          {/* Icon badge */}
          <div className="flex-shrink-0 flex items-center justify-center h-20 w-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/30">
            <Users className="h-10 w-10 text-emerald-400" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            {primary.badge && (
              <span className="inline-block mb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                {primary.badge}
              </span>
            )}
            <h3 className="text-2xl font-bold text-white leading-tight">
              {primary.title}
              {primary.highlight && (
                <span className="text-amber-300 ml-2">{primary.highlight}</span>
              )}
            </h3>
            {primary.subtitle && (
              <p className="mt-1 text-sm text-white/80">{primary.subtitle}</p>
            )}
            {primary.description && (
              <p className="mt-2 text-xs text-white/60 max-w-xl">{primary.description}</p>
            )}
          </div>

          {/* CTA */}
          {primary.cta && primary.href && (
            <Link to={primary.href} className="shrink-0">
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold gap-2 border-0">
                {primary.cta}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        {/* Steps row */}
        <div className="relative z-10 border-t border-white/10 px-6 md:px-8 py-5 grid grid-cols-3 gap-4">
          {[
            { icon: Share2, label: "Share your link", step: "01" },
            { icon: Users, label: "Friend signs up", step: "02" },
            { icon: Gift, label: "You both earn", step: "03" },
          ].map(({ icon: Icon, label, step }) => (
            <div key={step} className="flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-emerald-400" />
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{step}</p>
              <p className="text-xs text-foreground/80">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary promos */}
      {rest.length > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {rest.map((promo, i) => (
            <Link
              key={i}
              to={promo.href ?? "/promotions"}
              className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors p-4"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <Gift className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{promo.title}</p>
                {promo.subtitle && <p className="text-xs text-muted-foreground truncate">{promo.subtitle}</p>}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
