import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSuperSettings, saveSuperSettings } from "@/api/admin";
import { toast } from "@/hooks/use-toast";

type SuggestionRow = { id: string; value: string };

const newRow = (value = ""): SuggestionRow => ({
  id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `r-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  value,
});

const PowerhouseSuperSettings = () => {
  const queryClient = useQueryClient();
  const { data: superSettings } = useQuery({ queryKey: ["admin-super-settings"], queryFn: getSuperSettings });
  const [minDeposit, setMinDeposit] = useState("");
  const [maxDeposit, setMaxDeposit] = useState("");
  const [minWithdraw, setMinWithdraw] = useState("");
  const [maxWithdraw, setMaxWithdraw] = useState("");
  const [exposureLimit, setExposureLimit] = useState("");
  const [gameApiUrl, setGameApiUrl] = useState("");
  const [gameApiLaunchUrl, setGameApiLaunchUrl] = useState("");
  const [gameApiSecret, setGameApiSecret] = useState("");
  const [rejectSuggestionRows, setRejectSuggestionRows] = useState<SuggestionRow[]>(() => [newRow()]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const s = (superSettings ?? {}) as Record<string, unknown>;
    setMinDeposit(String(s.min_deposit ?? ""));
    setMaxDeposit(String(s.max_deposit ?? ""));
    setMinWithdraw(String(s.min_withdraw ?? ""));
    setMaxWithdraw(String(s.max_withdraw ?? ""));
    setExposureLimit(String(s.exposure_limit ?? ""));
    setGameApiUrl(String(s.game_api_url ?? ""));
    setGameApiLaunchUrl(String(s.game_api_launch_url ?? ""));
    setGameApiSecret(String(s.game_api_secret ?? ""));
    const rr = s.reject_reason_suggestions;
    if (rr != null && typeof rr === "object") {
      const raw = (rr as { data?: unknown }).data;
      if (Array.isArray(raw)) {
        const asStrings = raw.map((x) => String(x ?? ""));
        setRejectSuggestionRows(asStrings.length > 0 ? asStrings.map((v) => newRow(v)) : [newRow()]);
      } else {
        setRejectSuggestionRows([newRow()]);
      }
    } else {
      setRejectSuggestionRows([newRow()]);
    }
  }, [superSettings]);

  const addRejectSuggestionRow = useCallback(() => {
    setRejectSuggestionRows((rows) => [...rows, newRow()]);
  }, []);

  const updateRejectSuggestionRow = useCallback((id: string, value: string) => {
    setRejectSuggestionRows((rows) => rows.map((r) => (r.id === id ? { ...r, value } : r)));
  }, []);

  const removeRejectSuggestionRow = useCallback((id: string) => {
    setRejectSuggestionRows((rows) => {
      if (rows.length <= 1) return [newRow()];
      return rows.filter((r) => r.id !== id);
    });
  }, []);

  const handleSave = async () => {
    const suggestionData = rejectSuggestionRows.map((r) => r.value.trim()).filter((s) => s !== "");
    setSaving(true);
    try {
      await saveSuperSettings({
        min_deposit: minDeposit || "0",
        max_deposit: maxDeposit || "0",
        min_withdraw: minWithdraw || "0",
        max_withdraw: maxWithdraw || "0",
        exposure_limit: exposureLimit || "0",
        game_api_url: gameApiUrl.trim(),
        game_api_launch_url: gameApiLaunchUrl.trim(),
        game_api_secret: gameApiSecret.trim(),
        reject_reason_suggestions: { data: suggestionData },
      });
      queryClient.invalidateQueries({ queryKey: ["admin-super-settings"] });
      toast({ title: "Super settings saved." });
    } catch (e) {
      const msg = (e as { detail?: string })?.detail ?? "Failed to save settings";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="font-display font-bold text-xl">Super Settings</h2>
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-display">Reject reason auto-suggestions</CardTitle>
          <p className="text-xs text-muted-foreground font-normal pt-1">
            Shown as quick-pick chips on deposit / withdrawal / bonus / KYC / payment reject dialogs. Empty rows are ignored when you save.
          </p>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div className="space-y-2">
            {rejectSuggestionRows.map((row, index) => (
              <div key={row.id} className="flex gap-2 items-center">
                <span className="text-xs text-muted-foreground w-7 shrink-0 tabular-nums">{index + 1}.</span>
                <Input
                  value={row.value}
                  onChange={(e) => updateRejectSuggestionRow(row.id, e.target.value)}
                  placeholder={index === 0 ? "e.g. Invalid payment proof" : "e.g. Play game first"}
                  className="text-sm flex-1 min-w-0"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeRejectSuggestionRow(row.id)}
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="secondary" size="sm" className="w-full gap-1.5" onClick={addRejectSuggestionRow}>
            <Plus className="h-4 w-4" />
            Add suggestion
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm font-display">Financial Settings</CardTitle></CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Deposit Min</label><Input type="number" value={minDeposit} onChange={(e) => setMinDeposit(e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground">Deposit Max</label><Input type="number" value={maxDeposit} onChange={(e) => setMaxDeposit(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Withdraw Min</label><Input type="number" value={minWithdraw} onChange={(e) => setMinWithdraw(e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground">Withdraw Max</label><Input type="number" value={maxWithdraw} onChange={(e) => setMaxWithdraw(e.target.value)} /></div>
          </div>
          <div><label className="text-xs text-muted-foreground">Exposure Limit</label><Input type="number" value={exposureLimit} onChange={(e) => setExposureLimit(e.target.value)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm font-display">API Settings</CardTitle></CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div><label className="text-xs text-muted-foreground">API Endpoint (getProvider/providerGame)</label><Input value={gameApiUrl} onChange={(e) => setGameApiUrl(e.target.value)} placeholder="https://allapi.online/launch_game_js" /></div>
          <div><label className="text-xs text-muted-foreground">Launch URL (e.g. launch_game1_js)</label><Input value={gameApiLaunchUrl} onChange={(e) => setGameApiLaunchUrl(e.target.value)} placeholder="https://allapi.online/launch_game1_js" /></div>
          <div><label className="text-xs text-muted-foreground">API Secret</label><Input value={gameApiSecret} onChange={(e) => setGameApiSecret(e.target.value)} type="password" /></div>
        </CardContent>
      </Card>

      <Button className="gold-gradient text-primary-foreground font-display w-full" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Settings"}</Button>
    </div>
  );
};

export default PowerhouseSuperSettings;
