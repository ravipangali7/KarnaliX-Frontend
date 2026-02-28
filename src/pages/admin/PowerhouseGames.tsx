import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { getGamesAdmin, getCategoriesAdmin, getProvidersAdmin, createGame, createGameForm, updateGame, updateGameForm } from "@/api/admin";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { toast } from "@/hooks/use-toast";
import { getMediaUrl } from "@/lib/api";

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
  const [isComingSoon, setIsComingSoon] = useState(false);
  const [isSingleGame, setIsSingleGame] = useState(false);
  const [isTopGame, setIsTopGame] = useState(false);
  const [isPopularGame, setIsPopularGame] = useState(false);
  const [comingSoonLaunchDate, setComingSoonLaunchDate] = useState("");
  const [comingSoonDescription, setComingSoonDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Record<string, unknown> | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const resetForm = () => {
    setName("");
    setGameUid("");
    setCategoryId("");
    setProviderId("");
    setMinBet("10");
    setMaxBet("5000");
    setImageFile(null);
    setIsActive(true);
    setIsComingSoon(false);
    setIsSingleGame(false);
    setIsTopGame(false);
    setIsPopularGame(false);
    setComingSoonLaunchDate("");
    setComingSoonDescription("");
    setEditingGame(null);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditingGame(row);
    setName(String(row.name ?? ""));
    setGameUid(String(row.game_uid ?? ""));
    setCategoryId(typeof row.category === "number" ? row.category : "");
    setProviderId(typeof row.provider === "number" ? row.provider : "");
    setMinBet(String(row.min_bet ?? "10"));
    setMaxBet(String(row.max_bet ?? "5000"));
    setIsActive(Boolean(row.is_active));
    setIsComingSoon(Boolean(row.is_coming_soon));
    setIsSingleGame(Boolean(row.is_single_game));
    setIsTopGame(Boolean(row.is_top_game));
    setIsPopularGame(Boolean(row.is_popular_game));
    const launchDate = row.coming_soon_launch_date;
    setComingSoonLaunchDate(launchDate ? String(launchDate).slice(0, 10) : "");
    setComingSoonDescription(String(row.coming_soon_description ?? ""));
    setImageFile(null);
    setEditOpen(true);
  };

  const columns = [
    { header: "Name", accessor: (row: Record<string, unknown>) => String(row.name ?? "") },
    { header: "Category", accessor: (row: Record<string, unknown>) => String(row.category_name ?? "") },
    { header: "Provider", accessor: (row: Record<string, unknown>) => String(row.provider_name ?? "") },
    { header: "Min Bet", accessor: (row: Record<string, unknown>) => `₹${row.min_bet ?? ""}` },
    { header: "Max Bet", accessor: (row: Record<string, unknown>) => `₹${Number(row.max_bet ?? 0).toLocaleString()}` },
    {
      header: "Flags",
      accessor: (row: Record<string, unknown>) => (
        <div className="flex gap-1 flex-wrap">
          {row.is_top_game && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">Top</span>}
          {row.is_popular_game && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-600 dark:text-violet-400">Popular</span>}
        </div>
      ),
    },
    { header: "Status", accessor: (row: Record<string, unknown>) => <StatusBadge status={row.is_active ? "active" : "suspended"} /> },
    {
      header: "Actions",
      accessor: (row: Record<string, unknown>) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => openEdit(row)}>Edit</Button>
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
        formData.append("is_coming_soon", String(isComingSoon));
        formData.append("is_single_game", String(isSingleGame));
        formData.append("is_top_game", String(isTopGame));
        formData.append("is_popular_game", String(isPopularGame));
        if (comingSoonLaunchDate.trim()) formData.append("coming_soon_launch_date", comingSoonLaunchDate.trim());
        formData.append("coming_soon_description", comingSoonDescription.trim());
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
          is_coming_soon: isComingSoon,
          is_single_game: isSingleGame,
          is_top_game: isTopGame,
          is_popular_game: isPopularGame,
          coming_soon_launch_date: comingSoonLaunchDate.trim() || null,
          coming_soon_description: comingSoonDescription.trim() || "",
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

  const handleSaveEdit = async () => {
    if (!editingGame?.id) return;
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
    const id = Number(editingGame.id);
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
        formData.append("is_coming_soon", String(isComingSoon));
        formData.append("is_single_game", String(isSingleGame));
        formData.append("is_top_game", String(isTopGame));
        formData.append("is_popular_game", String(isPopularGame));
        if (comingSoonLaunchDate.trim()) formData.append("coming_soon_launch_date", comingSoonLaunchDate.trim());
        formData.append("coming_soon_description", comingSoonDescription.trim());
        formData.append("image", imageFile);
        await updateGameForm(id, formData);
      } else {
        await updateGame(id, {
          name: n,
          game_uid: uid,
          category: categoryId,
          provider: providerId,
          min_bet: minBet || "0",
          max_bet: maxBet || "0",
          is_active: isActive,
          is_coming_soon: isComingSoon,
          is_single_game: isSingleGame,
          is_top_game: isTopGame,
          is_popular_game: isPopularGame,
          coming_soon_launch_date: comingSoonLaunchDate.trim() || null,
          coming_soon_description: comingSoonDescription.trim() || "",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["admin-games"] });
      toast({ title: "Game updated successfully." });
      resetForm();
      setEditOpen(false);
    } catch (e) {
      const msg = (e as { detail?: string })?.detail ?? "Failed to update game";
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
              {imagePreviewUrl && (
                <div className="mt-2 rounded-lg border border-border overflow-hidden bg-muted/30 w-24 h-24">
                  <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Min Bet" type="number" value={minBet} onChange={(e) => setMinBet(e.target.value)} />
              <Input placeholder="Max Bet" type="number" value={maxBet} onChange={(e) => setMaxBet(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-border" />
              Active
            </label>
            <div className="space-y-2 border-t border-border pt-3">
              <p className="text-xs font-medium text-muted-foreground">Coming soon</p>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isComingSoon} onChange={(e) => setIsComingSoon(e.target.checked)} className="rounded border-border" />
                Mark as coming soon
              </label>
              {isComingSoon && (
                <>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Launch date (optional)</label>
                    <Input type="date" value={comingSoonLaunchDate} onChange={(e) => setComingSoonLaunchDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Description (optional)</label>
                    <Textarea placeholder="Short description for the card" value={comingSoonDescription} onChange={(e) => setComingSoonDescription(e.target.value)} rows={2} className="resize-none" />
                  </div>
                </>
              )}
            </div>
            <div className="space-y-2 border-t border-border pt-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isSingleGame} onChange={(e) => setIsSingleGame(e.target.checked)} className="rounded border-border" />
                Single game (open directly when provider is clicked)
              </label>
            </div>
            <div className="space-y-2 border-t border-border pt-3">
              <p className="text-xs font-medium text-muted-foreground">Homepage</p>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isTopGame} onChange={(e) => setIsTopGame(e.target.checked)} className="rounded border-border" />
                Top Game
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isPopularGame} onChange={(e) => setIsPopularGame(e.target.checked)} className="rounded border-border" />
                Popular Game
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>Cancel</Button>
            <Button className="gold-gradient text-primary-foreground" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-display">Edit Game</DialogTitle></DialogHeader>
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
              <label className="text-xs text-muted-foreground block mb-1">Game image (optional, leave empty to keep current)</label>
              <input
                key={editOpen ? "open" : "closed"}
                type="file"
                accept="image/*"
                className="w-full text-sm file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-muted file:text-sm"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
              {(imagePreviewUrl || (editingGame?.image && typeof editingGame.image === "string" && editingGame.image.trim())) && (
                <div className="mt-2 rounded-lg border border-border overflow-hidden bg-muted/30 w-24 h-24">
                  <img
                    src={imagePreviewUrl ?? getMediaUrl((editingGame?.image as string).trim())}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Min Bet" type="number" value={minBet} onChange={(e) => setMinBet(e.target.value)} />
              <Input placeholder="Max Bet" type="number" value={maxBet} onChange={(e) => setMaxBet(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-border" />
              Active
            </label>
            <div className="space-y-2 border-t border-border pt-3">
              <p className="text-xs font-medium text-muted-foreground">Coming soon</p>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isComingSoon} onChange={(e) => setIsComingSoon(e.target.checked)} className="rounded border-border" />
                Mark as coming soon
              </label>
              {isComingSoon && (
                <>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Launch date (optional)</label>
                    <Input type="date" value={comingSoonLaunchDate} onChange={(e) => setComingSoonLaunchDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Description (optional)</label>
                    <Textarea placeholder="Short description for the card" value={comingSoonDescription} onChange={(e) => setComingSoonDescription(e.target.value)} rows={2} className="resize-none" />
                  </div>
                </>
              )}
            </div>
            <div className="space-y-2 border-t border-border pt-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isSingleGame} onChange={(e) => setIsSingleGame(e.target.checked)} className="rounded border-border" />
                Single game (open directly when provider is clicked)
              </label>
            </div>
            <div className="space-y-2 border-t border-border pt-3">
              <p className="text-xs font-medium text-muted-foreground">Homepage</p>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isTopGame} onChange={(e) => setIsTopGame(e.target.checked)} className="rounded border-border" />
                Top Game
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isPopularGame} onChange={(e) => setIsPopularGame(e.target.checked)} className="rounded border-border" />
                Popular Game
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
            <Button className="gold-gradient text-primary-foreground" onClick={handleSaveEdit} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PowerhouseGames;
