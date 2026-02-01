import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api";
import {
  Users,
  Copy,
  Share2,
  Gift,
  TrendingUp,
  Check,
  MessageCircle,
  Facebook,
  Twitter,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Referral {
  id: string;
  name: string;
  email: string;
  joinedAt: string | null;
  status: "active" | "pending" | "joined";
  earnings: number;
  totalBets: number;
}

interface ReferralStats {
  total_referrals: number;
  active_referrals: number;
  total_earnings: string;
  total_bets_from_referrals: string;
}

interface ReferralTier {
  per_referral_amount: string;
}

export function ReferralSection() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [perReferralAmount, setPerReferralAmount] = useState<number>(500); // Default

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch referrals and tiers in parallel
        const [data, tiers] = await Promise.all([
          apiClient.getUserReferrals(),
          apiClient.getReferralTiers().catch(() => []),
        ]);
        
        // Set per-referral amount from first tier (or default)
        if (tiers && tiers.length > 0) {
          const firstTier = tiers[0];
          setPerReferralAmount(parseFloat(firstTier.per_referral_amount) || 500);
        }
        
        setReferralCode(data.referral_code || "");
        setReferralLink(data.referral_link || `https://karnalix.com/register?ref=${data.referral_code}`);
        setStats(data.stats);
        
        // Map API response to Referral format
        const mappedReferrals: Referral[] = (data.referrals || []).map((r: any) => ({
          id: String(r.id),
          name: r.name || 'Anonymous',
          email: r.email || '',
          joinedAt: r.joined_at ? new Date(r.joined_at).toLocaleDateString() : null,
          status: r.status,
          earnings: parseFloat(r.earnings) || 0,
          totalBets: parseFloat(r.total_bets) || 0,
        }));
        
        setReferrals(mappedReferrals);
      } catch (error) {
        console.error('Failed to fetch referrals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${type} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareVia = (platform: string) => {
    const message = `Join KarnaliX and get ₹500 bonus! Use my referral code: ${referralCode}`;
    let url = "";
    
    switch (platform) {
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(message + " " + referralLink)}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralLink)}`;
        break;
    }
    
    if (url) window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalEarnings = parseFloat(stats?.total_earnings || '0');
  const totalBetsFromReferrals = parseFloat(stats?.total_bets_from_referrals || '0');

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total Referrals</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold">{stats?.total_referrals || 0}</p>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-4 h-4 text-neon-green" />
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-neon-green">{stats?.active_referrals || 0}</p>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Total Earned</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono">₹{totalEarnings.toLocaleString()}</p>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Referral Bets</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono">₹{totalBetsFromReferrals.toLocaleString()}</p>
        </div>
      </div>

      {/* Referral Link */}
      <div className="glass rounded-xl p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" />
          Your Referral Link
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Input
                value={referralLink}
                readOnly
                className="pr-12 font-mono text-sm"
              />
              <button
                onClick={() => copyToClipboard(referralLink, "Link")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded-lg"
              >
                {copied ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <Button 
              variant="neon" 
              className="gap-2"
              onClick={() => copyToClipboard(referralLink, "Link")}
            >
              <Copy className="w-4 h-4" /> Copy Link
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Your Code:</span>
            <button
              onClick={() => copyToClipboard(referralCode, "Code")}
              className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg font-mono font-bold hover:bg-muted/80"
            >
              {referralCode || 'N/A'}
              <Copy className="w-3 h-3" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => shareVia("whatsapp")}
              className="gap-2 border-[#25D366] hover:bg-[#25D366]/10"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" /> WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => shareVia("facebook")}
              className="gap-2 border-[#1877F2] hover:bg-[#1877F2]/10"
            >
              <Facebook className="w-4 h-4 text-[#1877F2]" /> Facebook
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => shareVia("twitter")}
              className="gap-2 border-[#1DA1F2] hover:bg-[#1DA1F2]/10"
            >
              <Twitter className="w-4 h-4 text-[#1DA1F2]" /> Twitter
            </Button>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold mb-4">How It Works</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
              <Share2 className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-medium mb-1">1. Share</h4>
            <p className="text-sm text-muted-foreground">Share your unique referral link with friends</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-accent/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <h4 className="font-medium mb-1">2. They Join</h4>
            <p className="text-sm text-muted-foreground">Friends sign up using your link</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-neon-green/20 flex items-center justify-center">
              <Gift className="w-6 h-6 text-neon-green" />
            </div>
            <h4 className="font-medium mb-1">3. Earn</h4>
            <p className="text-sm text-muted-foreground">Get ₹{perReferralAmount.toLocaleString()} for each friend who deposits</p>
          </div>
        </div>
      </div>

      {/* Referrals List */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Your Referrals</h3>
          <span className="text-sm text-muted-foreground">{referrals.length} members</span>
        </div>
        {referrals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No referrals yet</p>
            <p className="text-xs mt-1">Share your referral link to start earning!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {referral.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{referral.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {referral.joinedAt ? `Joined: ${referral.joinedAt}` : 'Pending signup'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                    referral.status === "active" ? "bg-neon-green/10 text-neon-green" :
                    referral.status === "pending" ? "bg-accent/10 text-accent" :
                    referral.status === "joined" ? "bg-primary/10 text-primary" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {referral.status}
                  </span>
                  <div className="text-right hidden sm:block">
                    <p className="font-mono text-sm font-medium text-neon-green">+₹{referral.earnings.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Earned</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
