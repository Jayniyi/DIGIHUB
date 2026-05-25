import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Image, Palette } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Design {
  id: number; name: string; client: string; type: string; assignedTo: string; status: string; revisions: number; deadline: string;
}

const initialDesigns: Design[] = [
  { id: 1, name: "Product Catalog Flyer", client: "Adebayo Fashions", type: "Flyer", assignedTo: "Amina Ibrahim", status: "Designing", revisions: 0, deadline: "2024-02-05" },
  { id: 2, name: "Menu Design", client: "Lagos Eats", type: "Flyer", assignedTo: "Amina Ibrahim", status: "Review", revisions: 2, deadline: "2024-01-28" },
  { id: 3, name: "Logo & Brand Guide", client: "TechNaija Solutions", type: "Branding", assignedTo: "Kola Adeyemi", status: "Approved", revisions: 1, deadline: "2024-01-25" },
  { id: 4, name: "Social Media Pack", client: "NaijaFit Gym", type: "Graphics", assignedTo: "Unassigned", status: "Requested", revisions: 0, deadline: "2024-02-10" },
  { id: 5, name: "Business Card Design", client: "Abuja Properties", type: "Branding", assignedTo: "Amina Ibrahim", status: "Delivered", revisions: 1, deadline: "2024-01-18" },
];

const statusColor: Record<string, string> = { Requested: "bg-muted text-muted-foreground border-border", Designing: "bg-info/15 text-info border-info/30", Review: "bg-warning/15 text-warning border-warning/30", Approved: "bg-success/15 text-success border-success/30", Delivered: "bg-secondary/15 text-secondary border-secondary/30" };

const AdminDesigns = () => {
  const [designs, setDesigns] = useState(initialDesigns);
  const [search, setSearch] = useState("");
  const [viewDesign, setViewDesign] = useState<Design | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", client: "", type: "", assignedTo: "", deadline: "" });
  const { toast } = useToast();

  const filtered = designs.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.client.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => {
    if (!form.name || !form.client) return;
    setDesigns(prev => [{ id: Date.now(), ...form, status: "Requested", revisions: 0 }, ...prev]);
    setForm({ name: "", client: "", type: "", assignedTo: "", deadline: "" });
    setAddOpen(false);
    toast({ title: "Design Order Created" });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar role="admin" />
      <main className="flex-1 p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Design Orders</h1>
            <p className="text-muted-foreground text-sm mt-1">Track flyers, graphics, and branding requests.</p>
          </div>
          <Button className="gap-2" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> New Design Order</Button>
        </div>

        <div className="mb-6 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search designs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="grid gap-4">
          {filtered.map(design => (
            <Card key={design.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      {design.type === "Branding" ? <Palette className="w-5 h-5 text-muted-foreground" /> : <Image className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{design.name}</p>
                      <p className="text-sm text-muted-foreground">{design.client} · {design.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="text-xs text-muted-foreground">Assigned to</p>
                      <p className="text-sm text-card-foreground">{design.assignedTo}</p>
                    </div>
                    <Badge variant="outline" className={statusColor[design.status]}>{design.status}</Badge>
                    <Button variant="outline" size="sm" onClick={() => setViewDesign(design)}>View</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={!!viewDesign} onOpenChange={() => setViewDesign(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{viewDesign?.name}</DialogTitle></DialogHeader>
            {viewDesign && (
              <div className="space-y-3 text-sm mt-2">
                <Badge variant="outline" className={statusColor[viewDesign.status]}>{viewDesign.status}</Badge>
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-muted-foreground">Client:</span> <span className="text-foreground">{viewDesign.client}</span></div>
                  <div><span className="text-muted-foreground">Type:</span> <span className="text-foreground">{viewDesign.type}</span></div>
                  <div><span className="text-muted-foreground">Assigned:</span> <span className="text-foreground">{viewDesign.assignedTo}</span></div>
                  <div><span className="text-muted-foreground">Revisions:</span> <span className="text-foreground">{viewDesign.revisions}</span></div>
                  <div><span className="text-muted-foreground">Deadline:</span> <span className="text-foreground">{viewDesign.deadline}</span></div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>New Design Order</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <Input placeholder="Design Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <Input placeholder="Client" value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))} />
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue placeholder="Design Type" /></SelectTrigger>
                <SelectContent>
                  {["Flyer", "Branding", "Graphics", "Social Media"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Assign To" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} />
              <Input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
              <Button className="w-full" onClick={handleAdd}>Create Order</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminDesigns;
