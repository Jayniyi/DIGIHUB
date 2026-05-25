import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Client {
  id: string;
  businessName?: string;
  fullName?: string;
  contact?: string;
  email?: string;
  status?: string;
  joined?: string;
}

interface ProjectHistoryEntry {
  name: string;
  status: string;
  description: string;
  date: string;
}

const statusColor: Record<string, string> = {
  Active: "bg-success/15 text-success border-success/30",
  Suspended: "bg-destructive/15 text-destructive border-destructive/30",
};

const AdminClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [viewClient, setViewClient] = useState<Client | null>(null);
  const [projectHistory, setProjectHistory] = useState<Record<string, ProjectHistoryEntry[]>>({});
  const { toast } = useToast();

  useEffect(() => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", "user"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setClients(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      },
      (err) => {
        console.error("failed to load clients", err);
        toast({ title: "Failed to load clients", description: err?.message || String(err), variant: "destructive" });
      }
    );
    return unsub;
  }, [toast]);

  useEffect(() => {
    const projectsRef = collection(db, "projects");
    const unsub = onSnapshot(projectsRef, (snapshot) => {
      const history: Record<string, ProjectHistoryEntry[]> = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data() as any;
        if (!data.userId) return;
        const entry: ProjectHistoryEntry = {
          name: data.name || "Untitled project",
          status: data.status || "Pending",
          description: data.description || "No description provided.",
          date: data.date || "",
        };
        history[data.userId] = history[data.userId] || [];
        history[data.userId].push(entry);
      });
      Object.values(history).forEach((entries) => {
        entries.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      });
      setProjectHistory(history);
    }, (err) => {
      console.error("failed to load project history", err);
      toast({ title: "Failed to load project history", description: err?.message || String(err), variant: "destructive" });
    });
    return unsub;
  }, [toast]);

  const filtered = clients.filter(
    (c) =>
      (c.businessName || c.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.contact || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (projectHistory[c.id] || [])
        .map((history) => `${history.name} ${history.status} ${history.description}`)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar role="admin" />
      <main className="flex-1 p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Clients</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage all client accounts and project history.</p>
          </div>
        </div>

        <div className="mb-6 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>History</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((client) => {
                const historyEntries = projectHistory[client.id] || [];
                const historyText = historyEntries.length
                  ? historyEntries.slice(0, 2).map((entry) => `${entry.name} (${entry.status})`).join(" · ")
                  : "No requests";
                return (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium text-card-foreground">{client.businessName || client.fullName || client.email}</TableCell>
                    <TableCell className="text-muted-foreground">{client.contact || client.email || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{historyText}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColor[client.status || "Active"]}>
                        {client.status || "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden lg:table-cell">{client.joined || "—"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setViewClient(client)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <Dialog open={!!viewClient} onOpenChange={() => setViewClient(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{viewClient?.businessName || viewClient?.fullName || viewClient?.email}</DialogTitle>
            </DialogHeader>
            {viewClient && (
              <div className="space-y-3 text-sm mt-2">
                <Badge variant="outline" className={statusColor[viewClient.status || "Active"]}>
                  {viewClient.status || "Active"}
                </Badge>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground">Contact:</span>{" "}
                    <span className="text-foreground">{viewClient.contact || viewClient.email || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    <span className="text-foreground">{viewClient.email || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Projects:</span>{" "}
                    <span className="text-foreground">{(projectHistory[viewClient.id] || []).length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Joined:</span>{" "}
                    <span className="text-foreground">{viewClient.joined || "—"}</span>
                  </div>
                </div>
                {(projectHistory[viewClient.id] || []).map((entry, index) => (
                  <div key={index} className="rounded-xl border border-border p-3 bg-muted/50">
                    <p className="font-medium text-card-foreground">{entry.name}</p>
                    <p className="text-muted-foreground text-xs">{entry.status} • {entry.date || "No date"}</p>
                    <p className="mt-2 text-sm text-foreground">{entry.description}</p>
                  </div>
                ))}
                {(projectHistory[viewClient.id] || []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No project history available for this client.</p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Client removed: clients are created by users upon signup */}
      </main>
    </div>
  );
};

export default AdminClients;
