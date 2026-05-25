import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, ArrowLeft, Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { SiGoogle, SiApple } from "react-icons/si";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";

const inputClass =
  "bg-white/10 border-white/25 text-white placeholder:text-white/50 focus:border-secondary focus:ring-secondary/30";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isSignup, setIsSignup] = useState(searchParams.get("tab") === "signup");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, signIn, signInWithGoogle, signInWithApple, signInWithPhone, resetPassword, user } = useAuth();
  const navigate = useNavigate();

  // redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (forgotMode) {
      return;
    }
    setIsLoading(true);
    try {
      if (isSignup) {
        const u = await signUp(email, password, {
          fullName,
          businessName,
          phoneNumber: phone,
        });
        toast({ title: "Account created", description: "Welcome aboard!" });
        if (u.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        let u;
        // determine whether input is phone or email
        const phoneRegex = /^\+?\d{7,}$/;
        if (phoneRegex.test(email)) {
          u = await signInWithPhone(email);
        } else {
          u = await signIn(email, password);
        }
        toast({ title: "Signed in", description: "Redirecting to your dashboard" });
        if (u.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (e: any) {
      setError(e.message || "Authentication failed");
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

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

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
              ? "Create Your Account"
              : "Welcome Back"}
          </h1>
          <p className="text-white/60 text-sm mb-8">
            {forgotMode
              ? "Enter your email and we'll send a reset link."
              : isSignup
              ? "Start your digital transformation journey today."
              : "Sign in to access your dashboard."}
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {forgotMode ? null : isSignup ? (
              <div>
                <label className="text-white/90 text-sm font-medium mb-1.5 block">Full Name</label>
                <Input
                  placeholder="Your full name"
                  className={inputClass}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            ) : null}

            <div>
              <label className="text-white/90 text-sm font-medium mb-1.5 block">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {isSignup && (
              <div>
                <label className="text-white/90 text-sm font-medium mb-1.5 block">Phone Number</label>
                <Input
                  placeholder="+234 800 000 0000"
                  className={inputClass}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            {forgotMode ? null : (
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

            {forgotMode ? null : isSignup ? (
              <div>
                <label className="text-white/90 text-sm font-medium mb-1.5 block">Business Name</label>
                <Input
                  placeholder="Your business name"
                  className={inputClass}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            ) : null}

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
                  "Create Account"
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

          {/* reCAPTCHA container for phone auth */}
          <div id="recaptcha-container" />

          {/* oauth options for users */}
          {!forgotMode && (
            <div className="mt-4 space-y-2">
              <Button
                variant="outline"
                size="lg"
                className="w-full flex items-center justify-center gap-2"
                onClick={async () => {
                  setError(null);
                  setIsLoading(true);
                  try {
                    const u = await signInWithGoogle();
                    toast({ title: "Signed in with Google" });
                    if (!u.fullName || !u.businessName || !u.phoneNumber) {
                      navigate("/complete-profile");
                    } else if (u.role === "admin") {
                      navigate("/admin");
                    } else {
                      navigate("/dashboard");
                    }
                  } catch (e: any) {
                    setError(e.message || "OAuth failed");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
              >
                <SiGoogle className="w-5 h-5" />
                Continue with Google
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full flex items-center justify-center gap-2"
                onClick={async () => {
                  setError(null);
                  setIsLoading(true);
                  try {
                    const u = await signInWithApple();
                      toast({ title: "Signed in with Apple" });
                      if (!u.fullName || !u.businessName || !u.phoneNumber) {
                        navigate("/complete-profile");
                      } else if (u.role === "admin") {
                        navigate("/admin");
                      } else {
                        navigate("/dashboard");
                      }
                  } catch (e: any) {
                    setError(e.message || "OAuth failed");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
              >
                <SiApple className="w-5 h-5" />
                Continue with Apple
              </Button>
            </div>
          )}

          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          {resetMessage && <p className="text-green-400 text-sm mt-2">{resetMessage}</p>}

          <div className="mt-4 text-right">
            {!isSignup && !forgotMode && (
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
                onClick={() => setIsSignup(!isSignup)}
                className="text-secondary hover:text-secondary/80 text-sm font-medium"
              >
                {isSignup
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Sign Up"}
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

export default Auth;
