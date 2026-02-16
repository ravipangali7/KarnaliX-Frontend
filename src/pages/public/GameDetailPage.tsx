import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GameCard } from "@/components/shared/GameCard";
import { getGame, getGames, getGameImageUrl } from "@/api/games";
import { getSiteSetting } from "@/api/site";
import { launchGame, getPlayerWallet } from "@/api/player";
import { useAuth } from "@/contexts/AuthContext";
import type { Game } from "@/api/games";
import { toast } from "sonner";
import { Shield, Zap, Lock, Users, Trophy, Clock, Flame, TrendingUp, Crown, Dice1, Target, Eye } from "lucide-react";
import { motion } from "framer-motion";

const chips = [10, 50, 100, 500, 1000, 5000];

const recentWinners = [
  { name: "Ram S.", amount: 15000, time: "2 min ago" },
  { name: "Sita D.", amount: 8500, time: "5 min ago" },
  { name: "Hari B.", amount: 22000, time: "12 min ago" },
  { name: "Gita K.", amount: 5600, time: "18 min ago" },
  { name: "Bikash T.", amount: 31000, time: "25 min ago" },
];

const GameDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const isPlayer = user?.role === "player";
  const [betAmount, setBetAmount] = useState(100);
  const [launching, setLaunching] = useState(false);
  const { data: game, isLoading, isError: gameError, refetch: refetchGame } = useQuery({ queryKey: ["game", id], queryFn: () => getGame(id!), enabled: !!id });
  const { data: games = [] } = useQuery({ queryKey: ["games"], queryFn: () => getGames() });
  const { data: siteSetting } = useQuery({ queryKey: ["siteSetting"], queryFn: getSiteSetting });
  const { data: wallet } = useQuery({
    queryKey: ["playerWallet"],
    queryFn: getPlayerWallet,
    enabled: !!isPlayer,
  });

  if (isLoading || !id) return <div className="p-8 text-center">Loading...</div>;
  if (gameError) return (
    <div className="p-8 text-center space-y-2">
      <p className="text-muted-foreground">Could not load game.</p>
      <Button variant="outline" size="sm" onClick={() => refetchGame()}>Retry</Button>
    </div>
  );
  if (!game) return <div className="p-8 text-center">Game not found</div>;

  const g = game as Game;
  const minBet = Number(g.min_bet) || 10;
  const maxBet = Number(g.max_bet) || 5000;
  const related = (games as Game[]).filter((x) => x.category === g.category && x.id !== g.id).slice(0, 12);
  const mostPlayed = (games as Game[]).filter((x) => x.id !== g.id).slice(0, 12);
  const gameHistory: { id: string; username: string; result: string; betAmount: number; winAmount: number }[] = [];
  const livePlayers = Math.floor(Math.random() * 200) + 50;
  const todayWins = Math.floor(Math.random() * 500000) + 100000;
  const whatsapp = (siteSetting as { whatsapp_number?: string })?.whatsapp_number ?? "";

  return (
    <div className="container px-4 py-6 space-y-8">
      {/* Game Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3 relative rounded-2xl overflow-hidden aspect-[16/9] lg:aspect-[4/3]">
          <img src={getGameImageUrl(g)} alt={g.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          {/* Live badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-destructive/90 text-white text-[10px] font-gaming tracking-wider flex items-center gap-1 animate-pulse-neon">
              <span className="h-1.5 w-1.5 rounded-full bg-white" /> LIVE
            </span>
            <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] flex items-center gap-1">
              <Users className="h-3 w-3" /> {livePlayers} playing
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold gold-gradient text-primary-foreground mb-3">{g.category_name ?? ""}</span>
            <h1 className="font-gaming font-bold text-3xl md:text-4xl text-white tracking-wide text-glow">{g.name}</h1>
            <p className="text-sm text-white/60 mt-2 flex items-center gap-3">
              <span>Min: ₹{minBet}</span>
              <span>•</span>
              <span>Max: ₹{maxBet.toLocaleString()}</span>
              <span>•</span>
              <span>{g.provider_name ?? ""}</span>
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 space-y-4">
          <Card className="gaming-card">
            <CardContent className="p-5 space-y-5">
              {/* Balance */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-muted/50 cyber-border">
                  <p className="text-[10px] text-muted-foreground">Main</p>
                  <p className="font-bold text-base">{isPlayer && wallet != null ? `₹${Number((wallet as { main_balance?: string }).main_balance || 0).toLocaleString()}` : "—"}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 cyber-border">
                  <p className="text-[10px] text-muted-foreground">Bonus</p>
                  <p className="font-bold text-base text-primary">{isPlayer && wallet != null ? `₹${Number((wallet as { bonus_balance?: string }).bonus_balance || 0).toLocaleString()}` : "—"}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 neon-glow-sm">
                  <p className="text-[10px] text-muted-foreground">Total</p>
                  <p className="font-bold text-base neon-text">
                    {isPlayer && wallet != null
                      ? `₹${(Number((wallet as { main_balance?: string }).main_balance || 0) + Number((wallet as { bonus_balance?: string }).bonus_balance || 0)).toLocaleString()}`
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Bet Amount */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-muted-foreground font-medium">Bet Amount</label>
                  <Link to="/wallet">
                    <Button variant="ghost" size="sm" className="text-xs text-primary h-6 px-2">+ Add Fund</Button>
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-12 w-12 text-lg font-bold" onClick={() => setBetAmount(Math.max(minBet, betAmount - minBet))}>-</Button>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    className="flex-1 h-14 text-center text-2xl font-gaming font-bold rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                  <Button variant="outline" size="icon" className="h-12 w-12 text-lg font-bold" onClick={() => setBetAmount(Math.min(maxBet, betAmount + minBet))}>+</Button>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {chips.map((chip) => (
                    <Button
                      key={chip}
                      variant="outline"
                      size="sm"
                      onClick={() => setBetAmount(chip)}
                      className={`text-xs font-gaming ${betAmount === chip ? "border-primary text-primary neon-glow-sm bg-primary/5" : ""}`}
                    >
                      {chip >= 1000 ? `${chip / 1000}K` : chip}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setBetAmount(maxBet)} className="text-xs text-accent border-accent font-gaming">
                    MAX
                  </Button>
                </div>
              </div>

              {!user ? (
                <Link to="/login">
                  <Button className="w-full gold-gradient text-primary-foreground font-gaming font-bold text-lg h-14 neon-glow tracking-widest">
                    🎮 Login to play
                  </Button>
                </Link>
              ) : !isPlayer ? (
                <Button className="w-full bg-muted text-muted-foreground font-gaming font-bold text-lg h-14" disabled>
                  Only players can launch games
                </Button>
              ) : (
                <Button
                  className="w-full gold-gradient text-primary-foreground font-gaming font-bold text-lg h-14 neon-glow tracking-widest animate-scale-pulse"
                  disabled={launching}
                  onClick={async () => {
                    setLaunching(true);
                    try {
                      await launchGame(g.game_uid);
                    } catch (e) {
                      const msg = (e as { detail?: string })?.detail ?? "Launch failed";
                      toast.error(msg);
                    } finally {
                      setLaunching(false);
                    }
                  }}
                >
                  {launching ? "Launching…" : "🎮 START PLAYING"}
                </Button>
              )}
              <a href={`https://wa.me/${String(whatsapp).replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full border-success text-success mt-2" size="sm">
                  💬 Instant Deposit via WhatsApp
                </Button>
              </a>

              {/* Trust badges */}
              <div className="flex justify-center gap-5 pt-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-success" /> Secure</span>
                <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-primary" /> Instant</span>
                <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5 text-accent" /> Encrypted</span>
              </div>
            </CardContent>
          </Card>

          {/* Game Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="gaming-card">
              <CardContent className="p-3 text-center">
                <Eye className="h-4 w-4 mx-auto text-neon mb-1" />
                <p className="font-gaming font-bold text-sm">{livePlayers}</p>
                <p className="text-[9px] text-muted-foreground">Live Players</p>
              </CardContent>
            </Card>
            <Card className="gaming-card">
              <CardContent className="p-3 text-center">
                <Trophy className="h-4 w-4 mx-auto text-warning mb-1" />
                <p className="font-gaming font-bold text-sm">₹{(todayWins / 1000).toFixed(0)}K</p>
                <p className="text-[9px] text-muted-foreground">Today Wins</p>
              </CardContent>
            </Card>
            <Card className="gaming-card">
              <CardContent className="p-3 text-center">
                <TrendingUp className="h-4 w-4 mx-auto text-success mb-1" />
                <p className="font-gaming font-bold text-sm">—</p>
                <p className="text-[9px] text-muted-foreground">Total Plays</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Recent Winners */}
      <section>
        <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
          <Crown className="h-5 w-5 text-warning" /> Recent Winners
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {recentWinners.map((w, i) => (
            <Card key={i} className="gaming-card hover:neon-glow-sm transition-all">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full gold-gradient flex items-center justify-center text-xs font-bold text-primary-foreground">{w.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{w.name}</p>
                  <p className="text-[10px] text-muted-foreground">{w.time}</p>
                </div>
                <span className="text-success font-gaming font-bold text-sm">+₹{w.amount.toLocaleString()}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Game History - from API when available */}
      {gameHistory.length > 0 && (
        <section>
          <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> Recent Rounds
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {gameHistory.map((log) => (
              <Card key={log.id} className="gaming-card">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{log.username}</span>
                    <span className={`text-[10px] font-gaming font-bold px-2 py-0.5 rounded-full ${log.result === "win" ? "bg-success/10 text-success" : log.result === "loss" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                      {log.result.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Bet: ₹{log.betAmount}</p>
                  {log.winAmount > 0 && <p className="text-xs text-success font-bold">Won: ₹{log.winAmount}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Game Rules */}
      <section>
        <Card className="gaming-card">
          <CardContent className="p-6">
            <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" /> How to Play
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg gold-gradient flex items-center justify-center text-primary-foreground font-gaming font-bold text-sm flex-shrink-0">1</div>
                <div>
                  <h4 className="font-semibold text-sm">Place Your Bet</h4>
                  <p className="text-xs text-muted-foreground mt-1">Choose your bet amount using the chips above or enter a custom amount.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg gold-gradient flex items-center justify-center text-primary-foreground font-gaming font-bold text-sm flex-shrink-0">2</div>
                <div>
                  <h4 className="font-semibold text-sm">Start the Game</h4>
                  <p className="text-xs text-muted-foreground mt-1">Click Start Playing and wait for the round to begin. Results are instant.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg gold-gradient flex items-center justify-center text-primary-foreground font-gaming font-bold text-sm flex-shrink-0">3</div>
                <div>
                  <h4 className="font-semibold text-sm">Collect Winnings</h4>
                  <p className="text-xs text-muted-foreground mt-1">Winnings are added to your balance instantly. Withdraw anytime!</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Most Played */}
      <section>
        <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
          <span className="h-5 w-1 rounded-full gold-gradient inline-block" />
          <Flame className="h-5 w-5 text-warning" /> Most Played
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-hide">
          {mostPlayed.map((x) => (
            <div key={x.id} className="snap-start min-w-[150px] md:min-w-[190px]">
              <Link to={`/games/${x.id}`}><GameCard image={getGameImageUrl(x)} name={x.name} category={x.category_name ?? ""} minBet={Number(x.min_bet)} maxBet={Number(x.max_bet)} /></Link>
            </div>
          ))}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section>
          <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
            <span className="h-5 w-1 rounded-full gold-gradient inline-block" />
            <Dice1 className="h-5 w-5 text-accent" /> Related Games
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-hide">
            {related.map((x) => (
              <div key={x.id} className="snap-start min-w-[150px] md:min-w-[190px]">
                <Link to={`/games/${x.id}`}><GameCard image={getGameImageUrl(x)} name={x.name} category={x.category_name ?? ""} minBet={Number(x.min_bet)} maxBet={Number(x.max_bet)} /></Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default GameDetailPage;
