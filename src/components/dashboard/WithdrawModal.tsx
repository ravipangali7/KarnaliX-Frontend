import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { whatsAppLinks } from "@/components/layout/WhatsAppButton";
import apiClient from "@/lib/api";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
}

interface PaymentMethod {
  id: number;
  name: string;
  icon: string;
  minLimit: number;
  maxLimit: number;
}

// Fallback methods
const fallbackMethods: PaymentMethod[] = [
  { id: 1, name: "eSewa", icon: "💳", minLimit: 500, maxLimit: 25000 },
  { id: 2, name: "Khalti", icon: "📱", minLimit: 500, maxLimit: 50000 },
  { id: 3, name: "Bank Transfer", icon: "🏦", minLimit: 1000, maxLimit: 100000 },
];

export function WithdrawModal({ isOpen, onClose, walletBalance }: WithdrawModalProps) {
  const [withdrawMethods, setWithdrawMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [amount, setAmount] = useState(500);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const currentMethod = withdrawMethods.find((m) => m.id === selectedMethodId);

  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods();
    }
  }, [isOpen]);

  const fetchPaymentMethods = async () => {
    try {
      setLoadingMethods(true);
      const data = await apiClient.getPaymentMethods();
      const mapped = data.map((m: any) => ({
        id: m.id,
        name: m.name,
        icon: m.icon || "💳",
        minLimit: Number(m.min_limit) || 500,
        maxLimit: Number(m.max_limit) || 100000,
      })).filter((m: any) => m.isActive !== false);
      setWithdrawMethods(mapped.length > 0 ? mapped : fallbackMethods);
      if (mapped.length > 0) {
        setSelectedMethodId(mapped[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
      setWithdrawMethods(fallbackMethods);
      setSelectedMethodId(fallbackMethods[0].id);
    } finally {
      setLoadingMethods(false);
    }
  };

  const handleWithdraw = async () => {
    if (!accountNumber || !accountName) {
      toast.error("Please fill in all account details");
      return;
    }
    if (amount > walletBalance) {
      toast.error("Insufficient balance");
      return;
    }
    if (!selectedMethodId || !currentMethod) {
      toast.error("Please select a withdrawal method");
      return;
    }
    if (amount < currentMethod.minLimit) {
      toast.error(`Minimum withdrawal is ₹${currentMethod.minLimit}`);
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.createWithdrawal({
        payment_method: selectedMethodId,
        amount: amount,
        account_number: accountNumber,
        account_name: accountName,
      });
      setStep(2);
      toast.success("Withdrawal request submitted! Processing within 24-48 hours.");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit withdrawal request");
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setAmount(500);
    setAccountNumber("");
    setAccountName("");
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
              {currentMethod && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Min: ₹{currentMethod.minLimit.toLocaleString()}</span>
                  <span>Max: ₹{Math.min(currentMethod.maxLimit, walletBalance).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Method Selection */}
            <div className="space-y-2">
              <Label>Withdrawal Method</Label>
              {loadingMethods ? (
                <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="h-20 rounded-lg" />
                  <Skeleton className="h-20 rounded-lg" />
                  <Skeleton className="h-20 rounded-lg" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {withdrawMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethodId(method.id)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        selectedMethodId === method.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-xl block mb-1">{method.icon}</span>
                      <span className="text-xs">{method.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Account Details */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>
                  {currentMethod?.name.includes("Bank") ? "Account Number" : `${currentMethod?.name || "Payment"} ID/Number`}
                </Label>
                <Input
                  placeholder={currentMethod?.name.includes("Bank") ? "Enter bank account number" : `Enter ${currentMethod?.name || "payment"} number`}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Account Holder Name</Label>
                <Input
                  placeholder="Enter name as per account"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>
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
              <Button variant="outline" onClick={resetAndClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                variant="neon" 
                onClick={handleWithdraw} 
                className="flex-1 gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    Withdraw ₹{amount.toLocaleString()}
                  </>
                )}
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
                <span className="text-muted-foreground">Account:</span>
                <span className="font-mono">{accountNumber}</span>
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
