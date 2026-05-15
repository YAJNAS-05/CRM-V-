import React from "react";
import { usePermissions } from "@/hooks/useRBAC";

interface Props {
  module: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({ module, action, children, fallback = null }: Props) {
  const { can, loading } = usePermissions();

  if (loading) {
    return null;
  }

  return can(module, action) ? <>{children}</> : <>{fallback}</>;
}
