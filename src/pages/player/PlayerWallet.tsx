import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getPlayerWallet, getPaymentModes, getDepositPaymentModes, depositRequest, depositRequestWithScreenshot, withdrawRequest } from "@/api/player";
import { toast } from "@/hooks/use-toast";
import { ArrowDownCircle, ArrowUpCircle, Wallet, Upload, CheckCircle, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { motion } from "framer-motion";

const quickAmounts = [500, 1000, 2000, 5000, 10000, 25000];

const PlayerWallet = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [selectedPM, setSelectedPM] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [withdrawPassword, setWithdrawPassword] = useState("");
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [depositRemarks, setDepositRemarks] = useState("");
  const [depositScreenshot, setDepositScreenshot] = useState<File | null>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const { data: wallet = {} } = useQuery({ queryKey: ["player-wallet"], queryFn: getPlayerWallet });
  const { data: paymentModes = [] } = useQuery({ queryKey: ["player-payment-modes"], queryFn: getPaymentModes });
  const { data: depositPaymentModes = [] } = useQuery({
    queryKey: ["player-deposit-payment-modes"],
    queryFn: getDepositPaymentModes,
    enabled: depositOpen,
  });
  const w = wallet as Record<string, unknown> & { recent_deposits?: unknown[]; recent_withdrawals?: unknown[]; main_balance?: string; bonus_balance?: string };
  const myDeposits = w.deposits ?? w.recent_deposits ?? [];
  const myWithdrawals = w.withdrawals ?? w.recent_withdrawals ?? [];
  const mainBalance = Number(w.main_balance ?? 0);
  const bonusBalance = Number(w.bonus_balance ?? 0);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-4xl mx-auto">
      {/* Balance Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="text-center gaming-card hover:neon-glow-sm transition-all">
            <CardContent className="p-4">
              <Wallet className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-[10px] text-muted-foreground">Main Balance</p>
              <p className="font-gaming font-bold text-lg md:text-2xl">₹{mainBalance.toLocaleString()}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="text-center gaming-card hover:neon-glow-sm transition-all">
            <CardContent className="p-4">
              <Sparkles className="h-5 w-5 mx-auto mb-1 text-accent" />
              <p className="text-[10px] text-muted-foreground">Bonus</p>
              <p className="font-gaming font-bold text-lg md:text-2xl text-accent">₹{bonusBalance.toLocaleString()}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="text-center gaming-card neon-glow-sm">
            <CardContent className="p-4">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-neon" />
              <p className="text-[10px] text-muted-foreground">Total</p>
              <p className="font-gaming font-bold text-lg md:text-2xl neon-text">₹{(mainBalance + bonusBalance).toLocaleString()}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button className="gold-gradient text-primary-foreground font-gaming h-12 text-sm tracking-wider neon-glow-sm" onClick={() => setDepositOpen(true)}>
          <ArrowDownCircle className="h-4 w-4 mr-2" /> DEPOSIT
        </Button>
        <Button
          className="bg-accent text-accent-foreground font-gaming h-12 text-sm tracking-wider"
          onClick={() => setWithdrawOpen(true)}
        >
          <ArrowUpCircle className="h-4 w-4 mr-2" /> WITHDRAW
        </Button>
      </div>

      {/* History Tabs */}
      <Tabs defaultValue="deposits">
        <TabsList className="w-full">
          <TabsTrigger value="deposits" className="flex-1 gap-1 font-display"><ArrowDownCircle className="h-3 w-3" /> Deposit History</TabsTrigger>
          <TabsTrigger value="withdrawals" className="flex-1 gap-1 font-display"><ArrowUpCircle className="h-3 w-3" /> Withdrawal History</TabsTrigger>
        </TabsList>

        <TabsContent value="deposits" className="space-y-2 mt-3">
          {myDeposits.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No deposits yet</p>}
          {/* Desktop table header */}
          <div className="hidden md:grid grid-cols-5 gap-2 text-xs text-muted-foreground px-4 py-2 font-semibold">
            <span>Amount</span><span>Method</span><span>Date</span><span>Processed By</span><span className="text-right">Status</span>
          </div>
          {myDeposits.map((d: Record<string, unknown>, i: number) => (
            <Card key={String(d.id ?? i)} className="hover:border-primary/20 transition-colors">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between md:hidden">
                  <div>
                    <p className="text-sm font-bold">₹{Number(d.amount ?? 0).toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">{String(d.payment_mode ?? "")} • {d.created_at ? new Date(String(d.created_at)).toLocaleDateString() : ""}</p>
                  </div>
                  <StatusBadge status={String(d.status ?? "pending")} />
                </div>
                <div className="hidden md:grid grid-cols-5 gap-2 items-center">
                  <span className="font-bold text-sm">₹{Number(d.amount ?? 0).toLocaleString()}</span>
                  <span className="text-sm">{String(d.payment_mode ?? "")}</span>
                  <span className="text-xs text-muted-foreground">{d.created_at ? new Date(String(d.created_at)).toLocaleDateString() : ""}</span>
                  <span className="text-xs text-muted-foreground">{String(d.processed_by ?? "-")}</span>
                  <span className="text-right"><StatusBadge status={String(d.status ?? "pending")} /></span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="withdrawals" className="space-y-2 mt-3">
          {myWithdrawals.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No withdrawals yet</p>}
          <div className="hidden md:grid grid-cols-5 gap-2 text-xs text-muted-foreground px-4 py-2 font-semibold">
            <span>Amount</span><span>Method</span><span>Date</span><span>Account</span><span className="text-right">Status</span>
          </div>
          {myWithdrawals.map((w: Record<string, unknown>, i: number) => (
            <Card key={String(w.id ?? i)} className="hover:border-primary/20 transition-colors">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between md:hidden">
                  <div>
                    <p className="text-sm font-bold">₹{Number(w.amount ?? 0).toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">{String(w.payment_mode ?? "")} • {w.created_at ? new Date(String(w.created_at)).toLocaleDateString() : ""}</p>
                  </div>
                  <StatusBadge status={String(w.status ?? "pending")} />
                </div>
                <div className="hidden md:grid grid-cols-5 gap-2 items-center">
                  <span className="font-bold text-sm">₹{Number(w.amount ?? 0).toLocaleString()}</span>
                  <span className="text-sm">{String(w.payment_mode ?? "")}</span>
                  <span className="text-xs text-muted-foreground">{w.created_at ? new Date(String(w.created_at)).toLocaleDateString() : ""}</span>
                  <span className="text-xs text-muted-foreground">{String(w.account_details ?? "-")}</span>
                  <span className="text-right"><StatusBadge status={String(w.status ?? "pending")} /></span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Deposit Modal */}
      <Dialog open={depositOpen} onOpenChange={(open) => { setDepositOpen(open); if (!open) setDepositScreenshot(null); }}>
        <DialogContent className="max-w-md gaming-card">
          <DialogHeader>
            <DialogTitle className="font-gaming text-lg neon-text tracking-wider">DEPOSIT FUNDS</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Step 1: Select payment method */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">1. Select Payment Method (Master)</p>
              <div className="space-y-2">
                {(depositPaymentModes as Record<string, unknown>[]).length === 0 && (
                  <p className="text-xs text-muted-foreground py-2">No payment methods available. Ask your master to add one.</p>
                )}
                {(depositPaymentModes as Record<string, unknown>[]).map((pm) => (
                  <div
                    key={String(pm.id ?? "")}
                    onClick={() => setSelectedPM(String(pm.id ?? ""))}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedPM === String(pm.id ?? "") ? "border-primary neon-glow-sm bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="h-9 w-9 rounded-lg gold-gradient flex items-center justify-center text-xs font-bold text-primary-foreground">{(String(pm.name ?? ""))[0]}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{String(pm.name ?? "")}</p>
                      <p className="text-[10px] text-muted-foreground">{pm.type === "ewallet" ? String(pm.wallet_phone ?? pm.account_id ?? "") : String(pm.bank_account_no ?? pm.account_number ?? "")}</p>
                    </div>
                    {selectedPM === String(pm.id ?? "") && <CheckCircle className="h-4 w-4 text-primary" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Show selected method details + instructions, then amount & screenshot */}
            {selectedPM && (() => {
              const selectedMode = (depositPaymentModes as Record<string, unknown>[]).find((pm) => String(pm.id) === selectedPM);
              const isEwallet = selectedMode?.type === "ewallet";
              return (
                <>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">2. Pay to this account</p>
                    <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 space-y-2">
                      <p className="text-sm font-semibold">{String(selectedMode?.name ?? "")}</p>
                      {isEwallet ? (
                        <p className="text-sm">Wallet / Phone: <span className="font-mono font-medium">{String(selectedMode?.wallet_phone ?? selectedMode?.account_id ?? "")}</span></p>
                      ) : (
                        <div className="text-sm space-y-1">
                          {selectedMode?.bank_name && <p>Bank: {String(selectedMode.bank_name)}</p>}
                          {selectedMode?.bank_branch && <p>Branch: {String(selectedMode.bank_branch)}</p>}
                          {selectedMode?.bank_account_no && <p>Account No: <span className="font-mono font-medium">{String(selectedMode.bank_account_no)}</span></p>}
                          {selectedMode?.bank_account_holder_name && <p>Account Holder: {String(selectedMode.bank_account_holder_name)}</p>}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Transfer the amount to the account above. Then enter the amount and upload your payment screenshot below.</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">3. Enter amount you paid</p>
                    <Input type="number" placeholder="Enter deposit amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 text-lg font-gaming" />
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {quickAmounts.map((a) => (
                        <Button key={a} variant="outline" size="sm" onClick={() => setAmount(String(a))} className={`text-xs font-gaming ${amount === String(a) ? "border-primary text-primary" : ""}`}>
                          ₹{a >= 1000 ? `${a / 1000}K` : a}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Input placeholder="Remarks (optional)" value={depositRemarks} onChange={(e) => setDepositRemarks(e.target.value)} className="text-sm" />

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">4. Upload payment screenshot</p>
                    <input
                      ref={screenshotInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setDepositScreenshot(e.target.files?.[0] ?? null)}
                    />
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => screenshotInputRef.current?.click()}
                      onKeyDown={(e) => e.key === "Enter" && screenshotInputRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {depositScreenshot ? depositScreenshot.name : "Click to upload payment screenshot"}
                      </p>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepositOpen(false)}>Cancel</Button>
            <Button
              className="gold-gradient text-primary-foreground font-gaming neon-glow-sm"
              onClick={async () => {
                const amt = Number(amount) || 0;
                if (amt <= 0) {
                  toast({ title: "Enter a valid amount.", variant: "destructive" });
                  return;
                }
                if (!selectedPM) {
                  toast({ title: "Select a payment method first.", variant: "destructive" });
                  return;
                }
                try {
                  if (depositScreenshot) {
                    const formData = new FormData();
                    formData.append("amount", String(amt));
                    formData.append("payment_mode", String(selectedPM));
                    formData.append("remarks", depositRemarks.trim() || "");
                    formData.append("screenshot", depositScreenshot);
                    await depositRequestWithScreenshot(formData);
                  } else {
                    await depositRequest({
                      amount: amt,
                      payment_mode: Number(selectedPM),
                      remarks: depositRemarks.trim() || "",
                    });
                  }
                  queryClient.invalidateQueries({ queryKey: ["player-wallet"] });
                  toast({ title: "Deposit request submitted." });
                  setDepositOpen(false);
                  setAmount("");
                  setSelectedPM(null);
                  setDepositRemarks("");
                  setDepositScreenshot(null);
                } catch (e: unknown) {
                  const msg = (e as { detail?: string })?.detail ?? "Failed to submit deposit.";
                  toast({ title: msg, variant: "destructive" });
                }
              }}
            >
              Submit Deposit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal — only reachable when KYC approved */}
      <Dialog open={withdrawOpen} onOpenChange={(open) => { setWithdrawOpen(open); if (!open) { setAmount(""); setWithdrawPassword(""); setSelectedPM(null); } }}>
        <DialogContent className="max-w-md gaming-card">
          <DialogHeader>
            <DialogTitle className="font-gaming text-lg neon-text tracking-wider">WITHDRAW FUNDS</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-2 block">Select Your Payment Mode</label>
              <div className="space-y-2">
                {(paymentModes as Record<string, unknown>[]).map((pm) => (
                  <div
                    key={String(pm.id ?? "")}
                    onClick={() => setSelectedPM(String(pm.id ?? ""))}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedPM === String(pm.id ?? "") ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"
                    }`}
                  >
                    <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">{(String(pm.name ?? ""))[0]}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{String(pm.name ?? "")}</p>
                      <p className="text-[10px] text-muted-foreground">{pm.type === "ewallet" ? String(pm.wallet_phone ?? pm.account_id ?? "") : String(pm.bank_account_no ?? pm.account_number ?? "")}</p>
                    </div>
                    {selectedPM === String(pm.id ?? "") && <CheckCircle className="h-4 w-4 text-accent" />}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-2 block">Amount</label>
              <Input type="number" placeholder="Enter withdrawal amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 text-lg font-gaming" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-2 block">Password (to confirm)</label>
              <Input type="password" placeholder="Enter password" value={withdrawPassword} onChange={(e) => setWithdrawPassword(e.target.value)} className="h-11" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawOpen(false)} disabled={withdrawSubmitting}>Cancel</Button>
            <Button
              className="bg-accent text-accent-foreground font-gaming"
              disabled={!selectedPM || !amount || withdrawPassword.length < 1 || withdrawSubmitting}
              onClick={async () => {
                const amt = Number(amount);
                if (!selectedPM || !amt || amt <= 0) return;
                setWithdrawSubmitting(true);
                try {
                  await withdrawRequest({ amount: amt, payment_mode: Number(selectedPM), password: withdrawPassword });
                  toast({ title: "Withdrawal request submitted." });
                  setWithdrawOpen(false);
                  setAmount("");
                  setWithdrawPassword("");
                  setSelectedPM(null);
                  queryClient.invalidateQueries({ queryKey: ["player-wallet"] });
                } catch (e: unknown) {
                  const err = e as { detail?: string; status?: number };
                  const msg = err?.detail ?? "Invalid password or request failed.";
                  toast({ title: msg, variant: "destructive" });
                } finally {
                  setWithdrawSubmitting(false);
                }
              }}
            >
              {withdrawSubmitting ? "Submitting…" : "Submit Withdrawal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlayerWallet;
