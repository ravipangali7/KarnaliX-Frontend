import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  getMasterPaymentModes,
  createMasterPaymentMode,
  createMasterPaymentModeFormData,
  updateMasterPaymentMode,
  updateMasterPaymentModeFormData,
  deleteMasterPaymentMode,
} from "@/api/admin";
import { getMediaUrl } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Upload } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

type PaymentModeRow = Record<string, unknown> & {
  id?: number;
  name?: string;
  type?: string;
  wallet_phone?: string;
  bank_account_no?: string;
  status?: string;
  qr_image_url?: string;
};

const MasterPaymentModes = () => {
  const queryClient = useQueryClient();
  const { data: modes = [] } = useQuery({
    queryKey: ["master-payment-modes"],
    queryFn: getMasterPaymentModes,
  });
  const rows = modes as PaymentModeRow[];
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<PaymentModeRow | null>(null);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"ewallet" | "bank">("ewallet");
  const [formWalletPhone, setFormWalletPhone] = useState("");
  const [formBankName, setFormBankName] = useState("");
  const [formBankBranch, setFormBankBranch] = useState("");
  const [formBankAccountNo, setFormBankAccountNo] = useState("");
  const [formBankAccountHolderName, setFormBankAccountHolderName] = useState("");
  const [formQrFile, setFormQrFile] = useState<File | null>(null);
  const [formQrPreview, setFormQrPreview] = useState<string | null>(null);

  const resetForm = () => {
    setFormName("");
    setFormType("ewallet");
    setFormWalletPhone("");
    setFormBankName("");
    setFormBankBranch("");
    setFormBankAccountNo("");
    setFormBankAccountHolderName("");
    setFormQrFile(null);
    setFormQrPreview(null);
    setSelected(null);
  };

  const openEdit = (row: PaymentModeRow) => {
    setSelected(row);
    setFormName(String(row.name ?? ""));
    setFormType((row.type as "ewallet" | "bank") || "ewallet");
    setFormWalletPhone(String(row.wallet_phone ?? ""));
    setFormBankName(String(row.bank_name ?? ""));
    setFormBankBranch(String(row.bank_branch ?? ""));
    setFormBankAccountNo(String(row.bank_account_no ?? ""));
    setFormBankAccountHolderName(String(row.bank_account_holder_name ?? ""));
    setFormQrFile(null);
    setFormQrPreview(row.qr_image_url ? getMediaUrl(String(row.qr_image_url)) : null);
    setEditOpen(true);
  };

  const last4 = (s: string | undefined) => {
    if (!s || s.length < 4) return "-";
    return "****" + s.slice(-4);
  };

  const columns = [
    { header: "Name", accessor: (row: PaymentModeRow) => String(row.name ?? "") },
    { header: "Type", accessor: (row: PaymentModeRow) => String(row.type ?? "") },
    {
      header: "Account / Wallet",
      accessor: (row: PaymentModeRow) =>
        row.type === "bank" ? last4(row.bank_account_no) : last4(row.wallet_phone),
    },
    {
      header: "Status",
      accessor: (row: PaymentModeRow) => <StatusBadge status={String(row.status ?? "pending")} />,
    },
    {
      header: "Actions",
      accessor: (row: PaymentModeRow) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit" onClick={() => openEdit(row)}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            title="Delete"
            onClick={async () => {
              if (!row.id) return;
              if (!confirm("Delete this payment method?")) return;
              try {
                await deleteMasterPaymentMode(row.id);
                queryClient.invalidateQueries({ queryKey: ["master-payment-modes"] });
                toast({ title: "Payment method deleted." });
              } catch (e: unknown) {
                const msg = (e as { detail?: string })?.detail ?? "Failed to delete.";
                toast({ title: msg, variant: "destructive" });
              }
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  const buildFormData = (): FormData => {
    const formData = new FormData();
    formData.append("name", formName.trim());
    formData.append("type", formType);
    formData.append("status", "pending");
    if (formType === "ewallet") {
      formData.append("wallet_phone", formWalletPhone.trim());
      formData.append("bank_name", "");
      formData.append("bank_branch", "");
      formData.append("bank_account_no", "");
      formData.append("bank_account_holder_name", "");
    } else {
      formData.append("wallet_phone", "");
      formData.append("bank_name", formBankName.trim());
      formData.append("bank_branch", formBankBranch.trim());
      formData.append("bank_account_no", formBankAccountNo.trim());
      formData.append("bank_account_holder_name", formBankAccountHolderName.trim());
    }
    if (formQrFile) {
      formData.append("qr_image", formQrFile);
    }
    return formData;
  };

  const buildBody = () => {
    const body: Record<string, unknown> = {
      name: formName.trim(),
      type: formType,
      status: "pending",
    };
    if (formType === "ewallet") {
      body.wallet_phone = formWalletPhone.trim();
      body.bank_name = "";
      body.bank_branch = "";
      body.bank_account_no = "";
      body.bank_account_holder_name = "";
    } else {
      body.wallet_phone = "";
      body.bank_name = formBankName.trim();
      body.bank_branch = formBankBranch.trim();
      body.bank_account_no = formBankAccountNo.trim();
      body.bank_account_holder_name = formBankAccountHolderName.trim();
    }
    return body;
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl">Payment Methods</h2>
      <p className="text-sm text-muted-foreground">Manage payment methods your players use to deposit. New methods start as Pending; approve them in Payment Mode Verification.</p>
      <DataTable
        data={rows}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search payment methods..."
        onAdd={() => {
          resetForm();
          setCreateOpen(true);
        }}
        addLabel="Add Payment Method"
      />

      {/* Create */}
      <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Add Payment Method</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Name (e.g. Esewa, Bank Transfer)" value={formName} onChange={(e) => setFormName(e.target.value)} />
            <div>
              <label className="text-xs text-muted-foreground">Type</label>
              <select
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm mt-1"
                value={formType}
                onChange={(e) => setFormType(e.target.value as "ewallet" | "bank")}
              >
                <option value="ewallet">E-Wallet</option>
                <option value="bank">Bank</option>
              </select>
            </div>
            {formType === "ewallet" && (
              <Input placeholder="Wallet / Phone number" value={formWalletPhone} onChange={(e) => setFormWalletPhone(e.target.value)} />
            )}
            {formType === "bank" && (
              <>
                <Input placeholder="Bank name" value={formBankName} onChange={(e) => setFormBankName(e.target.value)} />
                <Input placeholder="Branch" value={formBankBranch} onChange={(e) => setFormBankBranch(e.target.value)} />
                <Input placeholder="Account number" value={formBankAccountNo} onChange={(e) => setFormBankAccountNo(e.target.value)} />
                <Input placeholder="Account holder name" value={formBankAccountHolderName} onChange={(e) => setFormBankAccountHolderName(e.target.value)} />
              </>
            )}
            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Upload className="h-3 w-3" /> QR Image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full text-sm mt-1 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary file:text-primary-foreground"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setFormQrFile(f ?? null);
                  setFormQrPreview(f ? URL.createObjectURL(f) : null);
                }}
              />
              {formQrPreview && (
                <img src={formQrPreview} alt="QR preview" className="mt-2 h-24 w-24 object-contain border rounded" />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              className="gold-gradient text-primary-foreground"
              onClick={async () => {
                try {
                  if (formQrFile) {
                    await createMasterPaymentModeFormData(buildFormData());
                  } else {
                    await createMasterPaymentMode(buildBody());
                  }
                  queryClient.invalidateQueries({ queryKey: ["master-payment-modes"] });
                  toast({ title: "Payment method added." });
                  setCreateOpen(false);
                  resetForm();
                } catch (e: unknown) {
                  const msg = (e as { detail?: string })?.detail ?? "Failed to add.";
                  toast({ title: msg, variant: "destructive" });
                }
              }}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Edit Payment Method</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Name" value={formName} onChange={(e) => setFormName(e.target.value)} />
            <div>
              <label className="text-xs text-muted-foreground">Type</label>
              <select
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm mt-1"
                value={formType}
                onChange={(e) => setFormType(e.target.value as "ewallet" | "bank")}
              >
                <option value="ewallet">E-Wallet</option>
                <option value="bank">Bank</option>
              </select>
            </div>
            {formType === "ewallet" && (
              <Input placeholder="Wallet / Phone number" value={formWalletPhone} onChange={(e) => setFormWalletPhone(e.target.value)} />
            )}
            {formType === "bank" && (
              <>
                <Input placeholder="Bank name" value={formBankName} onChange={(e) => setFormBankName(e.target.value)} />
                <Input placeholder="Branch" value={formBankBranch} onChange={(e) => setFormBankBranch(e.target.value)} />
                <Input placeholder="Account number" value={formBankAccountNo} onChange={(e) => setFormBankAccountNo(e.target.value)} />
                <Input placeholder="Account holder name" value={formBankAccountHolderName} onChange={(e) => setFormBankAccountHolderName(e.target.value)} />
              </>
            )}
            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Upload className="h-3 w-3" /> QR Image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full text-sm mt-1 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary file:text-primary-foreground"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setFormQrFile(f ?? null);
                  setFormQrPreview(f ? URL.createObjectURL(f) : (selected?.qr_image_url ? getMediaUrl(String(selected.qr_image_url)) : null));
                }}
              />
              {(formQrPreview || (selected?.qr_image_url && !formQrFile)) && (
                <img src={formQrPreview || (selected?.qr_image_url ? getMediaUrl(String(selected.qr_image_url)) : "")} alt="QR preview" className="mt-2 h-24 w-24 object-contain border rounded" />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button
              className="gold-gradient text-primary-foreground"
              onClick={async () => {
                if (!selected?.id) return;
                try {
                  if (formQrFile) {
                    const fd = buildFormData();
                    fd.append("name", formName.trim());
                    fd.append("type", formType);
                    if (formType === "ewallet") {
                      fd.set("wallet_phone", formWalletPhone.trim());
                    } else {
                      fd.set("bank_name", formBankName.trim());
                      fd.set("bank_branch", formBankBranch.trim());
                      fd.set("bank_account_no", formBankAccountNo.trim());
                      fd.set("bank_account_holder_name", formBankAccountHolderName.trim());
                    }
                    await updateMasterPaymentModeFormData(selected.id, fd);
                  } else {
                    await updateMasterPaymentMode(selected.id, buildBody());
                  }
                  queryClient.invalidateQueries({ queryKey: ["master-payment-modes"] });
                  toast({ title: "Payment method updated." });
                  setEditOpen(false);
                  resetForm();
                } catch (e: unknown) {
                  const msg = (e as { detail?: string })?.detail ?? "Failed to update.";
                  toast({ title: msg, variant: "destructive" });
                }
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MasterPaymentModes;
