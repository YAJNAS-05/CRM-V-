import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Permission = { module: string; action: string };

async function getCurrentAppUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("app_users")
    .select("id, org_id")
    .eq("auth_id", user.id)
    .maybeSingle();

  return data ?? null;
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);

      const appUser = await getCurrentAppUser();

      if (!appUser?.id) {
        if (mounted) {
          setPermissions([]);
          setLoading(false);
        }
        return;
      }

      const { data } = await supabase
        .from("user_roles")
        .select(
          `
          role:roles (
            role_permissions (
              permission:permissions (module, action)
            )
          )
        `,
        )
        .eq("user_id", appUser.id);

      const perms =
        data?.flatMap((ur: any) =>
          (ur?.role?.role_permissions || []).map((rp: any) => rp?.permission),
        )?.filter((p: any) => p?.module && p?.action) || [];

      const unique = Array.from(
        new Map(
          perms.map((p: Permission) => [`${p.module}:${p.action}`, p] as const),
        ).values(),
      );

      if (mounted) {
        setPermissions(unique);
        setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const can = useMemo(
    () => (module: string, action: string) =>
      permissions.some(
        (p) =>
          p.module.toLowerCase() === module.toLowerCase() &&
          p.action.toLowerCase() === action.toLowerCase(),
      ),
    [permissions],
  );

  return { permissions, can, loading };
}

export function useUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const currentAppUser = await getCurrentAppUser();

    if (!currentAppUser?.org_id) {
      setUsers([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("app_users")
      .select(
        `
        id, full_name, email, office_location, is_active, created_at,
        user_roles (
          role:roles (id, name)
        )
      `,
      )
      .eq("org_id", currentAppUser.org_id)
      .order("created_at", { ascending: false });

    const normalized = (data ?? []).map((u: any) => ({
      ...u,
      department: u.office_location || null,
    }));

    setUsers(normalized);
    setLoading(false);
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
    const currentAppUser = await getCurrentAppUser();

    if (!currentAppUser?.org_id) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("roles")
      .select(
        `
        id, name, description, is_system_role, org_id, created_at,
        role_permissions (
          permission:permissions (id, module, action)
        )
      `,
      )
      .or(`org_id.is.null,org_id.eq.${currentAppUser.org_id}`)
      .order("name");

    setRoles(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void fetchRoles();
  }, []);

  return { roles, loading, refresh: fetchRoles };
}
