import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Facebook, Globe, Youtube } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Campaign {
  id: number;
  name: string;
  client: string;
  platform: string;
  objective: string;
  budget: string;
  duration: string;
  status: string;
  assignedTo: string;
  notes?: string;
}

const initialCampaigns: Campaign[] = [
  { id: 1, name: "Summer Sale Campaign", client: "Adebayo Fashions", platform: "Instagram", objective: "Sales", budget: "₦150,000", duration: "30 days", status: "Running", assignedTo: "Tunde Bakare" },
  { id: 2, name: "Grand Opening Ads", client: "Lagos Eats", platform: "Facebook", objective: "Awareness", budget: "₦200,000", duration: "14 days", status: "Setup", assignedTo: "Tunde Bakare" },
  { id: 3, name: "Google Search Ads", client: "TechNaija Solutions", platform: "Google", objective: "Leads", budget: "₦100,000", duration: "60 days", status: "Running", assignedTo: "Fatima Yusuf" },
  { id: 4, name: "Brand Video Promotion", client: "Abuja Properties", platform: "YouTube", objective: "Engagement", budget: "₦300,000", duration: "21 days", status: "Completed", assignedTo: "Fatima Yusuf" },
  { id: 5, name: "New Year Promo", client: "NaijaFit Gym", platform: "Instagram", objective: "Sales", budget: "₦80,000", duration: "7 days", status: "Requested", assignedTo: "Unassigned" },
];

const statusColor: Record<string, string> = { Requested: "bg-muted text-muted-foreground border-border", Setup: "bg-info/15 text-info border-info/30", Running: "bg-success/15 text-success border-success/30", Optimizing: "bg-warning/15 text-warning border-warning/30", Completed: "bg-secondary/15 text-secondary border-secondary/30" };
const platformIcon: Record<string, React.ElementType> = { Instagram: Facebook, Facebook: Facebook, Google: Globe, YouTube: Youtube };

const AdminAds = () => {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [search, setSearch] = useState("");
  const [viewCampaign, setViewCampaign] = useState<Campaign | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", client: "", platform: "", objective: "", budget: "", duration: "", assignedTo: "" });
  const { toast } = useToast();

  const filtered = campaigns.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.client.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => {
    if (!form.name || !form.client) return;
    setCampaigns(prev => [{ id: Date.now(), ...form, status: "Requested" }, ...prev]);
    setForm({ name: "", client: "", platform: "", objective: "", budget: "", duration: "", assignedTo: "" });
    setAddOpen(false);
    toast({ title: "Campaign Created" });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar role="admin" />
      <main className="flex-1 p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Ads Campaigns</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage all advertising campaigns across platforms.</p>
          </div>
          <Button className="gap-2" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> New Campaign</Button>
        </div>

        <div className="mb-6 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search campaigns..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="grid gap-4">
          {filtered.map(campaign => {
            const PlatformIcon = platformIcon[campaign.platform] || Globe;
            return (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><PlatformIcon className="w-5 h-5 text-muted-foreground" /></div>
                      <div>
                        <p className="font-medium text-card-foreground">{campaign.name}</p>
                        <p className="text-sm text-muted-foreground">{campaign.client} · {campaign.platform}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-card-foreground">{campaign.budget}</p>
                        <p className="text-xs text-muted-foreground">{campaign.duration} · {campaign.objective}</p>
                      </div>
                      <Badge variant="outline" className={statusColor[campaign.status]}>{campaign.status}</Badge>
                      <Button variant="outline" size="sm" onClick={() => setViewCampaign(campaign)}>View</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* View Campaign */}
        <Dialog open={!!viewCampaign} onOpenChange={() => setViewCampaign(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{viewCampaign?.name}</DialogTitle></DialogHeader>
            {viewCampaign && (
              <div className="space-y-4 mt-2">
                <div className="flex items-center gap-2"><Badge variant="outline" className={statusColor[viewCampaign.status]}>{viewCampaign.status}</Badge></div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Client:</span> <span className="text-foreground">{viewCampaign.client}</span></div>
                  <div><span className="text-muted-foreground">Platform:</span> <span className="text-foreground">{viewCampaign.platform}</span></div>
                  <div><span className="text-muted-foreground">Objective:</span> <span className="text-foreground">{viewCampaign.objective}</span></div>
                  <div><span className="text-muted-foreground">Budget:</span> <span className="text-foreground">{viewCampaign.budget}</span></div>
                  <div><span className="text-muted-foreground">Duration:</span> <span className="text-foreground">{viewCampaign.duration}</span></div>
                  <div><span className="text-muted-foreground">Assigned To:</span> <span className="text-foreground">{viewCampaign.assignedTo}</span></div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Campaign */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>New Campaign</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <Input placeholder="Campaign Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <Input placeholder="Client" value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))} />
              <Select value={form.platform} onValueChange={v => setForm(f => ({ ...f, platform: v }))}>
                <SelectTrigger><SelectValue placeholder="Platform" /></SelectTrigger>
                <SelectContent>
                  {["Instagram", "Facebook", "Google", "YouTube"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Objective (e.g. Sales, Awareness)" value={form.objective} onChange={e => setForm(f => ({ ...f, objective: e.target.value }))} />
              <Input placeholder="Budget (e.g. ₦100,000)" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
              <Input placeholder="Duration (e.g. 30 days)" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
              <Input placeholder="Assign To" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} />
              <Button className="w-full" onClick={handleAdd}>Create Campaign</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminAds;
