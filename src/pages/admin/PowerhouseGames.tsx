import { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { getGamesAdmin } from "@/api/admin";
import { StatusBadge } from "@/components/shared/StatusBadge";

const PowerhouseGames = () => {
  const { data: games = [] } = useQuery({ queryKey: ["admin-games"], queryFn: getGamesAdmin });
  const [createOpen, setCreateOpen] = useState(false);
  const columns = [
    { header: "Name", accessor: (row: Record<string, unknown>) => String(row.name ?? "") },
    { header: "Category", accessor: (row: Record<string, unknown>) => String(row.category_name ?? "") },
    { header: "Provider", accessor: (row: Record<string, unknown>) => String(row.provider_name ?? "") },
    { header: "Min Bet", accessor: (row: Record<string, unknown>) => `₹${row.min_bet ?? ""}` },
    { header: "Max Bet", accessor: (row: Record<string, unknown>) => `₹${Number(row.max_bet ?? 0).toLocaleString()}` },
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
      <h2 className="font-display font-bold text-xl">Games Management</h2>
      <DataTable data={games as Record<string, unknown>[]} columns={columns} searchKey="name" onAdd={() => setCreateOpen(true)} addLabel="Add Game" pageSize={15} />
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-display">Add Game</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Game Name" />
            <select className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm"><option>Select Category</option></select>
            <select className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm"><option>Select Provider</option></select>
            <Input placeholder="Image URL" />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Min Bet" type="number" />
              <Input placeholder="Max Bet" type="number" />
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

export default PowerhouseGames;
