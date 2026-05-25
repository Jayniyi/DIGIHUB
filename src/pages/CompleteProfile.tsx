import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";

const CompleteProfile = () => {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // if user already has the fields, skip
    if (!user) return;
    if (user.fullName && user.businessName && user.phoneNumber) {
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [user, navigate]);

  const handleSave = async () => {
    if (!fullName || !businessName || !phoneNumber) {
      toast({ title: "All fields required", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({ fullName, businessName, phoneNumber });
      toast({ title: "Profile completed" });
      navigate(user?.role === "admin" ? "/admin" : "/dashboard");
    } catch (err: unknown) {
      const e = err as Error;
      toast({ title: "Failed to update", description: e?.message || String(err), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl p-8 bg-white/[0.07] backdrop-blur-xl border border-white/15 shadow-2xl">
        <h2 className="font-heading text-2xl font-bold text-white mb-4">Complete your profile</h2>
        <div className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <Label>Business Name</Label>
            <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          </div>
          <div>
            <Label>Phone Number</Label>
            <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
