import { Link } from "react-router-dom";
import { providers as defaultProviders } from "@/data/homePageMockData";
import type { ProviderShape } from "@/data/homePageMockData";

interface GameProvidersProps {
  providers?: ProviderShape[] | null;
  sectionTitle?: React.ReactNode;
  sectionSvg?: string;
  loading?: boolean;
}

export function GameProviders({ providers: providersProp, sectionTitle, loading }: GameProvidersProps) {
  const providers = providersProp && providersProp.length > 0 ? providersProp : defaultProviders;

  return (
    <section className="py-16 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {sectionTitle ?? (
              <>
                Trusted <span className="gradient-text-gold">Game Providers</span>
              </>
            )}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Partnered with world-class gaming providers for the best experience
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {loading ? (
            <div className="col-span-2 md:col-span-4 text-center text-muted-foreground">Loading providers...</div>
          ) : (
          providers.map((p) => (
            <Link
              key={p.id ?? p.name}
              to={p.single_game_id != null && p.single_game_id > 0 ? `/games/${p.single_game_id}/play` : (p.id != null ? `/providers/${p.id}` : `/games?provider=${encodeURIComponent(p.name.toLowerCase().replace(/\s+/g, "-"))}`)}
              className="group flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-muted/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                {p.logoImage ? (
                  <img src={p.logoImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-white">{p.logo}</span>
                )}
              </div>
              <span className="text-sm font-medium text-white">{p.name}</span>
            </Link>
          ))
          )}
        </div>
      </div>
    </section>
  );
}
