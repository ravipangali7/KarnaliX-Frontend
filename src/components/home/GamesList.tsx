import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/games/GameCard";
import { ChevronRight, Dices, Rocket, Video, Gamepad2, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import apiClient from "@/lib/api";
import {
  apiGameToCard,
  GAME_TYPE_TO_SLUG,
  SLUG_TO_LABEL,
  CATEGORY_SLUGS_ORDER,
  type GameCardShape,
} from "@/lib/gameUtils";

const SLUG_ICON: Record<string, LucideIcon> = {
  crash: Rocket,
  casino: Dices,
  liveCasino: Video,
  sports: Trophy,
  casual: Gamepad2,
};

const SLUG_COLOR_CLASS: Record<string, string> = {
  crash: "bg-primary/20 text-primary",
  casino: "bg-secondary/20 text-secondary",
  liveCasino: "bg-neon-red/20 text-neon-red",
  sports: "bg-neon-green/20 text-neon-green",
  casual: "bg-accent/20 text-accent",
};

interface GamesListProps {
  slug: string;
  title: string;
  games: GameCardShape[];
  showAll?: boolean;
}

const PREVIEW_LIMIT = 8;

export function GamesList({ slug, title, games, showAll = false }: GamesListProps) {
  const Icon = SLUG_ICON[slug] ?? Gamepad2;
  const colorClass = SLUG_COLOR_CLASS[slug] ?? "bg-muted text-muted-foreground";
  const displayGames = showAll ? games : games.slice(0, PREVIEW_LIMIT);
  const hasMore = games.length > PREVIEW_LIMIT;
  const linkHref = slug === "sports" ? "/sports" : `/games/${slug}`;

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
              <Icon className="w-5 h-5" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          </div>
          {!showAll && games.length > 0 && (
            <Link to={linkHref}>
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

        {!showAll && hasMore && (
          <div className="mt-6 text-center">
            <Link to={linkHref}>
              <Button variant="outline" size="lg" className="gap-2">
                More {title} <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export type { GameCardShape } from "@/lib/gameUtils";

export function AllGameCategories() {
  const [gamesBySlug, setGamesBySlug] = useState<Record<string, GameCardShape[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.getPublicGames();
        if (cancelled) return;
        const raw = res?.results ?? res ?? [];
        const list = Array.isArray(raw) ? raw : [];
        const bySlug: Record<string, GameCardShape[]> = {};
        for (const g of list) {
          const slug = GAME_TYPE_TO_SLUG[g.game_type] ?? "casual";
          if (!bySlug[slug]) bySlug[slug] = [];
          bySlug[slug].push(apiGameToCard(g));
        }
        setGamesBySlug(bySlug);
      } catch {
        if (!cancelled) setGamesBySlug({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const slugsToShow = useMemo(
    () => CATEGORY_SLUGS_ORDER.filter((slug) => (gamesBySlug[slug]?.length ?? 0) > 0),
    [gamesBySlug]
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl h-48 bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {slugsToShow.map((slug) => (
        <GamesList
          key={slug}
          slug={slug}
          title={SLUG_TO_LABEL[slug] ?? slug}
          games={gamesBySlug[slug] ?? []}
        />
      ))}
    </>
  );
}
