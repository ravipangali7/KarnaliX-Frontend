import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import apiClient from "@/lib/api";
import {
  Gift,
  Clock,
  Copy,
  Star,
  Zap,
  Trophy,
  Users,
  Calendar,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Bonus {
  id: string;
  name: string;
  type: "welcome" | "deposit" | "referral" | "cashback" | "other";
  amount: number;
  wagering: number;
  wageringProgress: number;
  expiresAt: string | null;
  status: "active" | "pending" | "wagered" | "expired" | "cancelled";
  description: string;
}

interface BonusStats {
  active_count: number;
  available_count: number;
  bonus_balance: string;
}

interface PromoCodeItem {
  id: number;
  code: string;
  name: string;
  bonus_type: string;
  bonus_amount: string;
}

interface ReferralTier {
  id: number;
  level: number;
  referrals_required: number;
  bonus_amount: string;
  per_referral_amount: string;
  name?: string;
}

export function BonusesSection() {
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [stats, setStats] = useState<BonusStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [promoCode, setPromoCode] = useState("");
  const [promoCodes, setPromoCodes] = useState<PromoCodeItem[]>([]);
  const [referralTiers, setReferralTiers] = useState<ReferralTier[]>([]);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [claimingBonus, setClaimingBonus] = useState<string | null>(null);

  const fetchBonuses = async () => {
    try {
      const data = await apiClient.getUserBonuses();
      
      // Map API response to Bonus format
      const mappedBonuses: Bonus[] = (data.bonuses || []).map((b: any) => ({
        id: String(b.id),
        name: b.name,
        type: b.type || 'other',
        amount: parseFloat(b.amount),
        wagering: parseFloat(b.wagering) || 0,
        wageringProgress: parseFloat(b.wagering_progress) || 0,
        expiresAt: b.expires_at,
        status: b.status,
        description: b.description || '',
      }));
      
      setBonuses(mappedBonuses);
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch bonuses:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchBonuses();
      
      // Fetch promo codes and referral tiers in parallel
      try {
        const [codes, tiers] = await Promise.all([
          apiClient.getActivePromoCodes().catch(() => []),
          apiClient.getReferralTiers().catch(() => []),
        ]);
        setPromoCodes(codes || []);
        setReferralTiers(tiers || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
      
      setLoading(false);
    };

    loadData();
  }, []);

  const filteredBonuses = bonuses.filter((b) => {
    if (filter === "all") return true;
    if (filter === "available") return b.status === "pending";
    if (filter === "claimed") return b.status === "wagered";
    return b.status === filter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "welcome":
        return <Gift className="w-5 h-5" />;
      case "deposit":
        return <Zap className="w-5 h-5" />;
      case "referral":
        return <Users className="w-5 h-5" />;
      case "cashback":
        return <Trophy className="w-5 h-5" />;
      default:
        return <Gift className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-neon-green bg-neon-green/10 border-neon-green/30";
      case "pending":
        return "text-primary bg-primary/10 border-primary/30";
      case "wagered":
        return "text-accent bg-accent/10 border-accent/30";
      case "expired":
      case "cancelled":
        return "text-muted-foreground bg-muted border-border";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Active";
      case "pending": return "Available";
      case "wagered": return "Claimed";
      case "expired": return "Expired";
      case "cancelled": return "Cancelled";
      default: return status;
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Code ${code} copied to clipboard!`);
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    try {
      setApplyingPromo(true);
      const result = await apiClient.redeemPromoCode(promoCode.trim());
      toast.success(result.message || "Promo code applied successfully!");
      setPromoCode("");
      // Refresh bonuses to show the new bonus
      await fetchBonuses();
    } catch (error: any) {
      toast.error(error.message || "Failed to apply promo code");
    } finally {
      setApplyingPromo(false);
    }
  };

  const claimBonus = async (bonusId: string) => {
    try {
      setClaimingBonus(bonusId);
      const result = await apiClient.claimBonus(parseInt(bonusId));
      toast.success(result.message || "Bonus claimed successfully!");
      // Refresh bonuses to update the status
      await fetchBonuses();
    } catch (error: any) {
      toast.error(error.message || "Failed to claim bonus");
    } finally {
      setClaimingBonus(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "No expiry";
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const bonusBalance = parseFloat(stats?.bonus_balance || '0');

  // Calculate VIP level from referral tiers or use default
  const getVipLevel = () => {
    if (referralTiers.length === 0) {
      // Fallback to default thresholds if no tiers configured
      if (bonusBalance >= 10000) return { name: "Gold", nextName: null, amountToNext: 0 };
      if (bonusBalance >= 5000) return { name: "Silver", nextName: "Gold", amountToNext: 10000 - bonusBalance };
      return { name: "Bronze", nextName: "Silver", amountToNext: 5000 - bonusBalance };
    }
    
    // Find current tier based on bonus balance
    const sortedTiers = [...referralTiers].sort((a, b) => b.level - a.level);
    let currentTier = sortedTiers[sortedTiers.length - 1]; // Default to lowest tier
    let nextTier: ReferralTier | null = null;
    
    for (let i = 0; i < sortedTiers.length; i++) {
      const tier = sortedTiers[i];
      const tierThreshold = parseFloat(tier.bonus_amount) * tier.referrals_required;
      if (bonusBalance >= tierThreshold) {
        currentTier = tier;
        nextTier = i > 0 ? sortedTiers[i - 1] : null;
        break;
      }
    }
    
    const tierNames = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
    const currentName = currentTier?.name || tierNames[Math.min(currentTier?.level - 1 || 0, tierNames.length - 1)];
    const nextName = nextTier ? (nextTier.name || tierNames[Math.min(nextTier.level - 1, tierNames.length - 1)]) : null;
    const nextThreshold = nextTier ? parseFloat(nextTier.bonus_amount) * nextTier.referrals_required : 0;
    
    return {
      name: currentName,
      nextName,
      amountToNext: nextTier ? Math.max(0, nextThreshold - bonusBalance) : 0,
    };
  };

  const vipInfo = getVipLevel();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Active Bonuses</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold">
            {stats?.active_count || 0}
          </p>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Available</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold">
            {stats?.available_count || 0}
          </p>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-neon-green" />
            <span className="text-xs text-muted-foreground">Bonus Balance</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-neon-green">
            ₹{bonusBalance.toLocaleString()}
          </p>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">VIP Level</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold gradient-text-gold">
            {vipInfo.name}
          </p>
        </div>
      </div>

      {/* Apply Promo Code */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold mb-4">Apply Promo Code</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Enter promo code"
            className="flex-1 h-10 px-4 rounded-lg bg-muted border border-border text-sm uppercase"
          />
          <Button onClick={applyPromoCode} disabled={!promoCode.trim() || applyingPromo}>
            {applyingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
          </Button>
        </div>
        {promoCodes.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Available promo codes:</p>
            <div className="flex flex-wrap gap-2">
              {promoCodes.map((code) => (
                <button
                  key={code.id}
                  onClick={() => setPromoCode(code.code)}
                  className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-sm"
                  title={`${code.name || code.code} - ₹${code.bonus_amount}`}
                >
                  <span className="font-mono font-medium">{code.code}</span>
                  <Copy className="w-3 h-3 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bonuses List */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold">My Bonuses</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {["all", "active", "available", "claimed", "expired"].map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(status)}
                className="capitalize whitespace-nowrap"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {bonuses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No bonuses yet</p>
            <Link to="/deposit" className="text-primary text-sm hover:underline">Make a deposit to get bonuses</Link>
          </div>
        ) : filteredBonuses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No bonuses match this filter</p>
            <button 
              onClick={() => setFilter("all")}
              className="text-primary text-sm hover:underline"
            >
              Show all bonuses
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBonuses.map((bonus) => (
              <div
                key={bonus.id}
                className={`p-4 rounded-xl border ${getStatusColor(bonus.status)} ${
                  bonus.status === "expired" || bonus.status === "cancelled" ? "opacity-60" : ""
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
                      bonus.status === "expired" || bonus.status === "cancelled" ? "bg-muted" : "bg-primary/20"
                    }`}>
                      {getTypeIcon(bonus.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{bonus.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusColor(bonus.status)}`}>
                          {getStatusLabel(bonus.status)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{bonus.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expires: {formatDate(bonus.expiresAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl sm:text-2xl font-bold font-mono text-neon-green">
                      ₹{bonus.amount.toLocaleString()}
                    </p>
                    {bonus.wagering > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground mb-1">
                          <span>Wagering: ₹{bonus.wageringProgress.toLocaleString()}/₹{bonus.wagering.toLocaleString()}</span>
                        </div>
                        <Progress 
                          value={(bonus.wageringProgress / bonus.wagering) * 100} 
                          className="h-1.5 w-32"
                        />
                      </div>
                    )}
                    {bonus.status === "pending" && (
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => claimBonus(bonus.id)}
                        disabled={claimingBonus === bonus.id}
                      >
                        {claimingBonus === bonus.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Claim Now"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VIP Banner */}
      <div className="glass rounded-xl p-4 sm:p-6 bg-gradient-to-r from-accent/10 to-orange-500/10 border-accent/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-accent to-orange-500 flex items-center justify-center">
              <Star className="w-6 h-6 sm:w-8 sm:h-8 text-accent-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {vipInfo.nextName 
                  ? `Upgrade to ${vipInfo.nextName} VIP` 
                  : `${vipInfo.name} VIP Member`}
              </h3>
              <p className="text-sm text-muted-foreground">
                {vipInfo.nextName 
                  ? `₹${vipInfo.amountToNext.toLocaleString()} more to ${vipInfo.nextName}`
                  : "You're enjoying maximum benefits!"}
              </p>
            </div>
          </div>
          <Link to="/deposit">
            <Button variant="gold" className="w-full sm:w-auto gap-2">
              {vipInfo.nextName ? "Deposit Now" : "View Benefits"} <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
