import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { AddFundsModal } from "@/components/modals/AddFundsModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  Zap,
} from "lucide-react";
import { whatsAppLinks } from "@/components/layout/WhatsAppButton";
import apiClient, { mapGame } from "@/lib/api";

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const slug = id ?? "";
  const [betAmount, setBetAmount] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'howto' | 'stats'>('about');
  const [walletBalance, setWalletBalance] = useState(0);

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await apiClient.getWalletBalance();
        setWalletBalance(parseFloat(data?.balance || '0'));
      } catch (error) {
        // User might not be logged in, default to 0
        setWalletBalance(0);
      }
    };
    fetchBalance();
  }, []);

  const { data: gameRaw, isLoading, error, isError } = useQuery({
    queryKey: ["game", slug],
    queryFn: () => apiClient.getGame(slug),
    enabled: !!slug,
  });

  const game = gameRaw ? mapGame(gameRaw as any) : null;

  const quickBets = [50, 100, 500, 1000, 5000];

  const handleBetChange = (value: number) => {
    if (!game) return;
    setBetAmount(Math.max(game.minBet, Math.min(game.maxBet, value)));
  };

  const handleStartPlaying = () => {
    if (walletBalance < betAmount) {
      setShowAddFunds(true);
      return;
    }
    setIsPlaying(true);
  };

  if (isLoading || !slug) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-28 pb-16">
          <div className="container mx-auto px-4">
            <Skeleton className="h-6 w-32 mb-6" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="aspect-video rounded-2xl" />
                <Skeleton className="h-64 rounded-xl" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-72 rounded-xl" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
        <MobileNav />
        <WhatsAppButton />
      </div>
    );
  }

  if (isError || !game) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-28 pb-16">
          <div className="container mx-auto px-4 text-center py-16">
            <h2 className="text-xl font-semibold mb-2">Game not found</h2>
            <p className="text-muted-foreground mb-4">The game you're looking for doesn't exist or was removed.</p>
            <Link to="/games">
              <Button variant="default">Back to Games</Button>
            </Link>
          </div>
        </main>
        <Footer />
        <MobileNav />
        <WhatsAppButton />
      </div>
    );
  }

  const howToPlay = Array.isArray(game.howToPlay) ? game.howToPlay : [];
  const features = Array.isArray(game.features) ? game.features : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <Link to="/games" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft className="w-4 h-4" />
            Back to Games
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="relative aspect-video rounded-2xl overflow-hidden glass border border-border">
                {!isPlaying ? (
                  <>
                    <img
                      src={game.image || ""}
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
                          onClick={() => setIsPlaying(true)}
                        >
                          <Play className="w-6 h-6" />
                          Play Now
                        </Button>
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

                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-full">
                  <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                  <Users className="w-4 h-4 text-neon-green" />
                  <span className="font-mono text-sm">{(game.players ?? 0).toLocaleString()} playing</span>
                </div>
              </div>

              <div className="glass rounded-xl p-6">
                <div className="flex items-center gap-4 mb-6 border-b border-border pb-4">
                  <Button 
                    variant={activeTab === 'about' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setActiveTab('about')}
                  >
                    About
                  </Button>
                  <Button 
                    variant={activeTab === 'howto' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setActiveTab('howto')}
                  >
                    How to Play
                  </Button>
                  <Button 
                    variant={activeTab === 'stats' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setActiveTab('stats')}
                  >
                    Stats
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* About Tab */}
                  {activeTab === 'about' && (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                          <Info className="w-5 h-5 text-primary" />
                          About {game.name}
                        </h3>
                        <p className="text-muted-foreground">{game.description || "No description available."}</p>
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
                          <div className="font-bold text-primary mb-1">{game.rtp != null ? `${game.rtp}%` : "—"}</div>
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

                      {features.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-4">
                          {features.map((feature: string) => (
                            <span key={feature} className="px-3 py-1 bg-muted rounded-full text-xs font-medium">
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* How to Play Tab */}
                  {activeTab === 'howto' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary" />
                        How to Play {game.name}
                      </h3>
                      {howToPlay.length > 0 ? (
                        <ol className="space-y-3">
                          {howToPlay.map((step: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-muted-foreground">
                              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary text-xs font-bold">
                                {i + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-muted-foreground">
                          Instructions for this game will be displayed here. Start by selecting your bet amount and click Play to begin!
                        </p>
                      )}
                    </div>
                  )}

                  {/* Stats Tab */}
                  {activeTab === 'stats' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-accent" />
                        Game Statistics
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="glass rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">Total Players</p>
                          <p className="text-2xl font-bold">{(game.players ?? 0).toLocaleString()}</p>
                        </div>
                        <div className="glass rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">Rating</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 text-accent fill-current" />
                            <span className="text-2xl font-bold">{game.rating}</span>
                          </div>
                        </div>
                        <div className="glass rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">RTP</p>
                          <p className="text-2xl font-bold text-neon-green">{game.rtp != null ? `${game.rtp}%` : "—"}</p>
                        </div>
                        <div className="glass rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">Bet Range</p>
                          <p className="text-lg font-bold">₹{game.minBet} - ₹{game.maxBet.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  Place Your Bet
                </h3>

                <div className="glass rounded-lg p-4 mb-4 bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Your Balance</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold font-mono">₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <Link to="/deposit">
                      <Button variant="gold" size="sm">Add Funds</Button>
                    </Link>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Bet Amount</label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleBetChange(betAmount - 10)}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={betAmount}
                      onChange={(e) => handleBetChange(Number(e.target.value))}
                      className="text-center font-mono text-lg h-12"
                    />
                    <Button variant="outline" size="icon" onClick={() => handleBetChange(betAmount + 10)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

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
                    <Button variant="outline" size="sm" onClick={() => setBetAmount(game.maxBet)}>
                      MAX
                    </Button>
                  </div>
                </div>

                <Button
                  variant="neon"
                  size="xl"
                  className="w-full mt-6 gap-2"
                  onClick={handleStartPlaying}
                >
                  <Play className="w-5 h-5" />
                  Start Playing
                </Button>
              </div>

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
                <a
                  href={whatsAppLinks.deposit}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors border border-[#25D366]/30"
                >
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
                <a
                  href={whatsAppLinks.withdraw}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
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
