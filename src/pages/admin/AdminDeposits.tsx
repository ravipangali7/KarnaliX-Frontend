import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PinDialog } from "@/components/shared/PinDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getDeposits, approveDeposit, rejectDeposit } from "@/api/admin";
import { toast } from "@/hooks/use-toast";
import { Check, X, Eye } from "lucide-react";

type DepositRow = Record<string, unknown> & { id?: number; user_username?: string; amount?: string; payment_mode?: string; status?: string; created_at?: string; screenshot?: string };

const AdminDeposits = () => {
  const { user } = useAuth();
  const role = (user?.role === "powerhouse" || user?.role === "super" || user?.role === "master") ? user.role : "master";
  const queryClient = useQueryClient();
  const { data: deposits = [] } = useQuery({ queryKey: ["admin-deposits", role], queryFn: () => getDeposits(role) });
  const [pinOpen, setPinOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRow | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const rows = deposits as DepositRow[];

  const columns = [
    { header: "ID", accessor: (row: DepositRow) => String(row.id ?? "") },
    { header: "User", accessor: (row: DepositRow) => String(row.user_username ?? row.username ?? "") },
    { header: "Amount", accessor: (row: DepositRow) => `₹${Number(row.amount ?? 0).toLocaleString()}` },
    { header: "Method", accessor: (row: DepositRow) => String(row.payment_mode ?? "") },
    { header: "Status", accessor: (row: DepositRow) => <StatusBadge status={String(row.status ?? "pending")} /> },
    { header: "Date", accessor: (row: DepositRow) => row.created_at ? new Date(String(row.created_at)).toLocaleDateString() : "" },
    {
      header: "Actions",
      accessor: (row: DepositRow) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedDeposit(row); setViewOpen(true); }}><Eye className="h-3 w-3" /></Button>
          {String(row.status) === "pending" && (
            <>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-success" onClick={() => { setSelectedDeposit(row); setPinOpen(true); }}><Check className="h-3 w-3" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-accent" onClick={() => { setSelectedDeposit(row); setRejectOpen(true); }}><X className="h-3 w-3" /></Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl">Deposits</h2>
      <DataTable data={rows} columns={columns} searchKey="user_username" searchPlaceholder="Search deposits..." />

      {/* View Deposit */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Deposit Details</DialogTitle></DialogHeader>
          {selectedDeposit && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground text-xs">ID</span><p className="font-medium">{String(selectedDeposit.id ?? "")}</p></div>
                <div><span className="text-muted-foreground text-xs">User</span><p className="font-medium">{String(selectedDeposit.user_username ?? selectedDeposit.username ?? "")}</p></div>
                <div><span className="text-muted-foreground text-xs">Amount</span><p className="font-bold text-success">₹{Number(selectedDeposit.amount ?? 0).toLocaleString()}</p></div>
                <div><span className="text-muted-foreground text-xs">Method</span><p className="font-medium">{String(selectedDeposit.payment_mode ?? "")}</p></div>
                <div><span className="text-muted-foreground text-xs">Status</span><p><StatusBadge status={String(selectedDeposit.status ?? "pending")} /></p></div>
                <div><span className="text-muted-foreground text-xs">Date</span><p className="font-medium">{selectedDeposit.created_at ? new Date(String(selectedDeposit.created_at)).toLocaleString() : ""}</p></div>
              </div>
              {selectedDeposit.screenshot && (
                <div>
                  <span className="text-muted-foreground text-xs">Screenshot</span>
                  <img src={String(selectedDeposit.screenshot)} alt="Screenshot" className="w-full h-40 object-cover rounded-lg mt-1 border border-border" />
                </div>
              )}
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="font-display">Reject Deposit</DialogTitle></DialogHeader>
          <Textarea placeholder="Rejection reason..." rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button
              className="bg-accent text-accent-foreground"
              onClick={async () => {
                if (!selectedDeposit?.id) return;
                try {
                  await rejectDeposit(selectedDeposit.id, { reject_reason: rejectReason }, role);
                  queryClient.invalidateQueries({ queryKey: ["admin-deposits", role] });
                  setRejectOpen(false);
                  setRejectReason("");
                  toast({ title: "Deposit rejected." });
                } catch (e: unknown) {
                  const msg = (e as { detail?: string })?.detail ?? "Something went wrong.";
                  toast({ title: msg, variant: "destructive" });
                }
              }}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PinDialog
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        onConfirm={async (pin) => {
          if (!selectedDeposit?.id) return;
          try {
            await approveDeposit(selectedDeposit.id, { pin }, role);
            queryClient.invalidateQueries({ queryKey: ["admin-deposits", role] });
            setPinOpen(false);
            toast({ title: "Deposit approved." });
          } catch (e: unknown) {
            const msg = (e as { detail?: string })?.detail ?? "Invalid PIN or request failed.";
            toast({ title: msg, variant: "destructive" });
          }
        }}
        title="Enter PIN to confirm"
      />
    </div>
  );
};

export default AdminDeposits;
