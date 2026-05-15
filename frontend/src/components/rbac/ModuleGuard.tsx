import React from "react";
import { Navigate } from "react-router-dom";
import { usePermissions } from "@/hooks/useRBAC";

interface Props {
  module: string;
  children: React.ReactNode;
}

export function ModuleGuard({ module, children }: Props) {
  const { can, loading } = usePermissions();

  if (loading) {
    return null;
  }

  if (!can(module, "view")) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
