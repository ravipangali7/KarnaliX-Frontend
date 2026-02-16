import { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { getTestimonialsAdmin } from "@/api/admin";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Star } from "lucide-react";

const PowerhouseTestimonials = () => {
  const { data: testimonials = [] } = useQuery({ queryKey: ["admin-testimonials"], queryFn: getTestimonialsAdmin });
  const [createOpen, setCreateOpen] = useState(false);
  const columns = [
    { header: "Avatar", accessor: (row: Record<string, unknown>) => row.image ? <img src={String(row.image)} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">{(String(row.name ?? ""))[0]}</span> },
    { header: "Name", accessor: (row: Record<string, unknown>) => String(row.name ?? "") },
    { header: "Rating", accessor: (row: Record<string, unknown>) => (
      <div className="flex text-primary">{Array.from({ length: Number(row.stars ?? 5) }).map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}</div>
    )},
    { header: "Review", accessor: (row: Record<string, unknown>) => <span className="text-xs truncate max-w-[200px] block">{String(row.message ?? "")}</span> },
    { header: "Status", accessor: () => <StatusBadge status="active" /> },
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
      <h2 className="font-display font-bold text-xl">Testimonials</h2>
      <DataTable data={testimonials as Record<string, unknown>[]} columns={columns} searchKey="name" onAdd={() => setCreateOpen(true)} addLabel="Add Testimonial" />
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Add Testimonial</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Name" />
            <Input placeholder="Avatar URL" />
            <select className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm">
              <option>5 Stars</option><option>4 Stars</option><option>3 Stars</option>
            </select>
            <Textarea placeholder="Review text" rows={3} />
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

export default PowerhouseTestimonials;
