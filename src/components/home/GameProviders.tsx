import { Link } from "react-router-dom";
import { providers as defaultProviders } from "@/data/homePageMockData";
import { cn } from "@/lib/utils";
import type { ProviderShape } from "@/data/homePageMockData";

interface GameProvidersProps {
  providers?: ProviderShape[] | null;
}

export function GameProviders({ providers: providersProp }: GameProvidersProps) {
  const providers = providersProp && providersProp.length > 0 ? providersProp : defaultProviders;

  return (
    <section className="container px-4 py-10">
      <h2 className="text-xl font-bold text-foreground mb-2">
        Trusted <span className="gradient-text-gold">Game Providers</span>
      </h2>
      <p className="text-sm text-muted-foreground mb-6">Play games from the best providers in the industry</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {providers.map((p) => (
          <Link
            key={p.name}
            to={`/games?provider=${encodeURIComponent(p.name)}`}
            className="glass rounded-xl p-4 border border-white/10 flex flex-col items-center gap-2 hover:scale-[1.02] hover:border-primary/30 transition-all"
          >
            <div className={cn("h-12 w-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm", p.color)}>
              {p.logo}
            </div>
            <span className="font-semibold text-sm text-foreground text-center">{p.name}</span>
            <span className="text-xs text-muted-foreground">{p.games}+ Games</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
