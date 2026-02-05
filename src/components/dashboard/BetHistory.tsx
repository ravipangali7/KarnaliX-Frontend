import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api";
import {
  Search,
  Download,
  Trophy,
  TrendingUp,
  TrendingDown,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  DollarSign,
} from "lucide-react";

interface Bet {
  id: string;
  game: string;
  gameType: string;
  betAmount: number;
  winAmount: number;
  odds: string;
  status: "won" | "lost" | "pending" | "cashout";
  date: string;
  category: string;
}

function mapApiBet(item: any): Bet {
  const statusMap: Record<string, Bet["status"]> = {
    won: "won",
    win: "won",
    lost: "lost",
    loss: "lost",
    pending: "pending",
    cashout: "cashout",
    settled: "won",
  };
  const status = statusMap[String(item.status || "pending").toLowerCase()] ?? "pending";
  const betAmount = typeof item.bet_amount === "string" ? parseFloat(item.bet_amount) : Number(item.bet_amount) ?? 0;
  const winAmount = typeof item.win_amount === "string" ? parseFloat(item.win_amount) : Number(item.win_amount) ?? 0;
  const date = item.created_at || item.date || "";
  return {
    id: String(item.id),
    game: item.game_name || item.game || "—",
    gameType: item.game_type || item.category || "—",
    betAmount,
    winAmount,
    odds: item.odds ? String(item.odds) : "—",
    status,
    date: date ? new Date(date).toLocaleString() : "",
    category: (item.game_type || item.category || "other").toLowerCase(),
  };
}

export function BetHistory() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchBets = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.getUserBets();
        const list = Array.isArray(res) ? res : (res?.results ?? []);
        setBets(list.map(mapApiBet));
      } catch (err: any) {
        setError(err?.message ?? "Failed to load bets");
        setBets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBets();
  }, []);

  const filteredBets = bets.filter((b) => {
    if (filter !== "all" && b.status !== filter) return false;
    if (categoryFilter !== "all" && b.category !== categoryFilter) return false;
    if (searchQuery && !b.game.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredBets.length / itemsPerPage);
  const paginatedBets = filteredBets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    totalBets: bets.length,
    wins: bets.filter((b) => b.status === "won").length,
    losses: bets.filter((b) => b.status === "lost").length,
    totalWagered: bets.reduce((sum, b) => sum + b.betAmount, 0),
    totalWon: bets.reduce((sum, b) => sum + b.winAmount, 0),
  };
  const winRatePct = stats.totalBets > 0 ? ((stats.wins / stats.totalBets) * 100).toFixed(0) : "0";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "won":
        return (
          <span className="flex items-center gap-1 text-xs text-neon-green bg-neon-green/10 px-2 py-1 rounded-full">
            <Trophy className="w-3 h-3" /> Won
          </span>
        );
      case "lost":
        return (
          <span className="flex items-center gap-1 text-xs text-neon-red bg-neon-red/10 px-2 py-1 rounded-full">
            <X className="w-3 h-3" /> Lost
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" /> Live
          </span>
        );
      case "cashout":
        return (
          <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
            <DollarSign className="w-3 h-3" /> Cashout
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gamepad2 className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total Bets</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold">{stats.totalBets}</p>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-neon-green" />
            <span className="text-xs text-muted-foreground">Win Rate</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-neon-green">
            {winRatePct}%
          </p>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Total Wagered</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono">₹{stats.totalWagered.toLocaleString()}</p>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-neon-green" />
            <span className="text-xs text-muted-foreground">Total Won</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-neon-green">₹{stats.totalWon.toLocaleString()}</p>
        </div>
      </div>

      {/* Bet History Table */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold">Bet History</h2>
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search game..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 w-full sm:w-40"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-9 px-3 rounded-lg bg-muted border border-border text-sm"
            >
              <option value="all">All Status</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="pending">Live</option>
              <option value="cashout">Cashout</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-3 rounded-lg bg-muted border border-border text-sm"
            >
              <option value="all">All Games</option>
              <option value="sports">Sports</option>
              <option value="casino">Casino</option>
              <option value="card">Card Games</option>
              <option value="crash">Crash</option>
              <option value="casual">Casual</option>
            </select>
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <p className="text-center py-8 text-muted-foreground">{error}</p>
        ) : filteredBets.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No bets found.</p>
        ) : (
        <>
        {/* Table */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Game</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Type</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Odds</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Bet</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Win</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBets.map((bet) => (
                <tr key={bet.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-3 px-4">
                    <p className="font-medium text-sm">{bet.game}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{bet.gameType}</td>
                  <td className="py-3 px-4 text-center font-mono text-sm">{bet.odds}</td>
                  <td className="py-3 px-4 text-right font-mono text-sm">₹{bet.betAmount.toLocaleString()}</td>
                  <td className={`py-3 px-4 text-right font-mono text-sm ${
                    bet.winAmount > 0 ? "text-neon-green" : "text-muted-foreground"
                  }`}>
                    {bet.winAmount > 0 ? `₹${bet.winAmount.toLocaleString()}` : "-"}
                  </td>
                  <td className="py-3 px-4 text-center">{getStatusBadge(bet.status)}</td>
                  <td className="py-3 px-4 text-right text-sm text-muted-foreground">{bet.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filteredBets.length)} of {filteredBets.length}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8"
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
