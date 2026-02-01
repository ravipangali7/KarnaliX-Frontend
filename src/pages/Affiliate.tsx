import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Gift, 
  Copy, 
  Share2, 
  TrendingUp,
  CheckCircle,
  ChevronRight,
  Wallet,
  Trophy,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api";

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  totalBetsFromReferrals: number;
}

interface ReferralTier {
  level: number;
  referrals: number;
  bonus: string;
  perReferral: string;
}

interface Referral {
  name: string;
  date: string;
  status: string;
  earned: string;
}

// Fallback tiers
const fallbackTiers: ReferralTier[] = [
  { level: 1, referrals: 5, bonus: "₹500", perReferral: "₹100" },
  { level: 2, referrals: 15, bonus: "₹2,000", perReferral: "₹150" },
  { level: 3, referrals: 30, bonus: "₹5,000", perReferral: "₹200" },
  { level: 4, referrals: 50, bonus: "₹10,000", perReferral: "₹250" },
  { level: 5, referrals: 100, bonus: "₹25,000", perReferral: "₹300" },
];

export default function Affiliate() {
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [showAllReferrals, setShowAllReferrals] = useState(false);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    totalBetsFromReferrals: 0,
  });
  const [tiers, setTiers] = useState<ReferralTier[]>(fallbackTiers);
  const [referrals, setReferrals] = useState<Referral[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [referralData, tiersData] = await Promise.all([
        apiClient.getUserReferrals().catch(() => null),
        apiClient.getReferralTiers().catch(() => []),
      ]);

      if (referralData) {
        setReferralCode(referralData.referral_code || "");
        setReferralLink(referralData.referral_link || `https://karnalix.com/register?ref=${referralData.referral_code}`);
        setStats({
          totalReferrals: referralData.stats?.total_referrals || 0,
          activeReferrals: referralData.stats?.active_referrals || 0,
          totalEarnings: parseFloat(referralData.stats?.total_earnings || "0"),
          totalBetsFromReferrals: parseFloat(referralData.stats?.total_bets_from_referrals || "0"),
        });

        // Map referrals
        const mappedReferrals = (referralData.referrals || []).map((r: any) => {
          const joinedAt = r.joined_at ? new Date(r.joined_at) : null;
          const now = new Date();
          let dateStr = "Pending";
          if (joinedAt) {
            const diffDays = Math.floor((now.getTime() - joinedAt.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 0) dateStr = "Today";
            else if (diffDays === 1) dateStr = "Yesterday";
            else if (diffDays < 7) dateStr = `${diffDays} days ago`;
            else if (diffDays < 30) dateStr = `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
            else dateStr = joinedAt.toLocaleDateString();
          }
          return {
            name: r.name || "User",
            date: dateStr,
            status: r.status || "pending",
            earned: r.earnings ? `₹${parseInt(r.earnings).toLocaleString()}` : "₹0",
          };
        });
        setReferrals(mappedReferrals);
      }

      if (tiersData && tiersData.length > 0) {
        setTiers(tiersData.map((t: any) => ({
          level: t.level,
          referrals: t.referrals,
          bonus: t.bonus,
          perReferral: t.perReferral,
        })));
      }
    } catch (error) {
      console.error("Failed to fetch referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join KarnaliX!",
        text: "Join me on KarnaliX and get a 200% welcome bonus! Use my referral code.",
        url: referralLink,
      });
    } else {
      copyToClipboard(referralLink);
    }
  };

  const currentTier = tiers.find(t => t.referrals > stats.totalReferrals) || tiers[tiers.length - 1] || fallbackTiers[0];
  const progress = currentTier ? (stats.totalReferrals / currentTier.referrals) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="glass rounded-2xl p-8 md:p-12 mb-8 bg-gradient-to-r from-neon-green/10 via-primary/10 to-secondary/10 border-neon-green/30">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-neon-green/30 mb-6">
                <Gift className="w-5 h-5 text-neon-green" />
                <span className="text-sm font-medium">Refer & Earn Program</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Earn <span className="gradient-text">₹500</span> for Every Friend!
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Share your referral link and earn money when your friends join and play. No limits on how much you can earn!
              </p>

              {/* Referral Link */}
              {loading ? (
                <Skeleton className="h-14 max-w-xl mx-auto rounded-lg" />
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto">
                  <div className="flex-1 w-full flex items-center gap-2 bg-input rounded-lg px-4 py-3 border border-border">
                    <Input
                      value={referralLink}
                      readOnly
                      className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(referralLink)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button variant="neon" size="lg" onClick={shareLink} className="gap-2 w-full sm:w-auto">
                    <Share2 className="w-5 h-5" />
                    Share Link
                  </Button>
                </div>
              )}

              {!loading && referralCode && (
                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                  <span>Your Code:</span>
                  <code className="px-2 py-1 bg-muted rounded font-mono">{referralCode}</code>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(referralCode)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {loading ? (
              <>
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
              </>
            ) : (
              <>
                <div className="glass rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Total Referrals</p>
                  <p className="text-2xl font-bold">{stats.totalReferrals}</p>
                </div>

                <div className="glass rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-neon-green" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Active Referrals</p>
                  <p className="text-2xl font-bold text-neon-green">{stats.activeReferrals}</p>
                </div>

                <div className="glass rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
                  <p className="text-2xl font-bold font-mono gradient-text-gold">₹{stats.totalEarnings.toLocaleString()}</p>
                </div>

                <div className="glass rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-secondary" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Referral Bets</p>
                  <p className="text-2xl font-bold font-mono">₹{stats.totalBetsFromReferrals.toLocaleString()}</p>
                </div>
              </>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Tier Progress */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-accent" />
                  Affiliate Tiers
                </h2>

                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                  </div>
                ) : (
                  <>
                    {/* Current Progress */}
                    <div className="mb-8 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress to Level {currentTier.level}</span>
                        <span className="text-sm text-muted-foreground">
                          {stats.totalReferrals}/{currentTier.referrals} referrals
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {Math.max(0, currentTier.referrals - stats.totalReferrals)} more referrals to unlock {currentTier.perReferral}/referral
                      </p>
                    </div>

                    {/* Tiers Grid */}
                    <div className="space-y-3">
                      {tiers.map((tier) => {
                        const isUnlocked = stats.totalReferrals >= tier.referrals;
                        const isCurrent = currentTier.level === tier.level;
                        return (
                          <div 
                            key={tier.level}
                            className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                              isUnlocked 
                                ? "bg-neon-green/10 border-neon-green/30" 
                                : isCurrent 
                                  ? "bg-primary/10 border-primary/30"
                                  : "bg-muted/30 border-border"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                isUnlocked ? "bg-neon-green text-primary-foreground" : "bg-muted"
                              }`}>
                                {tier.level}
                              </div>
                              <div>
                                <p className="font-medium">Level {tier.level}</p>
                                <p className="text-sm text-muted-foreground">{tier.referrals} referrals required</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-neon-green">{tier.perReferral}/referral</p>
                              <p className="text-sm text-muted-foreground">Bonus: {tier.bonus}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Recent Referrals */}
            <div className="space-y-6">
              <div className="glass rounded-xl p-6">
                <h2 className="text-lg font-bold mb-4">Recent Referrals</h2>
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                  </div>
                ) : referrals.length > 0 ? (
                  <div className="space-y-3">
                    {(showAllReferrals ? referrals : referrals.slice(0, 5)).map((ref, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{ref.name}</p>
                          <p className="text-xs text-muted-foreground">{ref.date}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            ref.status === "active" 
                              ? "bg-neon-green/20 text-neon-green" 
                              : "bg-accent/20 text-accent"
                          }`}>
                            {ref.status}
                          </span>
                          <p className="text-sm font-mono font-medium mt-1">{ref.earned}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No referrals yet. Share your link to get started!</p>
                )}
                {referrals.length > 5 && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-4 gap-2"
                    onClick={() => setShowAllReferrals(!showAllReferrals)}
                  >
                    {showAllReferrals ? 'Show Less' : `View All (${referrals.length})`}
                    <ChevronRight className={`w-4 h-4 transition-transform ${showAllReferrals ? 'rotate-90' : ''}`} />
                  </Button>
                )}
              </div>

              {/* How It Works */}
              <div className="glass rounded-xl p-6">
                <h2 className="text-lg font-bold mb-4">How It Works</h2>
                <div className="space-y-4">
                  {[
                    { step: 1, title: "Share Your Link", desc: "Send your unique referral link to friends" },
                    { step: 2, title: "Friend Signs Up", desc: "They register and make their first deposit" },
                    { step: 3, title: "You Get Paid", desc: "Earn ₹500 instantly when they start playing" },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground flex-shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
