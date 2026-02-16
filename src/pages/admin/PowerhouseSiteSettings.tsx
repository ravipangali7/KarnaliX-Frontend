import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getSiteSettingsAdmin, updateSiteSettings } from "@/api/admin";
import { toast } from "@/hooks/use-toast";

const PowerhouseSiteSettings = () => {
  const queryClient = useQueryClient();
  const { data: siteSettings } = useQuery({ queryKey: ["admin-site-settings"], queryFn: getSiteSettingsAdmin });
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [email1, setEmail1] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [footerDescription, setFooterDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const s = (siteSettings ?? {}) as Record<string, unknown>;
    const phones = (s.phones as string[]) ?? [];
    const emails = (s.emails as string[]) ?? [];
    setName(String(s.name ?? ""));
    setLogo(String(s.logo ?? ""));
    setPhone1(phones[0] ?? "");
    setPhone2(phones[1] ?? "");
    setEmail1(emails[0] ?? "");
    setWhatsappNumber(String(s.whatsapp_number ?? ""));
    setHeroTitle(String(s.hero_title ?? ""));
    setHeroSubtitle(String(s.hero_subtitle ?? ""));
    setFooterDescription(String(s.footer_description ?? ""));
  }, [siteSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSiteSettings({
        name: name.trim(),
        logo: logo.trim() || null,
        phones: [phone1.trim(), phone2.trim()].filter(Boolean),
        emails: [email1.trim()].filter(Boolean),
        whatsapp_number: whatsappNumber.trim(),
        hero_title: heroTitle.trim(),
        hero_subtitle: heroSubtitle.trim(),
        footer_description: footerDescription.trim(),
      });
      queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] });
      toast({ title: "Site settings saved." });
    } catch (e) {
      const msg = (e as { detail?: string })?.detail ?? "Failed to save settings";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="font-display font-bold text-xl">Site Settings</h2>
      <Card>
        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm font-display">General</CardTitle></CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div><label className="text-xs text-muted-foreground">Site Name</label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className="text-xs text-muted-foreground">Logo URL</label><Input value={logo} onChange={(e) => setLogo(e.target.value)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm font-display">Contact</CardTitle></CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div><label className="text-xs text-muted-foreground">Phone 1</label><Input value={phone1} onChange={(e) => setPhone1(e.target.value)} /></div>
          <div><label className="text-xs text-muted-foreground">Phone 2</label><Input value={phone2} onChange={(e) => setPhone2(e.target.value)} /></div>
          <div><label className="text-xs text-muted-foreground">Email</label><Input value={email1} onChange={(e) => setEmail1(e.target.value)} /></div>
          <div><label className="text-xs text-muted-foreground">WhatsApp</label><Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm font-display">Hero Section</CardTitle></CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div><label className="text-xs text-muted-foreground">Hero Title</label><Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} /></div>
          <div><label className="text-xs text-muted-foreground">Hero Subtitle</label><Input value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm font-display">Footer</CardTitle></CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div><label className="text-xs text-muted-foreground">Footer Description</label><Textarea value={footerDescription} onChange={(e) => setFooterDescription(e.target.value)} rows={2} /></div>
        </CardContent>
      </Card>

      <Button className="gold-gradient text-primary-foreground font-display w-full" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Settings"}</Button>
    </div>
  );
};

export default PowerhouseSiteSettings;
