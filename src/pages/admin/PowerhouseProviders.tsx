import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { getProvidersAdmin, createProviderAdmin } from "@/api/admin";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { toast } from "@/hooks/use-toast";

const PowerhouseProviders = () => {
  const queryClient = useQueryClient();
  const { data: gameProviders = [] } = useQuery({ queryKey: ["admin-providers"], queryFn: getProvidersAdmin });
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setName("");
    setCode("");
    setIsActive(true);
  };

  const columns = [
    { header: "Name", accessor: (row: Record<string, unknown>) => String(row.name ?? "") },
    { header: "Code", accessor: (row: Record<string, unknown>) => String(row.code ?? "") },
    { header: "Status", accessor: (row: Record<string, unknown>) => <StatusBadge status={row.is_active ? "active" : "suspended"} /> },
    {
      header: "Actions",
      accessor: () => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="text-xs">Edit</Button>
          <Button variant="ghost" size="sm" className="text-xs text-crimson">Delete</Button>
        </div>
      ),
    },
  ];

  const handleSave = async () => {
    const n = name.trim();
    const c = code.trim();
    if (!n || !c) {
      toast({ title: "Name and Code are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await createProviderAdmin({ name: n, code: c, is_active: isActive });
      queryClient.invalidateQueries({ queryKey: ["admin-providers"] });
      toast({ title: "Provider created successfully." });
      resetForm();
      setCreateOpen(false);
    } catch (e) {
      const msg = (e as { detail?: string })?.detail ?? "Failed to create provider";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl">Game Providers</h2>
      <DataTable data={gameProviders as Record<string, unknown>[]} columns={columns} searchKey="name" onAdd={() => setCreateOpen(true)} addLabel="Add Provider" />
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Add Provider</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Provider Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Provider Code" value={code} onChange={(e) => setCode(e.target.value)} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-border" />
              Active
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>Cancel</Button>
            <Button className="gold-gradient text-primary-foreground" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PowerhouseProviders;
