import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { GameImageWithFallback } from "@/components/shared/GameImageWithFallback";
import type { GameCardShape } from "@/data/homePageMockData";
import type { GameCategory } from "@/api/games";

interface SecondHomeCategoryGamesProps {
  categories: GameCategory[];
  gamesByCategory: Record<number, GameCardShape[]>;
}

export function SecondHomeCategoryGames({ categories, gamesByCategory }: SecondHomeCategoryGamesProps) {
  return (
    <>
      {categories.map((cat) => {
        const games = gamesByCategory[cat.id] ?? [];
        if (games.length === 0) return null;
        return (
          <section key={cat.id} className="container px-4 py-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-lg text-foreground">{cat.name}</h2>
              <Link to="/games" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {games.map((game) => (
                <Link
                  key={game.id}
                  to={`/games/${game.id}`}
                  className="flex-shrink-0 w-[120px] rounded-xl overflow-hidden border border-white/10 hover:border-primary/40 transition-all"
                >
                  <div className="aspect-[4/3]">
                    <GameImageWithFallback src={game.image} alt={game.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="p-2 text-xs font-medium text-foreground truncate">{game.name}</p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
