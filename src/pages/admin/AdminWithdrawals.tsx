import { useState, type ReactNode, type MouseEvent } from "react";
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
import { ListDateRangeToolbar } from "@/components/shared/ListDateRangeToolbar";
import { Check, X, Eye, RefreshCw } from "lucide-react";

type PaymentModeDetail = Record<string, unknown> & { payment_method_name?: string; details?: Record<string, unknown>; status_display?: string; qr_image_url?: string };
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
  const { data: withdrawals = [], isLoading, refetch } = useQuery({
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
  const [cellView, setCellView] = useState<{ label: string; value: ReactNode } | null>(null);
  const rows = withdrawals as WithdrawRow[];

  const openCell = (label: string, value: ReactNode) => (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setCellView({ label, value });
  };

  const columns = [
    { header: "username", sortKey: "user_username", accessor: (row: WithdrawRow) => <span className="cursor-pointer hover:underline text-primary" onClick={openCell("Username", String(row.user_username ?? row.username ?? ""))}>{String(row.user_username ?? row.username ?? "")}</span> },
    { header: "payment details", sortKey: "payment_mode_name", accessor: (row: WithdrawRow) => <span className="cursor-pointer hover:underline text-primary" onClick={openCell("Payment details", String(row.account_details ?? row.accountDetails ?? row.payment_mode_name ?? row.payment_mode ?? "—"))}>{String(row.account_details ?? row.accountDetails ?? row.payment_mode_name ?? row.payment_mode ?? "—")}</span> },
    { header: "Status", sortKey: "status", accessor: (row: WithdrawRow) => <span className="cursor-pointer" onClick={openCell("Status", <StatusBadge status={String(row.status ?? "pending")} />)}><StatusBadge status={String(row.status ?? "pending")} /></span> },
    { header: "Amount", sortKey: "amount", accessor: (row: WithdrawRow) => <span className="cursor-pointer hover:underline text-primary" onClick={openCell("Amount", `₹${Number(row.amount ?? 0).toLocaleString()}`)}>₹{Number(row.amount ?? 0).toLocaleString()}</span> },
    { header: "Date", sortKey: "created_at", accessor: (row: WithdrawRow) => <span className="cursor-pointer hover:underline text-primary" onClick={openCell("Date", row.created_at ? new Date(String(row.created_at)).toLocaleString() : "—")}>{row.created_at ? new Date(String(row.created_at)).toLocaleDateString() : ""}</span> },
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
      <ListDateRangeToolbar
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateChange={({ dateFrom: f, dateTo: t }) => { setDateFrom(f); setDateTo(t); }}
        onLoad={() => refetch()}
        loading={isLoading}
      />
      <div className="flex flex-wrap items-center gap-2">
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
      <DataTable data={rows} columns={columns} searchKey="user_username" searchPlaceholder="Search withdrawals..." variant="adminListing" />

      {/* View-only cell modal */}
      <Dialog open={!!cellView} onOpenChange={(open) => { if (!open) setCellView(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display text-base">View — {cellView?.label}</DialogTitle></DialogHeader>
          {cellView && <div className="py-2 text-sm">{cellView.value}</div>}
          <DialogFooter><Button variant="outline" onClick={() => setCellView(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

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
                    <div><span className="text-muted-foreground text-xs">Name</span><p className="font-medium">{String(selectedW.payment_mode_detail.payment_method_name ?? "")}</p></div>
                    <div><span className="text-muted-foreground text-xs">Status</span><p className="font-medium">{String(selectedW.payment_mode_detail.status_display ?? selectedW.payment_mode_detail.status ?? "")}</p></div>
                    {selectedW.payment_mode_detail.details != null && typeof selectedW.payment_mode_detail.details === "object" && Object.keys(selectedW.payment_mode_detail.details).length > 0 && (
                      Object.entries(selectedW.payment_mode_detail.details as Record<string, unknown>).map(([k, v]) => (
                        <div key={k} className={k.length > 12 ? "col-span-2" : ""}><span className="text-muted-foreground text-xs capitalize">{k.replace(/_/g, " ")}</span><p className="font-medium">{String(v ?? "")}</p></div>
                      ))
                    )}
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
