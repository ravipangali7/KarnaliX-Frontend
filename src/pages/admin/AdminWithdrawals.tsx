import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PinDialog } from "@/components/shared/PinDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getWithdrawals, approveWithdraw, rejectWithdraw } from "@/api/admin";
import { toast } from "@/hooks/use-toast";
import { Check, X, Eye } from "lucide-react";

type WithdrawRow = Record<string, unknown> & { id?: number; user_username?: string; amount?: string; payment_mode?: string; status?: string; created_at?: string };

const AdminWithdrawals = () => {
  const { user } = useAuth();
  const role = (user?.role === "powerhouse" || user?.role === "super" || user?.role === "master") ? user.role : "master";
  const queryClient = useQueryClient();
  const { data: withdrawals = [] } = useQuery({ queryKey: ["admin-withdrawals", role], queryFn: () => getWithdrawals(role) });
  const [pinOpen, setPinOpen] = useState(false);
  const [approving, setApproving] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedW, setSelectedW] = useState<WithdrawRow | null>(null);
  const rows = withdrawals as WithdrawRow[];

  const columns = [
    { header: "ID", accessor: (row: WithdrawRow) => String(row.id ?? "") },
    { header: "User", accessor: (row: WithdrawRow) => String(row.user_username ?? row.username ?? "") },
    { header: "Amount", accessor: (row: WithdrawRow) => `₹${Number(row.amount ?? 0).toLocaleString()}` },
    { header: "Method", accessor: (row: WithdrawRow) => String(row.payment_mode ?? "") },
    { header: "Status", accessor: (row: WithdrawRow) => <StatusBadge status={String(row.status ?? "pending")} /> },
    { header: "Date", accessor: (row: WithdrawRow) => row.created_at ? new Date(String(row.created_at)).toLocaleDateString() : "" },
    {
      header: "Actions",
      accessor: (row: WithdrawRow) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedW(row); setViewOpen(true); }}><Eye className="h-3 w-3" /></Button>
          {String(row.status) === "pending" && (
            <>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-success" onClick={() => { setSelectedW(row); setPinOpen(true); }}><Check className="h-3 w-3" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-accent" onClick={() => { setSelectedW(row); setRejectOpen(true); }}><X className="h-3 w-3" /></Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl">Withdrawals</h2>
      <DataTable data={rows} columns={columns} searchKey="user_username" searchPlaceholder="Search withdrawals..." />

      {/* View */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Withdrawal Details</DialogTitle></DialogHeader>
          {selectedW && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground text-xs">ID</span><p className="font-medium">{String(selectedW.id ?? "")}</p></div>
              <div><span className="text-muted-foreground text-xs">User</span><p className="font-medium">{String(selectedW.user_username ?? selectedW.username ?? "")}</p></div>
              <div><span className="text-muted-foreground text-xs">Amount</span><p className="font-bold text-accent">₹{Number(selectedW.amount ?? 0).toLocaleString()}</p></div>
              <div><span className="text-muted-foreground text-xs">Method</span><p className="font-medium">{String(selectedW.payment_mode ?? "")}</p></div>
              <div><span className="text-muted-foreground text-xs">Account</span><p className="font-medium">{String(selectedW.account_details ?? selectedW.accountDetails ?? "")}</p></div>
              <div><span className="text-muted-foreground text-xs">Status</span><p><StatusBadge status={String(selectedW.status ?? "pending")} /></p></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="font-display">Reject Withdrawal</DialogTitle></DialogHeader>
          <Textarea placeholder="Rejection reason..." rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button
              className="bg-accent text-accent-foreground"
              onClick={async () => {
                if (!selectedW?.id) return;
                try {
                  await rejectWithdraw(selectedW.id, { reject_reason: rejectReason }, role);
                  queryClient.invalidateQueries({ queryKey: ["admin-withdrawals", role] });
                  setRejectOpen(false);
                  setRejectReason("");
                  toast({ title: "Withdrawal rejected." });
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
        onClose={() => { if (!approving) setPinOpen(false); }}
        onConfirm={async (pin) => {
          if (!selectedW?.id) return;
          setApproving(true);
          try {
            await approveWithdraw(selectedW.id, { pin }, role);
            queryClient.invalidateQueries({ queryKey: ["admin-withdrawals", role] });
            setPinOpen(false);
            toast({ title: "Withdrawal approved." });
          } catch (e: unknown) {
            const err = e as { detail?: string };
            const msg = err?.detail ?? "Invalid PIN or request failed.";
            toast({ title: msg, variant: "destructive" });
          } finally {
            setApproving(false);
          }
        }}
        title="Enter PIN to confirm"
        loading={approving}
      />
    </div>
  );
};

export default AdminWithdrawals;
