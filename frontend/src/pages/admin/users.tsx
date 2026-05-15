import React, { useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRoles, useUsers } from "@/hooks/useRBAC";

export default function AdminUsersPage() {
  const { users, loading, refresh } = useUsers();
  const { roles } = useRoles();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteDept, setInviteDept] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const text = `${u.full_name || ""} ${u.email || ""}`.toLowerCase();
      const q = query.toLowerCase();
      const roleNames = (u.user_roles || []).map((r: any) => r?.role?.name);
      const roleMatch = !roleFilter || roleNames.includes(roleFilter);
      return text.includes(q) && roleMatch;
    });
  }, [users, query, roleFilter]);

  const inviteUser = async () => {
    if (!inviteEmail || selectedRoles.length === 0) return;
    setSubmitting(true);

    const { error } = await supabase.functions.invoke("invite-user", {
      body: {
        email: inviteEmail,
        full_name: inviteName,
        role_ids: selectedRoles,
        department: inviteDept,
      },
    });

    if (!error) {
      setShowInvite(false);
      setInviteName("");
      setInviteEmail("");
      setInviteDept("");
      setSelectedRoles([]);
      await refresh();
    }

    setSubmitting(false);
  };

  const toggleUserActive = async (user: any) => {
    await supabase
      .from("app_users")
      .update({ is_active: !user.is_active, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    await supabase.from("audit_logs").insert({
      action: user.is_active ? "deactivate_user" : "activate_user",
      target_type: "user",
      target_id: user.id,
      metadata: { email: user.email },
    });

    await refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={() => setShowInvite(true)}>
          Invite User
        </button>
      </div>

      <div className="flex gap-3">
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Search by name or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="rounded border px-3 py-2"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All roles</option>
          {roles.map((r: any) => (
            <option key={r.id} value={r.name}>{r.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="rounded border bg-white p-4">Loading users...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded border bg-white p-8 text-center text-slate-500">No users found.</div>
      ) : (
        <div className="overflow-x-auto rounded border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Department</th>
                <th className="px-3 py-2 text-left">Roles</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u: any) => (
                <tr key={u.id} className="border-t">
                  <td className="px-3 py-2">{u.full_name || "-"}</td>
                  <td className="px-3 py-2">{u.email || "-"}</td>
                  <td className="px-3 py-2">{u.department || "-"}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {(u.user_roles || []).map((ur: any) => (
                        <span key={ur.role?.id} className="rounded bg-slate-100 px-2 py-0.5 text-xs">
                          {ur.role?.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2">{u.is_active ? "Active" : "Inactive"}</td>
                  <td className="px-3 py-2">
                    <button className="rounded border px-2 py-1" onClick={() => void toggleUserActive(u)}>
                      {u.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg space-y-3 rounded bg-white p-4">
            <h2 className="text-lg font-semibold">Invite User</h2>
            <input className="w-full rounded border px-3 py-2" placeholder="Full name" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
            <input className="w-full rounded border px-3 py-2" placeholder="Email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            <input className="w-full rounded border px-3 py-2" placeholder="Department" value={inviteDept} onChange={(e) => setInviteDept(e.target.value)} />

            <div className="max-h-40 overflow-auto rounded border p-2">
              {roles.map((r: any) => {
                const checked = selectedRoles.includes(r.id);
                return (
                  <label key={r.id} className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setSelectedRoles((prev) =>
                          e.target.checked ? [...prev, r.id] : prev.filter((id) => id !== r.id),
                        );
                      }}
                    />
                    <span>{r.name}</span>
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end gap-2">
              <button className="rounded border px-3 py-2" onClick={() => setShowInvite(false)}>Cancel</button>
              <button className="rounded bg-blue-600 px-3 py-2 text-white" disabled={submitting} onClick={() => void inviteUser()}>
                {submitting ? "Inviting..." : "Invite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
