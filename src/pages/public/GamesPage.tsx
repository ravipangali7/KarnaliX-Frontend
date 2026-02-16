import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/shared/GameCard";
import { getGames, getCategories, getProviders, getGameImageUrl } from "@/api/games";
import type { Game } from "@/api/games";
import { Search, Grid3X3, List } from "lucide-react";

const GamesPage = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const providerParam = searchParams.get("provider");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(categoryParam || "all");
  const [activeProvider, setActiveProvider] = useState(providerParam || "all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categoryId = activeCategory === "all" ? undefined : Number(activeCategory) || undefined;
  const providerId = activeProvider === "all" ? undefined : Number(activeProvider) || undefined;
  const { data: games = [], isLoading: gamesLoading, isError: gamesError, refetch: refetchGames } = useQuery({ queryKey: ["games", categoryId, providerId], queryFn: () => getGames(categoryId, providerId) });
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: providers = [] } = useQuery({ queryKey: ["providers"], queryFn: getProviders });

  const filtered = games.filter((g: Game) => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || (g.category_name ?? "").toLowerCase().includes(search.toLowerCase()) || (g.provider_name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === "all" || g.category === Number(activeCategory);
    const matchProvider = activeProvider === "all" || g.provider === Number(activeProvider);
    return matchSearch && matchCategory && matchProvider;
  });

  return (
    <div className="container px-4 py-6 space-y-4">
      <div>
        <h1 className="font-gaming font-bold text-2xl neon-text tracking-wide">ALL GAMES</h1>
        <p className="text-sm text-muted-foreground mt-1">Discover {filtered.length} exciting games to play and win</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by game name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Button
          variant={activeCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveCategory("all")}
          className={activeCategory === "all" ? "gold-gradient text-primary-foreground neon-glow-sm" : ""}
        >
          All Games
        </Button>
        {categories.map((cat: { id: number; name: string }) => (
          <Button
            key={cat.id}
            variant={activeCategory === String(cat.id) ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(String(cat.id))}
            className={`whitespace-nowrap ${activeCategory === String(cat.id) ? "gold-gradient text-primary-foreground neon-glow-sm" : ""}`}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Provider filter */}
      {providers.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-muted-foreground self-center mr-1 flex-shrink-0">Provider:</span>
          <Button
            variant={activeProvider === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveProvider("all")}
            className={activeProvider === "all" ? "gold-gradient text-primary-foreground neon-glow-sm" : ""}
          >
            All
          </Button>
          {providers.map((prov: { id: number; name: string; code: string }) => (
            <Button
              key={prov.id}
              variant={activeProvider === String(prov.id) ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveProvider(String(prov.id))}
              className={`whitespace-nowrap ${activeProvider === String(prov.id) ? "gold-gradient text-primary-foreground neon-glow-sm" : ""}`}
            >
              {prov.name}
            </Button>
          ))}
        </div>
      )}

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
          {filtered.map((game: Game) => (
            <Link key={game.id} to={`/games/${game.id}`}>
              <GameCard image={getGameImageUrl(game)} name={game.name} category={game.category_name ?? ""} minBet={Number(game.min_bet)} maxBet={Number(game.max_bet)} />
            </Link>
          ))}
        </div>
      ) : !gamesLoading && !gamesError ? (
        <div className="space-y-2">
          {filtered.map((game: Game) => (
            <Link key={game.id} to={`/games/${game.id}`}>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:neon-glow-sm transition-all">
                <img src={getGameImageUrl(game)} alt={game.name} className="h-12 w-16 object-cover rounded" />
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

      {!gamesLoading && !gamesError && filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No games found</p>
      )}
    </div>
  );
};

export default GamesPage;
