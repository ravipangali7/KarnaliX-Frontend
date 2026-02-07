import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { AddFundsModal } from "@/components/modals/AddFundsModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Play, 
  Star, 
  Users, 
  Info, 
  MessageCircle, 
  Trophy,
  ChevronLeft,
  Wallet,
  Plus,
  Minus,
  Shield,
  Clock,
  Gift,
  Phone,
  Zap
} from "lucide-react";
import { whatsAppLinks } from "@/components/layout/WhatsAppButton";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";

const defaultGame = {
  name: "Aviator",
  provider: "Spribe",
  category: "Crash",
  image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=600&fit=crop",
  rating: 4.9,
  players: 15234,
  minBet: 10,
  maxBet: 100000,
  rtp: 97,
  description: "A thrilling game. Place your bet and play.",
  howToPlay: ["Place your bet", "Play the round", "Win or lose."],
  features: ["Live", "Fair", "Secure"],
};

function apiGameToDetail(g: any) {
  const minBet = typeof g.min_bet === "string" ? parseFloat(g.min_bet) : g.min_bet;
  const maxBet = typeof g.max_bet === "string" ? parseFloat(g.max_bet) : g.max_bet;
  const rtp = g.rtp != null ? (typeof g.rtp === "string" ? parseFloat(g.rtp) : g.rtp) : 96;
  return {
    name: g.name || defaultGame.name,
    provider: g.provider_name || g.provider || defaultGame.provider,
    category: g.game_type || defaultGame.category,
    image: defaultGame.image,
    rating: Math.min(5, (rtp || 96) / 20),
    players: 0,
    minBet: Number.isFinite(minBet) ? minBet : defaultGame.minBet,
    maxBet: Number.isFinite(maxBet) ? maxBet : defaultGame.maxBet,
    rtp: Number.isFinite(rtp) ? rtp : defaultGame.rtp,
    description: defaultGame.description,
    howToPlay: defaultGame.howToPlay,
    features: defaultGame.features,
  };
}

export default function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [game, setGame] = useState(defaultGame);
  const [loading, setLoading] = useState(!!id);
  const [betAmount, setBetAmount] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [launchLoading, setLaunchLoading] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const walletBalance = user ? parseFloat(user.wallet_balance || "0") : 0;
  const balanceFormatted = walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 });

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await apiClient.getPublicGameDetail(id);
        if (!cancelled) setGame(apiGameToDetail(data));
      } catch {
        if (!cancelled) setGame(defaultGame);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const quickBets = [50, 100, 500, 1000, 5000];

  const handleBetChange = (value: number) => {
    setBetAmount(Math.max(game.minBet, Math.min(game.maxBet, value)));
  };

  const handleStartPlaying = async () => {
    if (!id) return;
    if (!apiClient.getToken()) {
      navigate("/login", { state: { from: `/game/${id}` } });
      return;
    }
    if (walletBalance < betAmount) {
      setShowAddFunds(true);
      return;
    }
    setLaunchError(null);
    setLaunchLoading(true);
    try {
      const data = await apiClient.getLaunchUrl(id) as { launch_url?: string };
      if (data?.launch_url) {
        window.location.href = data.launch_url;
        return;
      }
      setLaunchError("Could not get game URL.");
    } catch (err: any) {
      const msg = err?.message ?? "Game unavailable. Try again later.";
      setLaunchError(typeof msg === "string" ? msg : "Game unavailable. Try again later.");
    } finally {
      setLaunchLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <Link to="/games" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft className="w-4 h-4" />
            Back to Games
          </Link>

          {loading && <div className="text-muted-foreground mb-4">Loading game...</div>}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Game Display Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Game Frame */}
              <div className="relative aspect-video rounded-2xl overflow-hidden glass border border-border">
                {!isPlaying ? (
                  <>
                    <img 
                      src={game.image} 
                      alt={game.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center">
                        <h2 className="text-3xl font-bold mb-4">{game.name}</h2>
                        <p className="text-muted-foreground mb-6">by {game.provider}</p>
                        <Button 
                          variant="neon" 
                          size="xl" 
                          className="gap-2"
                          onClick={handleStartPlaying}
                          disabled={launchLoading}
                        >
                          <Play className="w-6 h-6" />
                          {launchLoading ? "Redirecting..." : "Play Now"}
                        </Button>
                        {launchError && (
                          <p className="text-sm text-destructive mt-2">{launchError}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-4">
                          Min Bet: ₹{game.minBet} | Max Bet: ₹{game.maxBet.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-card flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse">
                        <Play className="w-10 h-10 text-primary" />
                      </div>
                      <p className="text-lg font-semibold">Game Loading...</p>
                      <p className="text-sm text-muted-foreground">Connecting to game server</p>
                    </div>
                  </div>
                )}

                {/* Live Players Badge */}
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-full">
                  <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                  <Users className="w-4 h-4 text-neon-green" />
                  <span className="font-mono text-sm">{game.players.toLocaleString()} playing</span>
                </div>
              </div>

              {/* Game Info Tabs */}
              <div className="glass rounded-xl p-6">
                <div className="flex items-center gap-4 mb-6 border-b border-border pb-4">
                  <Button variant="default" size="sm">About</Button>
                  <Button variant="ghost" size="sm">How to Play</Button>
                  <Button variant="ghost" size="sm">Stats</Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Info className="w-5 h-5 text-primary" />
                      About {game.name}
                    </h3>
                    <p className="text-muted-foreground">{game.description}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    <div className="glass rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-accent mb-1">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-bold">{game.rating}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                    <div className="glass rounded-lg p-4 text-center">
                      <div className="font-bold text-primary mb-1">{game.rtp}%</div>
                      <p className="text-xs text-muted-foreground">RTP</p>
                    </div>
                    <div className="glass rounded-lg p-4 text-center">
                      <div className="font-bold text-neon-green mb-1">₹{game.minBet}</div>
                      <p className="text-xs text-muted-foreground">Min Bet</p>
                    </div>
                    <div className="glass rounded-lg p-4 text-center">
                      <div className="font-bold text-accent mb-1">₹{game.maxBet.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Max Bet</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h4 className="font-semibold mb-3">How to Play</h4>
                    <ol className="space-y-2">
                      {game.howToPlay.map((step: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary text-xs font-bold">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4">
                    {game.features.map((feature: string) => (
                      <span key={feature} className="px-3 py-1 bg-muted rounded-full text-xs font-medium">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Bet Controls */}
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  Place Your Bet
                </h3>

                {/* Wallet Balance */}
                <div className="glass rounded-lg p-4 mb-4 bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Your Balance</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold font-mono">₹{balanceFormatted}</span>
                    <Link to="/deposit">
                      <Button variant="gold" size="sm">Add Funds</Button>
                    </Link>
                  </div>
                  {!user && (
                    <p className="text-xs text-muted-foreground mt-1">Log in to see your balance</p>
                  )}
                </div>

                {/* Bet Amount */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Bet Amount</label>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleBetChange(betAmount - 10)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={betAmount}
                      onChange={(e) => handleBetChange(Number(e.target.value))}
                      className="text-center font-mono text-lg h-12"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleBetChange(betAmount + 10)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Quick Bet Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {quickBets.map((amount) => (
                      <Button
                        key={amount}
                        variant={betAmount === amount ? "default" : "outline"}
                        size="sm"
                        onClick={() => setBetAmount(amount)}
                      >
                        ₹{amount}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBetAmount(game.maxBet)}
                    >
                      MAX
                    </Button>
                  </div>
                </div>

                <Button 
                  variant="neon" 
                  size="xl" 
                  className="w-full mt-6 gap-2"
                  onClick={handleStartPlaying}
                  disabled={launchLoading}
                >
                  <Play className="w-5 h-5" />
                  {launchLoading ? "Redirecting..." : "Start Playing"}
                </Button>
                {launchError && (
                  <p className="text-sm text-destructive mt-2">{launchError}</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="glass rounded-xl p-4 space-y-3">
                <Link to="/deposit" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-neon-green" />
                  </div>
                  <div>
                    <p className="font-medium">Deposit Funds</p>
                    <p className="text-xs text-muted-foreground">Add money to play</p>
                  </div>
                </Link>
                
                <a href={whatsAppLinks.deposit} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors border border-[#25D366]/30">
                  <div className="w-10 h-10 rounded-lg bg-[#25D366]/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium flex items-center gap-2">
                      Instant Deposit
                      <Zap className="w-4 h-4 text-accent" />
                    </p>
                    <p className="text-xs text-muted-foreground">Via WhatsApp</p>
                  </div>
                </a>

                <a href={whatsAppLinks.withdraw} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium flex items-center gap-2">
                      Instant Withdraw
                      <Zap className="w-4 h-4 text-accent" />
                    </p>
                    <p className="text-xs text-muted-foreground">Via WhatsApp</p>
                  </div>
                </a>

                <a href="tel:+918000825980" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Call Admin</p>
                    <p className="text-xs text-muted-foreground">+91 80008 25980</p>
                  </div>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-neon-green" />
                  <span className="text-sm font-medium">Safe & Secure Gaming</span>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Instant payouts 24/7
                  </div>
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Daily bonuses & rewards
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Fair & transparent gameplay
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
      <WhatsAppButton />
      <AddFundsModal open={showAddFunds} onOpenChange={setShowAddFunds} />
    </div>
  );
}
