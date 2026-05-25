import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { collection, onSnapshot, query, doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebaseconfig";

interface Project {
  id: string;
  name: string;
  userId: string;
  requesterName: string;
  type: string;
  assignedTo: string;
  status: string;
  priority: string;
  deadline: string;
  description: string;
  createdAt?: any;
}

const statusColor: Record<string, string> = {
  Pending: "bg-muted text-muted-foreground border-border",
  "In Progress": "bg-info/15 text-info border-info/30",
  Review: "bg-warning/15 text-warning border-warning/30",
  Completed: "bg-success/15 text-success border-success/30",
};
const priorityColor: Record<string, string> = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-warning/15 text-warning",
  High: "bg-destructive/15 text-destructive",
};

const AdminProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const projectsRef = collection(db, "projects");
    const q = query(projectsRef);
    const unsub = onSnapshot(
      q,
      async (snapshot) => {
        const usersCache = new Map<string, string>();
        const loaded = await Promise.all(
          snapshot.docs.map(async (projectDoc) => {
            const data = projectDoc.data() as any;
            let requesterName = "Unknown";
            if (data.userId) {
              if (usersCache.has(data.userId)) {
                requesterName = usersCache.get(data.userId)!;
              } else {
                try {
                  const userRef = doc(db, "users", data.userId);
                  const userSnap = await getDoc(userRef);
                  if (userSnap.exists()) {
                    const userData = userSnap.data() as any;
                    requesterName = userData.businessName || userData.fullName || userData.email || "User";
                  }
                } catch (error) {
                  console.error("Failed to load user for project", error);
                }
                usersCache.set(data.userId, requesterName);
              }
            }
            return {
              id: projectDoc.id,
              name: data.name || "Untitled Project",
              userId: data.userId || "",
              requesterName,
              type: data.service || data.type || "Unknown",
              assignedTo: data.assignedTo || "Unassigned",
              status: data.status || "Pending",
              priority: data.priority || "Medium",
              deadline: data.deadline || "—",
              description: data.description || "No description provided.",
              createdAt: data.createdAt,
            } as Project;
          })
        );
        loaded.sort((a, b) => {
          const aMs = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const bMs = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return bMs - aMs;
        });
        setProjects(loaded);
      },
      (error) => {
        console.error("Failed to load admin projects", error);
        toast({ title: "Unable to load projects", description: error.message || "Please try again later.", variant: "destructive" });
      }
    );

    return unsub;
  }, [toast]);

  const filtered = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.requesterName.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar role="admin" />
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and manage all live client projects.</p>
        </div>

        <div className="mb-6 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden lg:table-cell">Assigned To</TableHead>
                <TableHead className="hidden xl:table-cell">Description</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Deadline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium text-card-foreground">{project.name}</TableCell>
                  <TableCell className="text-muted-foreground">{project.requesterName}</TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">{project.type}</TableCell>
                  <TableCell className="text-card-foreground hidden lg:table-cell">{project.assignedTo}</TableCell>
                  <TableCell className="text-muted-foreground hidden xl:table-cell">{project.description}</TableCell>
                  <TableCell><Badge variant="outline" className={priorityColor[project.priority]}>{project.priority}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className={statusColor[project.status]}>{project.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">{project.deadline}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default AdminProjects;
