import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  audience: string;
  status: string;
}

const ClientAnnouncements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    if (!user) return;

    const announcementsRef = collection(db, "announcements");
    const announcementsQuery = query(
      announcementsRef,
      where("status", "==", "Published"),
      where("audience", "in", ["All Users", "Clients"])
    );
    const unsubscribe = onSnapshot(announcementsQuery, (snapshot) => {
      const items = snapshot.docs
        .map((doc) => ({ id: doc.id, ...(doc.data() as any) }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAnnouncements(items);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setDoc(doc(db, "users", user.uid), { lastAnnouncementSeenAt: serverTimestamp() }, { merge: true }).catch(() => {});
  }, [user]);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar role="client" />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-foreground">Announcements</h1>
          <p className="text-muted-foreground text-sm mt-1">Latest platform updates and news for your account.</p>
        </div>

        <div className="grid gap-4">
          {announcements.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">No announcements at the moment. Check back soon for updates.</div>
          ) : (
            announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <h2 className="font-semibold text-card-foreground">{announcement.title}</h2>
                        <Badge variant="outline" className="text-xs">{announcement.audience}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{announcement.message}</p>
                      <p className="mt-3 text-xs text-muted-foreground">{announcement.date}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientAnnouncements;
