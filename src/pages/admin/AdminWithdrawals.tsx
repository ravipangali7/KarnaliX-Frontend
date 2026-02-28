import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PinDialog } from "@/components/shared/PinDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getWithdrawals, approveWithdraw, rejectWithdraw, type ListParams } from "@/api/admin";
import { getMediaUrl } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Check, X, Eye, RefreshCw } from "lucide-react";

type PaymentModeDetail = Record<string, unknown> & { name?: string; type_display?: string; wallet_phone?: string; bank_name?: string; bank_branch?: string; bank_account_no?: string; bank_account_holder_name?: string; status_display?: string; qr_image_url?: string };
type WithdrawRow = Record<string, unknown> & { id?: number; user_username?: string; user_name?: string; user_phone?: string; user_email?: string; user_whatsapp_number?: string; amount?: string; payment_mode?: string; payment_mode_name?: string; payment_mode_qr_image?: string; payment_mode_detail?: PaymentModeDetail | null; status?: string; created_at?: string; account_details?: string; accountDetails?: string };

const AdminWithdrawals = () => {
  const { user } = useAuth();
  const role = (user?.role === "powerhouse" || user?.role === "super" || user?.role === "master") ? user.role : "master";
  const queryClient = useQueryClient();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const listParams: ListParams = {};
  if (dateFrom) listParams.date_from = dateFrom;
  if (dateTo) listParams.date_to = dateTo;
  if (statusFilter) listParams.status = statusFilter;
  const { data: withdrawals = [] } = useQuery({
    queryKey: ["admin-withdrawals", role, listParams],
    queryFn: () => getWithdrawals(role, listParams),
    refetchInterval: autoRefresh ? 10000 : false,
  });
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
      <div className="flex flex-wrap items-center gap-2">
        <Input type="date" className="w-40 h-9 text-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <Input type="date" className="w-40 h-9 text-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        <select className="h-9 rounded-md border border-border bg-background px-3 text-sm w-32" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
          <RefreshCw className="h-4 w-4" /> Auto refresh (10s)
        </label>
      </div>
      <DataTable data={rows} columns={columns} searchKey="user_username" searchPlaceholder="Search withdrawals..." />

      {/* View */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Withdrawal Details – Small Report</DialogTitle></DialogHeader>
          {selectedW && (
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-border p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground text-xs">Username</span><p className="font-medium">{String(selectedW.user_username ?? selectedW.username ?? "")}</p></div>
                  <div><span className="text-muted-foreground text-xs">Name</span><p className="font-medium">{String(selectedW.user_name ?? "")}</p></div>
                  {(selectedW.user_phone != null && String(selectedW.user_phone) !== "") && <div className="col-span-2"><span className="text-muted-foreground text-xs">Phone</span><p className="font-medium">{String(selectedW.user_phone)}</p></div>}
                  {(selectedW.user_email != null && String(selectedW.user_email) !== "") && <div><span className="text-muted-foreground text-xs">Email</span><p className="font-medium">{String(selectedW.user_email)}</p></div>}
                  {(selectedW.user_whatsapp_number != null && String(selectedW.user_whatsapp_number) !== "") && <div><span className="text-muted-foreground text-xs">WhatsApp</span><p className="font-medium">{String(selectedW.user_whatsapp_number)}</p></div>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground text-xs">ID</span><p className="font-medium">{String(selectedW.id ?? "")}</p></div>
                <div><span className="text-muted-foreground text-xs">Amount</span><p className="font-bold text-accent">₹{Number(selectedW.amount ?? 0).toLocaleString()}</p></div>
                <div><span className="text-muted-foreground text-xs">Method</span><p className="font-medium">{String(selectedW.payment_mode_name ?? selectedW.payment_mode ?? "")}</p></div>
                <div><span className="text-muted-foreground text-xs">Account</span><p className="font-medium">{String(selectedW.account_details ?? selectedW.accountDetails ?? "")}</p></div>
                <div><span className="text-muted-foreground text-xs">Status</span><p><StatusBadge status={String(selectedW.status ?? "pending")} /></p></div>
                <div><span className="text-muted-foreground text-xs">Date</span><p className="font-medium">{selectedW.created_at ? new Date(String(selectedW.created_at)).toLocaleString() : ""}</p></div>
              </div>
              {selectedW.payment_mode_qr_image && (
                <div>
                  <span className="text-muted-foreground text-xs">Payment QR</span>
                  <img src={getMediaUrl(String(selectedW.payment_mode_qr_image))} alt="Payment QR" className="w-32 h-32 object-contain rounded-lg mt-1 border border-border" />
                </div>
              )}
              {selectedW.payment_mode_detail && (
                <div className="border-t pt-3 mt-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Payment mode details</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground text-xs">Name</span><p className="font-medium">{String(selectedW.payment_mode_detail.name ?? "")}</p></div>
                    <div><span className="text-muted-foreground text-xs">Type</span><p className="font-medium">{String(selectedW.payment_mode_detail.type_display ?? selectedW.payment_mode_detail.type ?? "")}</p></div>
                    {selectedW.payment_mode_detail.wallet_phone && <div className="col-span-2"><span className="text-muted-foreground text-xs">Wallet / Phone</span><p className="font-mono font-medium">{String(selectedW.payment_mode_detail.wallet_phone)}</p></div>}
                    {selectedW.payment_mode_detail.bank_name && <div><span className="text-muted-foreground text-xs">Bank</span><p className="font-medium">{String(selectedW.payment_mode_detail.bank_name)}</p></div>}
                    {selectedW.payment_mode_detail.bank_branch && <div><span className="text-muted-foreground text-xs">Branch</span><p className="font-medium">{String(selectedW.payment_mode_detail.bank_branch)}</p></div>}
                    {selectedW.payment_mode_detail.bank_account_no && <div><span className="text-muted-foreground text-xs">Account no</span><p className="font-mono font-medium">{String(selectedW.payment_mode_detail.bank_account_no)}</p></div>}
                    {selectedW.payment_mode_detail.bank_account_holder_name && <div><span className="text-muted-foreground text-xs">Account holder</span><p className="font-medium">{String(selectedW.payment_mode_detail.bank_account_holder_name)}</p></div>}
                    <div><span className="text-muted-foreground text-xs">Status</span><p className="font-medium">{String(selectedW.payment_mode_detail.status_display ?? selectedW.payment_mode_detail.status ?? "")}</p></div>
                  </div>
                  {selectedW.payment_mode_detail.qr_image_url && (
                    <div>
                      <span className="text-muted-foreground text-xs">QR</span>
                      <img src={getMediaUrl(String(selectedW.payment_mode_detail.qr_image_url))} alt="Payment QR" className="w-32 h-32 object-contain rounded-lg mt-1 border border-border" />
                    </div>
                  )}
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
