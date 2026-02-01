import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { GameCard } from "@/components/games/GameCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Grid3X3,
  LayoutList,
  Spade,
  Dices,
  Rocket,
  Video,
  Gamepad2,
  Target,
  ChevronDown,
} from "lucide-react";
import apiClient, { mapGame, mapCategory, mapProvider } from "@/lib/api";

const slugToIcon: Record<string, typeof Spade> = {
  all: Grid3X3,
  cards: Spade,
  casino: Dices,
  crash: Rocket,
  live: Video,
  "live-casino": Video,
  casual: Gamepad2,
  sports: Target,
};

function getIconForSlug(slug: string) {
  return slugToIcon[slug] || Grid3X3;
}

export default function Games() {
  const { category: categoryParam } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "all");
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: categoriesRaw = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["gameCategories"],
    queryFn: () => apiClient.getGameCategories(),
  });

  const { data: providersRaw = [], isLoading: providersLoading } = useQuery({
    queryKey: ["gameProviders"],
    queryFn: () => apiClient.getGameProviders(),
  });

  const { data: gamesRaw = [], isLoading: gamesLoading, error: gamesError } = useQuery({
    queryKey: ["games", selectedCategory, selectedProviderId, searchQuery.trim()],
    queryFn: async () => {
      const params: { category?: string; provider?: string; search?: string } = {};
      if (selectedCategory && selectedCategory !== "all") params.category = selectedCategory;
      if (selectedProviderId) params.provider = selectedProviderId;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      return apiClient.getGames(params);
    },
  });

  const categories = useMemo(() => {
    const mapped = (categoriesRaw as any[]).map((c) => mapCategory(c));
    return [
      { id: "all", name: "All Games", slug: "all", icon: Grid3X3 },
      ...mapped.map((c) => ({ ...c, id: c.slug, icon: getIconForSlug(c.slug) })),
    ];
  }, [categoriesRaw]);

  const providers = useMemo(() => {
    const mapped = (providersRaw as any[]).map((p) => mapProvider(p));
    return [{ id: "", name: "All Providers" }, ...mapped];
  }, [providersRaw]);

  const games = useMemo(() => {
    return (gamesRaw as any[]).map((g) => mapGame(g));
  }, [gamesRaw]);

  const sortedGames = useMemo(() => {
    const list = [...games];
    switch (sortBy) {
      case "popular":
        return list.sort((a, b) => (b.players ?? 0) - (a.players ?? 0));
      case "rating":
        return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case "name":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "minBet":
        return list.sort((a, b) => a.minBet - b.minBet);
      default:
        return list;
    }
  }, [games, sortBy]);

  const isLoading = categoriesLoading || providersLoading || gamesLoading;

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />

      <main className="pt-32 pb-20 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {selectedCategory === "all"
                ? "All Games"
                : categories.find((c) => c.id === selectedCategory)?.name || "Games"}
            </h1>
            <p className="text-muted-foreground">
              {isLoading
                ? "Loading..."
                : `Discover ${sortedGames.length} exciting games to play and win`}
            </p>
          </div>

          <div className="glass rounded-xl p-4 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search games..."
                  className="pl-10 h-12 bg-input border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? "default" : "outline"}
                      size="sm"
                      className="flex-shrink-0 gap-2"
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      <Icon className="w-4 h-4" />
                      {cat.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <select
                    className="appearance-none bg-input border border-border rounded-lg px-4 py-2 pr-8 text-sm"
                    value={selectedProviderId}
                    onChange={(e) => setSelectedProviderId(e.target.value)}
                  >
                    {providers.map((p) => (
                      <option key={p.id} value={String(p.id)}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    className="appearance-none bg-input border border-border rounded-lg px-4 py-2 pr-8 text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Top Rated</option>
                    <option value="name">A-Z</option>
                    <option value="minBet">Min Bet</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{sortedGames.length} games</span>
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <LayoutList className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {gamesError && (
            <div className="text-center py-16 text-destructive">
              Failed to load games. Please try again.
            </div>
          )}

          {isLoading && (
            <div
              className={`grid gap-4 ${
                viewMode === "grid"
                  ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                  : "grid-cols-1 md:grid-cols-2"
              }`}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
              ))}
            </div>
          )}

          {!isLoading && !gamesError && (
            <>
              <div
                className={`grid gap-4 ${
                  viewMode === "grid"
                    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                    : "grid-cols-1 md:grid-cols-2"
                }`}
              >
                {sortedGames.map((game) => (
                  <GameCard key={game.id} {...game} />
                ))}
              </div>

              {sortedGames.length === 0 && (
                <div className="text-center py-16">
                  <Gamepad2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No games found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search query
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
      <MobileNav />
      <WhatsAppButton />
    </div>
  );
}
