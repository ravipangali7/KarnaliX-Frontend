import { Link } from "react-router-dom";

const defaultProviders = [
  { name: "Evolution", logo: "EVO", games: 85, color: "from-orange-500 to-red-500" },
  { name: "Pragmatic Play", logo: "PP", games: 120, color: "from-blue-500 to-cyan-500" },
  { name: "Spribe", logo: "SP", games: 15, color: "from-purple-500 to-pink-500" },
  { name: "Ezugi", logo: "EZ", games: 45, color: "from-green-500 to-emerald-500" },
  { name: "Microgaming", logo: "MG", games: 200, color: "from-yellow-500 to-orange-500" },
  { name: "NetEnt", logo: "NE", games: 150, color: "from-cyan-500 to-blue-500" },
  { name: "Playtech", logo: "PT", games: 180, color: "from-red-500 to-pink-500" },
  { name: "Betsoft", logo: "BS", games: 95, color: "from-indigo-500 to-purple-500" },
];

interface ProviderCard {
  name: string;
  logo: string;
  games: number;
  color: string;
}

interface GameProvidersProps {
  providers?: ProviderCard[] | null;
  loading?: boolean;
}

export function GameProviders({ providers: providersProp, loading }: GameProvidersProps) {
  const providers = providersProp != null && providersProp.length > 0 ? providersProp : defaultProviders;
  return (
    <section className="py-16 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Trusted <span className="gradient-text-gold">Game Providers</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Partnered with world-class gaming providers for the best experience
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-2 md:col-span-4 text-center text-muted-foreground">Loading providers...</div>
          ) : (
          providers.map((provider) => (
            <Link 
              key={provider.name} 
              to={`/games?provider=${provider.name.toLowerCase().replace(' ', '-')}`}
              className="group"
            >
              <div className="glass rounded-xl p-6 text-center hover:glow-cyan transition-all duration-300 group-hover:scale-105">
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${provider.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <span className="text-xl font-bold text-white">{provider.logo}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{provider.name}</h3>
                <p className="text-sm text-muted-foreground">{provider.games}+ Games</p>
              </div>
            </Link>
          ))
          )}
        </div>
      </div>
    </section>
  );
}
