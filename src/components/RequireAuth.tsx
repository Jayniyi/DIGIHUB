import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const RequireAuth: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-border bg-card px-6 py-5 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-base font-medium text-foreground">Checking authentication...</span>
        </div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <Outlet />;
};

export default RequireAuth;
