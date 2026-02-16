import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getSiteSettingsAdmin } from "@/api/admin";

const PowerhouseSiteSettings = () => {
  const { data: siteSettings } = useQuery({ queryKey: ["admin-site-settings"], queryFn: getSiteSettingsAdmin });
  const s = (siteSettings ?? {}) as Record<string, unknown>;
  const phones = (s.phones as string[]) ?? [];
  const emails = (s.emails as string[]) ?? [];
  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="font-display font-bold text-xl">Site Settings</h2>
      <Card>
        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm font-display">General</CardTitle></CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div><label className="text-xs text-muted-foreground">Site Name</label><Input defaultValue={String(s.name ?? "")} /></div>
          <div><label className="text-xs text-muted-foreground">Logo URL</label><Input defaultValue={String(s.logo ?? "")} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm font-display">Contact</CardTitle></CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div><label className="text-xs text-muted-foreground">Phone 1</label><Input defaultValue={phones[0] ?? ""} /></div>
          <div><label className="text-xs text-muted-foreground">Phone 2</label><Input defaultValue={phones[1] ?? ""} /></div>
          <div><label className="text-xs text-muted-foreground">Email</label><Input defaultValue={emails[0] ?? ""} /></div>
          <div><label className="text-xs text-muted-foreground">WhatsApp</label><Input defaultValue={String(s.whatsapp_number ?? "")} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm font-display">Hero Section</CardTitle></CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div><label className="text-xs text-muted-foreground">Hero Title</label><Input defaultValue={String(s.hero_title ?? "")} /></div>
          <div><label className="text-xs text-muted-foreground">Hero Subtitle</label><Input defaultValue={String(s.hero_subtitle ?? "")} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm font-display">Footer</CardTitle></CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div><label className="text-xs text-muted-foreground">Footer Description</label><Input defaultValue={String(s.footer_description ?? "")} /></div>
        </CardContent>
      </Card>

      <Button className="gold-gradient text-primary-foreground font-display w-full">Save Settings</Button>
    </div>
  );
};

export default PowerhouseSiteSettings;
