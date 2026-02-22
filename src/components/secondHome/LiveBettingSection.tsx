import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import type { LiveBettingSection as LiveBettingSectionType } from "@/hooks/useSecondHomePageData";

interface LiveBettingSectionProps {
  section: LiveBettingSectionType;
}

export function LiveBettingSection({ section }: LiveBettingSectionProps) {
  const { title, events } = section;
  if (!events.length) return null;
  return (
    <section className="container px-4 py-6">
      <h2 className="font-display font-bold text-xl mb-4 text-foreground">{title}</h2>
      <div className="space-y-2">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="flex flex-wrap items-center gap-2 md:gap-4 p-3 rounded-lg bg-card border border-border"
          >
            <Link to="/games">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground h-8">
                <Play className="h-3 w-3 mr-1" />
                Play
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate text-foreground">
                {ev.team1} vs. {ev.team2}
              </p>
              <p className="text-xs text-muted-foreground">
                {ev.date} · {ev.time}
              </p>
            </div>
            <div className="flex gap-2">
              {ev.isLive && (
                <span className="text-[10px] font-medium px-2 py-1 rounded bg-primary/20 text-primary">
                  Live
                </span>
              )}
              {ev.odds.map((odd, j) => (
                <span
                  key={j}
                  className={`text-xs font-semibold px-2 py-1 rounded text-white ${
                    j === 0 ? "odds-cell-red" : "odds-cell-blue"
                  }`}
                >
                  {odd}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
