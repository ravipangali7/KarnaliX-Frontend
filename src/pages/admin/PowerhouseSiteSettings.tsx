import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getSiteSettingsAdmin, updateSiteSettings } from "@/api/admin";
import { toast } from "@/hooks/use-toast";
import { ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";

export interface PromoBannerSlide {
  title?: string;
  subtitle?: string;
  image?: string;
  cta_label?: string;
  cta_link?: string;
}

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
  const [promoBanners, setPromoBanners] = useState<PromoBannerSlide[]>([]);
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
    const banners = s.promo_banners as PromoBannerSlide[] | undefined;
    setPromoBanners(Array.isArray(banners) ? banners.map((b) => ({ ...b })) : []);
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
        promo_banners: promoBanners,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["siteSetting"] });
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
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-display">Slider / Promo Banners</CardTitle>
          <Button type="button" size="sm" variant="outline" onClick={() => setPromoBanners((p) => [...p, { title: "", subtitle: "", image: "", cta_label: "Join Now", cta_link: "/register" }])}>
            <Plus className="h-4 w-4 mr-1" /> Add slide
          </Button>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          {promoBanners.length === 0 && <p className="text-xs text-muted-foreground">No slides. Add a slide to show on the second home page slider.</p>}
          {promoBanners.map((slide, i) => (
            <div key={i} className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">Slide {i + 1}</span>
                <div className="flex gap-1">
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8" disabled={i === 0} onClick={() => setPromoBanners((p) => { const n = [...p]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n; })}><ChevronUp className="h-4 w-4" /></Button>
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8" disabled={i === promoBanners.length - 1} onClick={() => setPromoBanners((p) => { const n = [...p]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; return n; })}><ChevronDown className="h-4 w-4" /></Button>
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setPromoBanners((p) => p.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <div><label className="text-xs text-muted-foreground">Title</label><Input value={slide.title ?? ""} onChange={(e) => setPromoBanners((p) => { const n = [...p]; n[i] = { ...n[i], title: e.target.value }; return n; })} placeholder="e.g. CRICKET CHAMPIONSHIP" /></div>
              <div><label className="text-xs text-muted-foreground">Subtitle</label><Input value={slide.subtitle ?? ""} onChange={(e) => setPromoBanners((p) => { const n = [...p]; n[i] = { ...n[i], subtitle: e.target.value }; return n; })} placeholder="Join now and enjoy..." /></div>
              <div><label className="text-xs text-muted-foreground">Image (path or URL)</label><Input value={slide.image ?? ""} onChange={(e) => setPromoBanners((p) => { const n = [...p]; n[i] = { ...n[i], image: e.target.value }; return n; })} placeholder="Optional" /></div>
              <div><label className="text-xs text-muted-foreground">CTA Label</label><Input value={slide.cta_label ?? ""} onChange={(e) => setPromoBanners((p) => { const n = [...p]; n[i] = { ...n[i], cta_label: e.target.value }; return n; })} placeholder="Join Now" /></div>
              <div><label className="text-xs text-muted-foreground">CTA Link</label><Input value={slide.cta_link ?? ""} onChange={(e) => setPromoBanners((p) => { const n = [...p]; n[i] = { ...n[i], cta_link: e.target.value }; return n; })} placeholder="/register" /></div>
            </div>
          ))}
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
