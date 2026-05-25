import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ClientDashboard from "./pages/ClientDashboard";
import ClientProjects from "./pages/client/ClientProjects";
import ClientMessages from "./pages/client/ClientMessages";
import ClientInvoices from "./pages/client/ClientInvoices";
import ClientSettings from "./pages/client/ClientSettings";
import CompleteProfile from "./pages/CompleteProfile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCRM from "./pages/admin/AdminCRM";
import AdminClients from "./pages/admin/AdminClients";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminAds from "./pages/admin/AdminAds";
import AdminDesigns from "./pages/admin/AdminDesigns";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminLogin from "./pages/AdminLogin";
import RequireAdmin from "./components/RequireAdmin";
import RequireAuth from "./components/RequireAuth";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { AuthProvider } from "./context/AuthContext";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AdminAuthProvider>
          <BrowserRouter>
            <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route element={<RequireAuth />}> 
            <Route path="/dashboard" element={<ClientDashboard />} />
            <Route path="/dashboard/projects" element={<ClientProjects />} />
            <Route path="/dashboard/messages" element={<ClientMessages />} />
            <Route path="/dashboard/invoices" element={<ClientInvoices />} />
            <Route path="/dashboard/settings" element={<ClientSettings />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<RequireAdmin />}> 
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/clients" element={<AdminClients />} />
            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route path="/admin/crm" element={<AdminCRM />} />
            <Route path="/admin/ads" element={<AdminAds />} />
            <Route path="/admin/designs" element={<AdminDesigns />} />
            <Route path="/admin/staff" element={<AdminStaff />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/announcements" element={<AdminAnnouncements />} />
            <Route path="/admin/messages" element={<AdminMessages />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
        </AdminAuthProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
