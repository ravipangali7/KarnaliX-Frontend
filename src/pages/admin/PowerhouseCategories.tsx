import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { getCategoriesAdmin, createCategoryAdminForm, updateCategoryAdminForm } from "@/api/admin";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { toast } from "@/hooks/use-toast";
import { getMediaUrl } from "@/lib/api";
import { svgToImgSrc } from "@/lib/svg";

const PowerhouseCategories = () => {
  const queryClient = useQueryClient();
  const { data: gameCategories = [] } = useQuery({ queryKey: ["admin-categories"], queryFn: getCategoriesAdmin });
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [svg, setSvg] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Record<string, unknown> | null>(null);

  const resetForm = () => {
    setName("");
    setSvg("");
    setIsActive(true);
    setEditingCategory(null);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditingCategory(row);
    setName(String(row.name ?? ""));
    setSvg("");
    setIsActive(Boolean(row.is_active));
    setEditOpen(true);
  };

  const handleSvgFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setSvg(text);
    e.target.value = "";
  };

  const buildFormData = (n: string) => {
    const formData = new FormData();
    formData.set("name", n);
    formData.set("is_active", String(isActive));
    const code = svg.trim();
    if (code) {
      const blob = new Blob([code], { type: "image/svg+xml" });
      formData.set("svg", blob, "icon.svg");
    }
    return formData;
  };

  const columns = [
    {
      header: "Icon",
      accessor: (row: Record<string, unknown>) => {
        const svgVal = row.svg;
        if (svgVal && typeof svgVal === "string" && svgVal.trim()) {
          const trimmed = svgVal.trim();
          if (trimmed.startsWith("<svg")) {
            return <img src={svgToImgSrc(trimmed)} alt="" className="h-6 w-6 object-contain" />;
          }
          return <img src={getMediaUrl(trimmed)} alt="" className="h-6 w-6 object-contain" />;
        }
        return <span className="h-6 w-6 rounded bg-muted flex items-center justify-center text-[10px] text-muted-foreground">—</span>;
      },
    },
    { header: "Name", accessor: (row: Record<string, unknown>) => String(row.name ?? "") },
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
    if (!n) {
      toast({ title: "Category name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await createCategoryAdminForm(buildFormData(n));
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast({ title: "Category created successfully." });
      resetForm();
      setCreateOpen(false);
    } catch (e) {
      const msg = (e as { detail?: string })?.detail ?? "Failed to create category";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingCategory?.id) return;
    const n = name.trim();
    if (!n) {
      toast({ title: "Category name is required", variant: "destructive" });
      return;
    }
    const id = Number(editingCategory.id);
    setSaving(true);
    try {
      await updateCategoryAdminForm(id, buildFormData(n));
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast({ title: "Category updated successfully." });
      resetForm();
      setEditOpen(false);
    } catch (e) {
      const msg = (e as { detail?: string })?.detail ?? "Failed to update category";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl">Game Categories</h2>
      <DataTable data={gameCategories as Record<string, unknown>[]} columns={columns} searchKey="name" onAdd={() => setCreateOpen(true)} addLabel="Add Category" />
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Add Category</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Category Name" value={name} onChange={(e) => setName(e.target.value)} />
            <div>
              <label className="text-xs text-muted-foreground block mb-1">SVG icon (paste code or upload .svg file)</label>
              <textarea
                value={svg}
                onChange={(e) => setSvg(e.target.value)}
                placeholder="Paste SVG code here, e.g. <svg ...>...</svg>"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
              />
              <input
                type="file"
                accept=".svg,image/svg+xml"
                className="mt-1 w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-muted file:text-xs"
                onChange={handleSvgFileChange}
              />
            </div>
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
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Edit Category</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Category Name" value={name} onChange={(e) => setName(e.target.value)} />
            <div>
              <label className="text-xs text-muted-foreground block mb-1">SVG icon (paste code or upload .svg file — leave empty to keep current)</label>
              <textarea
                value={svg}
                onChange={(e) => setSvg(e.target.value)}
                placeholder="Paste SVG code here, e.g. <svg ...>...</svg>"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
              />
              <input
                type="file"
                accept=".svg,image/svg+xml"
                className="mt-1 w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-muted file:text-xs"
                onChange={handleSvgFileChange}
              />
              {editingCategory?.svg && typeof editingCategory.svg === "string" && editingCategory.svg.trim() && !svg.trim() && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Current:</span>
                  <img
                    src={editingCategory.svg.trim().startsWith("<svg") ? svgToImgSrc(editingCategory.svg.trim()) : getMediaUrl(editingCategory.svg.trim())}
                    alt=""
                    className="h-6 w-6 object-contain"
                  />
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-border" />
              Active
            </label>
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

export default PowerhouseCategories;
