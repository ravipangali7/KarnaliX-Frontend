import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getMasters, getPlayers, createPlayer, updatePlayer, getMasterPaymentModes, getPaymentModesForDepositTarget, directDeposit, directWithdraw, resetPassword, type ListParams } from "@/api/admin";
import { toast } from "@/hooks/use-toast";
import { ArrowDownCircle, ArrowUpCircle, Key, Eye, Edit, RefreshCw } from "lucide-react";
import { PinDialog } from "@/components/shared/PinDialog";

type PlayerRow = Record<string, unknown> & { id?: number; username?: string; name?: string; main_balance?: string; bonus_balance?: string; exposure_balance?: string; exposure_limit?: string; is_active?: boolean; status?: string; created_at?: string; phone?: string; total_balance?: string | number; total_win_loss?: string | number };

type PendingAction = "deposit" | "withdraw" | "resetPassword" | null;

const AdminPlayers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = (user?.role === "powerhouse" || user?.role === "super" || user?.role === "master") ? user.role : "master";
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createUsername, setCreateUsername] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createWhatsApp, setCreateWhatsApp] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createParentId, setCreateParentId] = useState<number | "">("");
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [resetPwOpen, setResetPwOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PlayerRow | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [pendingPayload, setPendingPayload] = useState<Record<string, unknown>>({});
  const [depositAmount, setDepositAmount] = useState("");
  const [depositRemarks, setDepositRemarks] = useState("");
  const [depositPaymentModeId, setDepositPaymentModeId] = useState<number | "">("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawRemarks, setWithdrawRemarks] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const listParams: ListParams = {};
  if (dateFrom) listParams.date_from = dateFrom;
  if (dateTo) listParams.date_to = dateTo;
  const { data: players = [] } = useQuery({
    queryKey: ["admin-players", role, listParams],
    queryFn: () => getPlayers(role, listParams),
    refetchInterval: autoRefresh ? 10000 : false,
  });
  const { data: mastersList = [] } = useQuery({ queryKey: ["admin-masters", role], queryFn: () => getMasters(role), enabled: (role === "powerhouse" || role === "super") && createOpen });
  const { data: depositPaymentModesList = [] } = useQuery({
    queryKey: ["deposit-payment-modes", role, selectedUser?.id],
    queryFn: () => (role === "master" ? getMasterPaymentModes() : getPaymentModesForDepositTarget(role, selectedUser!.id as number)),
    enabled: depositOpen && !!selectedUser?.id,
  });
  const rows = players as PlayerRow[];

  const columns = [
    { header: "Username", accessor: (row: PlayerRow) => String(row.username ?? "") },
    { header: "Balance", accessor: (row: PlayerRow) => `₹${Number(row.main_balance ?? 0).toLocaleString()}` },
    { header: "Bonus", accessor: (row: PlayerRow) => `₹${Number(row.bonus_balance ?? 0).toLocaleString()}` },
    { header: "Exposure", accessor: (row: PlayerRow) => `₹${Number(row.exposure_balance ?? 0).toLocaleString()}` },
    { header: "Total Balance", accessor: (row: PlayerRow) => `₹${Number(row.total_balance ?? 0).toLocaleString()}` },
    { header: "Win/Loss", accessor: (row: PlayerRow) => `₹${Number(row.total_win_loss ?? 0).toLocaleString()}` },
    { header: "Exp Limit", accessor: (row: PlayerRow) => `₹${Number(row.exposure_limit ?? 0).toLocaleString()}` },
    { header: "Status", accessor: (row: PlayerRow) => <StatusBadge status={row.is_active === false ? "inactive" : "active"} /> },
    { header: "Joined", accessor: (row: PlayerRow) => row.created_at ? new Date(String(row.created_at)).toLocaleDateString() : "" },
    {
      header: "Actions",
      accessor: (row: PlayerRow) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-success" title="Deposit" onClick={() => { setSelectedUser(row); setDepositOpen(true); }}><ArrowDownCircle className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-accent" title="Withdraw" onClick={() => { setSelectedUser(row); setWithdrawOpen(true); }}><ArrowUpCircle className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Reset Password" onClick={() => { setSelectedUser(row); setResetPwOpen(true); }}><Key className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" title="View Report" onClick={() => navigate(`/${role}/players/${row.id}/report`)}><Eye className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit" onClick={() => { setSelectedUser(row); setEditName(String(row.name ?? "")); setEditPhone(String(row.phone ?? "")); setEditOpen(true); }}><Edit className="h-3 w-3" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl">Player Users</h2>
      <div className="flex flex-wrap items-center gap-2">
        <Input type="date" className="w-40 h-9 text-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <Input type="date" className="w-40 h-9 text-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
          <RefreshCw className="h-4 w-4" /> Auto refresh (10s)
        </label>
      </div>
      <DataTable data={rows} columns={columns} searchKey="username" searchPlaceholder="Search players..." onAdd={() => setCreateOpen(true)} addLabel="Add Player" />

      {/* Create Player */}
      <Dialog open={createOpen} onOpenChange={(open) => {
        setCreateOpen(open);
        if (!open) {
          setCreateName(""); setCreateUsername(""); setCreatePhone(""); setCreateEmail(""); setCreateWhatsApp(""); setCreatePassword(""); setCreateParentId("");
        }
      }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Create Player</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {(role === "powerhouse" || role === "super") && (
              <div>
                <label className="text-xs text-muted-foreground">Master</label>
                <select
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm mt-1"
                  value={createParentId}
                  onChange={(e) => setCreateParentId(e.target.value === "" ? "" : Number(e.target.value))}
                >
                  <option value="">Select master</option>
                  {(mastersList as { id?: number; username?: string }[]).map((m) => (
                    <option key={m.id} value={m.id}>{m.username ?? m.id}</option>
                  ))}
                </select>
              </div>
            )}
            <Input placeholder="Full Name" value={createName} onChange={(e) => setCreateName(e.target.value)} />
            <Input placeholder="Username" value={createUsername} onChange={(e) => setCreateUsername(e.target.value)} />
            <Input placeholder="Phone" value={createPhone} onChange={(e) => setCreatePhone(e.target.value)} />
            <Input placeholder="Email (optional)" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} />
            <Input placeholder="WhatsApp Number" value={createWhatsApp} onChange={(e) => setCreateWhatsApp(e.target.value)} />
            <Input type="password" placeholder="Password" value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              className="gold-gradient text-primary-foreground"
              onClick={async () => {
                try {
                  const body: Record<string, unknown> = {
                    name: createName.trim(),
                    username: createUsername.trim(),
                    phone: createPhone.trim(),
                    password: createPassword,
                  };
                  if (createEmail.trim()) body.email = createEmail.trim();
                  if (createWhatsApp.trim()) body.whatsapp_number = createWhatsApp.trim();
                  if (role === "powerhouse" || role === "super") {
                    if (createParentId === "" || createParentId === undefined) {
                      toast({ title: "Please select a Master.", variant: "destructive" });
                      return;
                    }
                    body.parent = createParentId;
                  }
                  await createPlayer(body, role);
                  queryClient.invalidateQueries({ queryKey: ["admin-players", role] });
                  toast({ title: "Player created successfully." });
                  setCreateOpen(false);
                  setCreateName(""); setCreateUsername(""); setCreatePhone(""); setCreateEmail(""); setCreateWhatsApp(""); setCreatePassword(""); setCreateParentId("");
                } catch (e: unknown) {
                  const msg = (e as { detail?: string })?.detail ?? "Something went wrong.";
                  toast({ title: msg, variant: "destructive" });
                }
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Player */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Player Details</DialogTitle></DialogHeader>
          {selectedUser && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground text-xs">Username</span><p className="font-medium">{String(selectedUser.username ?? "")}</p></div>
                <div><span className="text-muted-foreground text-xs">Full Name</span><p className="font-medium">{String(selectedUser.name ?? "")}</p></div>
                <div><span className="text-muted-foreground text-xs">Phone</span><p className="font-medium">{String(selectedUser.phone ?? "")}</p></div>
                <div><span className="text-muted-foreground text-xs">Status</span><p><StatusBadge status={selectedUser.is_active === false ? "inactive" : "active"} /></p></div>
                <div><span className="text-muted-foreground text-xs">Balance</span><p className="font-medium">₹{Number(selectedUser.main_balance ?? 0).toLocaleString()}</p></div>
                <div><span className="text-muted-foreground text-xs">Bonus</span><p className="font-medium">₹{Number(selectedUser.bonus_balance ?? 0).toLocaleString()}</p></div>
                <div><span className="text-muted-foreground text-xs">Exposure</span><p className="font-medium">₹{Number(selectedUser.exposure_balance ?? 0).toLocaleString()}</p></div>
                <div><span className="text-muted-foreground text-xs">Joined</span><p className="font-medium">{selectedUser.created_at ? new Date(String(selectedUser.created_at)).toLocaleDateString() : ""}</p></div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Player */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditSaving(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Edit Player</DialogTitle></DialogHeader>
          {selectedUser && (
            <div className="space-y-3">
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full Name" />
              <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone" />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={editSaving}>Cancel</Button>
            <Button
              className="gold-gradient text-primary-foreground"
              disabled={editSaving}
              onClick={async () => {
                if (!selectedUser?.id) return;
                setEditSaving(true);
                try {
                  await updatePlayer(selectedUser.id as number, { name: editName.trim(), phone: editPhone.trim() }, role);
                  queryClient.invalidateQueries({ queryKey: ["admin-players", role] });
                  toast({ title: "Player updated successfully." });
                  setEditOpen(false);
                } catch (e) {
                  const msg = (e as { detail?: string })?.detail ?? "Failed to update";
                  toast({ title: msg, variant: "destructive" });
                } finally {
                  setEditSaving(false);
                }
              }}
            >
              {editSaving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deposit Dialog */}
      <Dialog open={depositOpen} onOpenChange={(open) => { setDepositOpen(open); if (!open) setDepositPaymentModeId(""); }}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="font-display">Deposit to {selectedUser?.username}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Payment method (optional)</label>
              <select
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm mt-1"
                value={depositPaymentModeId}
                onChange={(e) => setDepositPaymentModeId(e.target.value === "" ? "" : Number(e.target.value))}
              >
                <option value="">— Select —</option>
                {(depositPaymentModesList as { id?: number; name?: string }[]).map((pm) => (
                  <option key={pm.id} value={pm.id}>{pm.name ?? pm.id}</option>
                ))}
              </select>
            </div>
            <Input type="number" placeholder="Amount" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
            <Textarea placeholder="Remarks (optional)" rows={2} value={depositRemarks} onChange={(e) => setDepositRemarks(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepositOpen(false)}>Cancel</Button>
            <Button
              className="gold-gradient text-primary-foreground"
              onClick={() => {
                setPendingAction("deposit");
                setPendingPayload({ userId: selectedUser?.id, amount: depositAmount, remarks: depositRemarks, paymentModeId: depositPaymentModeId });
                setDepositOpen(false);
                setPinOpen(true);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="font-display">Withdraw from {selectedUser?.username}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input type="number" placeholder="Amount" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
            <Textarea placeholder="Remarks (optional)" rows={2} value={withdrawRemarks} onChange={(e) => setWithdrawRemarks(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawOpen(false)}>Cancel</Button>
            <Button
              className="gold-gradient text-primary-foreground"
              onClick={() => {
                setPendingAction("withdraw");
                setPendingPayload({ userId: selectedUser?.id, amount: withdrawAmount, remarks: withdrawRemarks });
                setWithdrawOpen(false);
                setPinOpen(true);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password */}
      <Dialog open={resetPwOpen} onOpenChange={setResetPwOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="font-display">Reset Password — {selectedUser?.username}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <Input type="password" placeholder="Confirm New Password" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPwOpen(false)}>Cancel</Button>
            <Button
              className="gold-gradient text-primary-foreground"
              onClick={() => {
                if (newPassword !== newPasswordConfirm) {
                  toast({ title: "Passwords do not match", variant: "destructive" });
                  return;
                }
                if (newPassword.length < 6) {
                  toast({ title: "Password must be at least 6 characters", variant: "destructive" });
                  return;
                }
                setPendingAction("resetPassword");
                setPendingPayload({ userId: selectedUser?.id, new_password: newPassword });
                setResetPwOpen(false);
                setPinOpen(true);
              }}
            >
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PinDialog
        open={pinOpen}
        onClose={() => {
          setPinOpen(false);
          setPendingAction(null);
          setPendingPayload({});
        }}
        onConfirm={async (pin) => {
          try {
            if (pendingAction === "deposit") {
              const userId = pendingPayload.userId as number;
              const amount = pendingPayload.amount as string;
              const remarks = (pendingPayload.remarks as string) ?? "";
              const paymentModeId = pendingPayload.paymentModeId as number | "" | undefined;
              const body: { user_id: number; amount: number; remarks?: string; pin: string; payment_mode?: number } = {
                user_id: userId,
                amount: Number(amount) || 0,
                remarks,
                pin,
              };
              if (paymentModeId !== "" && paymentModeId != null) body.payment_mode = Number(paymentModeId);
              await directDeposit(body, role);
              queryClient.invalidateQueries({ queryKey: ["admin-players", role] });
              queryClient.invalidateQueries({ queryKey: ["admin-deposits", role] });
              toast({ title: "Deposit created and approved." });
            } else if (pendingAction === "withdraw") {
              const userId = pendingPayload.userId as number;
              const amount = pendingPayload.amount as string;
              const remarks = (pendingPayload.remarks as string) ?? "";
              await directWithdraw(
                { user_id: userId, amount: Number(amount) || 0, remarks, pin },
                role
              );
              queryClient.invalidateQueries({ queryKey: ["admin-players", role] });
              queryClient.invalidateQueries({ queryKey: ["admin-withdrawals", role] });
              toast({ title: "Withdrawal created and approved." });
            } else if (pendingAction === "resetPassword") {
              const userId = pendingPayload.userId as number;
              const new_password = pendingPayload.new_password as string;
              await resetPassword(userId, { pin, new_password }, role, "players");
              queryClient.invalidateQueries({ queryKey: ["admin-players", role] });
              toast({ title: "Password reset successfully." });
            }
            setPinOpen(false);
            setPendingAction(null);
            setPendingPayload({});
          } catch (e: unknown) {
            const msg = (e as { detail?: string })?.detail ?? "Something went wrong.";
            toast({ title: msg, variant: "destructive" });
          }
        }}
        title="Enter PIN to confirm"
      />
    </div>
  );
};

export default AdminPlayers;
