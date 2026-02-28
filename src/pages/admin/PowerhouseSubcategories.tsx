import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import {
  getSubcategoriesAdmin,
  getCategoriesAdmin,
  createSubcategoryAdmin,
  createSubcategoryAdminForm,
  updateSubcategoryAdmin,
  updateSubcategoryAdminForm,
  deleteSubcategoryAdmin,
} from "@/api/admin";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { toast } from "@/hooks/use-toast";
import { getMediaUrl } from "@/lib/api";

const PowerhouseSubcategories = () => {
  const queryClient = useQueryClient();
  const { data: subcategories = [] } = useQuery({ queryKey: ["admin-subcategories"], queryFn: getSubcategoriesAdmin });
  const { data: categories = [] } = useQuery({ queryKey: ["admin-categories"], queryFn: getCategoriesAdmin });
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [svg, setSvg] = useState("");
  const [svgFile, setSvgFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [gameCategoryId, setGameCategoryId] = useState<number | "">("");
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Record<string, unknown> | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const categoryMap = (categories as { id: number; name: string }[]).reduce(
    (acc, c) => {
      acc[c.id] = c.name;
      return acc;
    },
    {} as Record<number, string>
  );

  const resetForm = () => {
    setName("");
    setSvg("");
    setSvgFile(null);
    setIsActive(true);
    setGameCategoryId("");
    setEditingSubcategory(null);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditingSubcategory(row);
    setName(String(row.name ?? ""));
    setSvg(String(row.svg ?? ""));
    setSvgFile(null);
    setIsActive(Boolean(row.is_active));
    setGameCategoryId(typeof row.game_category === "number" ? row.game_category : (row.game_category as { id?: number })?.id ?? "");
    setEditOpen(true);
  };

  const openDeleteConfirm = (row: Record<string, unknown>) => {
    setDeletingId(Number(row.id));
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (deletingId == null) return;
    setDeleting(true);
    try {
      await deleteSubcategoryAdmin(deletingId);
      queryClient.invalidateQueries({ queryKey: ["admin-subcategories"] });
      toast({ title: "Subcategory deleted." });
      setDeleteConfirmOpen(false);
      setDeletingId(null);
    } catch (e) {
      const msg = (e as { detail?: string })?.detail ?? "Failed to delete subcategory";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
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
    {
      header: "Category",
      accessor: (row: Record<string, unknown>) => {
        const catId = typeof row.game_category === "number" ? row.game_category : (row.game_category as { id?: number })?.id;
        return catId != null ? categoryMap[catId] ?? catId : "—";
      },
    },
    { header: "Status", accessor: (row: Record<string, unknown>) => <StatusBadge status={row.is_active ? "active" : "suspended"} /> },
    {
      header: "Actions",
      accessor: (row: Record<string, unknown>) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => openEdit(row)}>Edit</Button>
          <Button variant="ghost" size="sm" className="text-xs text-crimson" onClick={() => openDeleteConfirm(row)}>Delete</Button>
        </div>
      ),
    },
  ];

  const handleSave = async () => {
    const n = name.trim();
    if (!n) {
      toast({ title: "Subcategory name is required", variant: "destructive" });
      return;
    }
    if (gameCategoryId === "") {
      toast({ title: "Please select a category", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (svgFile) {
        const formData = new FormData();
        formData.set("name", n);
        formData.set("is_active", String(isActive));
        formData.set("game_category", String(gameCategoryId));
        formData.set("svg", svgFile);
        await createSubcategoryAdminForm(formData);
      } else {
        await createSubcategoryAdmin({
          name: n,
          svg: svg.trim() || null,
          is_active: isActive,
          game_category: gameCategoryId as number,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["admin-subcategories"] });
      toast({ title: "Subcategory created successfully." });
      resetForm();
      setCreateOpen(false);
    } catch (e) {
      const msg = (e as { detail?: string })?.detail ?? "Failed to create subcategory";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingSubcategory?.id) return;
    const n = name.trim();
    if (!n) {
      toast({ title: "Subcategory name is required", variant: "destructive" });
      return;
    }
    if (gameCategoryId === "") {
      toast({ title: "Please select a category", variant: "destructive" });
      return;
    }
    const id = Number(editingSubcategory.id);
    setSaving(true);
    try {
      if (svgFile) {
        const formData = new FormData();
        formData.set("name", n);
        formData.set("is_active", String(isActive));
        formData.set("game_category", String(gameCategoryId));
        formData.set("svg", svgFile);
        await updateSubcategoryAdminForm(id, formData);
      } else {
        await updateSubcategoryAdmin(id, {
          name: n,
          svg: svg.trim() || null,
          is_active: isActive,
          game_category: gameCategoryId,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["admin-subcategories"] });
      toast({ title: "Subcategory updated successfully." });
      resetForm();
      setEditOpen(false);
    } catch (e) {
      const msg = (e as { detail?: string })?.detail ?? "Failed to update subcategory";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl">Game Subcategories</h2>
      <DataTable
        data={subcategories as Record<string, unknown>[]}
        columns={columns}
        searchKey="name"
        onAdd={() => setCreateOpen(true)}
        addLabel="Add Subcategory"
      />
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Add Subcategory</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Subcategory Name" value={name} onChange={(e) => setName(e.target.value)} />
            <select
              className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm"
              value={gameCategoryId}
              onChange={(e) => setGameCategoryId(e.target.value === "" ? "" : Number(e.target.value))}
            >
              <option value="">Select Category</option>
              {(categories as { id: number; name: string }[]).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
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
          <DialogHeader><DialogTitle className="font-display">Edit Subcategory</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Subcategory Name" value={name} onChange={(e) => setName(e.target.value)} />
            <select
              className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm"
              value={gameCategoryId}
              onChange={(e) => setGameCategoryId(e.target.value === "" ? "" : Number(e.target.value))}
            >
              <option value="">Select Category</option>
              {(categories as { id: number; name: string }[]).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
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
              {editingSubcategory?.svg && typeof editingSubcategory.svg === "string" && editingSubcategory.svg.trim() && !svgFile && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Current:</span>
                  {editingSubcategory.svg.trim().length <= 4 ? (
                    <span className="text-lg">{editingSubcategory.svg.trim()}</span>
                  ) : (
                    <img src={getMediaUrl(editingSubcategory.svg.trim())} alt="" className="h-6 w-6 object-contain" />
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
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Delete Subcategory</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this subcategory? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting…" : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PowerhouseSubcategories;
