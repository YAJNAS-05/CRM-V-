import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useRoles } from "@/hooks/useRBAC";
import { ACTIONS, MODULES, isActionSupported } from "@/components/rbac/permissionMatrix";

const DASHBOARD_PERMISSION_OPTIONS = [
  { action: "self_view", label: "Personal Dashboard View" },
  { action: "team_view", label: "Team Dashboard View" },
  { action: "finance_view", label: "Finance Dashboard View" },
  { action: "hr_view", label: "HR Dashboard View" },
  { action: "tech_view", label: "Technician Dashboard View" },
  { action: "operations_view", label: "Operations Dashboard View" },
  { action: "view", label: "Generic Dashboard View" },
] as const;

export default function AdminRolesPage() {
  const { roles, loading, refresh } = useRoles();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [availablePairs, setAvailablePairs] = useState<Set<string>>(new Set());

  const matrixKey = (m: string, a: string) => `${m}:${a}`;

  const permissionSet = useMemo(() => new Set(selected), [selected]);

  useEffect(() => {
    const loadPermissions = async () => {
      const { data } = await supabase.from("permissions").select("module,action");
      const normalized = new Set(
        (data || []).map((permission: any) => matrixKey(permission.module, permission.action))
      );
      setAvailablePairs(normalized);
    };

    void loadPermissions();
  }, []);

  const togglePermission = (m: string, a: string) => {
    const key = matrixKey(m, a);
    setSelected((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  };

  const createRole = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: appUser } = await supabase
      .from("app_users")
      .select("org_id")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (!appUser?.org_id) return;

    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .insert({ name, description, is_system_role: false, org_id: appUser.org_id })
      .select("id")
      .single();

    if (roleError || !roleData?.id) return;

    const selectedPairs = selected.map((key) => {
      const [module, action] = key.split(":");
      return { module, action };
    });

    const { data: perms } = await supabase
      .from("permissions")
      .select("id,module,action");

    const permIds = (perms || [])
      .filter((p: any) => selectedPairs.some((s) => s.module === p.module && s.action === p.action))
      .map((p: any) => ({ role_id: roleData.id, permission_id: p.id }));

    if (permIds.length > 0) {
      await supabase.from("role_permissions").insert(permIds);
    }

    await supabase.from("audit_logs").insert({
      action: "create_role",
      target_type: "role",
      target_id: roleData.id,
      metadata: { name, selected },
    });

    setShowCreate(false);
    setName("");
    setDescription("");
    setSelected([]);
    await refresh();
  };

  const deleteRole = async (role: any) => {
    if (role.is_system_role) return;

    const { count } = await supabase
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role_id", role.id);

    if ((count || 0) > 0) return;

    await supabase.from("roles").delete().eq("id", role.id);

    await supabase.from("audit_logs").insert({
      action: "delete_role",
      target_type: "role",
      target_id: role.id,
      metadata: { name: role.name },
    });

    await refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={() => setShowCreate(true)}>
          Create Role
        </button>
      </div>

      {loading ? (
        <div className="rounded border bg-white p-4">Loading roles...</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role: any) => (
            <div key={role.id} className="rounded border bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold">{role.name}</h2>
                  <p className="text-sm text-slate-500">{role.description || "No description"}</p>
                </div>
                {role.is_system_role && <span className="rounded bg-amber-100 px-2 py-1 text-xs">System</span>}
              </div>

              <p className="mt-3 text-sm text-slate-600">
                Permissions: {(role.role_permissions || []).length}
              </p>

              <div className="mt-3 flex gap-2">
                <Link className="rounded border px-2 py-1 text-sm" to={`/admin/roles/${role.id}`}>Details</Link>
                <button
                  className="rounded border px-2 py-1 text-sm disabled:opacity-50"
                  disabled={role.is_system_role}
                  onClick={() => void deleteRole(role)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-4xl space-y-3 rounded bg-white p-4">
            <h2 className="text-lg font-semibold">Create Role</h2>
            <input className="w-full rounded border px-3 py-2" placeholder="Role name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="w-full rounded border px-3 py-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

            <div className="overflow-x-auto rounded border">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-2 py-2 text-left">Module</th>
                    {ACTIONS.map((a) => (
                      <th key={a} className="px-2 py-2 text-center">{a}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map((m) => (
                    <tr key={m} className="border-t">
                      <td className="px-2 py-2 font-medium uppercase">{m}</td>
                      {ACTIONS.map((a) => {
                        const supported = isActionSupported(m, a) && availablePairs.has(matrixKey(m, a));
                        const key = matrixKey(m, a);
                        return (
                          <td key={key} className="px-2 py-2 text-center">
                            <input
                              type="checkbox"
                              disabled={!supported}
                              checked={permissionSet.has(key)}
                              onChange={() => togglePermission(m, a)}
                              className={!supported ? "opacity-40" : ""}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded border p-3">
              <p className="mb-2 text-sm font-semibold">Dashboard Permissions</p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {DASHBOARD_PERMISSION_OPTIONS.map((option) => {
                  const key = matrixKey("dashboard", option.action);
                  const exists = availablePairs.has(key);

                  return (
                    <label key={option.action} className={`flex items-center gap-2 text-sm ${exists ? "" : "opacity-50"}`}>
                      <input
                        type="checkbox"
                        disabled={!exists}
                        checked={permissionSet.has(key)}
                        onChange={() => togglePermission("dashboard", option.action)}
                      />
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>
              {!DASHBOARD_PERMISSION_OPTIONS.some((option) => availablePairs.has(matrixKey("dashboard", option.action))) ? (
                <p className="mt-2 text-xs text-slate-500">Dashboard permissions are not seeded yet in the database.</p>
              ) : null}
            </div>

            <div className="flex justify-end gap-2">
              <button className="rounded border px-3 py-2" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="rounded bg-blue-600 px-3 py-2 text-white" onClick={() => void createRole()}>Save role</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
