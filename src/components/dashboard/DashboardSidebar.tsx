import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, FileText, MessageSquare, Receipt, 
  Users, Settings, BarChart3, Megaphone, Palette, 
  UserCheck, Bell, Zap, LogOut, Target, Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { useAdminAuth } from "@/context/useAdminAuth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
}

const clientNav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Projects", icon: FileText, href: "/dashboard/projects" },
  { label: "Messages", icon: MessageSquare, href: "/dashboard/messages" },
  { label: "Announcements", icon: Bell, href: "/dashboard/announcements" },
  { label: "Invoices", icon: Receipt, href: "/dashboard/invoices" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

const projectCategories = [
  { label: "All Services", href: "/dashboard/projects" },
  { label: "Website Development", href: "/dashboard/projects/website-development" },
  { label: "Digital Ads", href: "/dashboard/projects/digital-ads" },
  { label: "Design & Branding", href: "/dashboard/projects/branding" },
  { label: "SEO / Local Search", href: "/dashboard/projects/seo" },
];

const adminNav: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard, href: "/admin" },
  { label: "Clients", icon: Users, href: "/admin/clients" },
  { label: "Projects", icon: FileText, href: "/admin/projects" },
  { label: "CRM Pipeline", icon: Target, href: "/admin/crm" },
  { label: "Ads Campaigns", icon: Megaphone, href: "/admin/ads" },
  { label: "Design Orders", icon: Palette, href: "/admin/designs" },
  { label: "Staff", icon: UserCheck, href: "/admin/staff" },
  { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { label: "Announcements", icon: Bell, href: "/admin/announcements" },
  { label: "Messages", icon: MessageSquare, href: "/admin/messages" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

interface DashboardSidebarProps {
  role: "client" | "admin";
}

const DashboardSidebar = ({ role }: DashboardSidebarProps) => {
  const location = useLocation();
  const navItems = role === "admin" ? adminNav : clientNav;
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [announcementCount, setAnnouncementCount] = useState(0);
  const { user, logout: clientLogout } = useAuth();
  const { logout: adminLogout } = useAdminAuth();
  const logout = role === "admin" ? adminLogout : clientLogout;

  useEffect(() => {
    let unsubscribe = () => {};
    if (role === "admin") {
      const q = query(collection(db, "threads"), where("unreadForAdmin", "==", true));
      unsubscribe = onSnapshot(q, (snapshot) => setUnreadCount(snapshot.size));
    } else if (user) {
      const messageQuery = query(
        collection(db, "threads"),
        where("clientId", "==", user.uid),
        where("unreadForClient", "==", true)
      );
      const announcementsQuery = query(
        collection(db, "announcements"),
        where("status", "==", "Published"),
        where("audience", "in", ["All Users", "Clients"])
      );
      const messageUnsub = onSnapshot(messageQuery, (snapshot) => setUnreadCount(snapshot.size));
      const announcementUnsub = onSnapshot(announcementsQuery, (snapshot) => setAnnouncementCount(snapshot.size));
      unsubscribe = () => {
        messageUnsub();
        announcementUnsub();
      };
    }
    return unsubscribe;
  }, [role, user]);

  const sidebarContent = (
    <>
      <div className="p-5 border-b border-sidebar-border flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-lg text-sidebar-foreground">
            DigiPro<span className="text-sidebar-primary">Hub</span>
          </span>
        </Link>
        {isMobile && (
          <button onClick={() => setOpen(false)} className="text-sidebar-foreground/70 hover:text-sidebar-foreground">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isProjectRoot = item.href === "/dashboard/projects";
          const isActive = isProjectRoot ? location.pathname.startsWith("/dashboard/projects") : location.pathname === item.href;

          if (isProjectRoot) {
            return (
              <div key={item.href}>
                <Link
                  to={item.href}
                  onClick={() => {
                    setProjectsOpen(true);
                    if (isMobile) setOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  <span className="text-xs text-sidebar-foreground/70">{projectsOpen ? "▾" : "▸"}</span>
                </Link>
                {(projectsOpen || isActive) && (
                  <div className="space-y-1 pl-10 mt-1">
                    {projectCategories.map((category) => {
                      const isCategoryActive = location.pathname === category.href;
                      return (
                        <Link
                          key={category.href}
                          to={category.href}
                          onClick={() => isMobile && setOpen(false)}
                          className={cn(
                            "block rounded-lg px-3 py-2 text-sm transition-colors",
                            isCategoryActive
                              ? "bg-sidebar-accent text-sidebar-primary"
                              : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                          )}
                        >
                          {category.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => isMobile && setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {item.label === "Messages" && unreadCount > 0 ? (
                <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold text-secondary-foreground">
                  {unreadCount}
                </span>
              ) : null}
              {item.label === "Announcements" && announcementCount > 0 ? (
                <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold text-secondary-foreground">
                  {announcementCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-1">
        <div className="flex items-center gap-3 px-3 py-1">
          <ThemeToggle variant="dark" />
          <span className="text-xs text-sidebar-foreground/50">Theme</span>
        </div>
        <Link
          to="/"
          onClick={() => {
            logout();
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Link>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="fixed top-4 left-4 z-50 w-10 h-10 rounded-lg bg-sidebar flex items-center justify-center shadow-lg border border-sidebar-border"
        >
          <Menu className="w-5 h-5 text-sidebar-foreground" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setOpen(false)} />
            <aside className="fixed inset-y-0 left-0 w-64 bg-sidebar z-50 flex flex-col shadow-2xl">
              {sidebarContent}
            </aside>
          </>
        )}
      </>
    );
  }

  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {sidebarContent}
    </aside>
  );
};

export default DashboardSidebar;
