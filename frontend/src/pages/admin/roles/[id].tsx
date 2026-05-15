import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
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

export default function RoleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [availablePairs, setAvailablePairs] = useState<Set<string>>(new Set());
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const key = (m: string, a: string) => `${m}:${a}`;
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const load = async () => {
    if (!id) return;

    const { data: roleData } = await supabase
      .from("roles")
      .select(
        `
        id, name, description, is_system_role,
        role_permissions (
          permission:permissions (id, module, action)
        )
      `,
      )
      .eq("id", id)
      .single();

    const { data: usersData } = await supabase
      .from("user_roles")
      .select(
        `
        id,
        user:app_users (id, full_name, email)
      `,
      )
      .eq("role_id", id);

    const { data: permissionData } = await supabase.from("permissions").select("module,action");

    setRole(roleData);
    setUsers(usersData || []);
    setName(roleData?.name || "");
    setDescription(roleData?.description || "");

    const perms = (roleData?.role_permissions || []).map((rp: any) => key(rp.permission.module, rp.permission.action));
    setSelected(perms);
    setAvailablePairs(
      new Set((permissionData || []).map((permission: any) => key(permission.module, permission.action)))
    );
  };

  useEffect(() => {
    void load();
  }, [id]);

  const togglePermission = (module: string, action: string) => {
    const k = key(module, action);
    setSelected((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  };

  const save = async () => {
    if (!id) return;

    await supabase.from("roles").update({ name, description, updated_at: new Date().toISOString() }).eq("id", id);

    const { data: perms } = await supabase.from("permissions").select("id,module,action");
    const wanted = new Set(selected);
    const permIds = (perms || [])
      .filter((p: any) => wanted.has(key(p.module, p.action)))
      .map((p: any) => p.id);

    await supabase.from("role_permissions").delete().eq("role_id", id);
    if (permIds.length > 0) {
      await supabase.from("role_permissions").insert(permIds.map((permission_id: string) => ({ role_id: id, permission_id })));
    }

    await supabase.from("audit_logs").insert({
      action: "update_role_permissions",
      target_type: "role",
      target_id: id,
      metadata: { selected },
    });

    await load();
  };

  const removeUser = async (userRoleId: string, userId: string) => {
    await supabase.from("user_roles").delete().eq("id", userRoleId);
    await supabase.from("audit_logs").insert({
      action: "remove_role_from_user",
      target_type: "user",
      target_id: userId,
      metadata: { role_id: id },
    });
    await load();
  };

  const deleteRole = async () => {
    if (!id || users.length > 0 || role?.is_system_role) return;
    await supabase.from("roles").delete().eq("id", id);
    await supabase.from("audit_logs").insert({
      action: "delete_role",
      target_type: "role",
      target_id: id,
      metadata: { name: role?.name },
    });
    navigate('/admin/roles');
  };

  if (!role) {
    return <div className="rounded border bg-white p-4">Loading role...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded border bg-white p-4">
        <h1 className="text-xl font-bold">Role Detail</h1>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <input className="rounded border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="rounded border px-3 py-2" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="mb-2 font-semibold">Permission Matrix</h2>
        <div className="overflow-x-auto">
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
                    const supported = isActionSupported(m, a) && availablePairs.has(key(m, a));
                    const checked = selectedSet.has(key(m, a));
                    return (
                      <td key={key(m, a)} className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          disabled={!supported}
                          checked={checked}
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

        <div className="mt-4 rounded border p-3">
          <p className="mb-2 text-sm font-semibold">Dashboard Permissions</p>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {DASHBOARD_PERMISSION_OPTIONS.map((option) => {
              const permissionKey = key("dashboard", option.action);
              const exists = availablePairs.has(permissionKey);
              return (
                <label key={option.action} className={`flex items-center gap-2 text-sm ${exists ? "" : "opacity-50"}`}>
                  <input
                    type="checkbox"
                    disabled={!exists}
                    checked={selectedSet.has(permissionKey)}
                    onChange={() => togglePermission("dashboard", option.action)}
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
          {!DASHBOARD_PERMISSION_OPTIONS.some((option) => availablePairs.has(key("dashboard", option.action))) ? (
            <p className="mt-2 text-xs text-slate-500">Dashboard permissions are not seeded yet in the database.</p>
          ) : null}
        </div>

        <div className="mt-3 flex justify-end">
          <button className="rounded bg-blue-600 px-3 py-2 text-white" onClick={() => void save()}>
            Save Changes
          </button>
        </div>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="mb-2 font-semibold">Users Assigned</h2>
        <div className="space-y-2">
          {users.length === 0 ? (
            <p className="text-sm text-slate-500">No users assigned.</p>
          ) : (
            users.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between rounded border p-2">
                <div>
                  <p className="font-medium">{u.user?.full_name || "-"}</p>
                  <p className="text-sm text-slate-500">{u.user?.email || "-"}</p>
                </div>
                <button className="rounded border px-2 py-1 text-sm" onClick={() => void removeUser(u.id, u.user?.id)}>
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded border border-red-200 bg-red-50 p-4">
        <h2 className="font-semibold text-red-700">Danger Zone</h2>
        <p className="text-sm text-red-600">Delete role (only if no users assigned and not system role).</p>
        <button
          className="mt-2 rounded bg-red-600 px-3 py-2 text-white disabled:opacity-50"
          disabled={users.length > 0 || role.is_system_role}
          onClick={() => void deleteRole()}
        >
          Delete Role
        </button>
      </div>
    </div>
  );
}
