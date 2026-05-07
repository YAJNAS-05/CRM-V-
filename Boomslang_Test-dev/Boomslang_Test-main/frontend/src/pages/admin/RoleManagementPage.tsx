import React, { useEffect, useMemo, useState } from 'react'
import { adminApi } from '../../api/adminApi'
import {
  CreateRoleRequest,
  PermissionDefinition,
  RoleDefinition,
  UpdateRolePermissionsRequest,
} from '../../types/auth'
import { toast } from 'sonner'
import { getErrorMessage } from '../../utils/errorUtils'
import { Plus, Shield, Edit2, Trash2, X } from 'lucide-react'
import { FeatureGate } from '../../components/rbac'

const RoleManagementPage: React.FC = () => {
  const [roles, setRoles] = useState<RoleDefinition[]>([])
  const [permissions, setPermissions] = useState<PermissionDefinition[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null)

  const [newRole, setNewRole] = useState<CreateRoleRequest>({
    name: '',
    description: '',
    isActive: true,
    permissionKeys: [],
  })

  const [editPermissionKeys, setEditPermissionKeys] = useState<string[]>([])

  const normalizePermissionModule = (permission: PermissionDefinition): string => {
    // Dashboard permissions belong to CRM in this product's RBAC UX.
    if (permission.permissionKey.startsWith('DASHBOARD_')) {
      return 'CRM'
    }

    return permission.module || 'GENERAL'
  }

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionDefinition[]> = {}

    for (const permission of permissions) {
      const moduleName = normalizePermissionModule(permission)
      if (!groups[moduleName]) {
        groups[moduleName] = []
      }
      groups[moduleName].push(permission)
    }

    Object.keys(groups).forEach((key) => {
      groups[key] = groups[key].sort((a, b) => a.permissionKey.localeCompare(b.permissionKey))
    })

    return groups
  }, [permissions])

  useEffect(() => {
    void fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [rolesResponse, permissionsResponse] = await Promise.all([
        adminApi.getRoles(),
        adminApi.getPermissions(),
      ])

      setRoles(rolesResponse.data.data || [])
      setPermissions(permissionsResponse.data.data || [])
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load roles and permissions'))
    } finally {
      setIsLoading(false)
    }
  }

  const toggleCreatePermission = (permissionKey: string) => {
    setNewRole((prev) => ({
      ...prev,
      permissionKeys: prev.permissionKeys.includes(permissionKey)
        ? prev.permissionKeys.filter((key) => key !== permissionKey)
        : [...prev.permissionKeys, permissionKey],
    }))
  }

  const toggleEditPermission = (permissionKey: string) => {
    setEditPermissionKeys((prev) =>
      prev.includes(permissionKey)
        ? prev.filter((key) => key !== permissionKey)
        : [...prev, permissionKey]
    )
  }

  const handleCreateRole = async () => {
    try {
      if (!newRole.name.trim()) {
        toast.error('Role name is required')
        return
      }

      await adminApi.createRole({
        ...newRole,
        name: newRole.name.trim().toUpperCase(),
      })

      toast.success('Role created successfully')
      setShowCreateModal(false)
      setNewRole({
        name: '',
        description: '',
        isActive: true,
        permissionKeys: [],
      })
      await fetchData()
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to create role'))
    }
  }

  const openPermissionModal = (role: RoleDefinition) => {
    setSelectedRole(role)
    setEditPermissionKeys(role.permissionKeys || [])
    setShowPermissionModal(true)
  }

  const handleSaveRolePermissions = async () => {
    try {
      if (!selectedRole) return

      const payload: UpdateRolePermissionsRequest = {
        permissionKeys: editPermissionKeys,
      }

      await adminApi.updateRolePermissions(selectedRole.id, payload)
      toast.success('Role permissions updated')
      setShowPermissionModal(false)
      setSelectedRole(null)
      setEditPermissionKeys([])
      await fetchData()
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to update role permissions'))
    }
  }

  const handleDeleteRole = async (role: RoleDefinition) => {
    if (role.isSystem) {
      toast.error('System roles cannot be deleted')
      return
    }

    if (!confirm(`Delete role ${role.name}?`)) {
      return
    }

    try {
      await adminApi.deleteRole(role.id)
      toast.success('Role deleted successfully')
      await fetchData()
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to delete role'))
    }
  }

  if (isLoading) {
    return <div className="p-10 text-center">Loading role module...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Roles & Permissions</h1>
          <p className="text-slate-500 font-medium">Create custom roles and control granular user access.</p>
        </div>
        <FeatureGate requiredPermission="ROLE_CREATE">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-indigo-200 transition flex items-center gap-2"
          >
            <Plus size={18} />
            Create Role
          </button>
        </FeatureGate>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Permissions</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
              <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-bold text-slate-900">{role.name}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-xs text-slate-600">{role.description || '-'}</td>
                <td className="px-6 py-5 text-xs font-semibold text-slate-500">{role.permissionKeys?.length || 0} permissions</td>
                <td className="px-6 py-5">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      role.isSystem ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {role.isSystem ? 'SYSTEM' : 'CUSTOM'}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <FeatureGate requiredPermission="ROLE_EDIT">
                        <button
                          onClick={() => openPermissionModal(role)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
                          title="Edit permissions"
                        >
                          <Edit2 size={16} />
                        </button>
                      </FeatureGate>
                      {!role.isSystem && (
                        <FeatureGate requiredPermission="ROLE_DELETE">
                          <button
                            onClick={() => handleDeleteRole(role)}
                            className="text-xs font-bold text-red-600 hover:text-red-700 transition"
                            title="Delete role"
                          >
                            <Trash2 size={16} />
                          </button>
                        </FeatureGate>
                      )}
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">Create Role</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">Role Name *</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="FIELD_MANAGER"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">Description</label>
                <input
                  type="text"
                  value={newRole.description || ''}
                  onChange={(e) => setNewRole((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Can manage field jobs and service actions"
                />
              </div>
            </div>

            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-3">Select Permissions</h3>
            <div className="space-y-5">
              {Object.entries(groupedPermissions).map(([moduleName, modulePermissions]) => (
                <div key={moduleName} className="border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">{moduleName}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {modulePermissions.map((permission) => (
                      <label key={permission.permissionKey} className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={newRole.permissionKeys.includes(permission.permissionKey)}
                          onChange={() => toggleCreatePermission(permission.permissionKey)}
                          className="w-4 h-4 rounded border-slate-300"
                        />
                        <span>{permission.permissionKey}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRole}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold"
              >
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}

      {showPermissionModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">Edit Permissions: {selectedRole.name}</h2>
              <button
                onClick={() => {
                  setShowPermissionModal(false)
                  setSelectedRole(null)
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-5">
              {Object.entries(groupedPermissions).map(([moduleName, modulePermissions]) => (
                <div key={moduleName} className="border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">{moduleName}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {modulePermissions.map((permission) => (
                      <label key={permission.permissionKey} className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={editPermissionKeys.includes(permission.permissionKey)}
                          onChange={() => toggleEditPermission(permission.permissionKey)}
                          className="w-4 h-4 rounded border-slate-300"
                        />
                        <span>{permission.permissionKey}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowPermissionModal(false)
                  setSelectedRole(null)
                }}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRolePermissions}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoleManagementPage
