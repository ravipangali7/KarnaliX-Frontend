import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getPlayerGameLog } from "@/api/player";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, TrendingDown } from "lucide-react";

const PlayerGameResults = () => {
  const { data: gameLogs = [] } = useQuery({ queryKey: ["player-game-log"], queryFn: getPlayerGameLog });
  const [filter, setFilter] = useState<string>("all");
  const filtered = (gameLogs as Record<string, unknown>[]).slice(0, 20).filter((l) => filter === "all" || (l.result ?? l.game_result) === filter);
  const totalBet = filtered.reduce((s, l) => s + Number(l.bet_amount ?? l.betAmount ?? 0), 0);
  const totalWin = filtered.reduce((s, l) => s + Number(l.win_amount ?? l.winAmount ?? 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
      <h2 className="font-gaming font-bold text-xl neon-text tracking-wider">GAME RESULTS</h2>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="gaming-card">
          <CardContent className="p-3 text-center">
            <Gamepad2 className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="font-gaming font-bold text-sm">{filtered.length}</p>
            <p className="text-[9px] text-muted-foreground">Total Games</p>
          </CardContent>
        </Card>
        <Card className="gaming-card">
          <CardContent className="p-3 text-center">
            <Trophy className="h-4 w-4 mx-auto text-success mb-1" />
            <p className="font-gaming font-bold text-sm text-success">₹{totalWin.toLocaleString()}</p>
            <p className="text-[9px] text-muted-foreground">Total Won</p>
          </CardContent>
        </Card>
        <Card className="gaming-card">
          <CardContent className="p-3 text-center">
            <TrendingDown className="h-4 w-4 mx-auto text-accent mb-1" />
            <p className="font-gaming font-bold text-sm">₹{totalBet.toLocaleString()}</p>
            <p className="text-[9px] text-muted-foreground">Total Bet</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["all", "win", "loss", "draw"].map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}
            className={`text-xs capitalize ${filter === f ? "gold-gradient text-primary-foreground" : ""}`}>
            {f}
          </Button>
        ))}
      </div>

      {/* Desktop header */}
      <div className="hidden md:grid grid-cols-5 gap-2 text-xs text-muted-foreground px-4 py-2 font-semibold border-b border-border">
        <span>Game</span><span>Category</span><span>Bet</span><span>Won</span><span className="text-right">Result</span>
      </div>

      <div className="space-y-2">
        {filtered.map((log: Record<string, unknown>, i: number) => {
          const gameName = String(log.game_name ?? log.game ?? "");
          const category = String(log.category ?? "");
          const betAmount = Number(log.bet_amount ?? log.betAmount ?? 0);
          const winAmount = Number(log.win_amount ?? log.winAmount ?? 0);
          const result = String(log.result ?? "");
          const playedAt = log.created_at ?? log.playedAt;
          return (
          <Card key={String(log.id ?? i)} className="hover:border-primary/20 transition-colors">
            <CardContent className="p-3 md:p-4">
              <div className="md:hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{gameName}</p>
                    <p className="text-[10px] text-muted-foreground">{category} • {playedAt ? new Date(String(playedAt)).toLocaleString() : ""}</p>
                  </div>
                  <StatusBadge status={result} />
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Bet: ₹{betAmount}</span>
                  {winAmount > 0 && <span className="text-success font-bold">Won: ₹{winAmount}</span>}
                </div>
              </div>
              <div className="hidden md:grid grid-cols-5 gap-2 items-center">
                <div>
                  <p className="text-sm font-semibold">{gameName}</p>
                  <p className="text-[10px] text-muted-foreground">{playedAt ? new Date(String(playedAt)).toLocaleString() : ""}</p>
                </div>
                <span className="text-xs">{category}</span>
                <span className="text-xs font-medium">₹{betAmount}</span>
                <span className={`text-xs font-bold ${winAmount > 0 ? "text-success" : "text-muted-foreground"}`}>
                  {winAmount > 0 ? `₹${winAmount}` : "-"}
                </span>
                <span className="text-right"><StatusBadge status={result} /></span>
              </div>
            </CardContent>
          </Card>
        );})}
      </div>
    </div>
  );
};

export default PlayerGameResults;
