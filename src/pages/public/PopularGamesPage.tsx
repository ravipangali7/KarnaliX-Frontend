import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/shared/GameCard";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { getGames, getGameImageUrl } from "@/api/games";
import type { Game } from "@/api/games";

const PAGE_SIZE = 24;

const PopularGamesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get("page");
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const { data: gamesData, isLoading, isError, refetch } = useQuery({
    queryKey: ["games", "popular", currentPage],
    queryFn: () => getGames(undefined, undefined, currentPage, PAGE_SIZE, undefined, { is_popular_game: true }),
  });

  const results = gamesData?.results ?? [];
  const totalCount = gamesData?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const setPage = (page: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    setSearchParams(next);
  };

  return (
    <div className="container px-2 mobile:px-4 py-4 mobile:py-6 space-y-4 min-w-0 max-w-full">
      <div className="min-w-0">
        <h1 className="font-gaming font-bold text-xl mobile:text-2xl neon-text tracking-wide truncate">POPULAR GAMES</h1>
        <p className="text-xs mobile:text-sm text-muted-foreground mt-1 truncate">Most played games by our players</p>
      </div>

      {isLoading && <p className="text-center text-muted-foreground py-8 text-sm">Loading games…</p>}
      {isError && !isLoading && (
        <div className="text-center py-8 space-y-2">
          <p className="text-muted-foreground text-sm">Could not load games.</p>
          <Button variant="outline" size="sm" className="touch-manipulation min-h-[44px]" onClick={() => refetch()}>Retry</Button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-2 mobile:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 mobile:gap-3 min-w-0">
          {results.map((game: Game) => (
            <div key={game.id} className="min-w-0 w-full">
              <Link to={`/games/${game.id}`} className="block min-w-0">
                <GameCard image={getGameImageUrl(game)} name={game.name} category={game.category_name ?? ""} minBet={Number(game.min_bet)} maxBet={Number(game.max_bet)} />
              </Link>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !isError && results.length === 0 && (
        <p className="text-center text-muted-foreground py-12 text-sm">No popular games found</p>
      )}

      {!isLoading && !isError && totalPages > 1 && (
        <Pagination className="pt-4">
          <PaginationContent className="gap-1 mobile:gap-2 flex-wrap">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); setPage(currentPage - 1); }}
                className={`min-h-[44px] touch-manipulation ${currentPage <= 1 ? "pointer-events-none opacity-50" : ""}`}
                aria-disabled={currentPage <= 1}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-2 mobile:px-3 py-2 text-xs mobile:text-sm text-muted-foreground whitespace-nowrap">
                Page {currentPage} of {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); setPage(currentPage + 1); }}
                className={`min-h-[44px] touch-manipulation ${currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}`}
                aria-disabled={currentPage >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default PopularGamesPage;
