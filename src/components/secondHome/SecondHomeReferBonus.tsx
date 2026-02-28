import { Users, Share2, Gift } from "lucide-react";
import type { PromoShape } from "@/data/homePageMockData";
import { promosGrid as defaultPromos } from "@/data/homePageMockData";
import { SecondHomeBonusCard } from "./SecondHomeBonusSection";

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

      {/* Primary card – same design as reference (value in gold, Login to claim) */}
      <SecondHomeBonusCard promo={primary} />

      {/* Steps row – layout unchanged */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] px-6 md:px-8 py-5 grid grid-cols-3 gap-4">
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

      {/* Secondary promos – same card design, same layout (grid) */}
      {rest.length > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {rest.map((promo, i) => (
            <SecondHomeBonusCard key={i} promo={promo} />
          ))}
        </div>
      )}
    </section>
  );
}
