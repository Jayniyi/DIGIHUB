import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Project {
  id: string;
  name: string;
  service: string;
  status: string;
  progress: number;
  date: string;
  description: string;
}

interface FirestoreProject {
  name: string;
  service: string;
  status: string;
  progress: number;
  date: string;
  description: string;
  userId: string;
  createdAt: any;
}

const statusColor: Record<string, string> = {
  Pending: "bg-warning/15 text-warning border-warning/30",
  "In Progress": "bg-info/15 text-info border-info/30",
  Review: "bg-secondary/15 text-secondary border-secondary/30",
  Completed: "bg-success/15 text-success border-success/30",
};

const services = [
  "Website Development",
  "Digital Ads",
  "Branding",
  "Google Business",
  "SEO",
  "Social Media Management",
  "Flyer & Graphics",
];

const projectCategories = [
  { slug: "all", label: "All Services", matcher: null },
  { slug: "website-development", label: "Website Development", matcher: /(website|development)/i },
  { slug: "digital-ads", label: "Digital Ads", matcher: /(ads|campaign)/i },
  { slug: "branding", label: "Design & Branding", matcher: /(design|branding|logo|graphics)/i },
  { slug: "seo", label: "SEO / Local Search", matcher: /(seo|google business|google)/i },
];

const ClientProjects = () => {
  const { category } = useParams<{ category?: string }>();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [viewProject, setViewProject] = useState<Project | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [form, setForm] = useState({ name: "", service: "", description: "" });
  const [loading, setLoading] = useState(true);
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
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as FirestoreProject) }));
        items.sort((a, b) => {
          const aMs = typeof a.createdAt?.toMillis === "function" ? a.createdAt.toMillis() : 0;
          const bMs = typeof b.createdAt?.toMillis === "function" ? b.createdAt.toMillis() : 0;
          return bMs - aMs;
        });
        setProjects(items);
        setLoading(false);
      },
      error => {
        console.error("Failed to load projects", error);
        toast({ title: "Unable to load projects", description: error.message || "Please try again later.", variant: "destructive" });
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user, toast]);

  const currentCategory = projectCategories.find((item) => item.slug === (category || "all"));
  const filtered = projects
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((project) => {
      if (!currentCategory || !currentCategory.matcher) return true;
      return currentCategory.matcher.test(project.service);
    });

  const handleSubmitRequest = async () => {
    if (!user || !form.name || !form.service) return;

    try {
      await addDoc(collection(db, "projects"), {
        userId: user.uid,
        name: form.name,
        service: form.service,
        status: "Pending",
        progress: 0,
        date: new Date().toISOString().split("T")[0],
        description: form.description,
        createdAt: serverTimestamp(),
      });
      setForm({ name: "", service: "", description: "" });
      setRequestOpen(false);
      toast({ title: "Request Submitted", description: "Your new project request has been saved." });
    } catch (error: any) {
      console.error("Failed to submit project request", error);
      toast({ title: "Submission failed", description: error.message || "Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar role="client" />
      <main className="flex-1 p-4 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">My Projects</h1>
            <p className="text-muted-foreground text-sm mt-1">Track and manage your projects — {currentCategory?.label || "All Services"}.</p>
          </div>
          <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="gap-2"><Plus className="w-4 h-4" /> New Request</Button>
            </DialogTrigger>
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
                <Button className="w-full" onClick={handleSubmitRequest}>Submit Request</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search projects..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading your projects...</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No projects found. Submit a request to create one.</div>
          ) : (
            filtered.map(project => (
              <div key={project.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-heading font-semibold text-card-foreground">{project.name}</h3>
                      <Badge variant="outline" className={statusColor[project.status] || statusColor.Pending}>{project.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{project.service}</span>
                      <span>•</span>
                      <span>{project.date}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setViewProject(project)}>
                    <Eye className="w-5 h-5" />
                  </Button>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-semibold text-foreground">{project.progress}%</span>
                  <Badge variant="outline" className={statusColor[project.status] || statusColor.Pending}>{project.status}</Badge>
                </div>
              </div>
            ))
          )}
        </div>

        <Dialog open={!!viewProject} onOpenChange={() => setViewProject(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{viewProject?.name}</DialogTitle>
            </DialogHeader>
            {viewProject && (
              <div className="space-y-4 mt-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusColor[viewProject.status] || statusColor.Pending}>{viewProject.status}</Badge>
                  <span className="text-sm text-muted-foreground">{viewProject.service}</span>
                </div>
                <p className="text-sm text-foreground">{viewProject.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Date:</span> <span className="text-foreground">{viewProject.date}</span></div>
                  <div><span className="text-muted-foreground">Progress:</span> <span className="text-foreground">{viewProject.progress}%</span></div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ClientProjects;
