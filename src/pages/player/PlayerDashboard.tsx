import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/shared/StatCard";
import { Wallet, TrendingUp, Eye, Gamepad2, ArrowDownCircle, ArrowUpCircle, Shield, Send, Trophy, Clock, Flame } from "lucide-react";
import { getPlayerDashboard, getPlayerTransactions } from "@/api/player";
import { getGames, getGameImageUrl } from "@/api/games";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { GameCard } from "@/components/shared/GameCard";
import { motion } from "framer-motion";

const PlayerDashboard = () => {
  const { user } = useAuth();
  const { data: dashboard = {} } = useQuery({ queryKey: ["player-dashboard"], queryFn: getPlayerDashboard });
  const { data: transactions = [] } = useQuery({ queryKey: ["player-transactions"], queryFn: getPlayerTransactions });
  const { data: games = [] } = useQuery({ queryKey: ["games"], queryFn: () => getGames() });
  const recent = (transactions as Record<string, unknown>[]).slice(0, 5);
  const topGames = (games as { id: number; name: string; image?: string; category_name?: string; min_bet: string; max_bet: string }[]).slice(0, 6);
  const [transferOpen, setTransferOpen] = useState(false);
  const d = dashboard as Record<string, unknown>;
  const mainBalance = String(d.main_balance ?? user?.main_balance ?? "0");
  const bonusBalance = String(d.bonus_balance ?? user?.bonus_balance ?? "0");
  const exposureBalance = String(d.exposure_balance ?? "0");

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="gold-gradient neon-glow overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 -ml-8 -mb-8" />
          <CardContent className="p-6 relative z-10">
            <p className="text-primary-foreground/70 text-xs font-medium">Welcome back,</p>
            <h2 className="font-gaming font-bold text-2xl text-primary-foreground tracking-wide">PLAYER1</h2>
            <p className="text-primary-foreground/60 text-xs mt-1">Last login: Today, 10:30 AM</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Balance Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <StatCard title="Main Balance" value={`₹${Number(mainBalance).toLocaleString()}`} icon={Wallet} />
        <StatCard title="Bonus" value={`₹${Number(bonusBalance).toLocaleString()}`} icon={TrendingUp} />
        <StatCard title="Exposure" value={`₹${Number(exposureBalance).toLocaleString()}`} icon={Eye} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2 md:gap-3">
        <Link to="/player/wallet">
          <Card className="cursor-pointer hover:border-primary/50 hover:neon-glow-sm transition-all gaming-card">
            <CardContent className="p-3 md:p-4 text-center">
              <ArrowDownCircle className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-1 text-success" />
              <p className="text-[10px] md:text-xs font-medium">Deposit</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/player/wallet">
          <Card className="cursor-pointer hover:border-primary/50 hover:neon-glow-sm transition-all gaming-card">
            <CardContent className="p-3 md:p-4 text-center">
              <ArrowUpCircle className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-1 text-accent" />
              <p className="text-[10px] md:text-xs font-medium">Withdraw</p>
            </CardContent>
          </Card>
        </Link>
        <Card className="cursor-pointer hover:border-primary/50 hover:neon-glow-sm transition-all gaming-card" onClick={() => setTransferOpen(true)}>
          <CardContent className="p-3 md:p-4 text-center">
            <Send className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-1 text-primary" />
            <p className="text-[10px] md:text-xs font-medium">Transfer</p>
          </CardContent>
        </Card>
        <Link to="/games">
          <Card className="cursor-pointer hover:border-primary/50 hover:neon-glow-sm transition-all gaming-card">
            <CardContent className="p-3 md:p-4 text-center">
              <Gamepad2 className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-1 text-neon" />
              <p className="text-[10px] md:text-xs font-medium">Play</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Desktop two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Recent Activity */}
        <div>
          <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Recent Activity
          </h3>
          <div className="space-y-2">
            {recent.map((t: Record<string, unknown>, i: number) => (
              <Card key={String(t.id ?? i)} className="hover:border-primary/20 transition-colors">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium capitalize">{String(t.transaction_type ?? t.type ?? "").replace(/_/g, " ")}</p>
                    <p className="text-[10px] text-muted-foreground">{t.created_at ? new Date(String(t.created_at)).toLocaleDateString() : ""}</p>
                  </div>
                  <span className={`font-gaming font-bold text-sm ${["deposit", "win", "bonus"].includes(String(t.transaction_type ?? t.type ?? "")) ? "text-success" : "text-accent"}`}>
                    {["deposit", "win", "bonus"].includes(String(t.transaction_type ?? t.type ?? "")) ? "+" : "-"}₹{Number(t.amount ?? 0).toLocaleString()}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Play */}
        <div>
          <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-warning" /> Quick Play
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {topGames.map((game) => (
              <Link key={game.id} to={`/games/${game.id}`}>
                <GameCard image={getGameImageUrl(game)} name={game.name} category={game.category_name ?? ""} minBet={Number(game.min_bet)} maxBet={Number(game.max_bet)} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Transfer Dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="max-w-sm gaming-card">
          <DialogHeader><DialogTitle className="font-gaming neon-text tracking-wider">TRANSFER</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Recipient Username</label>
              <Input placeholder="Enter username" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Amount</label>
              <Input type="number" placeholder="₹0" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Your Password (to confirm)</label>
              <Input type="password" placeholder="Enter password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferOpen(false)}>Cancel</Button>
            <Button className="gold-gradient text-primary-foreground font-gaming" onClick={() => setTransferOpen(false)}>Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlayerDashboard;
