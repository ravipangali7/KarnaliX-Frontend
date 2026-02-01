import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/games/GameCard";
import { ChevronRight, Spade, Dices, Rocket, Video, Gamepad2, Target, Grid3X3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient, { mapGame, mapCategory } from "@/lib/api";

const slugToIcon: Record<string, LucideIcon> = {
  cards: Spade,
  casino: Dices,
  sports: Target,
  "live-casino": Video,
  live: Video,
  casual: Gamepad2,
  crash: Rocket,
};
const slugToColor: Record<string, string> = {
  cards: "primary",
  casino: "secondary",
  sports: "neon-green",
  "live-casino": "neon-red",
  live: "neon-red",
  casual: "accent",
  crash: "neon-cyan",
};

interface CategoryInfo {
  slug: string;
  title: string;
  icon: LucideIcon;
  color: string;
}

interface GamesListSectionProps {
  category: CategoryInfo;
  games: ReturnType<typeof mapGame>[];
  showAll?: boolean;
}

export function GamesList({ category, games, showAll = false }: GamesListSectionProps) {
  const Icon = category.icon;
  const displayGames = showAll ? games : games.slice(0, 8);

  if (games.length === 0) return null;

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-${category.color}/20 flex items-center justify-center`}>
              <Icon className={`w-5 h-5 text-${category.color}`} />
            </div>
            <h2 className="text-xl md:text-2xl font-bold">{category.title}</h2>
          </div>
          {!showAll && games.length > 8 && (
            <Link to={`/games/${category.slug}`}>
              <Button variant="ghost" className="gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {displayGames.map((game) => (
            <GameCard key={game.id} {...game} />
          ))}
        </div>
        {!showAll && games.length > 8 && (
          <div className="mt-6 text-center">
            <Link to={`/games/${category.slug}`}>
              <Button variant="outline" size="lg" className="gap-2">
                More {category.title} <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export function AllGameCategories() {
  const { data: categoriesRaw = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["gameCategories"],
    queryFn: () => apiClient.getGameCategories(),
  });

  const { data: gamesRaw = [], isLoading: gamesLoading } = useQuery({
    queryKey: ["games", "all"],
    queryFn: () => apiClient.getGames({}),
  });

  const categories = useMemo(() => (categoriesRaw as any[]).map((c) => mapCategory(c)), [categoriesRaw]);
  const games = useMemo(() => (gamesRaw as any[]).map((g) => mapGame(g)), [gamesRaw]);

  const gamesByCategorySlug = useMemo(() => {
    const map: Record<string, ReturnType<typeof mapGame>[]> = {};
    for (const game of games) {
      const slug = (game as any).categorySlug || "";
      if (!map[slug]) map[slug] = [];
      map[slug].push(game);
    }
    return map;
  }, [games]);

  const categoryInfos: CategoryInfo[] = useMemo(
    () =>
      categories.map((c) => ({
        slug: c.slug,
        title: c.name,
        icon: slugToIcon[c.slug] ?? Grid3X3,
        color: slugToColor[c.slug] ?? "primary",
      })),
    [categories]
  );

  if (categoriesLoading || gamesLoading) {
    return (
      <>
        {Array.from({ length: 3 }).map((_, i) => (
          <section key={i} className="py-8">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-3 mb-6">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="h-8 w-40" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 8 }).map((_, j) => (
                  <Skeleton key={j} className="aspect-[4/3] rounded-xl" />
                ))}
              </div>
            </div>
          </section>
        ))}
      </>
    );
  }

  return (
    <>
      {categoryInfos.map((cat) => (
        <GamesList
          key={cat.slug}
          category={cat}
          games={gamesByCategorySlug[cat.slug] || []}
          showAll={false}
        />
      ))}
    </>
  );
}
