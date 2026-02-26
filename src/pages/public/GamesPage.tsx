import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GameCard } from "@/components/shared/GameCard";
import { GameImageWithFallback } from "@/components/shared/GameImageWithFallback";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { getGames, getCategories, getProviders, getGameImageUrl } from "@/api/games";
import type { Game, GameProvider } from "@/api/games";
import { getMediaUrl } from "@/lib/api";
import { Grid3X3, List, Search } from "lucide-react";

const IRREGULAR_SHAPE = "60% 40% 50% 50% / 50% 60% 40% 50%";

const PAGE_SIZE = 24;

const GamesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") ?? "all";
  const providerParam = searchParams.get("provider") ?? "all";
  const searchParam = searchParams.get("search") ?? "";
  const pageParam = searchParams.get("page");
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchInput, setSearchInput] = useState(searchParam);
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  const categoryId = categoryParam === "all" ? undefined : Number(categoryParam) || undefined;
  const providerId = providerParam === "all" ? undefined : Number(providerParam) || undefined;
  const searchQuery = searchParam.trim() || undefined;

  const setFilters = (updates: { category?: string; provider?: string; search?: string; page?: number }) => {
    const next = new URLSearchParams(searchParams);
    if (updates.category !== undefined) next.set("category", updates.category);
    if (updates.provider !== undefined) next.set("provider", updates.provider);
    if (updates.search !== undefined) {
      if (updates.search) next.set("search", updates.search); else next.delete("search");
    }
    if (updates.page !== undefined) next.set("page", String(updates.page));
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchInput.trim(), page: 1 });
  };

  const { data: gamesData, isLoading: gamesLoading, isError: gamesError, refetch: refetchGames } = useQuery({
    queryKey: ["games", categoryId, providerId, currentPage, searchQuery],
    queryFn: () => getGames(categoryId, providerId, currentPage, PAGE_SIZE, searchQuery),
  });
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: providers = [] } = useQuery({ queryKey: ["providers"], queryFn: getProviders });

  const results = gamesData?.results ?? [];
  const totalCount = gamesData?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="container px-4 py-6 space-y-4">
      <div>
        <h1 className="font-gaming font-bold text-2xl neon-text tracking-wide">ALL GAMES</h1>
        <p className="text-sm text-muted-foreground mt-1">Discover {totalCount} exciting games to play and win</p>
      </div>

      {/* Search - uses backend API with pagination */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search games by name or provider..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 h-10"
            aria-label="Search games"
          />
        </div>
        <Button type="submit" size="sm" className="h-10 shrink-0">
          Search
        </Button>
      </form>

      {/* Provider row: All = filter here; each provider = link to provider detail page */}
      {providers.length > 0 && (
        <div className="flex items-center gap-2 pb-1 overflow-hidden">
          <span className="text-xs text-muted-foreground flex-shrink-0">Provider:</span>
          <div className="flex flex-1 min-w-0 overflow-x-auto scrollbar-hide gap-2 flex-nowrap">
            <Button
              variant={providerParam === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({ provider: "all", page: 1 })}
              className={`flex-shrink-0 ${providerParam === "all" ? "gold-gradient text-primary-foreground neon-glow-sm" : ""}`}
            >
              All
            </Button>
            {(providers as GameProvider[]).map((prov) => {
              const imgUrl = prov.image?.trim() ? getMediaUrl(prov.image.trim()) : undefined;
              const initial = (prov.name ?? "?").slice(0, 2).toUpperCase();
              return (
                <Link
                  key={prov.id}
                  to={`/providers/${prov.id}`}
                  className="flex flex-col items-center gap-1 shrink-0 transition-all p-1 hover:opacity-90 rounded-lg focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                  title={`View ${prov.name} games`}
                >
                  <div
                    className="h-12 w-12 flex items-center justify-center text-white font-bold text-xs overflow-hidden"
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
                      <span className="text-muted-foreground" style={{ borderRadius: IRREGULAR_SHAPE }}>{initial}</span>
                    )}
                  </div>
                  <span className="text-xs max-w-20 truncate text-center">{prov.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Category tabs (below provider) */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Button
          variant={categoryParam === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilters({ category: "all", page: 1 })}
          className={categoryParam === "all" ? "gold-gradient text-primary-foreground neon-glow-sm" : ""}
        >
          All Games
        </Button>
        {categories.map((cat: { id: number; name: string }) => (
          <Button
            key={cat.id}
            variant={categoryParam === String(cat.id) ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters({ category: String(cat.id), page: 1 })}
            className={`whitespace-nowrap ${categoryParam === String(cat.id) ? "gold-gradient text-primary-foreground neon-glow-sm" : ""}`}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex items-center justify-end gap-1">
          <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("grid")}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
      </div>

      {/* Loading / error for games */}
      {gamesLoading && (
        <p className="text-center text-muted-foreground py-8">Loading games…</p>
      )}
      {gamesError && !gamesLoading && (
        <div className="text-center py-8 space-y-2">
          <p className="text-muted-foreground">Could not load games.</p>
          <Button variant="outline" size="sm" onClick={() => refetchGames()}>Retry</Button>
        </div>
      )}

      {/* Games grid/list */}
      {!gamesLoading && !gamesError && viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {results.map((game: Game) => (
            <Link key={game.id} to={`/games/${game.id}`}>
              <GameCard image={getGameImageUrl(game)} name={game.name} category={game.category_name ?? ""} minBet={Number(game.min_bet)} maxBet={Number(game.max_bet)} />
            </Link>
          ))}
        </div>
      ) : !gamesLoading && !gamesError ? (
        <div className="space-y-2">
          {results.map((game: Game) => (
            <Link key={game.id} to={`/games/${game.id}`}>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:neon-glow-sm transition-all">
                <div className="h-12 w-16 rounded overflow-hidden flex-shrink-0">
                  <GameImageWithFallback src={getGameImageUrl(game)} alt={game.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{game.name}</h3>
                  <p className="text-xs text-muted-foreground">{game.category_name ?? ""} • {game.provider_name ?? ""}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>₹{game.min_bet} - ₹{Number(game.max_bet).toLocaleString()}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : null}

      {!gamesLoading && !gamesError && results.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No games found</p>
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

export default GamesPage;
