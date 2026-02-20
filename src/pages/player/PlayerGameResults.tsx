import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getPlayerGameLog, getPlayerWallet } from "@/api/player";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, TrendingDown, Wallet, Radio, ExternalLink } from "lucide-react";

const POLL_INTERVAL_MS = 3000;

const PlayerGameResults = () => {
  const { data: wallet, dataUpdatedAt: walletUpdatedAt } = useQuery({
    queryKey: ["playerWallet"],
    queryFn: getPlayerWallet,
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });
  const { data: gameLogs = [], dataUpdatedAt: gameLogUpdatedAt } = useQuery({
    queryKey: ["player-game-log"],
    queryFn: getPlayerGameLog,
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });
  const [filter, setFilter] = useState<string>("all");
  const logs = gameLogs as Record<string, unknown>[];
  const resultKey = (l: Record<string, unknown>) => String(l.type ?? l.result ?? l.game_result ?? "").toLowerCase();
  const filtered = logs.slice(0, 100).filter((l) => filter === "all" || resultKey(l) === filter);
  const totalBet = filtered.reduce((s, l) => s + Number(l.bet_amount ?? l.betAmount ?? 0), 0);
  const totalWin = filtered.reduce((s, l) => s + Number(l.win_amount ?? l.winAmount ?? 0), 0);

  const w = wallet as Record<string, unknown> | undefined;
  const mainBalance = Number(w?.main_balance ?? 0);
  const bonusBalance = Number(w?.bonus_balance ?? 0);
  const totalBalance = mainBalance + bonusBalance;
  const lastUpdated = Math.max(walletUpdatedAt ?? 0, gameLogUpdatedAt ?? 0);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-gaming font-bold text-xl neon-text tracking-wider">GAME RESULTS</h2>
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Radio className="h-3 w-3 animate-pulse text-primary" />
          Live — updates every 3s
        </span>
      </div>

      {/* Wallet (real-time) */}
      <Card className="gaming-card border-primary/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-muted-foreground">Current balance</span>
            </div>
            {lastUpdated > 0 && (
              <span className="text-[10px] text-muted-foreground">
                Updated {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div>
              <p className="text-[10px] text-muted-foreground">Main</p>
              <p className="font-gaming font-bold text-lg">₹{mainBalance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Bonus</p>
              <p className="font-gaming font-bold text-lg text-primary">₹{bonusBalance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Total</p>
              <p className="font-gaming font-bold text-lg gold-gradient bg-clip-text text-transparent">₹{totalBalance.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Filter (align with API type: win, lose, draw) */}
      <div className="flex gap-2">
        {["all", "win", "lose", "draw"].map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}
            className={`text-xs capitalize ${filter === f ? "gold-gradient text-primary-foreground" : ""}`}>
            {f === "lose" ? "Loss" : f}
          </Button>
        ))}
      </div>

      {/* Desktop header */}
      <div className="hidden md:grid grid-cols-6 gap-2 text-xs text-muted-foreground px-4 py-2 font-semibold border-b border-border">
        <span>Game</span><span>Category</span><span>Bet</span><span>Won</span><span className="text-right">Result</span><span className="text-right">Details</span>
      </div>

      <div className="space-y-2">
        {filtered.map((log: Record<string, unknown>, i: number) => {
          const gameName = String(log.game_name ?? log.game ?? "");
          const category = String(log.category ?? "");
          const betAmount = Number(log.bet_amount ?? log.betAmount ?? 0);
          const winAmount = Number(log.win_amount ?? log.winAmount ?? 0);
          const result = String(log.type ?? log.result ?? "");
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
                <div className="flex justify-between mt-2 text-xs text-muted-foreground items-center">
                  <span>Bet: ₹{betAmount}</span>
                  <div className="flex items-center gap-2">
                    {winAmount > 0 && <span className="text-success font-bold">Won: ₹{winAmount}</span>}
                    {log.id != null && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" asChild>
                        <Link to={`/player/game-results/${log.id}`}>View <ExternalLink className="h-3 w-3" /></Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="hidden md:grid grid-cols-6 gap-2 items-center">
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
                <span className="text-right">
                  {log.id != null && (
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1" asChild>
                      <Link to={`/player/game-results/${log.id}`}>View details</Link>
                    </Button>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        );})}
      </div>
    </div>
  );
};

export default PlayerGameResults;
