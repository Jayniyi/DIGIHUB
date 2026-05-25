import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Eye } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Staff {
  id: number; name: string; email: string; role: string; specialty: string; activeProjects: number; status: string;
}

const initialStaff: Staff[] = [
  { id: 1, name: "Amina Ibrahim", email: "amina@digiprohub.ng", role: "Designer", specialty: "Graphics & Branding", activeProjects: 4, status: "Active" },
  { id: 2, name: "Tunde Bakare", email: "tunde@digiprohub.ng", role: "Ads Manager", specialty: "Meta & Google Ads", activeProjects: 3, status: "Active" },
  { id: 3, name: "Kola Adeyemi", email: "kola@digiprohub.ng", role: "Developer", specialty: "Web Development", activeProjects: 2, status: "Active" },
  { id: 4, name: "Fatima Yusuf", email: "fatima@digiprohub.ng", role: "Ads Manager", specialty: "YouTube & Google Ads", activeProjects: 2, status: "Active" },
  { id: 5, name: "Chidi Nwosu", email: "chidi@digiprohub.ng", role: "SEO Specialist", specialty: "SEO & Google Business", activeProjects: 1, status: "On Leave" },
];

const statusColor: Record<string, string> = { Active: "bg-success/15 text-success border-success/30", "On Leave": "bg-warning/15 text-warning border-warning/30" };

const AdminStaff = () => {
  const [staff, setStaff] = useState(initialStaff);
  const [viewStaff, setViewStaff] = useState<Staff | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "", specialty: "" });
  const { toast } = useToast();

  const handleAdd = () => {
    if (!form.name || !form.email) return;
    setStaff(prev => [{ id: Date.now(), ...form, activeProjects: 0, status: "Active" }, ...prev]);
    setForm({ name: "", email: "", role: "", specialty: "" });
    setAddOpen(false);
    toast({ title: "Staff Added", description: `${form.name} has been added to the team.` });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar role="admin" />
      <main className="flex-1 p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Staff Management</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage team members and their assignments.</p>
          </div>
          <Button className="gap-2" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> Add Staff</Button>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden lg:table-cell">Specialty</TableHead>
                <TableHead className="hidden md:table-cell">Active Projects</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-card-foreground">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">{s.email}</TableCell>
                  <TableCell className="text-card-foreground">{s.role}</TableCell>
                  <TableCell className="text-muted-foreground hidden lg:table-cell">{s.specialty}</TableCell>
                  <TableCell className="text-card-foreground hidden md:table-cell">{s.activeProjects}</TableCell>
                  <TableCell><Badge variant="outline" className={statusColor[s.status]}>{s.status}</Badge></TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => setViewStaff(s)}><Eye className="w-4 h-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={!!viewStaff} onOpenChange={() => setViewStaff(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{viewStaff?.name}</DialogTitle></DialogHeader>
            {viewStaff && (
              <div className="space-y-3 text-sm mt-2">
                <Badge variant="outline" className={statusColor[viewStaff.status]}>{viewStaff.status}</Badge>
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{viewStaff.email}</span></div>
                  <div><span className="text-muted-foreground">Role:</span> <span className="text-foreground">{viewStaff.role}</span></div>
                  <div><span className="text-muted-foreground">Specialty:</span> <span className="text-foreground">{viewStaff.specialty}</span></div>
                  <div><span className="text-muted-foreground">Active Projects:</span> <span className="text-foreground">{viewStaff.activeProjects}</span></div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <Input placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <Input placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                  {["Designer", "Developer", "Ads Manager", "SEO Specialist", "Content Writer"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Specialty" value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} />
              <Button className="w-full" onClick={handleAdd}>Add Staff</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminStaff;
