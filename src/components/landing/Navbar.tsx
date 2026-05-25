import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAdminAuth } from "@/context/useAdminAuth";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-hero/95 backdrop-blur-md border-b border-hero-foreground/10">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
            <Zap className="w-5 h-5 text-secondary-foreground" />
          </div>
          <span className="font-heading font-bold text-xl text-hero-foreground">
            DigiPro<span className="text-secondary">Hub</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#services" className="text-hero-foreground/70 hover:text-hero-foreground transition-colors text-sm font-medium">Services</a>
          <a href="#how-it-works" className="text-hero-foreground/70 hover:text-hero-foreground transition-colors text-sm font-medium">How It Works</a>
          <a href="#pricing" className="text-hero-foreground/70 hover:text-hero-foreground transition-colors text-sm font-medium">Pricing</a>
          <a href="#contact" className="text-hero-foreground/70 hover:text-hero-foreground transition-colors text-sm font-medium">Contact</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle variant="light" />
          {!user && (
            <>
              <Button variant="ghost" size="sm" className="text-hero-foreground/80 hover:text-hero-foreground hover:bg-hero-foreground/10" asChild>
                <Link to="/auth">Log In</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/auth?tab=signup">Get Started</Link>
              </Button>
            </>
          )}
          {user && (
            <>
              <Button variant="ghost" size="sm" className="text-hero-foreground/80 hover:text-hero-foreground hover:bg-hero-foreground/10" asChild>
                <Link to={user.role === "admin" ? "/admin" : "/dashboard"}>
                  Dashboard
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-hero-foreground/80 hover:text-hero-foreground hover:bg-hero-foreground/10"
                onClick={() => logout()}
              >
                Log Out
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden text-hero-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-hero border-t border-hero-foreground/10 p-4 space-y-3">
          <a href="#services" className="block text-hero-foreground/70 hover:text-hero-foreground py-2">Services</a>
          <a href="#how-it-works" className="block text-hero-foreground/70 hover:text-hero-foreground py-2">How It Works</a>
          <a href="#pricing" className="block text-hero-foreground/70 hover:text-hero-foreground py-2">Pricing</a>
          <a href="#contact" className="block text-hero-foreground/70 hover:text-hero-foreground py-2">Contact</a>
          <div className="flex gap-3 pt-2">
            {!user && (
              <>
                <Button variant="hero-outline" size="sm" asChild className="flex-1">
                  <Link to="/auth">Log In</Link>
                </Button>
                <Button variant="hero" size="sm" asChild className="flex-1">
                  <Link to="/auth?tab=signup">Get Started</Link>
                </Button>
              </>
            )}
            {user && (
              <>
                <Button variant="hero-outline" size="sm" asChild className="flex-1">
                  <Link to={user.role === "admin" ? "/admin" : "/dashboard"}>
                    Dashboard
                  </Link>
                </Button>
                <Button
                  variant="hero-outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => logout()}
                >
                  Log Out
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
