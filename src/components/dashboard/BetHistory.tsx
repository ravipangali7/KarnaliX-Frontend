import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Loader2,
} from "lucide-react";

interface Bet {
  id: string;
  game: string;
  gameType: string;
  betAmount: number;
  winAmount: number;
  odds: string;
  status: "won" | "lost" | "pending" | "cancelled" | "refunded";
  date: string;
  category: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export function BetHistory() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const itemsPerPage = 5;

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await apiClient.exportBets();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bet_history.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch bets and categories in parallel
        const [betsData, categoriesData] = await Promise.all([
          apiClient.getBets(),
          apiClient.getGameCategories().catch(() => []),
        ]);
        
        setCategories(categoriesData || []);
        
        // Map API response to Bet format
        const mappedBets: Bet[] = (betsData || []).map((b: any) => ({
          id: String(b.id),
          game: b.game_name || 'Unknown Game',
          gameType: b.game_type || 'Game',
          betAmount: parseFloat(b.bet_amount),
          winAmount: parseFloat(b.win_amount) || 0,
          odds: b.odds ? `${b.odds}x` : '-',
          status: b.status,
          date: new Date(b.bet_at || b.created_at).toLocaleString(),
          category: b.category || 'other',
        }));
        
        setBets(mappedBets);
      } catch (error) {
        console.error('Failed to fetch bets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const winRate = stats.totalBets > 0 ? ((stats.wins / stats.totalBets) * 100).toFixed(0) : 0;

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
      case "cancelled":
        return (
          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            <X className="w-3 h-3" /> Cancelled
          </span>
        );
      case "refunded":
        return (
          <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
            <DollarSign className="w-3 h-3" /> Refunded
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
            {winRate}%
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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 h-9 w-full sm:w-40"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 rounded-lg bg-muted border border-border text-sm"
            >
              <option value="all">All Status</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="pending">Live</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 rounded-lg bg-muted border border-border text-sm"
            >
              <option value="all">All Games</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
            <Button variant="outline" size="sm" className="gap-1" onClick={handleExport} disabled={exporting}>
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span className="hidden sm:inline">{exporting ? "Exporting..." : "Export"}</span>
            </Button>
          </div>
        </div>

        {/* Table */}
        {bets.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No bets yet</p>
            <Link to="/games" className="text-primary text-sm hover:underline">Start playing now</Link>
          </div>
        ) : filteredBets.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No bets match your filters</p>
            <button 
              onClick={() => {
                setFilter("all");
                setCategoryFilter("all");
                setSearchQuery("");
              }}
              className="text-primary text-sm hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
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
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8"
                      >
                        {page}
                      </Button>
                    );
                  })}
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
