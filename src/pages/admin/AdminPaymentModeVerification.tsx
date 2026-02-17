import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  getPaymentModeVerificationList,
  approvePaymentModeVerification,
  rejectPaymentModeVerification,
} from "@/api/admin";
import { getMediaUrl } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Check, X, Eye } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

type PaymentModeRow = Record<string, unknown> & {
  id?: number;
  name?: string;
  type?: string;
  status?: string;
  user?: number;
  user_username?: string;
  qr_image_url?: string;
  reject_reason?: string;
  created_at?: string;
};

const AdminPaymentModeVerification = () => {
  const { user } = useAuth();
  const role = (user?.role === "powerhouse" || user?.role === "super" || user?.role === "master") ? user.role : "master";
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("pending");
  const { data: list = [] } = useQuery({
    queryKey: ["payment-mode-verification", role, statusFilter],
    queryFn: () => getPaymentModeVerificationList(role, statusFilter && statusFilter !== "all" ? { status: statusFilter } : undefined),
  });
  const rows = list as PaymentModeRow[];
  const [viewOpen, setViewOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selected, setSelected] = useState<PaymentModeRow | null>(null);

  const columns = [
    { header: "ID", accessor: (row: PaymentModeRow) => String(row.id ?? "") },
    { header: "Name", accessor: (row: PaymentModeRow) => String(row.name ?? "") },
    { header: "Type", accessor: (row: PaymentModeRow) => String(row.type ?? "") },
    { header: "Owner", accessor: (row: PaymentModeRow) => String((row as { user_username?: string }).user_username ?? row.user ?? "") },
    { header: "Status", accessor: (row: PaymentModeRow) => <StatusBadge status={String(row.status ?? "pending")} /> },
    { header: "Created", accessor: (row: PaymentModeRow) => row.created_at ? new Date(String(row.created_at)).toLocaleDateString() : "" },
    {
      header: "Actions",
      accessor: (row: PaymentModeRow) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" title="View" onClick={() => { setSelected(row); setViewOpen(true); }}>
            <Eye className="h-3 w-3" />
          </Button>
          {String(row.status) === "pending" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-success"
                title="Approve"
                onClick={async () => {
                  if (!row.id) return;
                  try {
                    await approvePaymentModeVerification(row.id, role);
                    queryClient.invalidateQueries({ queryKey: ["payment-mode-verification", role, statusFilter] });
                    toast({ title: "Payment method approved." });
                  } catch (e: unknown) {
                    const msg = (e as { detail?: string })?.detail ?? "Failed to approve.";
                    toast({ title: msg, variant: "destructive" });
                  }
                }}
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-accent"
                title="Reject"
                onClick={() => { setSelected(row); setRejectReason(""); setRejectOpen(true); }}
              >
                <X className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl">Payment Mode Verification</h2>
      <p className="text-sm text-muted-foreground">Approve or reject pending payment methods. Only approved methods can be used for deposits/withdrawals.</p>
      <div className="flex gap-2 items-center">
        <span className="text-sm text-muted-foreground">Status:</span>
        <select
          className="h-9 rounded-md border border-border bg-background px-3 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
      </div>
      <DataTable
        data={rows}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search payment methods..."
      />

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Payment Method Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground text-xs">Name</span><p className="font-medium">{String(selected.name ?? "")}</p></div>
                <div><span className="text-muted-foreground text-xs">Type</span><p className="font-medium">{String(selected.type ?? "")}</p></div>
                <div><span className="text-muted-foreground text-xs">Status</span><p><StatusBadge status={String(selected.status ?? "pending")} /></p></div>
                {selected.reject_reason && (
                  <div className="col-span-2"><span className="text-muted-foreground text-xs">Reject reason</span><p className="font-medium">{String(selected.reject_reason)}</p></div>
                )}
              </div>
              {selected.qr_image_url && (
                <div>
                  <span className="text-muted-foreground text-xs">QR Image</span>
                  <img src={getMediaUrl(String(selected.qr_image_url))} alt="QR" className="w-32 h-32 object-contain rounded-lg mt-1 border border-border" />
                </div>
              )}
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="font-display">Reject Payment Method</DialogTitle></DialogHeader>
          <Textarea placeholder="Rejection reason (optional)..." rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button
              className="bg-accent text-accent-foreground"
              onClick={async () => {
                if (!selected?.id) return;
                try {
                  await rejectPaymentModeVerification(selected.id, { reject_reason: rejectReason }, role);
                  queryClient.invalidateQueries({ queryKey: ["payment-mode-verification", role, statusFilter] });
                  setRejectOpen(false);
                  setRejectReason("");
                  toast({ title: "Payment method rejected." });
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
    </div>
  );
};

export default AdminPaymentModeVerification;
