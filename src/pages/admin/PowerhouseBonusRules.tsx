import { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { getBonusRulesAdmin } from "@/api/admin";
import { StatusBadge } from "@/components/shared/StatusBadge";

const PowerhouseBonusRules = () => {
  const { data: bonusRules = [] } = useQuery({ queryKey: ["admin-bonus-rules"], queryFn: getBonusRulesAdmin });
  const [createOpen, setCreateOpen] = useState(false);
  const columns = [
    { header: "Name", accessor: (row: Record<string, unknown>) => String(row.name ?? "") },
    { header: "Type", accessor: (row: Record<string, unknown>) => <span className="capitalize">{String(row.bonus_type ?? "").replace(/_/g, " ")}</span> },
    { header: "Reward", accessor: (row: Record<string, unknown>) => `${row.reward_value ?? ""}${row.reward_type === "percentage" ? "%" : " Fixed"}` },
    { header: "Roll", accessor: (row: Record<string, unknown>) => `x${row.roll_required ?? "-"}` },
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

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl">Bonus Rules</h2>
      <DataTable data={bonusRules as Record<string, unknown>[]} columns={columns} searchKey="name" onAdd={() => setCreateOpen(true)} addLabel="Add Bonus Rule" />
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-display">Add Bonus Rule</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Bonus Name" />
            <select className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm">
              <option>First Deposit</option><option>Referral</option><option>Deposit</option>
            </select>
            <Input placeholder="Promo Code" />
            <div className="grid grid-cols-2 gap-3">
              <select className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
                <option>Percentage</option><option>Fixed</option>
              </select>
              <Input placeholder="Amount" type="number" />
            </div>
            <Input placeholder="Max Reward" type="number" />
            <Input placeholder="Roll Required" type="number" />
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" placeholder="Valid From" />
              <Input type="date" placeholder="Valid To" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button className="gold-gradient text-primary-foreground" onClick={() => setCreateOpen(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PowerhouseBonusRules;
