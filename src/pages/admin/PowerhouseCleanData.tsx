import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "@/hooks/use-toast";
import { executeCleanData, getCleanDataCatalog, type CleanDataCatalog } from "@/api/admin";
import { cn } from "@/lib/utils";

type PresetId = "user" | "master" | "super" | "powerhouse";

const PRESET_LABELS: Record<PresetId, string> = {
  user: "User",
  master: "Master",
  super: "Super",
  powerhouse: "Powerhouse",
};

const INVALIDATION_KEYS: (string | string[])[] = [
  ["admin-dashboard"],
  ["admin-supers"],
  ["admin-masters"],
  ["admin-players"],
  ["siteSetting"],
  ["admin-site-settings"],
  ["admin-super-settings"],
  ["admin-deposits"],
  ["admin-withdrawals"],
  ["admin-bonus-requests"],
  ["admin-game-log"],
  ["admin-transactions"],
  ["admin-activity"],
  ["admin-messages"],
  ["admin-cms"],
  ["admin-testimonials"],
  ["admin-payment-methods"],
  ["admin-countries"],
  ["admin-slider"],
  ["admin-popup"],
  ["admin-promotions"],
  ["admin-coming-soon"],
  ["admin-bonus-rules"],
  ["admin-live-betting-sections"],
  ["admin-providers"],
  ["admin-categories"],
  ["admin-games"],
];

export default function PowerhouseCleanData() {
  const queryClient = useQueryClient();
  const { data: catalog, isLoading, isError } = useQuery({
    queryKey: ["powerhouse-clean-data-catalog"],
    queryFn: getCleanDataCatalog,
  });

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const models = catalog?.models ?? [];

  useEffect(() => {
    if (!models.length) return;
    setSelected((prev) => {
      const next = { ...prev };
      for (const m of models) {
        if (next[m.id] === undefined) next[m.id] = false;
      }
      return next;
    });
  }, [models]);

  const applyPreset = useCallback(
    (presetId: PresetId) => {
      const preset = catalog?.presets?.[presetId];
      if (!preset || !models.length) return;
      const set = new Set(preset);
      const next: Record<string, boolean> = {};
      for (const m of models) {
        next[m.id] = set.has(m.id);
      }
      setSelected(next);
    },
    [catalog?.presets, models],
  );

  const selectedIds = useMemo(() => models.filter((m) => selected[m.id]).map((m) => m.id), [models, selected]);
  const selectedLabels = useMemo(
    () => models.filter((m) => selected[m.id]).map((m) => m.label),
    [models, selected],
  );

  const mutation = useMutation({
    mutationFn: executeCleanData,
    onSuccess: (res) => {
      const counts = (res as { deleted_counts?: Record<string, number> })?.deleted_counts ?? {};
      const parts = Object.entries(counts)
        .filter(([, n]) => n > 0)
        .map(([k, n]) => `${k}: ${n}`);
      toast({
        title: "Clean data completed",
        description: parts.length ? parts.join(" · ") : "Done.",
      });
      for (const key of INVALIDATION_KEYS) {
        queryClient.invalidateQueries({ queryKey: key });
      }
      setWizardOpen(false);
      setStep(1);
      setPin("");
      setPassword("");
      setConfirmText("");
    },
    onError: (err: unknown) => {
      const e = err as { detail?: string; message?: string };
      toast({ title: e?.detail ?? e?.message ?? "Request failed", variant: "destructive" });
    },
  });

  const openWizard = () => {
    setStep(1);
    setPin("");
    setPassword("");
    setConfirmText("");
    setWizardOpen(true);
  };

  const canProceedStep1 = pin.length >= 4;
  const canProceedStep2 = password.length > 0;
  const canExecute = confirmText.trim().toUpperCase() === "DELETE";

  const handleExecute = () => {
    mutation.mutate({ pin, password, models: selectedIds });
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading clean data options…</p>;
  }
  if (isError || !catalog) {
    return <p className="text-sm text-destructive">Could not load clean data catalog.</p>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-display font-bold text-xl">Clean Data</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Remove operational and CMS data in one transaction. Games, categories, and providers are never deleted. Your powerhouse account stays.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Clean under</CardTitle>
          <CardDescription>Preset chips only change the switches below — nothing runs until you confirm in the wizard.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(Object.keys(PRESET_LABELS) as PresetId[]).map((id) => (
            <Button key={id} type="button" variant="outline" size="sm" className="rounded-full" onClick={() => applyPreset(id)}>
              {PRESET_LABELS[id]}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Models to clear</CardTitle>
          <CardDescription>
            {selectedIds.length} selected · Execution order is fixed server-side for foreign-key safety.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-[min(52vh,28rem)] overflow-y-auto rounded-md border border-border divide-y divide-border">
            {models.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span className="text-sm">{m.label}</span>
                <Switch checked={!!selected[m.id]} onCheckedChange={(v) => setSelected((s) => ({ ...s, [m.id]: v }))} />
              </div>
            ))}
            {(catalog.protected ?? []).map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 px-3 py-2.5 bg-muted/30">
                <div>
                  <span className="text-sm text-muted-foreground">{p.label}</span>
                  <p className="text-[11px] text-muted-foreground">{p.helper}</p>
                </div>
                <Switch checked={false} disabled className="opacity-50" />
              </div>
            ))}
          </div>

          <Button
            variant="destructive"
            className="w-full sm:w-auto"
            disabled={selectedIds.length === 0}
            onClick={openWizard}
          >
            Clean Data…
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={wizardOpen}
        onOpenChange={(o) => {
          if (!o && !mutation.isPending) {
            setWizardOpen(false);
            setStep(1);
            setPin("");
            setPassword("");
            setConfirmText("");
          }
        }}
      >
        <DialogContent className="max-w-md border-destructive/30">
          <DialogHeader>
            <DialogTitle className="font-display text-destructive">Confirm clean data</DialogTitle>
          </DialogHeader>

          <div className="flex gap-1.5 justify-center mb-2">
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className={cn(
                  "h-1.5 flex-1 rounded-full max-w-[4rem]",
                  step >= n ? "bg-destructive" : "bg-muted",
                )}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Step 1 of 3 — enter your account PIN.</p>
              <PasswordInput
                maxLength={6}
                placeholder="PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="text-center text-lg tracking-widest"
                autoComplete="one-time-code"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Step 2 of 3 — enter your account password.</p>
              <PasswordInput
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-destructive">This cannot be undone.</p>
              <ul className="text-xs text-muted-foreground list-disc pl-4 max-h-32 overflow-y-auto space-y-0.5">
                {selectedLabels.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <p className="text-sm">Type <span className="font-mono font-semibold">DELETE</span> to confirm.</p>
              <Input
                placeholder="Type DELETE"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                autoComplete="off"
                className="font-mono"
              />
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2 flex-col sm:flex-row">
            {step > 1 && (
              <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            )}
            {step < 3 && (
              <Button
                type="button"
                className="gold-gradient text-primary-foreground"
                disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
                onClick={() => setStep((s) => s + 1)}
              >
                Next
              </Button>
            )}
            {step === 3 && (
              <Button type="button" variant="destructive" disabled={!canExecute || mutation.isPending} onClick={handleExecute}>
                {mutation.isPending ? "Working…" : "Execute clean"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
