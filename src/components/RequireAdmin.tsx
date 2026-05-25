import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "@/context/useAdminAuth";

const RequireAdmin: React.FC = () => {
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
};

export default RequireAdmin;
