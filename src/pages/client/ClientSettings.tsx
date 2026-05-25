import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";

const ClientSettings = () => {
  const { updatePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePasswordChange = async () => {
    if (next !== confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setIsUpdating(true);
    try {
      await updatePassword(current, next);
      toast({ title: "Password updated" });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (e: any) {
      toast({ title: "Unable to update password", description: e.message, variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar role="client" />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your profile and preferences.</p>
        </div>

        <Tabs defaultValue="profile" className="max-w-2xl">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="bg-card rounded-xl border border-border p-6 space-y-5">
              <h2 className="font-heading font-semibold text-card-foreground">Personal Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input defaultValue="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue="john@example.com" type="email" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input defaultValue="+234 801 234 5678" />
              </div>
              <Button variant="secondary">Save Changes</Button>
            </div>
          </TabsContent>

          <TabsContent value="business">
            <div className="bg-card rounded-xl border border-border p-6 space-y-5">
              <h2 className="font-heading font-semibold text-card-foreground">Business Details</h2>
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input defaultValue="Doe Enterprises" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input defaultValue="Retail" />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input defaultValue="Lagos, Nigeria" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Brand Colors</Label>
                <Input defaultValue="#1a3b5c, #f5a623" />
              </div>
              <div className="space-y-2">
                <Label>About Your Business</Label>
                <Textarea defaultValue="We sell quality fashion accessories across Nigeria." rows={3} />
              </div>
              <Button variant="secondary">Save Changes</Button>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="bg-card rounded-xl border border-border p-6 space-y-5">
              <h2 className="font-heading font-semibold text-card-foreground">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: "Project Updates", desc: "Get notified when project status changes" },
                  { label: "New Messages", desc: "Receive alerts for new messages" },
                  { label: "Invoice Reminders", desc: "Get payment due date reminders" },
                  { label: "Announcements", desc: "Platform news and updates" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="bg-card rounded-xl border border-border p-6 space-y-5">
              <h2 className="font-heading font-semibold text-card-foreground">Change Password</h2>
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input
                  type="password"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  disabled={isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  disabled={isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={isUpdating}
                />
              </div>
              <Button
                variant="secondary"
                onClick={handlePasswordChange}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ClientSettings;
