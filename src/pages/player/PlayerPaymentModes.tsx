import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getPaymentModes, createPaymentMode, deletePaymentMode } from "@/api/player";
import { Plus, Trash2, CreditCard, Smartphone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const PlayerPaymentModes = () => {
  const queryClient = useQueryClient();
  const { data: paymentModes = [] } = useQuery({ queryKey: ["player-payment-modes"], queryFn: getPaymentModes });
  const modes = paymentModes as Record<string, unknown>[];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newMode, setNewMode] = useState({
    type: "ewallet" as "ewallet" | "bank",
    name: "",
    wallet_phone: "",
    bank_name: "",
    bank_branch: "",
    bank_account_no: "",
    bank_account_holder_name: "",
  });

  const buildBody = () => {
    const body: Record<string, unknown> = {
      name: newMode.name.trim(),
      type: newMode.type,
    };
    if (newMode.type === "ewallet") {
      body.wallet_phone = newMode.wallet_phone.trim();
      body.bank_name = "";
      body.bank_branch = "";
      body.bank_account_no = "";
      body.bank_account_holder_name = "";
    } else {
      body.wallet_phone = "";
      body.bank_name = newMode.bank_name.trim();
      body.bank_branch = newMode.bank_branch.trim();
      body.bank_account_no = newMode.bank_account_no.trim();
      body.bank_account_holder_name = newMode.bank_account_holder_name.trim();
    }
    return body;
  };

  const handleAdd = async () => {
    if (!newMode.name.trim()) {
      toast({ title: "Enter provider name", variant: "destructive" });
      return;
    }
    if (newMode.type === "ewallet" && !newMode.wallet_phone.trim()) {
      toast({ title: "Enter wallet / phone number", variant: "destructive" });
      return;
    }
    if (newMode.type === "bank" && !newMode.bank_account_no.trim()) {
      toast({ title: "Enter bank account number", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await createPaymentMode(buildBody());
      queryClient.invalidateQueries({ queryKey: ["player-payment-modes"] });
      toast({ title: "Payment method added." });
      setDialogOpen(false);
      setNewMode({ type: "ewallet", name: "", wallet_phone: "", bank_name: "", bank_branch: "", bank_account_no: "", bank_account_holder_name: "" });
    } catch (e: unknown) {
      const err = e as { detail?: string };
      toast({ title: err?.detail ?? "Failed to add.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setSubmitting(true);
    try {
      await deletePaymentMode(id);
      queryClient.invalidateQueries({ queryKey: ["player-payment-modes"] });
      setDeleteId(null);
      toast({ title: "Payment method removed." });
    } catch (e: unknown) {
      const err = e as { detail?: string };
      toast({ title: err?.detail ?? "Failed to delete.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="font-gaming font-bold text-xl neon-text tracking-wider">PAYMENT MODES</h2>
        <Button size="sm" className="gold-gradient text-primary-foreground gap-1 font-gaming tracking-wider" onClick={() => setDialogOpen(true)}>
          <Plus className="h-3 w-3" /> ADD
        </Button>
      </div>

      <div className="space-y-2">
        {modes.map((pm) => (
          <Card key={String(pm.id ?? "")} className="gaming-card hover:neon-glow-sm transition-all">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl gold-gradient flex items-center justify-center neon-glow-sm">
                  {pm.type === "ewallet" ? <Smartphone className="h-5 w-5 text-primary-foreground" /> : <CreditCard className="h-5 w-5 text-primary-foreground" />}
                </div>
                <div>
                  <p className="text-sm font-semibold">{String(pm.name ?? "")}</p>
                  <p className="text-xs text-muted-foreground">{pm.type === "ewallet" ? String(pm.wallet_phone ?? pm.account_id ?? "") : String(pm.bank_account_no ?? pm.account_number ?? "")}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" disabled={submitting} onClick={() => setDeleteId(Number(pm.id))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {modes.length === 0 && (
        <p className="text-center text-muted-foreground py-8 text-sm">No payment modes added yet</p>
      )}

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setNewMode({ type: "ewallet", name: "", wallet_phone: "", bank_name: "", bank_branch: "", bank_account_no: "", bank_account_holder_name: "" }); }}>
        <DialogContent className="max-w-sm gaming-card">
          <DialogHeader>
            <DialogTitle className="font-gaming neon-text tracking-wider">ADD PAYMENT MODE</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Provider Name</label>
              <Input placeholder="e.g. eSewa, Khalti, My Bank" value={newMode.name} onChange={(e) => setNewMode({ ...newMode, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Type</label>
              <select
                value={newMode.type}
                onChange={(e) => setNewMode({ ...newMode, type: e.target.value as "ewallet" | "bank" })}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm"
              >
                <option value="ewallet">E-Wallet</option>
                <option value="bank">Bank Account</option>
              </select>
            </div>
            {newMode.type === "ewallet" && (
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Wallet / Phone number</label>
                <Input placeholder="Your e-wallet ID or phone" value={newMode.wallet_phone} onChange={(e) => setNewMode({ ...newMode, wallet_phone: e.target.value })} />
              </div>
            )}
            {newMode.type === "bank" && (
              <>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Bank name</label>
                  <Input placeholder="Bank name" value={newMode.bank_name} onChange={(e) => setNewMode({ ...newMode, bank_name: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Branch</label>
                  <Input placeholder="Branch" value={newMode.bank_branch} onChange={(e) => setNewMode({ ...newMode, bank_branch: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Account number</label>
                  <Input placeholder="Account number" value={newMode.bank_account_no} onChange={(e) => setNewMode({ ...newMode, bank_account_no: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Account holder name</label>
                  <Input placeholder="Account holder name" value={newMode.bank_account_holder_name} onChange={(e) => setNewMode({ ...newMode, bank_account_holder_name: e.target.value })} />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button className="gold-gradient text-primary-foreground font-gaming" onClick={handleAdd} disabled={submitting}>{submitting ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteId != null} onOpenChange={() => { if (!submitting) setDeleteId(null); }}>
        <DialogContent className="max-w-sm gaming-card">
          <DialogHeader>
            <DialogTitle className="font-display">Delete Payment Mode?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={submitting}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId != null && handleDelete(deleteId)} disabled={submitting}>{submitting ? "Deleting…" : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlayerPaymentModes;
