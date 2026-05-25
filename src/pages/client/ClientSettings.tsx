import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, onSnapshot, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const ClientSettings = () => {
  const { updatePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { user, updateProfile, logout } = useAuth();

  // profile/business state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bizName, setBizName] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [brandColors, setBrandColors] = useState("");
  const [about, setAbout] = useState("");

  const [notifPrefs, setNotifPrefs] = useState<any>({});
  const [sessions, setSessions] = useState<any[]>([]);

  const [profileLocked, setProfileLocked] = useState(false);
  const [businessLocked, setBusinessLocked] = useState(false);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    let mounted = true;
    getDoc(ref).then((snap) => {
      if (!mounted) return;
      const data = snap.exists() ? (snap.data() as any) : {};
      setFirstName(data.fullName ? String(data.fullName).split(" ")[0] : "");
      setLastName(data.fullName ? String(data.fullName).split(" ").slice(1).join(" ") : "");
      setEmail(data.email || user.email || "");
      setPhone(data.phoneNumber || "");
      setBizName(data.businessName || "");
      setIndustry(data.industry || "");
      setLocation(data.location || "");
      setBrandColors(data.brandColors || "");
      setAbout(data.about || "");
      setNotifPrefs(data.notificationPrefs || {});

      const sixMonths = 1000 * 60 * 60 * 24 * 30 * 6;
      if (data.profileUpdatedAt && data.profileUpdatedAt.toMillis) {
        const last = data.profileUpdatedAt.toMillis();
        setProfileLocked(Date.now() - last < sixMonths);
      }
      if (data.businessUpdatedAt && data.businessUpdatedAt.toMillis) {
        const last = data.businessUpdatedAt.toMillis();
        setBusinessLocked(Date.now() - last < sixMonths);
      }
    });

    // listen for sessions
    const q = query(collection(db, "sessions"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setSessions(items);
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, [user]);

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

  const handleSaveProfile = async () => {
    if (!user) return;
    if (profileLocked) {
      toast({ title: "Profile locked", description: "Profile can only be changed once every 6 months.", variant: "destructive" });
      return;
    }
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      await updateProfile({ fullName, phoneNumber: phone });
      await setDoc(doc(db, "users", user.uid), { profileUpdatedAt: serverTimestamp() }, { merge: true });
      setProfileLocked(true);
      toast({ title: "Profile updated" });
    } catch (e: any) {
      toast({ title: "Unable to update profile", description: e.message, variant: "destructive" });
    }
  };

  const handleSaveBusiness = async () => {
    if (!user) return;
    if (businessLocked) {
      toast({ title: "Business details locked", description: "Business details can only be changed once every 6 months.", variant: "destructive" });
      return;
    }
    try {
      await updateProfile({ businessName: bizName || null });
      await setDoc(doc(db, "users", user.uid), {
        businessName: bizName || null,
        industry: industry || null,
        location: location || null,
        brandColors: brandColors || null,
        about: about || null,
        businessUpdatedAt: serverTimestamp(),
      }, { merge: true });
      setBusinessLocked(true);
      toast({ title: "Business details updated" });
    } catch (e: any) {
      toast({ title: "Unable to update business details", description: e.message, variant: "destructive" });
    }
  };

  const handleSaveNotif = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), { notificationPrefs: notifPrefs }, { merge: true });
      toast({ title: "Notification preferences saved" });
    } catch (e: any) {
      toast({ title: "Unable to save preferences", description: e.message, variant: "destructive" });
    }
  };

  const handleLogoutSession = async (id: string) => {
    try {
      await deleteDoc(doc(db, "sessions", id));
      toast({ title: "Session logged out" });
    } catch (e: any) {
      toast({ title: "Unable to log out session", description: e.message, variant: "destructive" });
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
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={!user || profileLocked} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={!user || profileLocked} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email} type="email" disabled />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!user || profileLocked} />
              </div>
              <Button variant="secondary" onClick={handleSaveProfile} disabled={!user || profileLocked}>Save Changes</Button>
              {profileLocked && <p className="text-xs text-muted-foreground">Profile is locked for 6 months after updates.</p>}
            </div>
          </TabsContent>

          <TabsContent value="business">
            <div className="bg-card rounded-xl border border-border p-6 space-y-5">
              <h2 className="font-heading font-semibold text-card-foreground">Business Details</h2>
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input value={bizName} onChange={(e) => setBizName(e.target.value)} disabled={!user || businessLocked} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input value={industry} onChange={(e) => setIndustry(e.target.value)} disabled={!user || businessLocked} />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} disabled={!user || businessLocked} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Brand Colors</Label>
                <Input value={brandColors} onChange={(e) => setBrandColors(e.target.value)} disabled={!user || businessLocked} />
              </div>
              <div className="space-y-2">
                <Label>About Your Business</Label>
                <Textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={3} disabled={!user || businessLocked} />
              </div>
              <Button variant="secondary" onClick={handleSaveBusiness} disabled={!user || businessLocked}>Save Changes</Button>
              {businessLocked && <p className="text-xs text-muted-foreground">Business details are locked for 6 months after updates.</p>}
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="bg-card rounded-xl border border-border p-6 space-y-5">
              <h2 className="font-heading font-semibold text-card-foreground">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { key: "projectUpdates", label: "Project Updates", desc: "Get notified when project status changes" },
                  { key: "newMessages", label: "New Messages", desc: "Receive alerts for new messages" },
                  { key: "invoiceReminders", label: "Invoice Reminders", desc: "Get payment due date reminders" },
                  { key: "announcements", label: "Announcements", desc: "Platform news and updates" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch checked={Boolean(notifPrefs[item.key])} onCheckedChange={(val) => setNotifPrefs((p: any) => ({ ...p, [item.key]: val }))} />
                  </div>
                ))}
                <div className="pt-4">
                  <Button variant="secondary" onClick={handleSaveNotif}>Save Preferences</Button>
                </div>
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

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-card-foreground mb-3">Active Sessions</h3>
                <div className="space-y-2">
                  {sessions.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No active sessions found.</div>
                  ) : (
                    sessions.map((s) => (
                      <div key={s.id} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                        <div className="text-sm">
                          <div className="font-medium">{String(s.userAgent || "Browser").slice(0, 60)}</div>
                          <div className="text-xs text-muted-foreground">{s.createdAt?.toMillis ? new Date(s.createdAt.toMillis()).toLocaleString() : String(s.createdAt)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" onClick={() => handleLogoutSession(s.id)}>Log out</Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ClientSettings;
