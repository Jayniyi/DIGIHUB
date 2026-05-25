import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Phone, Mail, User, CalendarDays, StickyNote } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  service: string;
  industry: string;
  stage: string;
  notes: string[];
  followUps: { date: string; note: string }[];
  createdAt: string;
}

const initialLeads: Lead[] = [
  { id: 1, name: "Adebayo Fashions", contact: "Adebayo Olanrewaju", email: "adebayo@fashions.ng", phone: "+234 801 234 5678", service: "Website + Ads", industry: "Fashion", stage: "New", notes: ["Interested in full package"], followUps: [], createdAt: "2024-01-15" },
  { id: 2, name: "Lagos Eats", contact: "Chioma Eze", email: "chioma@lagoseats.ng", phone: "+234 802 345 6789", service: "Full Package", industry: "Food & Beverage", stage: "Contacted", notes: ["Follow up next week"], followUps: [], createdAt: "2024-01-12" },
  { id: 3, name: "TechNaija Solutions", contact: "Emeka Obi", email: "emeka@technaija.ng", phone: "+234 803 456 7890", service: "SEO + Google Business", industry: "Technology", stage: "Qualified", notes: ["Budget confirmed, ready to start"], followUps: [], createdAt: "2024-01-10" },
  { id: 4, name: "Abuja Properties", contact: "Hassan Musa", email: "hassan@abujaprops.ng", phone: "+234 804 567 8901", service: "Website + Branding", industry: "Real Estate", stage: "Converted", notes: ["Signed contract, project starting"], followUps: [], createdAt: "2024-01-08" },
  { id: 5, name: "NaijaFit Gym", contact: "Blessing Ade", email: "blessing@naijafit.ng", phone: "+234 805 678 9012", service: "Flyer Design + Ads", industry: "Health & Fitness", stage: "New", notes: ["Needs promotional materials ASAP"], followUps: [], createdAt: "2024-01-16" },
  { id: 6, name: "GreenLeaf Farms", contact: "Yusuf Bello", email: "yusuf@greenleaf.ng", phone: "+234 806 789 0123", service: "Branding + Website", industry: "Agriculture", stage: "Contacted", notes: ["Sent proposal, awaiting feedback"], followUps: [], createdAt: "2024-01-11" },
];

const stages = ["New", "Contacted", "Qualified", "Converted"];
const stageColor: Record<string, string> = { New: "bg-info/15 text-info border-info/30", Contacted: "bg-warning/15 text-warning border-warning/30", Qualified: "bg-secondary/15 text-secondary border-secondary/30", Converted: "bg-success/15 text-success border-success/30" };
const stageBorder: Record<string, string> = { New: "border-t-info", Contacted: "border-t-warning", Qualified: "border-t-secondary", Converted: "border-t-success" };

const AdminCRM = () => {
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [noteDialog, setNoteDialog] = useState(false);
  const [followUpDialog, setFollowUpDialog] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [followUpForm, setFollowUpForm] = useState({ date: "", note: "" });
  const [leadForm, setLeadForm] = useState({ name: "", contact: "", email: "", phone: "", service: "", industry: "" });
  const { toast } = useToast();

  const filteredLeads = leads.filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.contact.toLowerCase().includes(search.toLowerCase()));

  const handleConvert = () => {
    if (!selectedLead) return;
    setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, stage: "Converted" } : l));
    setSelectedLead(prev => prev ? { ...prev, stage: "Converted" } : null);
    toast({ title: "Lead Converted", description: `${selectedLead.name} has been converted to a client.` });
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedLead) return;
    setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, notes: [...l.notes, newNote] } : l));
    setSelectedLead(prev => prev ? { ...prev, notes: [...prev.notes, newNote] } : null);
    setNewNote("");
    setNoteDialog(false);
    toast({ title: "Note Added" });
  };

  const handleScheduleFollowUp = () => {
    if (!followUpForm.date || !selectedLead) return;
    const fu = { date: followUpForm.date, note: followUpForm.note };
    setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, followUps: [...l.followUps, fu] } : l));
    setSelectedLead(prev => prev ? { ...prev, followUps: [...prev.followUps, fu] } : null);
    setFollowUpForm({ date: "", note: "" });
    setFollowUpDialog(false);
    toast({ title: "Follow-up Scheduled", description: `Scheduled for ${fu.date}` });
  };

  const handleAddLead = () => {
    if (!leadForm.name || !leadForm.contact) return;
    const nl: Lead = { id: Date.now(), ...leadForm, stage: "New", notes: [], followUps: [], createdAt: new Date().toISOString().split("T")[0] };
    setLeads(prev => [nl, ...prev]);
    setLeadForm({ name: "", contact: "", email: "", phone: "", service: "", industry: "" });
    setAddLeadOpen(false);
    toast({ title: "Lead Added", description: `${nl.name} added to pipeline.` });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar role="admin" />
      <main className="flex-1 p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">CRM Pipeline</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage leads and convert them into clients.</p>
          </div>
          <Button className="gap-2" onClick={() => setAddLeadOpen(true)}><Plus className="w-4 h-4" /> Add Lead</Button>
        </div>

        <div className="mb-6 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stages.map(stage => {
            const stageLeads = filteredLeads.filter(l => l.stage === stage);
            return (
              <div key={stage} className={`bg-card rounded-xl border border-border border-t-4 ${stageBorder[stage]}`}>
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-semibold text-card-foreground">{stage}</h3>
                    <Badge variant="outline" className="text-xs">{stageLeads.length}</Badge>
                  </div>
                </div>
                <div className="p-3 space-y-3 min-h-[200px]">
                  {stageLeads.map(lead => (
                    <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedLead(lead)}>
                      <CardContent className="p-4">
                        <p className="font-medium text-card-foreground text-sm">{lead.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{lead.contact}</p>
                        <p className="text-xs text-muted-foreground">{lead.service}</p>
                        <Badge variant="outline" className="text-xs mt-2">{lead.industry}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {selectedLead && (
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-heading text-xl font-bold text-card-foreground">{selectedLead.name}</h2>
                <p className="text-muted-foreground text-sm">{selectedLead.industry}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={stageColor[selectedLead.stage]}>{selectedLead.stage}</Badge>
                <Button variant="outline" size="sm" onClick={() => setSelectedLead(null)}>Close</Button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-card-foreground">Contact</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3"><User className="w-4 h-4 text-muted-foreground" /><span className="text-card-foreground">{selectedLead.contact}</span></div>
                  <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-muted-foreground" /><span className="text-card-foreground">{selectedLead.email}</span></div>
                  <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-muted-foreground" /><span className="text-card-foreground">{selectedLead.phone}</span></div>
                </div>
                <h3 className="font-semibold text-card-foreground pt-2">Notes</h3>
                <div className="space-y-2">
                  {selectedLead.notes.map((n, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm"><StickyNote className="w-3.5 h-3.5 text-muted-foreground mt-0.5" /><span className="text-card-foreground">{n}</span></div>
                  ))}
                </div>
                {selectedLead.followUps.length > 0 && (
                  <>
                    <h3 className="font-semibold text-card-foreground pt-2">Scheduled Follow-ups</h3>
                    <div className="space-y-2">
                      {selectedLead.followUps.map((fu, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm"><CalendarDays className="w-3.5 h-3.5 text-muted-foreground mt-0.5" /><span className="text-card-foreground">{fu.date} — {fu.note || "No note"}</span></div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-card-foreground">Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Service:</span> <span className="text-card-foreground">{selectedLead.service}</span></p>
                  <p><span className="text-muted-foreground">Created:</span> <span className="text-card-foreground">{selectedLead.createdAt}</span></p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedLead.stage !== "Converted" && <Button size="sm" onClick={handleConvert}>Convert to Client</Button>}
                  <Button size="sm" variant="outline" onClick={() => setNoteDialog(true)}>Add Note</Button>
                  <Button size="sm" variant="outline" onClick={() => setFollowUpDialog(true)}>Schedule Follow-up</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Lead Dialog */}
        <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Lead</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <Input placeholder="Business Name" value={leadForm.name} onChange={e => setLeadForm(f => ({ ...f, name: e.target.value }))} />
              <Input placeholder="Contact Person" value={leadForm.contact} onChange={e => setLeadForm(f => ({ ...f, contact: e.target.value }))} />
              <Input placeholder="Email" value={leadForm.email} onChange={e => setLeadForm(f => ({ ...f, email: e.target.value }))} />
              <Input placeholder="Phone" value={leadForm.phone} onChange={e => setLeadForm(f => ({ ...f, phone: e.target.value }))} />
              <Input placeholder="Service Interested In" value={leadForm.service} onChange={e => setLeadForm(f => ({ ...f, service: e.target.value }))} />
              <Input placeholder="Industry" value={leadForm.industry} onChange={e => setLeadForm(f => ({ ...f, industry: e.target.value }))} />
              <Button className="w-full" onClick={handleAddLead}>Add Lead</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Note Dialog */}
        <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Note</DialogTitle></DialogHeader>
            <Textarea placeholder="Write your note here..." value={newNote} onChange={e => setNewNote(e.target.value)} />
            <Button className="w-full" onClick={handleAddNote}>Save Note</Button>
          </DialogContent>
        </Dialog>

        {/* Schedule Follow-up Dialog */}
        <Dialog open={followUpDialog} onOpenChange={setFollowUpDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Schedule Follow-up</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Date</label>
                <Input type="date" value={followUpForm.date} onChange={e => setFollowUpForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Note (optional)</label>
                <Textarea placeholder="Reminder note..." value={followUpForm.note} onChange={e => setFollowUpForm(f => ({ ...f, note: e.target.value }))} />
              </div>
              <Button className="w-full" onClick={handleScheduleFollowUp}>Schedule</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminCRM;
