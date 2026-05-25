import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import { Users, FileText, Megaphone, TrendingUp, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, doc, getDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../../firebaseconfig";

interface AdminProject {
  id: string;
  name: string;
  service: string;
  status: string;
  date?: string;
  userId: string;
  requesterName?: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const displayName = user?.businessName || user?.fullName || "";
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [clientsCount, setClientsCount] = useState(0);

  useEffect(() => {
    const projectsRef = collection(db, "projects");
    const q = query(projectsRef);
    const unsub = onSnapshot(q, async snapshot => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      // enrich with requester name
      const enriched = await Promise.all(docs.map(async p => {
        let requesterName = "Unknown";
        try {
          const uref = doc(db, "users", p.userId);
          const usnap = await getDoc(uref);
          if (usnap.exists()) {
            const data = usnap.data() as any;
            requesterName = data.businessName || data.fullName || data.email || "User";
          }
        } catch (e) {
          console.error("failed to load user for project", e);
        }
        return { ...p, requesterName } as AdminProject;
      }));
      // sort by createdAt if available
      enriched.sort((a: any, b: any) => {
        const aMs = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bMs = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bMs - aMs;
      });
      setProjects(enriched as AdminProject[]);
    });
    return unsub;
  }, []);

  const changeStatus = async (projectId: string, status: string) => {
    try {
      await updateDoc(doc(db, "projects", projectId), { status });
    } catch (err) {
      console.error("failed to update project status", err);
    }
  };

  useEffect(() => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", "user"));
    const unsub = onSnapshot(q, (snapshot) => {
      setClientsCount(snapshot.size);
    }, (error) => {
      console.error("failed to load clients count", error);
    });
    return unsub;
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar role="admin" />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Admin Overview{displayName ? ` — ${displayName}` : ""}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Platform performance and pipeline at a glance.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatsCard title="Total Clients" value={String(clientsCount)} icon={Users} />
          <StatsCard title="Active Projects" value={String(projects.length)} icon={FileText} />
          <StatsCard title="Ad Campaigns" value="12" icon={Megaphone} />
          <StatsCard title="Pipeline Leads" value="27" icon={Target} />
          <StatsCard title="Revenue (MTD)" value="₦4.2M" icon={TrendingUp} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Projects */}
          <div className="bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-heading font-semibold text-lg text-card-foreground">Project Requests</h2>
            </div>
            <div className="divide-y divide-border">
              {projects.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="font-medium text-card-foreground">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{p.requesterName} · {p.service}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select className="rounded-md border px-2 py-1 text-sm" value={p.status} onChange={e => changeStatus(p.id, e.target.value)}>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Review</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <Badge variant="outline" className={p.status === "Completed" ? "bg-success/15 text-success" : "bg-muted/10 text-muted-foreground"}>{p.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity (keeps static for now) */}
          <div className="bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-heading font-semibold text-lg text-card-foreground">Recent Activity</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-secondary mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-card-foreground">Recent project updates are visible here.</p>
                  <p className="text-xs text-muted-foreground">Live activity stream will appear when enabled.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
