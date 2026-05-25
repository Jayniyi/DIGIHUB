import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import { FileText, Clock, CheckCircle, MessageSquare, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Project {
  id: string;
  name: string;
  service: string;
  status: string;
  date: string;
  description?: string;
  progress?: number;
}

interface FirestoreProject {
  name: string;
  service: string;
  status: string;
  date: string;
  description?: string;
  progress: number;
  userId: string;
  createdAt: any;
}

const services = [
  "Website Development",
  "Digital Ads",
  "Branding",
  "Google Business",
  "SEO",
  "Social Media Management",
  "Flyer & Graphics",
];

const statusColor: Record<string, string> = {
  Pending: "bg-warning/15 text-warning border-warning/30",
  "In Progress": "bg-info/15 text-info border-info/30",
  Review: "bg-secondary/15 text-secondary border-secondary/30",
  Completed: "bg-success/15 text-success border-success/30",
};

const ClientDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [requestOpen, setRequestOpen] = useState(false);
  const [form, setForm] = useState({ name: "", service: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const projectsRef = collection(db, "projects");
    const q = query(projectsRef, where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as FirestoreProject),
        }));
        items.sort((a, b) => {
          const aMs = typeof a.createdAt?.toMillis === "function" ? a.createdAt.toMillis() : 0;
          const bMs = typeof b.createdAt?.toMillis === "function" ? b.createdAt.toMillis() : 0;
          return bMs - aMs;
        });
        setProjects(items);
        setLoading(false);
      },
      error => {
        console.error("Failed to load user projects", error);
        toast({ title: "Unable to load projects", description: error.message || "Please try again later.", variant: "destructive" });
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user, toast]);

  const displayName = user?.businessName || user?.fullName || "";

  const handleSubmit = async () => {
    if (!user || !form.name || !form.service) return;
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "projects"), {
        userId: user.uid,
        name: form.name,
        service: form.service,
        description: form.description,
        status: "Pending",
        progress: 0,
        date: new Date().toISOString().split("T")[0],
        createdAt: serverTimestamp(),
      });
      setForm({ name: "", service: "", description: "" });
      setRequestOpen(false);
      toast({ title: "Request Submitted", description: "Your project request has been saved." });
    } catch (error: any) {
      console.error("Failed to submit project request", error);
      toast({ title: "Submission failed", description: error.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar role="client" />
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Welcome back{displayName ? `, ${displayName}` : ""} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Here's an overview of your digital projects.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total Projects" value={String(projects.length)} icon={FileText} />
          <StatsCard title="In Progress" value={String(projects.filter(p => p.status === "In Progress").length)} icon={Clock} />
          <StatsCard title="Completed" value={String(projects.filter(p => p.status === "Completed").length)} icon={CheckCircle} />
          <StatsCard title="Messages" value="3" subtitle="2 unread" icon={MessageSquare} />
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-heading font-semibold text-lg text-card-foreground">Recent Projects</h2>
            <Button variant="secondary" size="sm" className="gap-2" onClick={() => setRequestOpen(true)}>
              <Plus className="w-4 h-4" /> New Request
            </Button>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-5 text-sm text-muted-foreground">Loading your projects...</div>
            ) : projects.length === 0 ? (
              <div className="p-5 text-sm text-muted-foreground">No project requests yet. Submit one to get started.</div>
            ) : (
              projects.map(project => (
                <div key={project.id} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="font-medium text-card-foreground">{project.name}</p>
                    <p className="text-sm text-muted-foreground">{project.service}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground hidden sm:block">{project.date}</span>
                    <Badge variant="outline" className={statusColor[project.status] || statusColor.Pending}>{project.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit a New Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Project Name</label>
                <Input placeholder="e.g. New Website for my store" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Service Type</label>
                <Select value={form.service} onValueChange={v => setForm(f => ({ ...f, service: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                  <SelectContent>
                    {services.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
                <Textarea placeholder="Describe what you need..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ClientDashboard;
