import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAdminAuth } from "@/context/useAdminAuth";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const inputClass =
  "bg-white/10 border-white/25 text-white placeholder:text-white/50 focus:border-secondary focus:ring-secondary/30";

const AdminLogin = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, register, isAuthenticated } = useAdminAuth();
  const { resetPassword, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (forgotMode) {
      return;
    }
    setIsLoading(true);
    try {
      if (isSignup) {
        const success = await register(email, password, department);
        if (success) {
          toast({ title: "Admin account created" });
          navigate("/admin");
        } else {
          setError("Unable to create admin account");
        }
      } else {
        const success = await login(email, password);
        if (success) {
          toast({ title: "Signed in as admin" });
          navigate("/admin");
        } else {
          setError("Invalid credentials or not an admin");
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setError(null);
    setResetMessage(null);
    setIsLoading(true);
    try {
      await resetPassword(email);
      setResetMessage("If that address is registered, a reset link has been sent.");
    } catch (e: any) {
      setError(e.message || "Unable to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  // redirect if already logged in as an admin
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin");
    }
    // if a regular user is signed in, don't automatically redirect here
    // instead we show the form and let them log out or sign in as admin.
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="rounded-2xl p-8 bg-white/[0.07] backdrop-blur-xl border border-white/15 shadow-2xl">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
              <Zap className="w-5 h-5 text-secondary-foreground" />
            </div>
            <span className="font-heading font-bold text-xl text-white">
              DigiPro<span className="text-secondary">Hub</span>
            </span>
          </div>

          <h1 className="font-heading text-2xl font-bold text-white mb-2">
            {forgotMode
              ? "Reset Password"
              : isSignup
              ? "Create Admin Account"
              : "Admin Sign In"}
          </h1>
          <p className="text-white/60 text-sm mb-8">
            {forgotMode
              ? "Enter your email and we'll send a reset link."
              : isSignup
              ? "Set up your administrator credentials."
              : "Enter your admin email and password."}
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-white/90 text-sm font-medium mb-1.5 block">Email</label>
              <Input
                placeholder="admin@example.com"
                className={inputClass}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {!forgotMode && (
              <div>
                <label className="text-white/90 text-sm font-medium mb-1.5 block">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`${inputClass} pr-10`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {isSignup && !forgotMode && (
              <div>
                <label className="text-white/90 text-sm font-medium mb-1.5 block">Department</label>
                <div>
                  <Select value={department} onValueChange={(v) => setDepartment(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CEO">CEO</SelectItem>
                      <SelectItem value="Ads Manager">Ads Manager</SelectItem>
                      <SelectItem value="Web Creator">Web Creator</SelectItem>
                      <SelectItem value="Designer">Designer</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {!forgotMode && (
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isSignup ? "Creating..." : "Signing in..."}
                  </>
                ) : isSignup ? (
                  "Create Admin Account"
                ) : (
                  "Sign In"
                )}
              </Button>
            )}
            {forgotMode && (
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                type="button"
                onClick={handleReset}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            )}
          </form>

          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          {resetMessage && <p className="text-green-400 text-sm mt-2">{resetMessage}</p>}

          <div className="mt-4 text-right">
            {!forgotMode && !isSignup && (
              <button
                onClick={() => setForgotMode(true)}
                className="text-secondary hover:text-secondary/80 text-sm font-medium"
              >
                Forgot password?
              </button>
            )}
          </div>

          <div className="mt-6 text-center">
            {!forgotMode && (
              <button
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError(null);
                }}
                className="text-secondary hover:text-secondary/80 text-sm font-medium"
              >
                {isSignup
                  ? "Already an admin? Sign In"
                  : "New here? Create account"}
              </button>
            )}
            {forgotMode && (
              <button
                onClick={() => setForgotMode(false)}
                className="text-secondary hover:text-secondary/80 text-sm font-medium"
              >
                Back to {isSignup ? "sign up" : "sign in"}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
