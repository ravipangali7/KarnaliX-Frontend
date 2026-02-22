import { Link } from "react-router-dom";
import { Users, Gamepad2, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hero as defaultHero, heroStats as defaultHeroStats } from "@/data/homePageMockData";
import type { HeroData } from "@/data/homePageMockData";

const statIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  users: Users,
  gamepad: Gamepad2,
  trophy: Trophy,
  zap: Zap,
};

interface HeroSectionProps {
  hero?: HeroData | null;
  heroStats?: { label: string; value: string; icon: string }[] | null;
}

export function HeroSection({ hero: heroProp, heroStats: heroStatsProp }: HeroSectionProps) {
  const hero = heroProp ?? defaultHero;
  const heroStats = heroStatsProp && heroStatsProp.length > 0 ? heroStatsProp : defaultHeroStats;

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-hero-pattern">
      {/* Floating orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/20 blur-[100px] animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-secondary/15 blur-[120px] animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-accent/10 blur-[80px] animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container relative z-10 px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 mb-6">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">{hero.badge ?? "Nepal's #1 Gaming Platform"}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Play. Win. <span className="gradient-text">Repeat.</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            {hero.subtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link to={hero.ctaHref ?? "/register"}>
              <Button variant="neon" size="xl">{hero.ctaText ?? "Start Playing"}</Button>
            </Link>
            <Link to="/games">
              <Button variant="glass" size="xl">Explore Games</Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {heroStats.map((s) => {
              const Icon = statIcons[s.icon as keyof typeof statIcons] ?? Trophy;
              return (
                <div key={s.label} className="glass rounded-xl p-4 border border-white/10 flex flex-col items-center gap-2">
                  <Icon className="h-7 w-7 text-primary" />
                  <span className="font-bold text-lg text-foreground font-roboto-mono">{s.value}</span>
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating promo cards (desktop) */}
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-52 animate-float" style={{ animationDelay: "0.5s" }}>
          <div className="glass rounded-xl p-4 border border-white/10 shadow-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Weekly Tournament</p>
            <p className="font-bold text-primary">₹10 Lakh</p>
            <p className="text-xs text-muted-foreground">Prize pool</p>
            <Link to="/tournaments" className="text-xs text-primary font-semibold mt-2 inline-block hover:underline">Join →</Link>
          </div>
        </div>
        <div className="hidden lg:block absolute left-8 top-1/3 w-52 animate-float" style={{ animationDelay: "1.5s" }}>
          <div className="glass rounded-xl p-4 border border-white/10 shadow-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Welcome Bonus</p>
            <p className="font-bold text-primary">200%</p>
            <p className="text-xs text-muted-foreground">Up to ₹50,000</p>
            <Link to="/bonus" className="text-xs text-primary font-semibold mt-2 inline-block hover:underline">Claim →</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
