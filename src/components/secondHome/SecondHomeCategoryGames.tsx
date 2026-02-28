import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { GameImageWithFallback } from "@/components/shared/GameImageWithFallback";
import type { GameCardShape } from "@/data/homePageMockData";
import type { GameCategory } from "@/api/games";
import { svgToImgSrc } from "@/lib/svg";

interface SecondHomeCategoryGamesProps {
  categories: GameCategory[];
  gamesByCategory: Record<number, GameCardShape[]>;
  sectionTitle?: string;
  sectionSvg?: string;
}

export function SecondHomeCategoryGames({ categories, gamesByCategory, sectionTitle, sectionSvg }: SecondHomeCategoryGamesProps) {
  return (
    <>
      {categories.map((cat) => {
        const games = gamesByCategory[cat.id] ?? [];
        if (games.length === 0) return null;
        return (
          <section key={cat.id} className="container px-4 py-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                {sectionSvg && <img src={svgToImgSrc(sectionSvg)} alt="" className="h-5 w-5 object-contain" />}
                {cat.name}
              </h2>
              <Link to={`/games?category=${cat.id}`} className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            {/* Mobile: 2 cards visible (calc half viewport minus padding/gap); desktop: more */}
            <div
              className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 min-w-0 snap-x snap-mandatory"
              style={{ WebkitOverflowScrolling: "touch", scrollSnapType: "x mandatory" }}
            >
              {games.map((game) => (
                <Link
                  key={game.id}
                  to={`/games/${game.id}`}
                  className="flex-shrink-0 snap-start rounded-xl overflow-hidden border border-white/10 hover:border-primary/40 transition-all"
                  style={{ width: "calc(50vw - 28px)", maxWidth: "160px", minWidth: "120px" }}
                >
                  <div className="aspect-[4/3]">
                    <GameImageWithFallback src={game.image} alt={game.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2 space-y-0.5">
                    <p className="text-xs font-medium text-foreground truncate">{game.name}</p>
                    {game.provider && <p className="text-[10px] text-muted-foreground truncate">{game.provider}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
