import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { GameCard } from "@/components/games/GameCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Grid3X3,
  LayoutList,
  Dices,
  Rocket,
  Video,
  Gamepad2,
  Target,
  ChevronDown,
} from "lucide-react";
import apiClient from "@/lib/api";
import { apiGameToCard, SLUG_TO_GAME_TYPES, SLUG_TO_LABEL, type GameCardShape } from "@/lib/gameUtils";

const defaultGames: GameCardShape[] = [
  { id: "1", name: "Teen Patti Gold", image: "https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400&h=300&fit=crop", category: "CASINO", players: 8234, minBet: 50, maxBet: 50000, rating: 4.8, isHot: true, provider: "Evolution" },
  { id: "2", name: "Aviator", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop", category: "CRASH", players: 15234, minBet: 10, maxBet: 100000, rating: 4.9, isHot: true, provider: "Spribe" },
  { id: "3", name: "Lightning Roulette", image: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=300&fit=crop", category: "CASINO", players: 7823, minBet: 100, maxBet: 500000, rating: 4.9, isHot: true, provider: "Evolution" },
  { id: "4", name: "IPL Betting", image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&h=300&fit=crop", category: "SPORTS", players: 18234, minBet: 100, maxBet: 1000000, rating: 4.8, isHot: true, provider: "KarnaliX Sports" },
];

const categories = [
  { id: "all", name: "All Games", icon: Grid3X3 },
  { id: "casino", name: SLUG_TO_LABEL.casino ?? "Casino", icon: Dices },
  { id: "crash", name: SLUG_TO_LABEL.crash ?? "Crash Games", icon: Rocket },
  { id: "liveCasino", name: SLUG_TO_LABEL.liveCasino ?? "Live Casino", icon: Video },
  { id: "casual", name: SLUG_TO_LABEL.casual ?? "Casual", icon: Gamepad2 },
  { id: "sports", name: SLUG_TO_LABEL.sports ?? "Sports", icon: Target },
];

export default function Games() {
  const { category } = useParams();
  const [allGames, setAllGames] = useState<GameCardShape[]>(defaultGames);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(category || "all");
  const [providerNames, setProviderNames] = useState<string[]>(["All Providers"]);
  const [selectedProvider, setSelectedProvider] = useState("All Providers");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    setSelectedCategory(category || "all");
  }, [category]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [gamesRes, providersRes] = await Promise.all([
          apiClient.getPublicGames(),
          apiClient.getPublicProviders(),
        ]);
        if (cancelled) return;
        const games = gamesRes?.results ?? gamesRes ?? [];
        const provs = providersRes?.results ?? providersRes ?? [];
        setAllGames(Array.isArray(games) ? games.map((g: any) => apiGameToCard(g)) : defaultGames);
        const names = Array.isArray(provs) ? ["All Providers", ...provs.map((p: any) => p.name)] : ["All Providers"];
        setProviderNames(names);
      } catch {
        if (!cancelled) setAllGames(defaultGames);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredGames = allGames.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
    const allowedTypes = selectedCategory === "all"
      ? null
      : (SLUG_TO_GAME_TYPES[selectedCategory] ?? [selectedCategory.toUpperCase()]);
    const matchesCategory = allowedTypes === null || (game.category && allowedTypes.includes(game.category));
    const matchesProvider = selectedProvider === "All Providers" ||
      (game.provider && game.provider === selectedProvider);
    return matchesSearch && matchesCategory && matchesProvider;
  });

  const sortedGames = [...filteredGames].sort((a, b) => {
    switch (sortBy) {
      case "popular": return b.players - a.players;
      case "rating": return b.rating - a.rating;
      case "name": return a.name.localeCompare(b.name);
      case "minBet": return a.minBet - b.minBet;
      default: return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      
      <main className="pt-32 pb-20 md:pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {selectedCategory === "all" ? "All Games" : (SLUG_TO_LABEL[selectedCategory] ?? categories.find(c => c.id === selectedCategory)?.name) || "Games"}
            </h1>
            <p className="text-muted-foreground">
              Discover {sortedGames.length} exciting games to play and win
            </p>
          </div>

          {/* Filters Bar */}
          <div className="glass rounded-xl p-4 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search games..."
                  className="pl-10 h-12 bg-input border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Filter */}
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

            {/* Second Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-4">
                {/* Provider Filter */}
                <div className="relative">
                  <select
                    className="appearance-none bg-input border border-border rounded-lg px-4 py-2 pr-8 text-sm"
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                  >
                    {providerNames.map((provider) => (
                      <option key={provider} value={provider}>{provider}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>

                {/* Sort */}
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

              {/* View Mode */}
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

          {/* Games Grid */}
          {loading ? (
            <div className="py-16 text-center text-muted-foreground">Loading games...</div>
          ) : (
          <div className={`grid gap-4 ${
            viewMode === "grid" 
              ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" 
              : "grid-cols-1 md:grid-cols-2"
          }`}>
            {sortedGames.map((game) => (
              <GameCard key={game.id} {...game} />
            ))}
          </div>
          )}

          {!loading && sortedGames.length === 0 && (
            <div className="text-center py-16">
              <Gamepad2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No games found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileNav />
      <WhatsAppButton />
    </div>
  );
}
