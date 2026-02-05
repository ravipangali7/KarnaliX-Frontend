import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowUpRight,
  Wallet,
  AlertCircle,
  Check,
  Clock,
  Shield,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { whatsAppLinks } from "@/components/layout/WhatsAppButton";
import { useContact } from "@/hooks/useContact";
import apiClient from "@/lib/api";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  onSuccess?: () => void;
}

interface PaymentMode {
  id: number | string;
  name: string;
  type?: string;
}

const defaultMethods = [
  { id: "esewa", name: "eSewa", minLimit: 500, maxLimit: 25000 },
  { id: "khalti", name: "Khalti", minLimit: 500, maxLimit: 50000 },
  { id: "bank", name: "Bank Transfer", minLimit: 1000, maxLimit: 100000 },
];

export function WithdrawModal({ isOpen, onClose, walletBalance, onSuccess }: WithdrawModalProps) {
  const contact = useContact();
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [loadingModes, setLoadingModes] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [amount, setAmount] = useState(500);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      setLoadingModes(true);
      try {
        const res = await apiClient.getUserPaymentModes();
        if (cancelled) return;
        const list = res?.results ?? res ?? [];
        const modes = Array.isArray(list) ? list.map((p: any) => ({ id: p.id, name: p.wallet_holder_name || p.name || "Payment", type: p.type })) : [];
        setPaymentModes(modes);
        if (modes.length > 0 && !selectedMethod) setSelectedMethod(String(modes[0].id));
      } catch {
        if (!cancelled) setPaymentModes([]);
      } finally {
        if (!cancelled) setLoadingModes(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen]);

  const withdrawMethods = paymentModes.length > 0
    ? paymentModes.map((p) => ({ id: String(p.id), name: p.name, minLimit: 500, maxLimit: 100000 }))
    : defaultMethods;
  const currentMethod = withdrawMethods.find((m) => m.id === selectedMethod) ?? withdrawMethods[0];

  const handleWithdraw = async () => {
    if (amount > walletBalance) {
      toast.error("Insufficient balance");
      return;
    }
    if (amount < contact.min_withdraw) {
      toast.error(`Minimum withdrawal is ₹${contact.min_withdraw}`);
      return;
    }
    const paymentModeId = paymentModes.length > 0 ? selectedMethod : null;
    if (paymentModes.length > 0 && !paymentModeId) {
      toast.error("Please select a payment method. Add one from Withdraw page if needed.");
      return;
    }
    setSubmitting(true);
    try {
      const body: { amount: string; payment_mode_id?: string } = { amount: String(amount) };
      if (paymentModeId) body.payment_mode_id = String(paymentModeId);
      await apiClient.createUserWithdrawal(body);
      setStep(2);
      toast.success("Withdrawal request submitted! Processing within 24-48 hours.");
      onSuccess?.();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Withdrawal request failed");
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setAmount(500);
    setSelectedMethod(paymentModes.length > 0 ? String(paymentModes[0]?.id) : "esewa");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-primary" />
            {step === 1 ? "Request Withdrawal" : "Withdrawal Submitted"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            {/* Balance */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Available Balance</span>
              </div>
              <span className="font-bold font-mono">₹{walletBalance.toLocaleString()}</span>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>Withdrawal Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-medium">₹</span>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="text-center text-xl font-bold pl-8"
                  min={currentMethod?.minLimit}
                  max={Math.min(currentMethod?.maxLimit || 100000, walletBalance)}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: ₹{currentMethod?.minLimit.toLocaleString()}</span>
                <span>Max: ₹{Math.min(currentMethod?.maxLimit || 100000, walletBalance).toLocaleString()}</span>
              </div>
            </div>

            {/* Method Selection */}
            <div className="space-y-2">
              <Label>Withdrawal Method</Label>
              {loadingModes ? (
                <p className="text-sm text-muted-foreground">Loading payment methods...</p>
              ) : (
              <div className={`grid gap-2 ${withdrawMethods.length >= 3 ? "grid-cols-3" : "grid-cols-1"}`}>
                {withdrawMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      selectedMethod === method.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-xs font-medium">{method.name}</span>
                  </button>
                ))}
              </div>
              )}
            </div>

            {/* Notice */}
            <div className="p-3 bg-accent/10 rounded-lg border border-accent/30">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium">Processing Time</p>
                  <p className="text-muted-foreground">Withdrawals are processed within 24-48 hours after verification.</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetAndClose} className="flex-1" disabled={submitting}>
                Cancel
              </Button>
              <Button variant="neon" onClick={handleWithdraw} className="flex-1 gap-2" disabled={submitting}>
                <ArrowUpRight className="w-4 h-4" />
                {submitting ? "Submitting..." : `Withdraw ₹${amount.toLocaleString()}`}
              </Button>
            </div>

            {/* WhatsApp Option */}
            <div className="text-center pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Or for faster processing</p>
              <a href={whatsAppLinks.withdraw} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2 w-full border-[#25D366] hover:bg-[#25D366]/10">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  Instant Withdraw via WhatsApp
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-neon-green/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-neon-green" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">Request Submitted!</h3>
              <p className="text-muted-foreground text-sm">
                Your withdrawal of ₹{amount.toLocaleString()} is being processed.
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-mono font-medium">₹{amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Method:</span>
                <span>{currentMethod?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className="flex items-center gap-1 text-accent">
                  <Clock className="w-3 h-3" /> Processing
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4" />
              You'll receive a notification once processed
            </div>
            <Button onClick={resetAndClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
