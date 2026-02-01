import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient, { mapProvider } from "@/lib/api";

const defaultColors = [
  "from-orange-500 to-red-500",
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-green-500 to-emerald-500",
  "from-yellow-500 to-orange-500",
  "from-cyan-500 to-blue-500",
  "from-red-500 to-pink-500",
  "from-indigo-500 to-purple-500",
];

export function GameProviders() {
  const { data: providersRaw = [], isLoading } = useQuery({
    queryKey: ["gameProviders"],
    queryFn: () => apiClient.getGameProviders(),
  });

  const providers = (providersRaw as any[]).map((p, i) => {
    const mapped = mapProvider(p);
    return {
      ...mapped,
      color: typeof mapped.color === "string" && mapped.color.startsWith("from-")
        ? mapped.color
        : defaultColors[i % defaultColors.length],
    };
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-9 w-56 mx-auto mb-3" />
            <Skeleton className="h-4 w-80 mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (providers.length === 0) return null;

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
          {providers.map((provider) => (
            <Link
              key={provider.id}
              to={`/games?provider=${provider.id}`}
              className="group"
            >
              <div className="glass rounded-xl p-6 text-center hover:glow-cyan transition-all duration-300 group-hover:scale-105">
                <div
                  className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${provider.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <span className="text-xl font-bold text-white">{provider.logo}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{provider.name}</h3>
                <p className="text-sm text-muted-foreground">{provider.games}+ Games</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
