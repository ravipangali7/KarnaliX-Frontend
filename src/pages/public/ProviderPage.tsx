import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/shared/GameCard";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { getProviderDetail, getGames, getGameImageUrl } from "@/api/games";
import type { Game, ProviderDetailCategory } from "@/api/games";
import { svgToImgSrc } from "@/lib/svg";
import { LayoutGrid } from "lucide-react";

function CategoryIcon({ svg, name }: { svg?: string | null; name: string }) {
  if (!svg?.trim()) {
    return (
      <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
        <LayoutGrid className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }
  const src = svg.trim().startsWith("<svg") ? svgToImgSrc(svg.trim()) : svg.trim();
  return (
    <img src={src} alt={name} className="h-10 w-10 rounded-xl object-contain flex-shrink-0 bg-white/5 border border-white/10 p-1" />
  );
}

const PAGE_SIZE = 24;

const ProviderPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") ?? "all";
  const pageParam = searchParams.get("page");
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const providerId = id ? parseInt(id, 10) : NaN;
  const categoryId = categoryParam === "all" ? undefined : Number(categoryParam) || undefined;

  const { data: provider, isLoading: providerLoading, isError: providerError } = useQuery({
    queryKey: ["provider-detail", providerId],
    queryFn: () => getProviderDetail(providerId),
    enabled: Number.isInteger(providerId) && providerId > 0,
  });

  const { data: gamesData, isLoading: gamesLoading, isError: gamesError, refetch: refetchGames } = useQuery({
    queryKey: ["games", providerId, categoryId, currentPage],
    queryFn: () => getGames(categoryId, providerId, currentPage, PAGE_SIZE),
    enabled: Number.isInteger(providerId) && providerId > 0,
  });

  const setFilters = (updates: { category?: string; page?: number }) => {
    const next = new URLSearchParams(searchParams);
    if (updates.category !== undefined) next.set("category", updates.category);
    if (updates.page !== undefined) next.set("page", String(updates.page));
    setSearchParams(next);
  };

  const results = gamesData?.results ?? [];
  const totalCount = gamesData?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const categories = provider?.categories ?? [];

  if (!id || !Number.isInteger(providerId) || providerId <= 0) {
    return (
      <div className="container px-4 py-6">
        <p className="text-muted-foreground">Invalid provider.</p>
        <Link to="/games" className="text-primary hover:underline mt-2 inline-block">Back to games</Link>
      </div>
    );
  }

  if (providerError || (provider && !providerLoading && !provider)) {
    return (
      <div className="container px-4 py-6">
        <p className="text-muted-foreground">Provider not found.</p>
        <Link to="/games" className="text-primary hover:underline mt-2 inline-block">Back to games</Link>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 space-y-6">
      {/* Banner + name + total games */}
      <div className="space-y-3">
        {providerLoading ? (
          <div className="h-32 md:h-48 rounded-xl bg-muted animate-pulse" />
        ) : (
          <div className="relative w-full rounded-xl overflow-hidden bg-muted aspect-[3/1] max-h-48 md:max-h-56">
            {(provider?.banner || provider?.image) ? (
              <img
                src={provider.banner || provider.image}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground font-display text-lg">
                {provider?.name ?? "Provider"}
              </div>
            )}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          {provider && (provider.image || provider.banner) && (
            <div
              className="h-12 w-12 md:h-14 md:w-14 overflow-hidden flex-shrink-0"
              style={{ borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%" }}
            >
              <img
                src={provider.image || provider.banner}
                alt=""
                className="h-full w-full object-cover"
                style={{ borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%" }}
              />
            </div>
          )}
          <div className="flex flex-wrap items-baseline gap-2">
            <h1 className="font-gaming font-bold text-2xl neon-text tracking-wide">
              {providerLoading ? "…" : provider?.name ?? ""}
            </h1>
            {provider && (
              <span className="text-sm text-muted-foreground">
                {provider.games_count} game{provider.games_count !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Category filters — single-row horizontal scroll, never wraps */}
      {categories.length > 0 && (
        <div
          className="scrollbar-hide pb-2"
          style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", overflowX: "auto", overflowY: "hidden", gap: "12px", width: "100%", WebkitOverflowScrolling: "touch" }}
        >
          {/* All chip */}
          <button
            onClick={() => setFilters({ category: "all", page: 1 })}
            className={`transition-all ${categoryParam === "all" ? "opacity-100" : "opacity-60 hover:opacity-90"}`}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flexShrink: 0, flexGrow: 0, width: "64px", minWidth: "64px" }}
          >
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border-2 transition-all ${categoryParam === "all" ? "border-primary neon-glow-sm bg-primary/10" : "border-white/10 bg-white/5"}`}>
              <LayoutGrid className={`h-6 w-6 ${categoryParam === "all" ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <span className={`text-[10px] font-medium text-center ${categoryParam === "all" ? "text-primary" : "text-muted-foreground"}`} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>All</span>
          </button>
          {(categories as ProviderDetailCategory[]).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilters({ category: String(cat.id), page: 1 })}
              className={`transition-all ${categoryParam === String(cat.id) ? "opacity-100" : "opacity-60 hover:opacity-90"}`}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flexShrink: 0, flexGrow: 0, width: "64px", minWidth: "64px" }}
            >
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border-2 transition-all overflow-hidden ${categoryParam === String(cat.id) ? "border-primary neon-glow-sm bg-primary/10" : "border-white/10 bg-white/5"}`}>
                <CategoryIcon svg={cat.svg} name={cat.name} />
              </div>
              <span className={`text-[10px] font-medium text-center ${categoryParam === String(cat.id) ? "text-primary" : "text-muted-foreground"}`} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>{cat.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Games — single-row horizontal scroll, never wraps */}
      {gamesLoading && <p className="text-center text-muted-foreground py-8">Loading games…</p>}
      {gamesError && !gamesLoading && (
        <div className="text-center py-8 space-y-2">
          <p className="text-muted-foreground">Could not load games.</p>
          <Button variant="outline" size="sm" onClick={() => refetchGames()}>Retry</Button>
        </div>
      )}
      {!gamesLoading && !gamesError && (
        <div
          className="scrollbar-hide pb-2"
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-evenly", overflowX: "auto", overflowY: "hidden", gap: "12px", width: "100%", WebkitOverflowScrolling: "touch", scrollSnapType: "x mandatory" }}
        >
          {results.map((game: Game) => (
            <div key={game.id} style={{ flexShrink: 0, flexGrow: 0, width: "150px", minWidth: "150px", scrollSnapAlign: "start" }}>
              <Link to={`/games/${game.id}`}>
                <GameCard
                  image={getGameImageUrl(game)}
                  name={game.name}
                  category={game.category_name ?? ""}
                  minBet={Number(game.min_bet)}
                  maxBet={Number(game.max_bet)}
                />
              </Link>
            </div>
          ))}
        </div>
      )}

      {!gamesLoading && !gamesError && results.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No games in this category</p>
      )}

      {/* Pagination */}
      {!gamesLoading && !gamesError && totalPages > 1 && (
        <Pagination className="pt-4">
          <PaginationContent className="gap-2">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); setFilters({ page: currentPage - 1 }); }}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                aria-disabled={currentPage <= 1}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-3 py-2 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); setFilters({ page: currentPage + 1 }); }}
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                aria-disabled={currentPage >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default ProviderPage;
