import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  LogIn
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useContact } from "@/hooks/useContact";
import apiClient from "@/lib/api";

const referralTiers = [
  { level: 1, referrals: 5, bonus: "₹500", perReferral: "₹100" },
  { level: 2, referrals: 15, bonus: "₹2,000", perReferral: "₹150" },
  { level: 3, referrals: 30, bonus: "₹5,000", perReferral: "₹200" },
  { level: 4, referrals: 50, bonus: "₹10,000", perReferral: "₹250" },
  { level: 5, referrals: 100, bonus: "₹25,000", perReferral: "₹300" },
];

const defaultRecentReferrals: { name: string; date: string; status: string; earned: string; earnings: number }[] = [
  { name: "Ra***sh K.", date: "2 days ago", status: "active", earned: "₹500", earnings: 500 },
  { name: "Pr***ya S.", date: "5 days ago", status: "active", earned: "₹500", earnings: 500 },
  { name: "Am***it G.", date: "1 week ago", status: "pending", earned: "₹0", earnings: 0 },
  { name: "Su***ta M.", date: "1 week ago", status: "active", earned: "₹500", earnings: 500 },
  { name: "Bi***al T.", date: "2 weeks ago", status: "active", earned: "₹500", earnings: 500 },
];

type TierRow = { level: number; referrals: number; bonus: string; perReferral: string };

export default function Affiliate() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const contact = useContact();
  const navigate = useNavigate();
  const [referralCode, setReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [referrals, setReferrals] = useState<{ name: string; date: string; status: string; earned: string; earnings: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [tiers, setTiers] = useState<TierRow[]>(referralTiers);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const content = await apiClient.getPublicContent();
        if (cancelled) return;
        const raw = (content as any)?.referral_tiers;
        if (Array.isArray(raw) && raw.length > 0) {
          setTiers(
            raw.map((t: any) => ({
              level: Number(t.level) || 1,
              referrals: Number(t.referrals) || 0,
              bonus: String(t.bonus ?? "₹0"),
              perReferral: String(t.perReferral ?? "₹0"),
            }))
          );
        }
      } catch {
        if (!cancelled) setTiers(referralTiers);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await apiClient.getUserReferral();
        if (cancelled) return;
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://karnalix.com";
        setReferralCode(data.referral_code ?? data.referralCode ?? "");
        setReferralLink(data.referral_link ? `${baseUrl}${data.referral_link}` : `${baseUrl}/ref/${data.referral_code || data.referralCode || ""}`);
        const list = data.referrals ?? [];
        setReferrals(
          list.map((r: any) => {
            const earningsNum = typeof r.earnings === "number" ? r.earnings : (typeof r.earnings === "string" ? parseFloat(r.earnings) : 0) || 0;
            return {
              name: r.username ? `${String(r.username).slice(0, 2)}***${String(r.username).slice(-2)}` : "—",
              date: (r.joined_at || r.created_at) ? new Date(r.joined_at || r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—",
              status: r.status === "ACTIVE" ? "active" : "pending",
              earned: r.earnings != null && r.earnings !== "" ? `₹${Number(r.earnings) || 0}` : "—",
              earnings: earningsNum,
            };
          })
        );
      } catch {
        if (!cancelled) setReferrals(defaultRecentReferrals);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const totalReferrals = referrals.length;
  const referralStats = {
    totalReferrals,
    activeReferrals: referrals.filter((r) => r.status === "active").length,
    pendingReferrals: referrals.filter((r) => r.status === "pending").length,
    totalEarnings: referrals.reduce((s, r) => s + (r.earnings ?? 0), 0),
    pendingEarnings: referrals.filter((r) => r.status === "pending").reduce((s, r) => s + (r.earnings ?? 0), 0),
  };
  const recentReferralsList = referrals.length > 0 ? referrals : defaultRecentReferrals;
  const displayCode = referralCode || "—";
  const displayLink = referralLink || (typeof window !== "undefined" ? `${window.location.origin}/ref/` : "https://karnalix.com/ref/");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const shareLink = () => {
    const url = displayLink || referralLink;
    if (navigator.share && url) {
      navigator.share({
        title: "Join KarnaliX!",
        text: "Join me on KarnaliX and get a 200% welcome bonus! Use my referral code.",
        url,
      });
    } else if (url) {
      copyToClipboard(url);
    }
  };

  const currentTier = tiers.find(t => t.referrals > referralStats.totalReferrals) || tiers[0];
  const progress = currentTier?.referrals > 0 ? (referralStats.totalReferrals / currentTier.referrals) * 100 : 0;

  if (authLoading || (isAuthenticated && loading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="glass rounded-2xl p-8 md:p-12 mb-8 bg-gradient-to-r from-neon-green/10 via-primary/10 to-secondary/10 border-neon-green/30">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-neon-green/30 mb-6">
                <Gift className="w-5 h-5 text-neon-green" />
                <span className="text-sm font-medium">Refer & Earn Program</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Earn <span className="gradient-text">{contact.referral_amount}</span> for Every Friend!
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Share your referral link and earn money when your friends join and play. No limits on how much you can earn!
              </p>

              {!isAuthenticated ? (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-muted-foreground">Sign in to get your referral link and start earning.</p>
                  <Button variant="neon" size="lg" onClick={() => navigate("/login")} className="gap-2">
                    <LogIn className="w-5 h-5" />
                    Sign in to get your link
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto">
                    <div className="flex-1 w-full flex items-center gap-2 bg-input rounded-lg px-4 py-3 border border-border">
                      <Input
                        value={displayLink}
                        readOnly
                        className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                      />
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(displayLink)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button variant="neon" size="lg" onClick={() => shareLink()} className="gap-2 w-full sm:w-auto">
                      <Share2 className="w-5 h-5" />
                      Share Link
                    </Button>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                    <span>Your Code:</span>
                    <code className="px-2 py-1 bg-muted rounded font-mono">{displayCode}</code>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(displayCode)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          {isAuthenticated && (
          <>
          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Referrals</p>
              <p className="text-2xl font-bold">{referralStats.totalReferrals}</p>
            </div>

            <div className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-neon-green" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Active Referrals</p>
              <p className="text-2xl font-bold text-neon-green">{referralStats.activeReferrals}</p>
            </div>

            <div className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-accent" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
              <p className="text-2xl font-bold font-mono gradient-text-gold">₹{referralStats.totalEarnings.toLocaleString()}</p>
            </div>

            <div className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Pending Earnings</p>
              <p className="text-2xl font-bold font-mono">₹{referralStats.pendingEarnings.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Tier Progress */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-accent" />
                  Affiliate Tiers
                </h2>

                {/* Current Progress */}
                <div className="mb-8 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress to Level {currentTier?.level ?? 1}</span>
                    <span className="text-sm text-muted-foreground">
                      {referralStats.totalReferrals}/{currentTier?.referrals ?? 0} referrals
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {(currentTier?.referrals ?? 0) - referralStats.totalReferrals} more referrals to unlock {currentTier?.perReferral ?? "₹0"}/referral
                  </p>
                </div>

                {/* Tiers Grid */}
                <div className="space-y-3">
                  {tiers.map((tier) => {
                    const isUnlocked = referralStats.totalReferrals >= tier.referrals;
                    const isCurrent = currentTier?.level === tier.level;
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
              </div>
            </div>

            {/* Recent Referrals */}
            <div className="space-y-6">
              <div className="glass rounded-xl p-6">
                <h2 className="text-lg font-bold mb-4">Recent Referrals</h2>
                <div className="space-y-3">
                  {recentReferralsList.map((ref, i) => (
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
                <Link to="/dashboard" state={{ tab: "referrals" }}>
                  <Button variant="outline" className="w-full mt-4 gap-2">
                    View All <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {/* How It Works */}
              <div className="glass rounded-xl p-6">
                <h2 className="text-lg font-bold mb-4">How It Works</h2>
                <div className="space-y-4">
                  {[
                    { step: 1, title: "Share Your Link", desc: "Send your unique referral link to friends" },
                    { step: 2, title: "Friend Signs Up", desc: "They register and make their first deposit" },
                    { step: 3, title: "You Get Paid", desc: `Earn ${contact.referral_amount} instantly when they start playing` },
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
          </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
