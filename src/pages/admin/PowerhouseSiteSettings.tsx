import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getSiteSettingsAdmin, updateSiteSettings, updateSiteSettingsForm, getSliderSlidesAdmin, createSliderSlide, updateSliderSlide, deleteSliderSlide, getLiveBettingSectionsAdmin, createLiveBettingSection, updateLiveBettingSection, deleteLiveBettingSection, createLiveBettingEvent, updateLiveBettingEvent, deleteLiveBettingEvent } from "@/api/admin";
import { toast } from "@/hooks/use-toast";
import { getMediaUrl } from "@/lib/api";
import { ChevronUp, ChevronDown, Trash2, Plus, ChevronRight, Tag, Box, Gamepad2, Gift, FileText, Star, Settings } from "lucide-react";

export interface LiveBettingEventAdmin {
  id: number;
  section: number;
  sport?: string;
  team1: string;
  team2: string;
  event_date?: string;
  event_time?: string;
  odds: number[];
  is_live?: boolean;
  order?: number;
}

export interface LiveBettingSectionAdmin {
  id: number;
  title: string;
  order: number;
  events: LiveBettingEventAdmin[];
}

export interface SliderSlideAdmin {
  id: number;
  title: string;
  subtitle?: string;
  image?: string;
  cta_label: string;
  cta_link: string;
  order: number;
}

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
  const { data: sliderSlidesApi = [], refetch: refetchSlider } = useQuery({
    queryKey: ["admin-slider-slides"],
    queryFn: getSliderSlidesAdmin,
  });
  const sliderSlides = (sliderSlidesApi as SliderSlideAdmin[]).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const [sliderSaving, setSliderSaving] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<number | null>(null);
  const { data: liveBettingSectionsApi = [], refetch: refetchLiveBetting } = useQuery({
    queryKey: ["admin-live-betting-sections"],
    queryFn: getLiveBettingSectionsAdmin,
  });
  const liveBettingSections = (liveBettingSectionsApi as LiveBettingSectionAdmin[]).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const [liveBettingSaving, setLiveBettingSaving] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [addingEventSectionId, setAddingEventSectionId] = useState<number | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLogoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

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
      if (logoFile) {
        const formData = new FormData();
        formData.set("name", name.trim());
        formData.set("phone1", phone1.trim());
        formData.set("phone2", phone2.trim());
        formData.set("email1", email1.trim());
        formData.set("whatsapp_number", whatsappNumber.trim());
        formData.set("hero_title", heroTitle.trim());
        formData.set("hero_subtitle", heroSubtitle.trim());
        formData.set("footer_description", footerDescription.trim());
        formData.set("promo_banners", JSON.stringify(promoBanners));
        formData.set("logo", logoFile);
        await updateSiteSettingsForm(formData);
      } else {
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
      }
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

  const handleSliderAdd = async () => {
    setSliderSaving(true);
    try {
      await createSliderSlide({
        title: "New Slide",
        subtitle: "",
        image: "",
        cta_label: "Join Now",
        cta_link: "/register",
        order: sliderSlides.length,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-slider-slides"] });
      queryClient.invalidateQueries({ queryKey: ["sliderSlides"] });
      toast({ title: "Slide added." });
    } catch (e) {
      const msg = (e as { detail?: string })?.detail ?? "Failed to add slide";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSliderSaving(false);
    }
  };

  const handleSliderUpdate = async (id: number, data: Partial<SliderSlideAdmin>) => {
    setSliderSaving(true);
    try {
      await updateSliderSlide(id, data);
      queryClient.invalidateQueries({ queryKey: ["admin-slider-slides"] });
      queryClient.invalidateQueries({ queryKey: ["sliderSlides"] });
      setEditingSlideId(null);
      toast({ title: "Slide updated." });
    } catch (e) {
      const msg = (e as { detail?: string })?.detail ?? "Failed to update";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSliderSaving(false);
    }
  };

  const handleSliderDelete = async (id: number) => {
    if (!confirm("Delete this slide?")) return;
    setSliderSaving(true);
    try {
      await deleteSliderSlide(id);
      queryClient.invalidateQueries({ queryKey: ["admin-slider-slides"] });
      queryClient.invalidateQueries({ queryKey: ["sliderSlides"] });
      setEditingSlideId(null);
      toast({ title: "Slide deleted." });
    } catch (e) {
      const msg = (e as { detail?: string })?.detail ?? "Failed to delete";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSliderSaving(false);
    }
  };

  const handleSliderReorder = async (index: number, direction: "up" | "down") => {
    const slide = sliderSlides[index];
    if (!slide) return;
    const newOrder = direction === "up" ? index - 1 : index + 1;
    if (newOrder < 0 || newOrder >= sliderSlides.length) return;
    const other = sliderSlides[newOrder];
    if (!other) return;
    setSliderSaving(true);
    try {
      await Promise.all([
        updateSliderSlide(slide.id, { order: newOrder }),
        updateSliderSlide(other.id, { order: index }),
      ]);
      queryClient.invalidateQueries({ queryKey: ["admin-slider-slides"] });
      queryClient.invalidateQueries({ queryKey: ["sliderSlides"] });
      toast({ title: "Order updated." });
    } catch (e) {
      const msg = (e as { detail?: string })?.detail ?? "Failed to reorder";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSliderSaving(false);
    }
  };

  const handleLiveBettingAddSection = async () => {
    setLiveBettingSaving(true);
    try {
      await createLiveBettingSection({ title: "New Section", order: liveBettingSections.length });
      queryClient.invalidateQueries({ queryKey: ["admin-live-betting-sections"] });
      queryClient.invalidateQueries({ queryKey: ["liveBettingSections"] });
      toast({ title: "Section added." });
    } catch (e) {
      const msg = (e as { detail?: string })?.detail ?? "Failed to add section";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setLiveBettingSaving(false);
    }
  };

  const handleLiveBettingUpdateSection = async (id: number, data: { title?: string }) => {
    setLiveBettingSaving(true);
    try {
      await updateLiveBettingSection(id, data);
      queryClient.invalidateQueries({ queryKey: ["admin-live-betting-sections"] });
      queryClient.invalidateQueries({ queryKey: ["liveBettingSections"] });
      setEditingSectionId(null);
      toast({ title: "Section updated." });
    } catch (e) {
      const msg = (e as { detail?: string })?.detail ?? "Failed to update";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setLiveBettingSaving(false);
    }
  };

  const handleLiveBettingDeleteSection = async (id: number) => {
    if (!confirm("Delete this section and all its events?")) return;
    setLiveBettingSaving(true);
    try {
      await deleteLiveBettingSection(id);
      queryClient.invalidateQueries({ queryKey: ["admin-live-betting-sections"] });
      queryClient.invalidateQueries({ queryKey: ["liveBettingSections"] });
      setEditingSectionId(null);
      setAddingEventSectionId(null);
      toast({ title: "Section deleted." });
    } catch (e) {
      const msg = (e as { detail?: string })?.detail ?? "Failed to delete";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setLiveBettingSaving(false);
    }
  };

  const handleLiveBettingAddEvent = async (sectionId: number, data: { team1: string; team2: string; sport?: string; event_date?: string; event_time?: string; odds?: number[]; is_live?: boolean }) => {
    setLiveBettingSaving(true);
    try {
      await createLiveBettingEvent({ section: sectionId, ...data });
      queryClient.invalidateQueries({ queryKey: ["admin-live-betting-sections"] });
      queryClient.invalidateQueries({ queryKey: ["liveBettingSections"] });
      setAddingEventSectionId(null);
      toast({ title: "Event added." });
    } catch (e) {
      const msg = (e as { detail?: string })?.detail ?? "Failed to add event";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setLiveBettingSaving(false);
    }
  };

  const handleLiveBettingUpdateEvent = async (id: number, data: Partial<LiveBettingEventAdmin>) => {
    setLiveBettingSaving(true);
    try {
      await updateLiveBettingEvent(id, data);
      queryClient.invalidateQueries({ queryKey: ["admin-live-betting-sections"] });
      queryClient.invalidateQueries({ queryKey: ["liveBettingSections"] });
      setEditingEventId(null);
      toast({ title: "Event updated." });
    } catch (e) {
      const msg = (e as { detail?: string })?.detail ?? "Failed to update";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setLiveBettingSaving(false);
    }
  };

  const handleLiveBettingDeleteEvent = async (id: number) => {
    if (!confirm("Delete this event?")) return;
    setLiveBettingSaving(true);
    try {
      await deleteLiveBettingEvent(id);
      queryClient.invalidateQueries({ queryKey: ["admin-live-betting-sections"] });
      queryClient.invalidateQueries({ queryKey: ["liveBettingSections"] });
      setEditingEventId(null);
      toast({ title: "Event deleted." });
    } catch (e) {
      const msg = (e as { detail?: string })?.detail ?? "Failed to delete";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setLiveBettingSaving(false);
    }
  };

  const quickLinks = [
    { label: "Categories", path: "/powerhouse/categories", icon: Tag },
    { label: "Providers", path: "/powerhouse/providers", icon: Box },
    { label: "Games", path: "/powerhouse/games", icon: Gamepad2 },
    { label: "Bonus Rules", path: "/powerhouse/bonus-rules", icon: Gift },
    { label: "CMS Pages", path: "/powerhouse/cms", icon: FileText },
    { label: "Testimonials", path: "/powerhouse/testimonials", icon: Star },
    { label: "Super Settings", path: "/powerhouse/super-settings", icon: Settings },
  ];

  return (
    <div className="space-y-4 max-w-lg">
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-display">Manage content</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <p className="text-xs text-muted-foreground mb-3">Quick links to listing and manage each section.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {quickLinks.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button type="button" variant="outline" className="w-full justify-start gap-2 h-9 text-sm">
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
      <h2 className="font-display font-bold text-xl">Site Settings</h2>
      <Card>
        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm font-display">General</CardTitle></CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div><label className="text-xs text-muted-foreground">Site Name</label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Logo (upload image)</label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-sm file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-muted file:text-sm"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            />
            {(logoPreviewUrl || (logo && logo.trim())) && (
              <div className="mt-2 rounded-lg border border-border overflow-hidden bg-muted/30 w-20 h-20">
                <img
                  src={logoPreviewUrl ?? getMediaUrl(logo.trim())}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
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
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-display">Slider (second home)</CardTitle>
          <Button type="button" size="sm" variant="outline" onClick={handleSliderAdd} disabled={sliderSaving}>
            <Plus className="h-4 w-4 mr-1" /> Add slide
          </Button>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <p className="text-xs text-muted-foreground">Slides for the second home page slider. When empty, the second home falls back to Promo Banners above.</p>
          {sliderSlides.length === 0 && <p className="text-xs text-muted-foreground">No slides. Add a slide to show on the second home page.</p>}
          {sliderSlides.map((slide, i) => (
            <div key={slide.id} className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">Slide {i + 1}</span>
                <div className="flex gap-1">
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8" disabled={i === 0} onClick={() => handleSliderReorder(i, "up")}><ChevronUp className="h-4 w-4" /></Button>
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8" disabled={i === sliderSlides.length - 1} onClick={() => handleSliderReorder(i, "down")}><ChevronDown className="h-4 w-4" /></Button>
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleSliderDelete(slide.id)} disabled={sliderSaving}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              {editingSlideId === slide.id ? (
                <>
                  <div><label className="text-xs text-muted-foreground">Title</label><Input defaultValue={slide.title} id={`st-${slide.id}`} placeholder="Title" /></div>
                  <div><label className="text-xs text-muted-foreground">Subtitle</label><Input defaultValue={slide.subtitle ?? ""} id={`ss-${slide.id}`} placeholder="Subtitle" /></div>
                  <div><label className="text-xs text-muted-foreground">Image (path or URL)</label><Input defaultValue={slide.image ?? ""} id={`si-${slide.id}`} placeholder="Optional" /></div>
                  <div><label className="text-xs text-muted-foreground">CTA Label</label><Input defaultValue={slide.cta_label ?? "Join Now"} id={`sc-${slide.id}`} placeholder="Join Now" /></div>
                  <div><label className="text-xs text-muted-foreground">CTA Link</label><Input defaultValue={slide.cta_link ?? "/register"} id={`sl-${slide.id}`} placeholder="/register" /></div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => { const t = (document.getElementById(`st-${slide.id}`) as HTMLInputElement)?.value; const s = (document.getElementById(`ss-${slide.id}`) as HTMLInputElement)?.value; const im = (document.getElementById(`si-${slide.id}`) as HTMLInputElement)?.value; const c = (document.getElementById(`sc-${slide.id}`) as HTMLInputElement)?.value; const l = (document.getElementById(`sl-${slide.id}`) as HTMLInputElement)?.value; handleSliderUpdate(slide.id, { title: t, subtitle: s, image: im, cta_label: c, cta_link: l }); }}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingSlideId(null)}>Cancel</Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium">{slide.title || "(No title)"}</p>
                  {slide.subtitle && <p className="text-xs text-muted-foreground">{slide.subtitle}</p>}
                  <Button size="sm" variant="outline" onClick={() => setEditingSlideId(slide.id)}>Edit</Button>
                </>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-display">Live Betting (second home)</CardTitle>
          <Button type="button" size="sm" variant="outline" onClick={handleLiveBettingAddSection} disabled={liveBettingSaving}>
            <Plus className="h-4 w-4 mr-1" /> Add section
          </Button>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <p className="text-xs text-muted-foreground">Sections and events shown in the Live Betting block on the second home page. When empty, mock data is shown.</p>
          {liveBettingSections.length === 0 && <p className="text-xs text-muted-foreground">No sections. Add a section (e.g. Cricket, Football) then add events.</p>}
          {liveBettingSections.map((sec) => (
            <div key={sec.id} className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                {editingSectionId === sec.id ? (
                  <div className="flex gap-2 flex-1">
                    <Input id={`lb-sec-title-${sec.id}`} defaultValue={sec.title} placeholder="Section title" className="flex-1" />
                    <Button size="sm" onClick={() => handleLiveBettingUpdateSection(sec.id, { title: (document.getElementById(`lb-sec-title-${sec.id}`) as HTMLInputElement)?.value ?? "" })}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingSectionId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <ChevronRight className="h-4 w-4" /> {sec.title || "(No title)"}
                    </span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditingSectionId(sec.id)}>Edit</Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleLiveBettingDeleteSection(sec.id)} disabled={liveBettingSaving}>Delete</Button>
                      <Button size="sm" variant="outline" onClick={() => setAddingEventSectionId(addingEventSectionId === sec.id ? null : sec.id)}><Plus className="h-3 w-3 mr-1" /> Event</Button>
                    </div>
                  </>
                )}
              </div>
              {addingEventSectionId === sec.id && (
                <div className="rounded bg-muted/50 p-2 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <Input id={`lb-ev-team1-${sec.id}`} placeholder="Team 1" />
                    <Input id={`lb-ev-team2-${sec.id}`} placeholder="Team 2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input id={`lb-ev-sport-${sec.id}`} placeholder="Sport (optional)" />
                    <Input id={`lb-ev-date-${sec.id}`} placeholder="Date e.g. 19 Mar 2026" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input id={`lb-ev-time-${sec.id}`} placeholder="Time e.g. 23:00" />
                    <Input id={`lb-ev-odds-${sec.id}`} placeholder="Odds e.g. 1.92,1.92,2.1" />
                  </div>
                  <div className="flex gap-2 items-center">
                    <label className="flex items-center gap-1 text-xs"><input type="checkbox" id={`lb-ev-live-${sec.id}`} /> Live</label>
                    <Button size="sm" onClick={() => { const t1 = (document.getElementById(`lb-ev-team1-${sec.id}`) as HTMLInputElement)?.value?.trim(); const t2 = (document.getElementById(`lb-ev-team2-${sec.id}`) as HTMLInputElement)?.value?.trim(); if (!t1 || !t2) { toast({ title: "Team 1 and Team 2 required", variant: "destructive" }); return; } const oddsStr = (document.getElementById(`lb-ev-odds-${sec.id}`) as HTMLInputElement)?.value?.trim(); const odds = oddsStr ? oddsStr.split(",").map((n) => parseFloat(n.trim())).filter((n) => !Number.isNaN(n)) : []; handleLiveBettingAddEvent(sec.id, { team1: t1, team2: t2, sport: (document.getElementById(`lb-ev-sport-${sec.id}`) as HTMLInputElement)?.value?.trim() || undefined, event_date: (document.getElementById(`lb-ev-date-${sec.id}`) as HTMLInputElement)?.value?.trim() || undefined, event_time: (document.getElementById(`lb-ev-time-${sec.id}`) as HTMLInputElement)?.value?.trim() || undefined, odds: odds.length ? odds : undefined, is_live: (document.getElementById(`lb-ev-live-${sec.id}`) as HTMLInputElement)?.checked }); }}>Add event</Button>
                    <Button size="sm" variant="outline" onClick={() => setAddingEventSectionId(null)}>Cancel</Button>
                  </div>
                </div>
              )}
              <ul className="text-xs space-y-1 pl-4">
                {(sec.events ?? []).map((ev) => (
                  <li key={ev.id} className="flex items-center justify-between gap-2 py-1 border-b border-border/50 last:border-0">
                    {editingEventId === ev.id ? (
                      <div className="flex flex-wrap gap-2 items-center flex-1">
                        <Input id={`lb-ed-team1-${ev.id}`} defaultValue={ev.team1} placeholder="Team 1" className="w-24" />
                        <Input id={`lb-ed-team2-${ev.id}`} defaultValue={ev.team2} placeholder="Team 2" className="w-24" />
                        <Input id={`lb-ed-odds-${ev.id}`} defaultValue={ev.odds?.join(", ")} placeholder="Odds" className="w-28" />
                        <Button size="sm" onClick={() => { const t1 = (document.getElementById(`lb-ed-team1-${ev.id}`) as HTMLInputElement)?.value; const t2 = (document.getElementById(`lb-ed-team2-${ev.id}`) as HTMLInputElement)?.value; const o = (document.getElementById(`lb-ed-odds-${ev.id}`) as HTMLInputElement)?.value; handleLiveBettingUpdateEvent(ev.id, { team1: t1, team2: t2, odds: o ? o.split(",").map((n) => parseFloat(n.trim())).filter((n) => !Number.isNaN(n)) : [] }); }}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingEventId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <>
                        <span>{ev.team1} vs {ev.team2} {ev.event_date && `(${ev.event_date} ${ev.event_time ?? ""})`} {ev.is_live && "(Live)"}</span>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setEditingEventId(ev.id)}>Edit</Button>
                          <Button size="sm" variant="ghost" className="h-6 text-xs text-destructive" onClick={() => handleLiveBettingDeleteEvent(ev.id)}>Delete</Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
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
