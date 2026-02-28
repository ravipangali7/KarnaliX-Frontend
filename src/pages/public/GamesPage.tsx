import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GameCard } from "@/components/shared/GameCard";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { getGames, getCategories, getGameImageUrl } from "@/api/games";
import type { Game, GameCategory } from "@/api/games";
import { getMediaUrl } from "@/lib/api";
import { svgToImgSrc } from "@/lib/svg";
import { LayoutGrid, Search } from "lucide-react";

function CategoryIcon({ svg, name }: { svg?: string; name: string }) {
  if (!svg?.trim()) {
    return (
      <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
        <LayoutGrid className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }
  const src = svg.trim().startsWith("<svg") ? svgToImgSrc(svg.trim()) : getMediaUrl(svg.trim());
  return (
    <img src={src} alt={name} className="h-10 w-10 rounded-xl object-contain flex-shrink-0 bg-white/5 border border-white/10 p-1" />
  );
}

const PAGE_SIZE = 24;

const GamesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") ?? "all";
  const searchParam = searchParams.get("search") ?? "";
  const pageParam = searchParams.get("page");
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [searchInput, setSearchInput] = useState(searchParam);
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  const categoryId = categoryParam === "all" ? undefined : Number(categoryParam) || undefined;
  const searchQuery = searchParam.trim() || undefined;

  const setFilters = (updates: { category?: string; search?: string; page?: number }) => {
    const next = new URLSearchParams(searchParams);
    if (updates.category !== undefined) next.set("category", updates.category);
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
    queryKey: ["games", categoryId, currentPage, searchQuery],
    queryFn: () => getGames(categoryId, undefined, currentPage, PAGE_SIZE, searchQuery),
  });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories });

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
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 w-full sm:max-w-md min-w-0">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search games by name or provider..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 h-10 min-h-[44px]"
            aria-label="Search games"
          />
        </div>
        <Button type="submit" size="sm" className="h-10 min-h-[44px] shrink-0 touch-manipulation">
          Search
        </Button>
      </form>

      {/* Category row with SVG icon + name, single-row horizontal scroll */}
      <div
        className="scrollbar-hide pb-2"
        style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", overflowX: "auto", overflowY: "hidden", gap: "12px", width: "100%", WebkitOverflowScrolling: "touch" }}
      >
        {/* All Games chip */}
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
        {(categories as GameCategory[]).map((cat) => (
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

      {/* Games — single-row horizontal scroll, never wraps */}
      {!gamesLoading && !gamesError && (
        <div
          className="scrollbar-hide pb-2"
          style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", overflowX: "auto", overflowY: "hidden", gap: "12px", width: "100%", WebkitOverflowScrolling: "touch", scrollSnapType: "x mandatory" }}
        >
          {results.map((game: Game) => (
            <div key={game.id} style={{ flexShrink: 0, flexGrow: 0, width: "150px", minWidth: "150px", scrollSnapAlign: "start" }}>
              <Link to={`/games/${game.id}`}>
                <GameCard image={getGameImageUrl(game)} name={game.name} category={game.category_name ?? ""} minBet={Number(game.min_bet)} maxBet={Number(game.max_bet)} />
              </Link>
            </div>
          ))}
        </div>
      )}

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
