import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { getCategoriesAdmin, createCategoryAdmin, createCategoryAdminForm, updateCategoryAdmin, updateCategoryAdminForm } from "@/api/admin";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { toast } from "@/hooks/use-toast";
import { getMediaUrl } from "@/lib/api";

const PowerhouseCategories = () => {
  const queryClient = useQueryClient();
  const { data: gameCategories = [] } = useQuery({ queryKey: ["admin-categories"], queryFn: getCategoriesAdmin });
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [svg, setSvg] = useState("");
  const [svgFile, setSvgFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Record<string, unknown> | null>(null);

  const resetForm = () => {
    setName("");
    setSvg("");
    setSvgFile(null);
    setIsActive(true);
    setEditingCategory(null);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditingCategory(row);
    setName(String(row.name ?? ""));
    setSvg(String(row.svg ?? ""));
    setSvgFile(null);
    setIsActive(Boolean(row.is_active));
    setEditOpen(true);
  };

  const columns = [
    {
      header: "Icon",
      accessor: (row: Record<string, unknown>) => {
        const svgVal = row.svg;
        if (svgVal && typeof svgVal === "string" && svgVal.trim()) {
          const url = getMediaUrl(svgVal.trim());
          const isEmoji = !svgVal.trim().startsWith("http") && !svgVal.trim().startsWith("/") && svgVal.length <= 4;
          if (isEmoji) return <span className="text-lg">{svgVal.trim()}</span>;
          return <img src={url} alt="" className="h-6 w-6 object-contain" />;
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
      if (svgFile) {
        const formData = new FormData();
        formData.set("name", n);
        formData.set("is_active", String(isActive));
        formData.set("svg", svgFile);
        await createCategoryAdminForm(formData);
      } else {
        await createCategoryAdmin({ name: n, svg: svg.trim() || null, is_active: isActive });
      }
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
      if (svgFile) {
        const formData = new FormData();
        formData.set("name", n);
        formData.set("is_active", String(isActive));
        formData.set("svg", svgFile);
        await updateCategoryAdminForm(id, formData);
      } else {
        await updateCategoryAdmin(id, { name: n, svg: svg.trim() || null, is_active: isActive });
      }
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
            <Input placeholder="Icon (emoji or text fallback)" value={svg} onChange={(e) => setSvg(e.target.value)} />
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Or upload SVG file</label>
              <input
                type="file"
                accept=".svg,image/svg+xml"
                className="w-full text-sm file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-muted file:text-sm"
                onChange={(e) => setSvgFile(e.target.files?.[0] ?? null)}
              />
              {svgFile && <p className="text-xs text-muted-foreground mt-1">{svgFile.name}</p>}
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
            <Input placeholder="Icon (emoji or text fallback)" value={svg} onChange={(e) => setSvg(e.target.value)} />
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Or upload SVG file (leave empty to keep current)</label>
              <input
                type="file"
                accept=".svg,image/svg+xml"
                className="w-full text-sm file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-muted file:text-sm"
                onChange={(e) => setSvgFile(e.target.files?.[0] ?? null)}
              />
              {svgFile && <p className="text-xs text-muted-foreground mt-1">{svgFile.name}</p>}
              {editingCategory?.svg && typeof editingCategory.svg === "string" && editingCategory.svg.trim() && !svgFile && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Current:</span>
                  {editingCategory.svg.trim().length <= 4 ? (
                    <span className="text-lg">{editingCategory.svg.trim()}</span>
                  ) : (
                    <img src={getMediaUrl(editingCategory.svg.trim())} alt="" className="h-6 w-6 object-contain" />
                  )}
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
