import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Bell } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Announcement {
  id: number; title: string; message: string; date: string; audience: string; status: string;
}

const initialAnnouncements: Announcement[] = [
  { id: 1, title: "Platform Maintenance", message: "Scheduled maintenance on Feb 1st from 2AM-4AM WAT.", date: "2024-01-25", audience: "All Users", status: "Published" },
  { id: 2, title: "New Service: YouTube Ads", message: "We now offer YouTube advertising campaigns.", date: "2024-01-20", audience: "Clients", status: "Published" },
  { id: 3, title: "Design Team Update", message: "New design templates available.", date: "2024-01-18", audience: "Staff", status: "Published" },
  { id: 4, title: "Holiday Promo Packages", message: "Special Valentine's Day marketing packages at 20% discount.", date: "2024-01-28", audience: "Clients", status: "Draft" },
];

const statusColor: Record<string, string> = { Published: "bg-success/15 text-success border-success/30", Draft: "bg-muted text-muted-foreground border-border" };

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState({ title: "", message: "", audience: "", status: "Draft" });
  const { toast } = useToast();

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", message: "", audience: "", status: "Draft" });
    setDialogOpen(true);
  };

  const openEdit = (ann: Announcement) => {
    setEditing(ann);
    setForm({ title: ann.title, message: ann.message, audience: ann.audience, status: ann.status });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title || !form.message) return;
    if (editing) {
      setAnnouncements(prev => prev.map(a => a.id === editing.id ? { ...a, ...form } : a));
      toast({ title: "Announcement Updated" });
    } else {
      setAnnouncements(prev => [{ id: Date.now(), ...form, date: new Date().toISOString().split("T")[0] }, ...prev]);
      toast({ title: "Announcement Created" });
    }
    setDialogOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar role="admin" />
      <main className="flex-1 p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Announcements</h1>
            <p className="text-muted-foreground text-sm mt-1">Broadcast updates to clients and staff.</p>
          </div>
          <Button className="gap-2" onClick={openNew}><Plus className="w-4 h-4" /> New Announcement</Button>
        </div>

        <div className="grid gap-4">
          {announcements.map(ann => (
            <Card key={ann.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mt-0.5"><Bell className="w-5 h-5 text-muted-foreground" /></div>
                    <div>
                      <p className="font-medium text-card-foreground">{ann.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{ann.message}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs text-muted-foreground">{ann.date}</span>
                        <Badge variant="outline" className="text-xs">{ann.audience}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={statusColor[ann.status]}>{ann.status}</Badge>
                    <Button variant="outline" size="sm" onClick={() => openEdit(ann)}>Edit</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Announcement" : "New Announcement"}</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <Input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <Textarea placeholder="Message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
              <Select value={form.audience} onValueChange={v => setForm(f => ({ ...f, audience: v }))}>
                <SelectTrigger><SelectValue placeholder="Audience" /></SelectTrigger>
                <SelectContent>
                  {["All Users", "Clients", "Staff"].map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  {["Draft", "Published"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminAnnouncements;
