import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getBonusRules } from "@/api/bonus";
import { Gift, Clock, Percent, Zap } from "lucide-react";

const BonusPage = () => {
  const { data: bonusRules = [] } = useQuery({ queryKey: ["bonusRules"], queryFn: getBonusRules });

  return (
    <div className="container px-4 py-6 space-y-6">
      <div>
        <h1 className="font-gaming font-bold text-2xl neon-text tracking-wide">BONUSES & PROMOTIONS</h1>
        <p className="text-sm text-muted-foreground mt-1">Claim exclusive rewards and boost your balance</p>
      </div>
      <div className="grid gap-4">
        {bonusRules.map((bonus) => (
          <Card key={bonus.id} className="overflow-hidden hover:border-primary/30 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0 neon-glow-sm">
                  <Gift className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-lg">{bonus.name}</h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent"><Percent className="h-3 w-3" /> {bonus.reward_value}{bonus.reward_type === "percentage" ? "%" : " Fixed"}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Roll x{bonus.roll_required ?? "-"}</span>
                  </div>
                  {bonus.min_deposit && <p className="text-xs text-muted-foreground mt-2">Min deposit: ₹{bonus.min_deposit}</p>}
                  <Button className="mt-3 gold-gradient text-primary-foreground neon-glow-sm" size="sm">Claim Bonus</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BonusPage;
