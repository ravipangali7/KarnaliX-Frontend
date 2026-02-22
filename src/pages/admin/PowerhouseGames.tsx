import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { getGamesAdmin, getCategoriesAdmin, getProvidersAdmin, createGame, createGameForm } from "@/api/admin";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { toast } from "@/hooks/use-toast";

const PowerhouseGames = () => {
  const queryClient = useQueryClient();
  const { data: games = [] } = useQuery({ queryKey: ["admin-games"], queryFn: getGamesAdmin });
  const { data: categories = [] } = useQuery({ queryKey: ["admin-categories"], queryFn: getCategoriesAdmin });
  const { data: providers = [] } = useQuery({ queryKey: ["admin-providers"], queryFn: getProvidersAdmin });
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [gameUid, setGameUid] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [providerId, setProviderId] = useState<number | "">("");
  const [minBet, setMinBet] = useState("10");
  const [maxBet, setMaxBet] = useState("5000");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setName("");
    setGameUid("");
    setCategoryId("");
    setProviderId("");
    setMinBet("10");
    setMaxBet("5000");
    setImageFile(null);
    setIsActive(true);
  };

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

  const handleSave = async () => {
    const n = name.trim();
    const uid = gameUid.trim();
    if (!n || !uid) {
      toast({ title: "Game name and Game UID are required", variant: "destructive" });
      return;
    }
    if (categoryId === "" || providerId === "") {
      toast({ title: "Please select Category and Provider", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append("name", n);
        formData.append("game_uid", uid);
        formData.append("category", String(categoryId));
        formData.append("provider", String(providerId));
        formData.append("min_bet", minBet || "0");
        formData.append("max_bet", maxBet || "0");
        formData.append("is_active", String(isActive));
        formData.append("image", imageFile);
        await createGameForm(formData);
      } else {
        await createGame({
          name: n,
          game_uid: uid,
          category: categoryId,
          provider: providerId,
          min_bet: minBet || "0",
          max_bet: maxBet || "0",
          is_active: isActive,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["admin-games"] });
      toast({ title: "Game created successfully." });
      resetForm();
      setCreateOpen(false);
    } catch (e) {
      const msg = (e as { detail?: string })?.detail ?? "Failed to create game";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl">Games Management</h2>
      <DataTable data={games as Record<string, unknown>[]} columns={columns} searchKey="name" onAdd={() => setCreateOpen(true)} addLabel="Add Game" pageSize={15} />
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-display">Add Game</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Game Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Game UID (provider code)" value={gameUid} onChange={(e) => setGameUid(e.target.value)} />
            <select
              className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value === "" ? "" : Number(e.target.value))}
            >
              <option value="">Select Category</option>
              {(categories as { id: number; name: string }[]).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm"
              value={providerId}
              onChange={(e) => setProviderId(e.target.value === "" ? "" : Number(e.target.value))}
            >
              <option value="">Select Provider</option>
              {(providers as { id: number; name: string; code: string }[]).map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Game image (optional)</label>
              <input
                key={createOpen ? "open" : "closed"}
                type="file"
                accept="image/*"
                className="w-full text-sm file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-muted file:text-sm"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Min Bet" type="number" value={minBet} onChange={(e) => setMinBet(e.target.value)} />
              <Input placeholder="Max Bet" type="number" value={maxBet} onChange={(e) => setMaxBet(e.target.value)} />
            </div>
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

export default PowerhouseGames;
