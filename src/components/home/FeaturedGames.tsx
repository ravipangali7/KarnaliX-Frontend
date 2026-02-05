import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameCardLarge } from "@/components/games/GameCard";
import type { GameCardShape } from "@/lib/gameUtils";

const defaultFeaturedGames: GameCardShape[] = [
  { id: "1", name: "Aviator", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=450&fit=crop", category: "CRASH", players: 12543, minBet: 10, maxBet: 100000, rating: 4.9, isHot: true, provider: "Spribe" },
  { id: "2", name: "Teen Patti Royal", image: "https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=800&h=450&fit=crop", category: "CASINO", players: 8234, minBet: 50, maxBet: 50000, rating: 4.8, isNew: true, provider: "Evolution" },
  { id: "3", name: "Lightning Roulette", image: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800&h=450&fit=crop", category: "LIVE", players: 5621, minBet: 100, maxBet: 500000, rating: 4.9, isHot: true, provider: "Evolution" },
  { id: "4", name: "IPL Betting", image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=450&fit=crop", category: "SPORTS", players: 15789, minBet: 100, maxBet: 1000000, rating: 4.7, isHot: true, provider: "KarnaliX Sports" },
  { id: "5", name: "VIP Blackjack", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=450&fit=crop", category: "CASINO", players: 3421, minBet: 500, maxBet: 200000, rating: 4.8, provider: "Pragmatic Play" },
];

interface FeaturedGamesProps {
  games?: GameCardShape[] | null;
  loading?: boolean;
}

export function FeaturedGames({ games, loading }: FeaturedGamesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const featuredGames = games != null && games.length > 0 ? games : defaultFeaturedGames;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Section Header */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-red to-orange-500 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Top Picks for You</h2>
              <p className="text-muted-foreground text-sm">Most popular games right now</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Games Carousel */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-6 overflow-x-auto scrollbar-hide px-4 pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="w-4 flex-shrink-0" />
        {loading ? (
          <div className="flex gap-6 px-4">Loading...</div>
        ) : (
          featuredGames.map((game) => (
            <div key={game.id} className="w-[400px] flex-shrink-0 snap-start">
              <GameCardLarge {...game} />
            </div>
          ))
        )}
        <div className="w-4 flex-shrink-0" />
      </div>
    </section>
  );
}
