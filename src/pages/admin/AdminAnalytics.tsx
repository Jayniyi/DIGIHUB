import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import { Users, FileText, Megaphone, TrendingUp, Palette, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface AnalyticsProject {
  id: string;
  service?: string;
  status?: string;
}

interface ServiceBreakdownItem {
  label: string;
  count: number;
  pct: number;
}

const serviceCategories = [
  { label: "Website Development", matcher: /(website|development)/i },
  { label: "Digital Ads", matcher: /(ads|campaign)/i },
  { label: "Branding & Design", matcher: /(design|branding|logo|graphics)/i },
  { label: "SEO / Google Business", matcher: /(seo|google business|google)/i },
  { label: "Social Media", matcher: /(social media|instagram|facebook|tiktok)/i },
];

const AdminAnalytics = () => {
  const [clientsCount, setClientsCount] = useState(0);
  const [projects, setProjects] = useState<AnalyticsProject[]>([]);
  const [leadsCount, setLeadsCount] = useState(0);
  const [revenueMTD, setRevenueMTD] = useState(0);

  useEffect(() => {
    const usersRef = collection(db, "users");
    const usersQuery = query(usersRef, where("role", "==", "user"));
    const usersUnsub = onSnapshot(usersQuery, (snapshot) => setClientsCount(snapshot.size));

    const projectsRef = collection(db, "projects");
    const projectsQuery = query(projectsRef);
    const projectsUnsub = onSnapshot(projectsQuery, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as AnalyticsProject) }));
      setProjects(items);
    });

    const leadsRef = collection(db, "leads");
    const leadsQuery = query(leadsRef);
    const leadsUnsub = onSnapshot(leadsQuery, (snapshot) => setLeadsCount(snapshot.size));

    const invoicesRef = collection(db, "invoices");
    const invoicesQuery = query(invoicesRef);
    const invoicesUnsub = onSnapshot(invoicesQuery, (snapshot) => {
      const now = new Date();
      let total = 0;
      snapshot.docs.forEach((doc) => {
        const data = doc.data() as any;
        const dateText = data.date;
        const createdAt = dateText ? new Date(dateText) : null;
        const isCurrentMonth = createdAt
          ? createdAt.getFullYear() === now.getFullYear() && createdAt.getMonth() === now.getMonth()
          : true;

        if (!isCurrentMonth) {
          return;
        }

        const amount = typeof data.amountNum === "number"
          ? data.amountNum
          : typeof data.amount === "string"
          ? Number(data.amount.replace(/[^0-9.-]/g, ""))
          : 0;

        if (!Number.isNaN(amount)) {
          total += amount;
        }
      });
      setRevenueMTD(total);
    });

    return () => {
      usersUnsub();
      projectsUnsub();
      leadsUnsub();
      invoicesUnsub();
    };
  }, []);

  const adCampaigns = projects.filter((project) => /ads|campaign/i.test(project.service || "")).length;
  const designOrders = projects.filter((project) => /(design|branding)/i.test(project.service || "")).length;

  const breakdown: ServiceBreakdownItem[] = serviceCategories.map((service) => {
    const count = projects.filter((project) => service.matcher.test(project.service || "")).length;
    const pct = projects.length ? Math.round((count / projects.length) * 100) : 0;
    return { label: service.label, count, pct };
  });

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar role="admin" />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform performance and insights.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatsCard title="Total Clients" value={String(clientsCount)} subtitle="Active client accounts" icon={Users} />
          <StatsCard title="Active Projects" value={String(projects.length)} subtitle="Live project requests" icon={FileText} />
          <StatsCard title="Ad Campaigns" value={String(adCampaigns)} subtitle="Ad-focused requests" icon={Megaphone} />
          <StatsCard title="Design Orders" value={String(designOrders)} subtitle="Design and branding jobs" icon={Palette} />
          <StatsCard title="Pipeline Leads" value={String(leadsCount)} subtitle="Sales pipeline total" icon={Target} />
          <StatsCard title="Revenue (MTD)" value={`₦${revenueMTD.toLocaleString()}`} subtitle="This month" icon={TrendingUp} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-heading font-semibold text-lg text-card-foreground mb-4">Revenue Trend</h2>
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
              Revenue is calculated from invoices stored in Firestore.
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-heading font-semibold text-lg text-card-foreground mb-4">Service Breakdown</h2>
            <div className="space-y-4">
              {breakdown.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-card-foreground">{item.label}</span>
                    <span className="text-muted-foreground">{item.count} requests ({item.pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;
