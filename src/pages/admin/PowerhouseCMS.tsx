import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { getCmsPages, createCmsPage } from "@/api/admin";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { toast } from "@/hooks/use-toast";

const PowerhouseCMS = () => {
  const queryClient = useQueryClient();
  const { data: cmsPages = [] } = useQuery({ queryKey: ["admin-cms"], queryFn: getCmsPages });
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [isHeader, setIsHeader] = useState(false);
  const [isFooter, setIsFooter] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setContent("");
    setIsHeader(false);
    setIsFooter(true);
    setIsActive(true);
  };

  const columns = [
    { header: "Title", accessor: (row: Record<string, unknown>) => String(row.title ?? "") },
    { header: "Slug", accessor: (row: Record<string, unknown>) => String(row.slug ?? "") },
    { header: "Header", accessor: (row: Record<string, unknown>) => row.is_header ? "Yes" : "No" },
    { header: "Footer", accessor: (row: Record<string, unknown>) => row.is_footer ? "Yes" : "No" },
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
    const t = title.trim();
    const s = slug.trim().toLowerCase().replace(/\s+/g, "-");
    if (!t || !s) {
      toast({ title: "Title and Slug are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await createCmsPage({ title: t, slug: s, content: content.trim(), is_header: isHeader, is_footer: isFooter, is_active: isActive });
      queryClient.invalidateQueries({ queryKey: ["admin-cms"] });
      toast({ title: "CMS page created successfully." });
      resetForm();
      setCreateOpen(false);
    } catch (e) {
      const msg = (e as { detail?: string })?.detail ?? "Failed to create CMS page";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl">CMS Pages</h2>
      <DataTable data={cmsPages as Record<string, unknown>[]} columns={columns} searchKey="title" onAdd={() => setCreateOpen(true)} addLabel="Add Page" />
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-display">Add CMS Page</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Page Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Slug (e.g., about-us)" value={slug} onChange={(e) => setSlug(e.target.value)} />
            <Textarea placeholder="Page Content" rows={5} value={content} onChange={(e) => setContent(e.target.value)} />
            <div className="flex items-center justify-between">
              <span className="text-sm">Show in Header</span>
              <Switch checked={isHeader} onCheckedChange={setIsHeader} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Show in Footer</span>
              <Switch checked={isFooter} onCheckedChange={setIsFooter} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Active</span>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
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

export default PowerhouseCMS;
