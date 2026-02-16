import { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { getCmsPages } from "@/api/admin";
import { StatusBadge } from "@/components/shared/StatusBadge";

const PowerhouseCMS = () => {
  const { data: cmsPages = [] } = useQuery({ queryKey: ["admin-cms"], queryFn: getCmsPages });
  const [createOpen, setCreateOpen] = useState(false);
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

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl">CMS Pages</h2>
      <DataTable data={cmsPages as Record<string, unknown>[]} columns={columns} searchKey="title" onAdd={() => setCreateOpen(true)} addLabel="Add Page" />
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-display">Add CMS Page</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Page Title" />
            <Input placeholder="Slug (e.g., about-us)" />
            <Textarea placeholder="Page Content" rows={5} />
            <div className="flex items-center justify-between">
              <span className="text-sm">Show in Header</span>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Show in Footer</span>
              <Switch defaultChecked />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button className="gold-gradient text-primary-foreground" onClick={() => setCreateOpen(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PowerhouseCMS;
