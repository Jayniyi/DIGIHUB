import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import { Users, FileText, Megaphone, TrendingUp, Palette, Target } from "lucide-react";

const AdminAnalytics = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar role="admin" />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform performance and insights.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatsCard title="Total Clients" value="42" subtitle="+5 this month" icon={Users} />
          <StatsCard title="Active Projects" value="18" subtitle="6 completing soon" icon={FileText} />
          <StatsCard title="Ad Campaigns" value="12" subtitle="8 currently running" icon={Megaphone} />
          <StatsCard title="Design Orders" value="23" subtitle="4 pending review" icon={Palette} />
          <StatsCard title="Pipeline Leads" value="27" subtitle="12 qualified" icon={Target} />
          <StatsCard title="Revenue (MTD)" value="₦4.2M" subtitle="+18% vs last month" icon={TrendingUp} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-heading font-semibold text-lg text-card-foreground mb-4">Revenue Trend</h2>
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
              Chart will be available when backend is connected
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-heading font-semibold text-lg text-card-foreground mb-4">Service Breakdown</h2>
            <div className="space-y-4">
              {[
                { service: "Website Development", count: 15, pct: 35 },
                { service: "Ads Management", count: 12, pct: 28 },
                { service: "Flyer & Graphics", count: 10, pct: 23 },
                { service: "Branding", count: 4, pct: 9 },
                { service: "SEO / Google Business", count: 2, pct: 5 },
              ].map((item) => (
                <div key={item.service}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-card-foreground">{item.service}</span>
                    <span className="text-muted-foreground">{item.count} projects ({item.pct}%)</span>
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
