import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getSupers,
  getMasters,
  createMaster,
  updateMaster,
  getPaymentModesForDepositTarget,
  directDeposit,
  directWithdraw,
  regeneratePin,
  resetPassword,
  settleMaster,
} from "@/api/admin";
import { toast } from "@/hooks/use-toast";
import { ArrowDownCircle, ArrowUpCircle, Key, Eye, Edit, RefreshCw, ArrowRightLeft } from "lucide-react";
import { PinDialog } from "@/components/shared/PinDialog";

type MasterRow = Record<string, unknown> & { id?: number; username?: string; name?: string; main_balance?: string; pl_balance?: string; players_count?: number; users_balance?: string; status?: string; created_at?: string; pin?: string };

type PendingAction = "deposit" | "withdraw" | "resetPassword" | "regeneratePin" | "settlement" | null;

const AdminMasters = () => {
  const { user } = useAuth();
  const role = user?.role === "powerhouse" || user?.role === "super" ? user.role : "super";
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MasterRow | null>(null);
  const [createName, setCreateName] = useState("");
  const [createUsername, setCreateUsername] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createWhatsApp, setCreateWhatsApp] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createCommission, setCreateCommission] = useState("10");
  const [createParentId, setCreateParentId] = useState<number | "">("");
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [resetPwOpen, setResetPwOpen] = useState(false);
  const [pinViewOpen, setPinViewOpen] = useState(false);
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
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
  const [editCommission, setEditCommission] = useState("10");
  const [editSaving, setEditSaving] = useState(false);

  const { data: masters = [] } = useQuery({ queryKey: ["admin-masters", role], queryFn: () => getMasters(role) });
  const { data: supersList = [] } = useQuery({ queryKey: ["admin-supers"], queryFn: getSupers, enabled: role === "powerhouse" && createOpen });
  const { data: depositPaymentModesList = [] } = useQuery({
    queryKey: ["deposit-payment-modes-masters", role, selectedUser?.id],
    queryFn: () => getPaymentModesForDepositTarget(role, selectedUser!.id as number),
    enabled: depositOpen && !!selectedUser?.id,
  });
  const rows = masters as MasterRow[];

  const columns = [
    { header: "Username", accessor: (row: MasterRow) => String(row.username ?? "") },
    { header: "Balance", accessor: (row: MasterRow) => `₹${Number(row.main_balance ?? 0).toLocaleString()}` },
    { header: "P/L", accessor: (row: MasterRow) => (
      <span className={Number(row.pl_balance ?? 0) >= 0 ? "text-success" : "text-accent"}>
        {Number(row.pl_balance ?? 0) >= 0 ? "+" : ""}₹{Number(row.pl_balance ?? 0).toLocaleString()}
      </span>
    )},
    { header: "Players", accessor: (row: MasterRow) => row.players_count ?? 0 },
    { header: "Users Bal", accessor: (row: MasterRow) => `₹${Number(row.users_balance ?? 0).toLocaleString()}` },
    { header: "Status", accessor: (row: MasterRow) => <StatusBadge status={String(row.status ?? "active")} /> },
    { header: "Joined", accessor: (row: MasterRow) => row.created_at ? new Date(String(row.created_at)).toLocaleDateString() : "" },
    {
      header: "Actions",
      accessor: (row: MasterRow) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-success" title="Deposit" onClick={() => { setSelectedUser(row); setDepositOpen(true); }}><ArrowDownCircle className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-accent" title="Withdraw" onClick={() => { setSelectedUser(row); setWithdrawOpen(true); }}><ArrowUpCircle className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Reset Password" onClick={() => { setSelectedUser(row); setResetPwOpen(true); }}><Key className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" title="View PIN" onClick={() => { setSelectedUser(row); setPinViewOpen(true); }}><Eye className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-warning" title="Regenerate PIN" onClick={() => { setSelectedUser(row); setPendingAction("regeneratePin"); setPendingPayload({ userId: row.id }); setPinOpen(true); }}><RefreshCw className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-neon" title="Settlement" onClick={() => { setSelectedUser(row); setSettlementOpen(true); }}><ArrowRightLeft className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" title="View" onClick={() => { setSelectedUser(row); setViewOpen(true); }}><Eye className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit" onClick={() => { setSelectedUser(row); setEditName(String(row.name ?? "")); setEditCommission(String(row.commission_percentage ?? "10")); setEditOpen(true); }}><Edit className="h-3 w-3" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl">Master Users</h2>
      <DataTable data={rows} columns={columns} searchKey="username" searchPlaceholder="Search masters..." onAdd={() => setCreateOpen(true)} addLabel="Add Master" />

      {/* Create */}
      <Dialog open={createOpen} onOpenChange={(open) => {
        setCreateOpen(open);
        if (!open) {
          setCreateName(""); setCreateUsername(""); setCreatePhone(""); setCreateEmail(""); setCreateWhatsApp(""); setCreatePassword(""); setCreateCommission("10"); setCreateParentId("");
        }
      }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Create Master</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {role === "powerhouse" && (
              <div>
                <label className="text-xs text-muted-foreground">Super</label>
                <select
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm mt-1"
                  value={createParentId}
                  onChange={(e) => setCreateParentId(e.target.value === "" ? "" : Number(e.target.value))}
                >
                  <option value="">Select super</option>
                  {(supersList as { id?: number; username?: string }[]).map((s) => (
                    <option key={s.id} value={s.id}>{s.username ?? s.id}</option>
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
            <Input type="number" placeholder="Commission %" value={createCommission} onChange={(e) => setCreateCommission(e.target.value)} />
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
                    commission_percentage: createCommission ? Number(createCommission) : 10,
                  };
                  if (createEmail.trim()) body.email = createEmail.trim();
                  if (createWhatsApp.trim()) body.whatsapp_number = createWhatsApp.trim();
                  if (role === "powerhouse") {
                    if (createParentId === "" || createParentId === undefined) {
                      toast({ title: "Please select a Super.", variant: "destructive" });
                      return;
                    }
                    body.parent = createParentId;
                  }
                  await createMaster(body, role);
                  queryClient.invalidateQueries({ queryKey: ["admin-masters", role] });
                  toast({ title: "Master created successfully." });
                  setCreateOpen(false);
                  setCreateName(""); setCreateUsername(""); setCreatePhone(""); setCreateEmail(""); setCreateWhatsApp(""); setCreatePassword(""); setCreateCommission("10"); setCreateParentId("");
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

      {/* View */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Master Details</DialogTitle></DialogHeader>
          {selectedUser && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground text-xs">Username</span><p className="font-medium">{String(selectedUser.username ?? "")}</p></div>
              <div><span className="text-muted-foreground text-xs">Name</span><p className="font-medium">{String(selectedUser.name ?? "")}</p></div>
              <div><span className="text-muted-foreground text-xs">Balance</span><p className="font-medium">₹{Number(selectedUser.main_balance ?? 0).toLocaleString()}</p></div>
              <div><span className="text-muted-foreground text-xs">P/L</span><p className={`font-medium ${Number(selectedUser.pl_balance ?? 0) >= 0 ? "text-success" : "text-accent"}`}>{Number(selectedUser.pl_balance ?? 0) >= 0 ? "+" : ""}₹{Number(selectedUser.pl_balance ?? 0).toLocaleString()}</p></div>
              <div><span className="text-muted-foreground text-xs">Players</span><p className="font-medium">{Number(selectedUser.players_count ?? 0)}</p></div>
              <div><span className="text-muted-foreground text-xs">Users Balance</span><p className="font-medium">₹{Number(selectedUser.users_balance ?? 0).toLocaleString()}</p></div>
              <div><span className="text-muted-foreground text-xs">Status</span><p><StatusBadge status={String(selectedUser.status ?? "active")} /></p></div>
              <div><span className="text-muted-foreground text-xs">Joined</span><p className="font-medium">{selectedUser.created_at ? new Date(String(selectedUser.created_at)).toLocaleDateString() : ""}</p></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditSaving(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Edit Master</DialogTitle></DialogHeader>
          {selectedUser && (
            <div className="space-y-3">
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full Name" />
              <Input type="number" placeholder="Commission %" value={editCommission} onChange={(e) => setEditCommission(e.target.value)} />
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
                  await updateMaster(selectedUser.id as number, { name: editName.trim(), commission_percentage: editCommission || "10" }, role);
                  queryClient.invalidateQueries({ queryKey: ["admin-masters", role] });
                  toast({ title: "Master updated successfully." });
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

      {/* Deposit */}
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
            <Textarea placeholder="Remarks" rows={2} value={depositRemarks} onChange={(e) => setDepositRemarks(e.target.value)} />
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

      {/* Withdraw */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="font-display">Withdraw from {selectedUser?.username}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input type="number" placeholder="Amount" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
            <Textarea placeholder="Remarks" rows={2} value={withdrawRemarks} onChange={(e) => setWithdrawRemarks(e.target.value)} />
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
            <Input type="password" placeholder="Confirm Password" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} />
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

      {/* View PIN */}
      <Dialog open={pinViewOpen} onOpenChange={setPinViewOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="font-display">PIN for {selectedUser?.username}</DialogTitle></DialogHeader>
          <div className="text-center py-4">
            <p className="text-3xl font-gaming tracking-[0.5em] neon-text">{String(selectedUser?.pin ?? "")}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPinViewOpen(false)}>Close</Button>
            <Button
              className="gold-gradient text-primary-foreground"
              onClick={() => {
                setPendingAction("regeneratePin");
                setPendingPayload({ userId: selectedUser?.id });
                setPinViewOpen(false);
                setPinOpen(true);
              }}
            >
              Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settlement (super only) */}
      <Dialog open={settlementOpen} onOpenChange={setSettlementOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="font-display">Settlement — {selectedUser?.username}</DialogTitle></DialogHeader>
          {selectedUser && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-muted">
                <div><span className="text-muted-foreground text-xs">Main Balance</span><p className="font-bold">₹{Number(selectedUser.main_balance ?? 0).toLocaleString()}</p></div>
                <div><span className="text-muted-foreground text-xs">P/L Balance</span><p className={`font-bold ${Number(selectedUser.pl_balance ?? 0) >= 0 ? "text-success" : "text-accent"}`}>{Number(selectedUser.pl_balance ?? 0) >= 0 ? "+" : ""}₹{Number(selectedUser.pl_balance ?? 0).toLocaleString()}</p></div>
              </div>
              <p className="text-xs text-muted-foreground">Settlement will transfer all master balance to your account and reset P/L to 0.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettlementOpen(false)}>Cancel</Button>
            <Button
              className="gold-gradient text-primary-foreground"
              onClick={() => {
                setPendingAction("settlement");
                setPendingPayload({ masterId: selectedUser?.id });
                setSettlementOpen(false);
                setPinOpen(true);
              }}
            >
              Settle
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
              queryClient.invalidateQueries({ queryKey: ["admin-masters", role] });
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
              queryClient.invalidateQueries({ queryKey: ["admin-masters", role] });
              queryClient.invalidateQueries({ queryKey: ["admin-withdrawals", role] });
              toast({ title: "Withdrawal created and approved." });
            } else if (pendingAction === "resetPassword") {
              const userId = pendingPayload.userId as number;
              const new_password = pendingPayload.new_password as string;
              await resetPassword(userId, { pin, new_password }, role, "masters");
              queryClient.invalidateQueries({ queryKey: ["admin-masters", role] });
              toast({ title: "Password reset successfully." });
            } else if (pendingAction === "regeneratePin") {
              const userId = pendingPayload.userId as number;
              await regeneratePin(userId, { pin }, role, "masters");
              queryClient.invalidateQueries({ queryKey: ["admin-masters", role] });
              toast({ title: "PIN regenerated successfully." });
            } else if (pendingAction === "settlement") {
              const masterId = pendingPayload.masterId as number;
              await settleMaster(masterId, { pin });
              queryClient.invalidateQueries({ queryKey: ["admin-masters", role] });
              toast({ title: "Settlement completed." });
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

export default AdminMasters;
