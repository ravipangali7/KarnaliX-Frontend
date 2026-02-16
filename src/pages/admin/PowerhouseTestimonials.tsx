import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { getTestimonialsAdmin, createTestimonial } from "@/api/admin";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const PowerhouseTestimonials = () => {
  const queryClient = useQueryClient();
  const { data: testimonials = [] } = useQuery({ queryKey: ["admin-testimonials"], queryFn: getTestimonialsAdmin });
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [stars, setStars] = useState(5);
  const [testimonialFrom, setTestimonialFrom] = useState("");
  const [gameName, setGameName] = useState("");
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setName("");
    setMessage("");
    setStars(5);
    setTestimonialFrom("");
    setGameName("");
  };

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

  const handleSave = async () => {
    const n = name.trim();
    const m = message.trim();
    if (!n || !m) {
      toast({ title: "Name and Review text are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await createTestimonial({
        name: n,
        message: m,
        stars: Number(stars) || 5,
        testimonial_from: testimonialFrom.trim() || "",
        game_name: gameName.trim() || "",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      toast({ title: "Testimonial created successfully." });
      resetForm();
      setCreateOpen(false);
    } catch (e) {
      const msg = (e as { detail?: string })?.detail ?? "Failed to create testimonial";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl">Testimonials</h2>
      <DataTable data={testimonials as Record<string, unknown>[]} columns={columns} searchKey="name" onAdd={() => setCreateOpen(true)} addLabel="Add Testimonial" />
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Add Testimonial</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="From (optional)" value={testimonialFrom} onChange={(e) => setTestimonialFrom(e.target.value)} />
            <select className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm" value={stars} onChange={(e) => setStars(Number(e.target.value))}>
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
            </select>
            <Textarea placeholder="Review text" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
            <Input placeholder="Game name (optional)" value={gameName} onChange={(e) => setGameName(e.target.value)} />
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

export default PowerhouseTestimonials;
