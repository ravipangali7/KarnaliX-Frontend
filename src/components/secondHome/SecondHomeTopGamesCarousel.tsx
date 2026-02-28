import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { GameImageWithFallback } from "@/components/shared/GameImageWithFallback";
import type { GameCardShape } from "@/data/homePageMockData";
import { ChevronRight } from "lucide-react";

const CARD_WIDTH = 140;
const VISIBLE = 8;
const TOTAL = 16;
const AUTO_SCROLL_MS = 4000;

interface SecondHomeTopGamesCarouselProps {
  games: GameCardShape[];
  sectionTitle?: string;
  sectionSvg?: string;
}

export function SecondHomeTopGamesCarousel({ games, sectionTitle, sectionSvg }: SecondHomeTopGamesCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const list = games.slice(0, TOTAL);
  if (list.length === 0) return null;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || list.length <= VISIBLE) return;
    let step = 0;
    const maxSteps = Math.ceil(list.length / VISIBLE);
    const run = () => {
      step = (step + 1) % maxSteps;
      el.scrollTo({ left: step * CARD_WIDTH * VISIBLE, behavior: "smooth" });
    };
    const id = setInterval(run, AUTO_SCROLL_MS);
    return () => clearInterval(id);
  }, [list.length]);

  return (
    <section className="container px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
          {sectionSvg && <img src={sectionSvg} alt="" className="h-6 w-6 object-contain" />}
          {sectionTitle || "Top Games"}
        </h2>
        <Link to="/games" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
          View All <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory py-2 min-w-0"
        style={{ WebkitOverflowScrolling: "touch", scrollSnapType: "x mandatory" }}
      >
        {list.map((game) => (
          <Link
            key={game.id}
            to={`/games/${game.id}`}
            className="flex-shrink-0 w-[140px] snap-start rounded-xl overflow-hidden border border-white/10 hover:border-primary/40 transition-all hover:scale-[1.02]"
            style={{ width: CARD_WIDTH }}
          >
            <div className="aspect-[4/3] relative">
              <GameImageWithFallback src={game.image} alt={game.name} className="w-full h-full object-cover" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
