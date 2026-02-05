import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Wallet, MessageCircle, Gift, ArrowRight, Zap } from "lucide-react";
import { whatsAppLinks } from "@/components/layout/WhatsAppButton";
import { useContact } from "@/hooks/useContact";
import apiClient from "@/lib/api";

const DEFAULT_BONUS_TITLE = "Get 10% Deposit Bonus!";
const DEFAULT_BONUS_SUBTITLE = "Min deposit ₹500 to avail bonus";

interface AddFundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddFundsModal({ open, onOpenChange }: AddFundsModalProps) {
  const contact = useContact();
  const [bonusTitle, setBonusTitle] = useState(DEFAULT_BONUS_TITLE);
  const [bonusSubtitle, setBonusSubtitle] = useState(DEFAULT_BONUS_SUBTITLE);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const minDepositSubtitle = `Min deposit ₹${contact.min_deposit} to avail bonus`;
    (async () => {
      try {
        const content = await apiClient.getPublicContent();
        if (cancelled) return;
        const hero = content?.hero;
        const promos = content?.promos;
        if (hero?.highlight) {
          setBonusTitle(String(hero.highlight));
          setBonusSubtitle(hero.subtitle ? String(hero.subtitle) : minDepositSubtitle);
        } else if (Array.isArray(promos) && promos.length > 0) {
          const p = promos[0];
          setBonusTitle(p?.title ?? p?.highlight ?? DEFAULT_BONUS_TITLE);
          setBonusSubtitle(p?.subtitle ?? minDepositSubtitle);
        } else {
          setBonusTitle(DEFAULT_BONUS_TITLE);
          setBonusSubtitle(minDepositSubtitle);
        }
      } catch {
        if (!cancelled) {
          setBonusTitle(DEFAULT_BONUS_TITLE);
          setBonusSubtitle(minDepositSubtitle);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [open, contact.min_deposit]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-strong border-border">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">Add Funds to Play</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Your wallet balance is low. Add funds to start playing and winning!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {/* Deposit via App */}
          <Link to="/deposit" onClick={() => onOpenChange(false)}>
            <Button variant="neon" size="lg" className="w-full gap-2 justify-between">
              <span className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Deposit via App
              </span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>

          {/* Instant Deposit via WhatsApp */}
          <a 
            href={whatsAppLinks.deposit} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => onOpenChange(false)}
          >
            <Button variant="outline" size="lg" className="w-full gap-2 justify-between border-[#25D366] hover:bg-[#25D366]/10">
              <span className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                <span>Instant Deposit via WhatsApp</span>
                <Zap className="w-4 h-4 text-accent" />
              </span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </a>
        </div>

        {/* Bonus Info */}
        <div className="p-4 bg-gradient-to-r from-neon-green/10 to-accent/10 rounded-xl border border-neon-green/30">
          <div className="flex items-center gap-3">
            <Gift className="w-6 h-6 text-neon-green flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">{bonusTitle}</p>
              <p className="text-xs text-muted-foreground">{bonusSubtitle}</p>
            </div>
          </div>
        </div>

        {/* Cancel */}
        <Button 
          variant="ghost" 
          className="w-full"
          onClick={() => onOpenChange(false)}
        >
          Maybe Later
        </Button>
      </DialogContent>
    </Dialog>
  );
}
