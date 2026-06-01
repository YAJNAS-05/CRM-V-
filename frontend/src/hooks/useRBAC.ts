import { useMemo, useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { adminApi } from "@/api/adminApi";

type Permission = { module: string; action: string };

function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/** Map flat permission strings like "CRM_VIEW" to {module, action} pairs */
function parsePermissions(rawPerms: string[]): Permission[] {
  return rawPerms.flatMap((p) => {
    const idx = p.lastIndexOf("_");
    if (idx <= 0) return [];
    return [{ module: p.slice(0, idx).toLowerCase(), action: p.slice(idx + 1).toLowerCase() }];
  });
}

export function usePermissions() {
  const user = useAuthStore((state) => state.user);
  const rawPermissions = user?.permissions || [];

  const permissions = useMemo(() => parsePermissions(rawPermissions), [rawPermissions]);

  const can = useMemo(
    () => (module: string, action: string) =>
      permissions.some(
        (p) =>
          p.module.toLowerCase() === module.toLowerCase() &&
          p.action.toLowerCase() === action.toLowerCase(),
      ),
    [permissions],
  );

  return { permissions, can, loading: false };
}

export function useUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers(0, 200);
      const pageContent = res.data?.data?.content;
      const directContent = res.data?.content;
      const directData = res.data?.data;
      const data = ensureArray<any>(pageContent ?? directContent ?? directData ?? res.data);

      const normalized = data.map((u: any) => ({
        ...u,
        department: u.officeLocation || u.office_location || null,
      }));
      setUsers(normalized);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  return { users, loading, refresh: fetchUsers };
}

export function useRoles() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getRoles();
      const raw = res.data?.data ?? res.data;
      // handle both plain array and Spring-paged { content: [] } shapes
      const data = ensureArray<any>(Array.isArray(raw) ? raw : raw?.content ?? raw);
      setRoles(data);
    } catch {
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRoles();
  }, []);

  return { roles, loading, refresh: fetchRoles };
}
