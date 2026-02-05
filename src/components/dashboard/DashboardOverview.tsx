import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api";
import { apiGameToCard } from "@/lib/gameUtils";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Gamepad2,
  Gift,
  Trophy,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Star,
} from "lucide-react";

interface ActiveBetRow {
  game: string;
  type: string;
  odds: string;
  stake: number;
  status: string;
}

interface RecentActivityRow {
  name: string;
  result: "win" | "loss";
  amount: number;
  time: string;
}

interface FeaturedGameRow {
  id: string;
  name: string;
  image: string;
}

interface DashboardOverviewProps {
  walletBalance: number;
  dashboardStats?: any;
  loading?: boolean;
  userName?: string;
  setActiveTab?: (tab: string) => void;
}

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

export function DashboardOverview({
  walletBalance,
  dashboardStats,
  loading,
  userName,
  setActiveTab,
}: DashboardOverviewProps) {
  const [activeBetsList, setActiveBetsList] = useState<ActiveBetRow[]>([]);
  const [recentGamesList, setRecentGamesList] = useState<RecentActivityRow[]>([]);
  const [featuredGames, setFeaturedGames] = useState<FeaturedGameRow[]>([]);
  const [promoContent, setPromoContent] = useState<{ title?: string; highlight?: string; subtitle?: string } | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setOverviewLoading(true);
      try {
        const [betsRes, gamesRes, contentRes] = await Promise.all([
          apiClient.getUserBets().catch(() => ({ results: [] })),
          apiClient.getPublicGames({ featured: "4" }).catch(() => ({ results: [] })),
          apiClient.getPublicContent().catch(() => null),
        ]);
        if (cancelled) return;

        const betsRaw = betsRes?.results ?? (Array.isArray(betsRes) ? betsRes : []);
        const bets = Array.isArray(betsRaw) ? betsRaw : [];
        const pending = bets.filter((b: any) => String(b.result || b.status || "").toUpperCase() === "PENDING");
        const settled = bets.filter((b: any) => String(b.result || b.status || "").toUpperCase() !== "PENDING").slice(0, 5);

        setActiveBetsList(
          pending.map((b: any) => ({
            game: b.game_name || b.game || "—",
            type: b.game_type || b.category || "—",
            odds: b.odds ? String(b.odds) : "—",
            stake: typeof b.bet_amount === "string" ? parseFloat(b.bet_amount) : Number(b.bet_amount) || 0,
            status: "pending",
          }))
        );

        setRecentGamesList(
          settled.map((b: any) => {
            const result = String(b.result || b.status || "").toLowerCase();
            const isWin = result === "won" || result === "win" || result === "settled";
            const betAmount = typeof b.bet_amount === "string" ? parseFloat(b.bet_amount) : Number(b.bet_amount) || 0;
            const winAmount = typeof b.win_amount === "string" ? parseFloat(b.win_amount) : Number(b.win_amount) || 0;
            const amount = isWin ? winAmount : -betAmount;
            return {
              name: b.game_name || b.game || "—",
              result: isWin ? "win" : "loss",
              amount,
              time: formatTimeAgo(b.placed_at || b.created_at || b.date || ""),
            };
          })
        );

        const games = gamesRes?.results ?? (Array.isArray(gamesRes) ? gamesRes : []);
        const list = Array.isArray(games) ? games : [];
        setFeaturedGames(list.slice(0, 4).map((g: any) => apiGameToCard(g)).map((c) => ({ id: c.id, name: c.name, image: c.image })));

        if (contentRes && contentRes.promos && Array.isArray(contentRes.promos) && contentRes.promos.length > 0) {
          const first = contentRes.promos[0];
          setPromoContent({
            title: first.title,
            highlight: first.highlight,
            subtitle: first.subtitle || first.description,
          });
        } else {
          setPromoContent(null);
        }
      } catch {
        if (!cancelled) {
          setActiveBetsList([]);
          setRecentGamesList([]);
          setFeaturedGames([]);
          setPromoContent(null);
        }
      } finally {
        if (!cancelled) setOverviewLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = dashboardStats;
  const betsTotal = stats?.bets?.total ?? 0;
  const betsWon = stats?.bets?.won ?? 0;
  const betsLost = stats?.bets?.lost ?? 0;
  const totalWagered = betsWon + betsLost > 0 ? betsWon + betsLost : 0;
  const winRate = totalWagered > 0 ? Math.round((betsWon / totalWagered) * 100) : 0;
  const winningsDisplay = stats?.bets?.total_win_amount ?? stats?.bets?.total_won ?? 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Banner */}
      <div className="glass rounded-xl p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Welcome back, {userName ?? "User"}! 👋</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Ready to play and win?</p>
          </div>
          <Link to="/games">
            <Button variant="neon" size="default" className="gap-2 w-full sm:w-auto">
              <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5" />
              Play Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass rounded-xl p-3 sm:p-5">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <Link to="/deposit">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Plus className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Balance</p>
          <p className="text-lg sm:text-2xl font-bold font-mono">₹{walletBalance.toLocaleString()}</p>
        </div>

        <div className="glass rounded-xl p-3 sm:p-5">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-neon-green" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Winnings</p>
          <p className="text-lg sm:text-2xl font-bold font-mono text-neon-green">₹{Number(winningsDisplay).toLocaleString()}</p>
        </div>

        <div className="glass rounded-xl p-3 sm:p-5">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-neon-red/20 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-neon-red" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Bets</p>
          <p className="text-lg sm:text-2xl font-bold font-mono">{betsTotal}</p>
        </div>

        <div className="glass rounded-xl p-3 sm:p-5">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Win Rate</p>
          <p className="text-lg sm:text-2xl font-bold font-mono gradient-text-gold">{winRate}%</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Active Bets */}
        <div className="glass rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold">Active Bets</h2>
            {setActiveTab ? (
              <button type="button" className="text-sm text-primary hover:underline" onClick={() => setActiveTab("bets")}>
                View All
              </button>
            ) : (
              <Link to="/dashboard" className="text-sm text-primary hover:underline">
                View All
              </Link>
            )}
          </div>
          {overviewLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">Loading...</div>
          ) : activeBetsList.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No active bets. Place a bet from Games!</p>
          ) : (
            <div className="space-y-3">
              {activeBetsList.map((bet, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                    <div>
                      <p className="font-medium text-xs sm:text-sm">{bet.game}</p>
                      <p className="text-xs text-muted-foreground">{bet.type} @ {bet.odds}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-medium text-sm">₹{bet.stake.toLocaleString()}</p>
                    <p className="text-xs text-neon-green">
                      Win: ₹{bet.odds !== "—" ? (bet.stake * parseFloat(bet.odds)).toFixed(0) : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="glass rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold">Recent Activity</h2>
            {setActiveTab ? (
              <button type="button" className="text-sm text-primary hover:underline" onClick={() => setActiveTab("bets")}>
                View All
              </button>
            ) : (
              <Link to="/dashboard" className="text-sm text-primary hover:underline">
                View All
              </Link>
            )}
          </div>
          {overviewLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">Loading...</div>
          ) : recentGamesList.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No recent activity yet.</p>
          ) : (
            <div className="space-y-3">
              {recentGamesList.map((game, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
                        game.result === "win" ? "bg-neon-green/20" : "bg-neon-red/20"
                      }`}
                    >
                      {game.result === "win" ? (
                        <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-neon-green" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-neon-red" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-xs sm:text-sm">{game.name}</p>
                      <p className="text-xs text-muted-foreground">{game.time}</p>
                    </div>
                  </div>
                  <span
                    className={`font-mono font-medium text-sm ${game.result === "win" ? "text-neon-green" : "text-neon-red"}`}
                  >
                    {game.result === "win" ? "+" : ""}₹{Math.abs(game.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Featured Games */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            Featured Games
          </h2>
          <Link to="/games" className="text-sm text-primary hover:underline flex items-center gap-1">
            Browse <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {overviewLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">Loading...</div>
        ) : featuredGames.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No featured games at the moment.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {featuredGames.map((game) => (
              <Link key={game.id} to={`/game/${game.id}`} className="group">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="font-semibold text-xs sm:text-sm">{game.name}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Promo Banner */}
      <div className="glass rounded-xl p-4 sm:p-6 bg-gradient-to-r from-accent/10 to-orange-500/10 border-accent/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-accent to-orange-500 flex items-center justify-center">
              <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-accent-foreground" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">{promoContent?.title ?? "Deposit Bonus"}</h3>
              <p className="text-sm text-muted-foreground">
                {promoContent?.subtitle ?? (promoContent?.highlight ? `${promoContent.highlight} on deposits` : "Get extra on your deposits")}
              </p>
            </div>
          </div>
          <Link to="/deposit" className="w-full sm:w-auto">
            <Button variant="gold" size="default" className="w-full sm:w-auto">
              Claim Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
