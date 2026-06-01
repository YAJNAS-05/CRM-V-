import React, { useMemo, useState } from "react";
import { useRoles, useUsers } from "@/hooks/useRBAC";
import { adminApi } from "@/api/adminApi";

const EMPTY_FORM = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  officeLocation: "",
  selectedRoles: [] as string[],
};

export default function AdminUsersPage() {
  const { users, loading, refresh } = useUsers();
  const { roles } = useRoles();
  const roleOptions: any[] = Array.isArray(roles) ? roles : [];

  // filters
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // add user modal
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // edit user modal
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  // delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const text = `${u.fullName || u.full_name || ""} ${u.email || ""}`.toLowerCase();
      const q = query.toLowerCase();
      const roleNames = Array.isArray(u.roles) ? u.roles : [];
      const roleMatch = !roleFilter || roleNames.includes(roleFilter);
      return text.includes(q) && roleMatch;
    });
  }, [users, query, roleFilter]);

  // ---------- Add user ----------
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormError("");
    setShowAdd(true);
  };

  const handleAddRole = (name: string, checked: boolean) => {
    setForm((f) => ({
      ...f,
      selectedRoles: checked
        ? [...f.selectedRoles, name]
        : f.selectedRoles.filter((r) => r !== name),
    }));
  };

  const submitAdd = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      setFormError("Email and password are required.");
      return;
    }
    setFormError("");
    setSubmitting(true);
    try {
      await adminApi.createUser({
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim() || form.email.split("@")[0],
        phone: form.phone.trim(),
        role: form.selectedRoles[0] ?? "",
        roles: form.selectedRoles,
        officeLocation: form.officeLocation.trim() || "USA",
        isActive: true,
      });
      setShowAdd(false);
      await refresh();
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? "Failed to create user.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Edit user ----------
  const openEdit = (u: any) => {
    setEditUser(u);
    setEditForm({
      fullName: u.fullName || u.full_name || "",
      email: u.email || "",
      phone: u.phone || "",
      officeLocation: u.officeLocation || u.department || "",
      selectedRoles: Array.isArray(u.roles) ? [...u.roles] : [],
    });
  };

  const handleEditRole = (name: string, checked: boolean) => {
    setEditForm((f: any) => ({
      ...f,
      selectedRoles: checked
        ? [...f.selectedRoles, name]
        : f.selectedRoles.filter((r: string) => r !== name),
    }));
  };

  const submitEdit = async () => {
    if (!editUser) return;
    setEditSubmitting(true);
    try {
      await adminApi.updateUser(editUser.id, {
        fullName: editForm.fullName,
        email: editForm.email,
        phone: editForm.phone,
        officeLocation: editForm.officeLocation,
        role: editForm.selectedRoles[0] ?? "",
        roles: editForm.selectedRoles,
      });
      setEditUser(null);
      await refresh();
    } finally {
      setEditSubmitting(false);
    }
  };

  // ---------- Delete user ----------
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      await adminApi.deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      await refresh();
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // ---------- Toggle active ----------
  const toggleActive = async (u: any) => {
    await adminApi.toggleUserStatus(u.id);
    await refresh();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          onClick={openAdd}
        >
          + Add User
        </button>
      </div>

      {/* Filters */}
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
          {roleOptions.map((r: any) => (
            <option key={r.id ?? r.name} value={r.name}>{r.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded border bg-white p-4 text-slate-500">Loading users…</div>
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
                <tr key={u.id} className="border-t hover:bg-slate-50">
                  <td className="px-3 py-2">{u.fullName || u.full_name || "—"}</td>
                  <td className="px-3 py-2">{u.email || "—"}</td>
                  <td className="px-3 py-2">{u.department || u.officeLocation || "—"}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(u.roles) ? u.roles : []).map((role: string) => (
                        <span key={role} className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        className="rounded border px-2 py-1 text-xs hover:bg-slate-50"
                        onClick={() => openEdit(u)}
                      >
                        Edit
                      </button>
                      <button
                        className={`rounded border px-2 py-1 text-xs ${u.isActive ? "hover:bg-red-50 hover:border-red-300 hover:text-red-600" : "hover:bg-green-50 hover:border-green-300 hover:text-green-600"}`}
                        onClick={() => void toggleActive(u)}
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        className="rounded border px-2 py-1 text-xs text-red-500 hover:bg-red-50 hover:border-red-300"
                        onClick={() => setDeleteTarget(u)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== Add User Modal ===== */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Add User</h2>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Full Name</label>
                <input
                  className="w-full rounded border px-3 py-2"
                  placeholder="John Doe"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email <span className="text-red-500">*</span></label>
                <input
                  className="w-full rounded border px-3 py-2"
                  placeholder="john@example.com"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Password <span className="text-red-500">*</span></label>
                <input
                  className="w-full rounded border px-3 py-2"
                  placeholder="Min 8 characters"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium">Phone</label>
                  <input
                    className="w-full rounded border px-3 py-2"
                    placeholder="+1 555 000"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium">Department / Location</label>
                  <input
                    className="w-full rounded border px-3 py-2"
                    placeholder="Sales / New York"
                    value={form.officeLocation}
                    onChange={(e) => setForm((f) => ({ ...f, officeLocation: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Roles</label>
                <div className="max-h-36 overflow-auto rounded border p-2">
                  {roleOptions.length === 0 && (
                    <p className="text-xs text-slate-400">No roles loaded</p>
                  )}
                  {roleOptions.map((r: any) => (
                    <label key={r.id ?? r.name} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={form.selectedRoles.includes(r.name)}
                        onChange={(e) => handleAddRole(r.name, e.target.checked)}
                      />
                      <span className="text-sm">{r.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formError && <p className="text-sm text-red-600">{formError}</p>}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded border px-4 py-2 text-sm" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
              <button
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
                disabled={submitting}
                onClick={() => void submitAdd()}
              >
                {submitting ? "Creating…" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Edit User Modal ===== */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Edit User</h2>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Full Name</label>
                <input
                  className="w-full rounded border px-3 py-2"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm((f: any) => ({ ...f, fullName: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  className="w-full rounded border px-3 py-2"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f: any) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium">Phone</label>
                  <input
                    className="w-full rounded border px-3 py-2"
                    value={editForm.phone}
                    onChange={(e) => setEditForm((f: any) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium">Department / Location</label>
                  <input
                    className="w-full rounded border px-3 py-2"
                    value={editForm.officeLocation}
                    onChange={(e) => setEditForm((f: any) => ({ ...f, officeLocation: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Roles</label>
                <div className="max-h-36 overflow-auto rounded border p-2">
                  {roleOptions.map((r: any) => (
                    <label key={r.id ?? r.name} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={(editForm.selectedRoles as string[]).includes(r.name)}
                        onChange={(e) => handleEditRole(r.name, e.target.checked)}
                      />
                      <span className="text-sm">{r.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded border px-4 py-2 text-sm" onClick={() => setEditUser(null)}>
                Cancel
              </button>
              <button
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
                disabled={editSubmitting}
                onClick={() => void submitEdit()}
              >
                {editSubmitting ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Delete Confirmation ===== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-semibold text-red-600">Delete User</h2>
            <p className="mb-4 text-sm text-slate-600">
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.fullName || deleteTarget.email}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button className="rounded border px-4 py-2 text-sm" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button
                className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-60"
                disabled={deleteSubmitting}
                onClick={() => void confirmDelete()}
              >
                {deleteSubmitting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
