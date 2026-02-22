import { useRef } from "react";
import { Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { featuredGames as defaultFeaturedGames } from "@/data/homePageMockData";
import { GameCardLarge } from "@/components/games/GameCard";
import { Button } from "@/components/ui/button";
import type { GameCardShape } from "@/data/homePageMockData";

interface FeaturedGamesProps {
  games?: GameCardShape[] | null;
}

export function FeaturedGames({ games: gamesProp }: FeaturedGamesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const games = gamesProp && gamesProp.length > 0 ? gamesProp : defaultFeaturedGames;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const step = 320;
    scrollRef.current.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  return (
    <section className="container px-4 py-10">
      <div className="flex items-center gap-2 mb-6">
        <Flame className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-xl font-bold text-foreground">Top Picks for You</h2>
          <p className="text-sm text-muted-foreground">Most popular games right now</p>
        </div>
      </div>
      <div className="relative">
        <Button
          variant="glass"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-2 rounded-full h-10 w-10 hidden md:flex"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="glass"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-2 rounded-full h-10 w-10 hidden md:flex"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x pb-2 -mx-4 px-4"
        >
          {games.map((game) => (
            <GameCardLarge key={String(game.id)} {...game} />
          ))}
        </div>
      </div>
    </section>
  );
}
