import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [whatsappSecretKey, setWhatsappSecretKey] = useState("");
  const [whatsappVerifyToken, setWhatsappVerifyToken] = useState("");
  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState("");
  const [whatsappApiVersion, setWhatsappApiVersion] = useState("v22.0");
  const [whatsappOtpTemplateName, setWhatsappOtpTemplateName] = useState("");
  const [whatsappOtpTemplateLanguage, setWhatsappOtpTemplateLanguage] = useState("en_US");
  const [whatsappOtpTemplateBodyParam, setWhatsappOtpTemplateBodyParam] = useState(false);
  const [flexgrewApiKey, setFlexgrewApiKey] = useState("");
  const [flexgrewBaseUrl, setFlexgrewBaseUrl] = useState("");
  const [flexgrewOtpTemplateId, setFlexgrewOtpTemplateId] = useState("");
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
    setWhatsappSecretKey(String(s.whatsapp_secret_key ?? ""));
    setWhatsappVerifyToken(String(s.whatsapp_verify_token ?? ""));
    setWhatsappPhoneNumberId(String(s.whatsapp_phone_number_id ?? ""));
    setWhatsappApiVersion(String(s.whatsapp_api_version ?? "v22.0") || "v22.0");
    setWhatsappOtpTemplateName(String(s.whatsapp_otp_template_name ?? ""));
    setWhatsappOtpTemplateLanguage(String(s.whatsapp_otp_template_language ?? "en_US") || "en_US");
    setWhatsappOtpTemplateBodyParam(s.whatsapp_otp_template_body_param === true);
    setFlexgrewApiKey(String(s.flexgrew_api_key ?? ""));
    setFlexgrewBaseUrl(String(s.flexgrew_base_url ?? ""));
    setFlexgrewOtpTemplateId(
      s.flexgrew_otp_template_id != null && s.flexgrew_otp_template_id !== "" ? String(s.flexgrew_otp_template_id) : ""
    );
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
    const tidRaw = flexgrewOtpTemplateId.trim();
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
        whatsapp_secret_key: whatsappSecretKey.trim(),
        whatsapp_verify_token: whatsappVerifyToken.trim(),
        whatsapp_phone_number_id: whatsappPhoneNumberId.trim(),
        whatsapp_api_version: whatsappApiVersion.trim() || "v22.0",
        whatsapp_otp_template_name: whatsappOtpTemplateName.trim(),
        whatsapp_otp_template_language: whatsappOtpTemplateLanguage.trim() || "en_US",
        whatsapp_otp_template_body_param: whatsappOtpTemplateBodyParam,
        flexgrew_api_key: flexgrewApiKey.trim(),
        flexgrew_base_url: flexgrewBaseUrl.trim(),
        flexgrew_otp_template_id: tidRaw === "" ? null : tidRaw,
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

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-display">WhatsApp OTP (Meta Cloud API)</CardTitle>
          <div className="text-xs text-muted-foreground font-normal pt-1 space-y-2">
            <p>
              Used when players choose WhatsApp on register or forgot password. Paste your Meta token and Phone number ID
              from{" "}
              <a
                href="https://developers.facebook.com/apps/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                developers.facebook.com
              </a>
              .
            </p>
            <p>
              <strong className="text-foreground font-medium">Easy start:</strong> template name <code className="text-[11px] bg-muted px-1 rounded">hello_world</code>, language{" "}
              <code className="text-[11px] bg-muted px-1 rounded">en_US</code>, leave the checkbox below <strong>off</strong> — this sends a test message and avoids Meta errors. Players on the main site then get the real code by SMS automatically until you set up a custom template.
            </p>
            <p>
              <strong className="text-foreground font-medium">Real code inside WhatsApp:</strong> in Meta Business Suite create a template whose body includes one variable (e.g. &quot;Your code is {"{{1}}"}&quot;), wait for approval, enter that template name here, and turn the checkbox <strong>on</strong>.
            </p>
            <p>
              <strong className="text-foreground font-medium">Webhook URL (Meta Dashboard):</strong>{" "}
              <code className="text-[11px] bg-muted px-1 rounded break-all">https://&lt;your-domain&gt;/webhook/whatsapp/</code> — same verify token as below.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Access token (Bearer)</label>
            <Input
              value={whatsappSecretKey}
              onChange={(e) => setWhatsappSecretKey(e.target.value)}
              type="password"
              autoComplete="off"
              placeholder="Long-lived token from Meta"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Webhook verify token</label>
            <Input
              value={whatsappVerifyToken}
              onChange={(e) => setWhatsappVerifyToken(e.target.value)}
              type="password"
              autoComplete="off"
              placeholder="Any secret you choose — must match Meta → WhatsApp → Webhook"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Phone number ID</label>
            <Input
              value={whatsappPhoneNumberId}
              onChange={(e) => setWhatsappPhoneNumberId(e.target.value)}
              placeholder="e.g. 1080066288522498"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Graph API version</label>
            <Input value={whatsappApiVersion} onChange={(e) => setWhatsappApiVersion(e.target.value)} placeholder="v22.0" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">OTP template name</label>
            <Input value={whatsappOtpTemplateName} onChange={(e) => setWhatsappOtpTemplateName(e.target.value)} placeholder="hello_world or your_approved_template" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Template language code</label>
            <Input value={whatsappOtpTemplateLanguage} onChange={(e) => setWhatsappOtpTemplateLanguage(e.target.value)} placeholder="en_US" />
          </div>
          <label className="flex items-start gap-2 cursor-pointer text-sm leading-snug">
            <Checkbox
              className="mt-0.5"
              checked={whatsappOtpTemplateBodyParam}
              onCheckedChange={(v) => setWhatsappOtpTemplateBodyParam(v === true)}
            />
            <span>
              Put the 6-digit code in the message (required for custom templates with one body variable). Leave off for{" "}
              <code className="text-[11px] bg-muted px-1 rounded">hello_world</code>.
            </span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-display">Flexgrew (WhatsApp fallback)</CardTitle>
          <p className="text-xs text-muted-foreground font-normal pt-1">
            Used when Meta is not configured, or when Meta token fails (then OTP is sent via Flexgrew). Base URL defaults
            to <code className="text-[11px] bg-muted px-1 rounded">https://flexgrew.cloud/api</code>; you may use{" "}
            <code className="text-[11px] bg-muted px-1 rounded">https://flexgrew.cloud</code> (the <code className="text-[11px] bg-muted px-1 rounded">/api</code> path is added automatically). For cold OTP outside the 24h window, set an OTP template ID from Flexgrew (GET /api/templates); variable{" "}
            <code className="text-[11px] bg-muted px-1 rounded">1</code> receives the 6-digit code.
          </p>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Flexgrew API key</label>
            <Input
              value={flexgrewApiKey}
              onChange={(e) => setFlexgrewApiKey(e.target.value)}
              type="password"
              autoComplete="off"
              placeholder="Bearer token from Flexgrew"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Base URL (optional)</label>
            <p className="text-[11px] text-muted-foreground mb-1">
              Must point at the JSON API root (usually ends with <code className="bg-muted px-1 rounded">/api</code>). Leave empty for the default.
            </p>
            <Input
              value={flexgrewBaseUrl}
              onChange={(e) => setFlexgrewBaseUrl(e.target.value)}
              placeholder="https://flexgrew.cloud/api"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">OTP template ID (optional)</label>
            <Input
              value={flexgrewOtpTemplateId}
              onChange={(e) => setFlexgrewOtpTemplateId(e.target.value)}
              placeholder="e.g. 15 — uses POST .../chats/:uuid/template"
              inputMode="numeric"
            />
          </div>
        </CardContent>
      </Card>

      <Button className="gold-gradient text-primary-foreground font-display w-full" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Settings"}</Button>
    </div>
  );
};

export default PowerhouseSuperSettings;
