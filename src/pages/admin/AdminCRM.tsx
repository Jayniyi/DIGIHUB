import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Phone, Mail, User, CalendarDays, StickyNote, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { collection, query, onSnapshot, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Lead {
  id: string;
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

const stages = ["New", "Contacted", "Qualified", "Converted"];
const stageColor: Record<string, string> = { New: "bg-info/15 text-info border-info/30", Contacted: "bg-warning/15 text-warning border-warning/30", Qualified: "bg-secondary/15 text-secondary border-secondary/30", Converted: "bg-success/15 text-success border-success/30" };
const stageBorder: Record<string, string> = { New: "border-t-info", Contacted: "border-t-warning", Qualified: "border-t-secondary", Converted: "border-t-success" };

const AdminCRM = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [noteDialog, setNoteDialog] = useState(false);
  const [followUpDialog, setFollowUpDialog] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [followUpForm, setFollowUpForm] = useState({ date: "", note: "" });
  const [leadForm, setLeadForm] = useState({ name: "", contact: "", email: "", phone: "", service: "", industry: "" });
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const leadsRef = collection(db, "leads");
    const leadsQuery = query(leadsRef);
    const unsubscribe = onSnapshot(
      leadsQuery,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
        setLeads(items);
        if (selectedLead) {
          const updated = items.find((item) => item.id === selectedLead.id) || null;
          setSelectedLead(updated);
        }
        setLoading(false);
      },
      (error) => {
        console.error("failed to load leads", error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [selectedLead]);

  const filteredLeads = leads.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()) || l.contact.toLowerCase().includes(search.toLowerCase()));

  const handleConvert = async () => {
    if (!selectedLead) return;
    setIsSaving(true);
    try {
      const leadRef = doc(db, "leads", selectedLead.id);
      await updateDoc(leadRef, { stage: "Converted" });
      toast({ title: "Lead Converted", description: `${selectedLead.name} has been converted to a client.` });
    } catch (error) {
      console.error("failed to convert lead", error);
      toast({ title: "Unable to convert lead", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedLead) return;
    setIsSaving(true);
    try {
      const leadRef = doc(db, "leads", selectedLead.id);
      const nextNotes = [...selectedLead.notes, newNote];
      await updateDoc(leadRef, { notes: nextNotes });
      setNewNote("");
      setNoteDialog(false);
      toast({ title: "Note Added" });
    } catch (error) {
      console.error("failed to add note", error);
      toast({ title: "Unable to save note", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleScheduleFollowUp = async () => {
    if (!followUpForm.date || !selectedLead) return;
    setIsSaving(true);
    try {
      const leadRef = doc(db, "leads", selectedLead.id);
      const nextFollowUps = [...selectedLead.followUps, { date: followUpForm.date, note: followUpForm.note }];
      await updateDoc(leadRef, { followUps: nextFollowUps });
      setFollowUpForm({ date: "", note: "" });
      setFollowUpDialog(false);
      toast({ title: "Follow-up Scheduled", description: `Scheduled for ${followUpForm.date}` });
    } catch (error) {
      console.error("failed to schedule follow-up", error);
      toast({ title: "Unable to schedule follow-up", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLead = async () => {
    if (!leadForm.name || !leadForm.contact) return;
    setIsSaving(true);
    try {
      const newLead = {
        name: leadForm.name,
        contact: leadForm.contact,
        email: leadForm.email,
        phone: leadForm.phone,
        service: leadForm.service,
        industry: leadForm.industry,
        stage: "New",
        notes: [],
        followUps: [],
        createdAt: new Date().toISOString().split("T")[0],
      };
      await addDoc(collection(db, "leads"), newLead);
      setLeadForm({ name: "", contact: "", email: "", phone: "", service: "", industry: "" });
      setAddLeadOpen(false);
      toast({ title: "Lead Added", description: `${newLead.name} added to pipeline.` });
    } catch (error) {
      console.error("failed to add lead", error);
      toast({ title: "Unable to add lead", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-border bg-card px-6 py-5 shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <span className="text-base font-medium text-foreground">Loading CRM pipeline...</span>
        </div>
      </div>
    );
  }

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
          <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stages.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === stage);
            return (
              <div key={stage} className={`bg-card rounded-xl border border-border border-t-4 ${stageBorder[stage]}`}>
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-semibold text-card-foreground">{stage}</h3>
                    <Badge variant="outline" className="text-xs">{stageLeads.length}</Badge>
                  </div>
                </div>
                <div className="p-3 space-y-3 min-h-[200px]">
                  {stageLeads.map((lead) => (
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
                  {selectedLead.stage !== "Converted" && (
                    <Button size="sm" onClick={handleConvert} disabled={isSaving}>
                      {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Convert to Client
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setNoteDialog(true)} disabled={isSaving}>
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Add Note
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setFollowUpDialog(true)} disabled={isSaving}>
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Schedule Follow-up
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Lead</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <Input placeholder="Business Name" value={leadForm.name} onChange={(e) => setLeadForm((f) => ({ ...f, name: e.target.value }))} />
              <Input placeholder="Contact Person" value={leadForm.contact} onChange={(e) => setLeadForm((f) => ({ ...f, contact: e.target.value }))} />
              <Input placeholder="Email" value={leadForm.email} onChange={(e) => setLeadForm((f) => ({ ...f, email: e.target.value }))} />
              <Input placeholder="Phone" value={leadForm.phone} onChange={(e) => setLeadForm((f) => ({ ...f, phone: e.target.value }))} />
              <Input placeholder="Service Interested In" value={leadForm.service} onChange={(e) => setLeadForm((f) => ({ ...f, service: e.target.value }))} />
              <Input placeholder="Industry" value={leadForm.industry} onChange={(e) => setLeadForm((f) => ({ ...f, industry: e.target.value }))} />
              <Button className="w-full" onClick={handleAddLead} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Lead
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Note</DialogTitle></DialogHeader>
            <Textarea placeholder="Write your note here..." value={newNote} onChange={(e) => setNewNote(e.target.value)} />
            <Button className="w-full" onClick={handleAddNote}>Save Note</Button>
          </DialogContent>
        </Dialog>

        <Dialog open={followUpDialog} onOpenChange={setFollowUpDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Schedule Follow-up</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Date</label>
                <Input type="date" value={followUpForm.date} onChange={(e) => setFollowUpForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Note (optional)</label>
                <Textarea placeholder="Reminder note..." value={followUpForm.note} onChange={(e) => setFollowUpForm((f) => ({ ...f, note: e.target.value }))} />
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
