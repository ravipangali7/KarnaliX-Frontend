import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const PlayerReferralPage = () => {
  const { user } = useAuth();
  const referralUrl =
    typeof window !== "undefined" && user?.username
      ? `${window.location.origin}/register?ref=${encodeURIComponent(user.username)}`
      : "";

  const handleCopy = async () => {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      toast({ title: "Link copied to clipboard." });
    } catch {
      toast({ title: "Could not copy. Copy the link manually.", variant: "destructive" });
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl mx-auto">
      <h2 className="font-gaming font-bold text-xl neon-text tracking-wider">REFER & EARN</h2>

      <Card className="gaming-card overflow-hidden">
        <div className="h-16 gold-gradient flex items-center justify-center">
          <Users className="h-8 w-8 text-primary-foreground/90" />
        </div>
        <CardContent className="p-5 space-y-3">
          <p className="text-sm text-muted-foreground">
            Share your link with friends. When they sign up using your link, they join under the same platform and you earn a referral bonus when the offer is active.
          </p>
          <div className="flex gap-2">
            <Input readOnly value={referralUrl} className="font-mono text-xs bg-muted/50" />
            <Button size="icon" variant="secondary" className="flex-shrink-0" onClick={handleCopy} title="Copy link">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <Button className="w-full gold-gradient text-primary-foreground font-display font-semibold" onClick={handleCopy}>
            Copy referral link
          </Button>
          {user?.username && (
            <p className="text-xs text-muted-foreground">
              Your referral code: <span className="font-mono font-medium text-foreground">{user.username}</span>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerReferralPage;
