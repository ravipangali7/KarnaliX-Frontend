import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";
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
  Loader2,
} from "lucide-react";

interface RecentActivity {
  id: number;
  game_name: string;
  result: string;
  amount: string;
  bet_at: string | null;
}

interface ActiveBet {
  id: number;
  game_name: string;
  game_type: string;
  odds: string | null;
  stake: string;
  potential_win: string;
  status: string;
}

interface FavoriteGame {
  id: string;
  slug: string;
  name: string;
  image: string;
  category: string | null;
  category_slug: string | null;
  provider: string | null;
}

interface UserStats {
  balance: string;
  currency: string;
  total_winnings: string;
  total_bet_amount: string;
  total_bets_count: number;
  won_count: number;
  lost_count: number;
  win_rate: number;
  recent_activity: RecentActivity[];
  active_bets: ActiveBet[];
}

interface DashboardOverviewProps {
  walletBalance: number;
  onTabChange?: (tab: string) => void;
}

// Fallback images for games without images
const defaultGameImages = [
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=200&h=150&fit=crop",
];

function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return "Recently";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

interface PromoBanner {
  id: number;
  title: string;
  description: string;
  link_url: string;
}

export function DashboardOverview({ walletBalance, onTabChange }: DashboardOverviewProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [favorites, setFavorites] = useState<FavoriteGame[]>([]);
  const [promoBanner, setPromoBanner] = useState<PromoBanner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user stats, favorites, and promo banner in parallel
        const [statsData, favoritesData, bannersData] = await Promise.all([
          apiClient.getUserStats(),
          apiClient.getFavorites().catch(() => []),
          apiClient.getBanners('dashboard').catch(() => []),
        ]);
        
        setStats(statsData);
        setFavorites(favoritesData);
        // Get first active banner for dashboard
        if (bannersData && bannersData.length > 0) {
          setPromoBanner(bannersData[0]);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const displayName = user?.full_name || user?.username || 'User';
  const firstName = displayName.split(' ')[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalWinnings = parseFloat(stats?.total_winnings || '0');
  const totalBetAmount = parseFloat(stats?.total_bet_amount || '0');
  const winRate = stats?.win_rate || 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Banner */}
      <div className="glass rounded-xl p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Welcome back, {firstName}!</h1>
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
            {winRate > 50 && <span className="text-xs text-neon-green">+{winRate}%</span>}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Winnings</p>
          <p className="text-lg sm:text-2xl font-bold font-mono text-neon-green">₹{totalWinnings.toLocaleString()}</p>
        </div>

        <div className="glass rounded-xl p-3 sm:p-5">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-neon-red/20 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-neon-red" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Bets</p>
          <p className="text-lg sm:text-2xl font-bold font-mono">₹{totalBetAmount.toLocaleString()}</p>
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
            <button 
              onClick={() => onTabChange?.('history')} 
              className="text-sm text-primary hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {stats?.active_bets && stats.active_bets.length > 0 ? (
              stats.active_bets.map((bet) => (
                <div key={bet.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                    <div>
                      <p className="font-medium text-xs sm:text-sm">{bet.game_name}</p>
                      <p className="text-xs text-muted-foreground">{bet.game_type} {bet.odds ? `@ ${bet.odds}` : ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-medium text-sm">₹{parseFloat(bet.stake).toLocaleString()}</p>
                    <p className="text-xs text-neon-green">
                      Win: ₹{parseFloat(bet.potential_win).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No active bets</p>
                <Link to="/games" className="text-primary text-sm hover:underline">Place a bet now</Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold">Recent Activity</h2>
            <button 
              onClick={() => onTabChange?.('history')} 
              className="text-sm text-primary hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {stats?.recent_activity && stats.recent_activity.length > 0 ? (
              stats.recent_activity.map((activity) => {
                const isWin = activity.result === 'won';
                const amount = parseFloat(activity.amount);
                return (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
                        isWin ? "bg-neon-green/20" : "bg-neon-red/20"
                      }`}>
                        {isWin 
                          ? <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-neon-green" />
                          : <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-neon-red" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-xs sm:text-sm">{activity.game_name}</p>
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.bet_at)}</p>
                      </div>
                    </div>
                    <span className={`font-mono font-medium text-sm ${
                      isWin ? "text-neon-green" : "text-neon-red"
                    }`}>
                      {amount >= 0 ? "+" : ""}₹{Math.abs(amount).toLocaleString()}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No recent activity</p>
                <Link to="/games" className="text-primary text-sm hover:underline">Start playing</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Favorite Games */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            Favorite Games
          </h2>
          <Link to="/games" className="text-sm text-primary hover:underline flex items-center gap-1">
            Browse <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {favorites.length > 0 ? (
            favorites.slice(0, 4).map((game, index) => (
              <Link key={game.id} to={`/game/${game.slug}`} className="group">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                  <img 
                    src={game.image || defaultGameImages[index % defaultGameImages.length]} 
                    alt={game.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="font-semibold text-xs sm:text-sm">{game.name}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-4 text-center py-8 text-muted-foreground">
              <p className="text-sm">No favorite games yet</p>
              <Link to="/games" className="text-primary text-sm hover:underline">Explore games to add favorites</Link>
            </div>
          )}
        </div>
      </div>

      {/* Promo Banner - Only show if there's an active promotion */}
      {promoBanner && (
        <div className="glass rounded-xl p-4 sm:p-6 bg-gradient-to-r from-accent/10 to-orange-500/10 border-accent/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-accent to-orange-500 flex items-center justify-center">
                <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">{promoBanner.title}</h3>
                <p className="text-sm text-muted-foreground">{promoBanner.description}</p>
              </div>
            </div>
            <Link to={promoBanner.link_url || "/deposit"} className="w-full sm:w-auto">
              <Button variant="gold" size="default" className="w-full sm:w-auto">Claim Now</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
