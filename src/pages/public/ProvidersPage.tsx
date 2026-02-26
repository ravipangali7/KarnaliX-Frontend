import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProviders } from "@/api/games";
import type { GameProvider } from "@/api/games";
import { getMediaUrl } from "@/lib/api";

const IRREGULAR_SHAPE = "60% 40% 50% 50% / 50% 60% 40% 50%";

const ProvidersPage = () => {
  const { data: providers = [], isLoading, isError } = useQuery({
    queryKey: ["providers"],
    queryFn: getProviders,
  });

  if (isLoading) {
    return (
      <div className="container px-4 py-6">
        <p className="text-center text-muted-foreground py-12">Loading providers…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container px-4 py-6">
        <p className="text-center text-muted-foreground py-12">Could not load providers.</p>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 space-y-6">
      <div>
        <h1 className="font-gaming font-bold text-2xl neon-text tracking-wide">GAME PROVIDERS</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse by provider to find your favorite games
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {(providers as GameProvider[]).map((prov) => {
          const imgUrl = prov.image?.trim() ? getMediaUrl(prov.image.trim()) : undefined;
          const initial = (prov.name ?? "?").slice(0, 2).toUpperCase();
          return (
            <Link
              key={prov.id}
              to={`/providers/${prov.id}`}
              className="flex flex-col items-center gap-3 p-4 rounded-xl transition-all group focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <div
                className="h-20 w-20 flex items-center justify-center text-white font-bold text-lg overflow-hidden"
                style={{ borderRadius: IRREGULAR_SHAPE }}
              >
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ borderRadius: IRREGULAR_SHAPE }}
                  />
                ) : (
                  <span className="text-muted-foreground" style={{ borderRadius: IRREGULAR_SHAPE }}>
                    {initial}
                  </span>
                )}
              </div>
              <span className="font-semibold text-sm text-foreground text-center group-hover:text-primary transition-colors line-clamp-2">
                {prov.name}
              </span>
            </Link>
          );
        })}
      </div>
      {providers.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No providers found.</p>
      )}
    </div>
  );
};

export default ProvidersPage;
