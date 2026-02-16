import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { getProvidersAdmin, createProviderAdmin, getImportGameApiUrl, fetchProvidersFromGameApi, fetchProviderGamesFromGameApi, postImportGames, type ImportProvider, type ImportGame } from "@/api/admin";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

const PowerhouseProviders = () => {
  const queryClient = useQueryClient();
  const { data: gameProviders = [] } = useQuery({ queryKey: ["admin-providers"], queryFn: getProvidersAdmin });
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Direct Import modal (game API called from browser; backend only gives URL and persists import)
  const [importOpen, setImportOpen] = useState(false);
  const [gameApiUrl, setGameApiUrl] = useState("");
  const [importProviders, setImportProviders] = useState<ImportProvider[]>([]);
  const [importProvidersLoading, setImportProvidersLoading] = useState(false);
  const [importProvidersError, setImportProvidersError] = useState<string | null>(null);
  const [selectedProviderCode, setSelectedProviderCode] = useState("");
  const [importGamesData, setImportGamesData] = useState<{ categories: string[]; games: ImportGame[] } | null>(null);
  const [importGamesLoading, setImportGamesLoading] = useState(false);
  const [importGamesError, setImportGamesError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedGames, setSelectedGames] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);

  const resetForm = () => {
    setName("");
    setCode("");
    setIsActive(true);
  };

  // When Direct Import modal opens, get game API URL from backend then fetch providers from game API (browser)
  useEffect(() => {
    if (!importOpen) return;
    setImportProvidersError(null);
    setGameApiUrl("");
    setImportProvidersLoading(true);
    getImportGameApiUrl()
      .then(({ game_api_url }) => {
        if (!game_api_url) {
          setImportProvidersError("Game API URL not set. Configure in Super Settings.");
          return;
        }
        setGameApiUrl(game_api_url);
        return fetchProvidersFromGameApi(game_api_url);
      })
      .then((list) => {
        if (list) {
          setImportProviders(list);
          setSelectedProviderCode("");
          setImportGamesData(null);
          setSelectedCategories(new Set());
          setSelectedGames(new Set());
        }
      })
      .catch((e) => setImportProvidersError((e as { detail?: string })?.detail ?? (e as { message?: string })?.message ?? "Failed to load providers"))
      .finally(() => setImportProvidersLoading(false));
  }, [importOpen]);

  // When provider is selected, fetch games from game API (browser)
  useEffect(() => {
    if (!importOpen || !selectedProviderCode || !gameApiUrl) {
      if (!selectedProviderCode || !gameApiUrl) setImportGamesData(null);
      setImportGamesError(null);
      return;
    }
    setImportGamesError(null);
    setImportGamesLoading(true);
    fetchProviderGamesFromGameApi(gameApiUrl, selectedProviderCode)
      .then((data) => {
        setImportGamesData(data);
        setSelectedCategories(new Set());
        setSelectedGames(new Set());
      })
      .catch((e) => setImportGamesError((e as { detail?: string })?.detail ?? (e as { message?: string })?.message ?? "Failed to load games"))
      .finally(() => setImportGamesLoading(false));
  }, [importOpen, selectedProviderCode, gameApiUrl]);

  const selectedProviderName = importProviders.find((p) => p.code === selectedProviderCode)?.name ?? "";
  const categories = importGamesData?.categories ?? [];
  const games = importGamesData?.games ?? [];
  const selectedGamesList = games.filter((g) => selectedGames.has(g.game_uid));

  const handleImportSelectAllCategories = () => setSelectedCategories(new Set(categories));
  const handleImportDeselectAllCategories = () => setSelectedCategories(new Set());
  const handleImportSelectAllGames = () => setSelectedGames(new Set(games.map((g) => g.game_uid)));
  const handleImportDeselectAllGames = () => setSelectedGames(new Set());

  const handleImport = async () => {
    if (!selectedProviderCode || selectedGamesList.length === 0) return;
    setImporting(true);
    try {
      const result = await postImportGames({
        provider_code: selectedProviderCode,
        provider_name: selectedProviderName,
        games: selectedGamesList,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-providers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-games"] });
      toast({
        title: `Imported: ${result.categories_created} categories, ${result.games_created} games created, ${result.games_skipped} skipped.`,
      });
      setImportOpen(false);
    } catch (e) {
      const msg = (e as { detail?: string; message?: string })?.detail ?? (e as { message?: string })?.message ?? "Import failed";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setImporting(false);
    }
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
      <DataTable
        data={gameProviders as Record<string, unknown>[]}
        columns={columns}
        searchKey="name"
        onAdd={() => setCreateOpen(true)}
        addLabel="Add Provider"
        secondaryAction={{ label: "Direct Import", onClick: () => setImportOpen(true) }}
      />
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

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display">Direct Import</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 min-h-0">
            <div>
              <label className="text-sm font-medium mb-1 block">Provider</label>
              {importProvidersLoading ? (
                <p className="text-sm text-muted-foreground">Loading providers…</p>
              ) : importProvidersError ? (
                <div className="space-y-2">
                  <p className="text-sm text-destructive">{importProvidersError}</p>
                  <Button variant="outline" size="sm" onClick={() => { setImportProvidersError(null); setImportProvidersLoading(true); getImportGameApiUrl().then(({ game_api_url }) => { if (!game_api_url) { setImportProvidersError("Game API URL not set. Configure in Super Settings."); return; } setGameApiUrl(game_api_url); return fetchProvidersFromGameApi(game_api_url); }).then((list) => { if (list) setImportProviders(list); }).catch((e) => setImportProvidersError((e as { detail?: string })?.detail ?? (e as { message?: string })?.message ?? "Failed to load providers")).finally(() => setImportProvidersLoading(false)); }}>Retry</Button>
                </div>
              ) : (
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedProviderCode}
                  onChange={(e) => setSelectedProviderCode(e.target.value)}
                >
                  <option value="">Select a provider</option>
                  {importProviders.map((p) => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>

            {selectedProviderCode && (
              <>
                {importGamesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading categories and games…</p>
                ) : importGamesError ? (
                  <div className="space-y-2">
                    <p className="text-sm text-destructive">{importGamesError}</p>
                    <Button variant="outline" size="sm" onClick={() => { setImportGamesError(null); setImportGamesLoading(true); fetchProviderGamesFromGameApi(gameApiUrl, selectedProviderCode).then((data) => { setImportGamesData(data); setSelectedCategories(new Set()); setSelectedGames(new Set()); }).catch((e) => setImportGamesError((e as { detail?: string })?.detail ?? (e as { message?: string })?.message ?? "Failed to load games")).finally(() => setImportGamesLoading(false)); }}>Retry</Button>
                  </div>
                ) : importGamesData ? (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Categories</label>
                        <div className="flex gap-1">
                          <Button type="button" variant="ghost" size="sm" className="text-xs h-7" onClick={handleImportSelectAllCategories}>Select all</Button>
                          <Button type="button" variant="ghost" size="sm" className="text-xs h-7" onClick={handleImportDeselectAllCategories}>Deselect all</Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 max-h-24 overflow-y-auto rounded border p-2">
                        {categories.map((cat) => (
                          <label key={cat} className="flex items-center gap-2 text-sm cursor-pointer">
                            <Checkbox
                              checked={selectedCategories.has(cat)}
                              onCheckedChange={(checked) => setSelectedCategories((prev) => { const next = new Set(prev); if (checked) next.add(cat); else next.delete(cat); return next; })}
                            />
                            {cat}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Games</label>
                        <div className="flex gap-1">
                          <Button type="button" variant="ghost" size="sm" className="text-xs h-7" onClick={handleImportSelectAllGames}>Select all</Button>
                          <Button type="button" variant="ghost" size="sm" className="text-xs h-7" onClick={handleImportDeselectAllGames}>Deselect all</Button>
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto rounded border p-2 space-y-1">
                        {games.map((g) => (
                          <label key={g.game_uid} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5">
                            <Checkbox
                              checked={selectedGames.has(g.game_uid)}
                              onCheckedChange={(checked) => setSelectedGames((prev) => { const next = new Set(prev); if (checked) next.add(g.game_uid); else next.delete(g.game_uid); return next; })}
                            />
                            <span className="truncate">{g.game_name}</span>
                            {g.game_type && <span className="text-muted-foreground text-xs">({g.game_type})</span>}
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)} disabled={importing}>Cancel</Button>
            <Button
              className="gold-gradient text-primary-foreground"
              onClick={handleImport}
              disabled={!selectedProviderCode || selectedGamesList.length === 0 || importing}
            >
              {importing ? "Importing…" : `Import ${selectedGamesList.length} game${selectedGamesList.length !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PowerhouseProviders;
