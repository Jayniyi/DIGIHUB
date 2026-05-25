import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RequireAuth: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // show simple spinner or message while auth state initializes
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <Outlet />;
};

export default RequireAuth;
