import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { adminApi } from '@/api/adminApi'
import { useRoles } from '@/hooks/useRBAC'
import { ACTIONS, MODULES, isActionSupported } from '@/components/rbac/permissionMatrix'
import { ArrowRight, BadgeCheck, Layers3, Plus, Search, Shield, Sparkles, Trash2, Users } from 'lucide-react'

const DASHBOARD_PERMISSION_OPTIONS = [
  { action: 'self_view', label: 'Personal Dashboard View' },
  { action: 'team_view', label: 'Team Dashboard View' },
  { action: 'finance_view', label: 'Finance Dashboard View' },
  { action: 'hr_view', label: 'HR Dashboard View' },
  { action: 'tech_view', label: 'Technician Dashboard View' },
  { action: 'operations_view', label: 'Operations Dashboard View' },
  { action: 'view', label: 'Generic Dashboard View' },
] as const

const MODULE_LABELS: Record<string, string> = {
  pm: 'Project Management',
  finance: 'Finance',
  hr: 'Human Resources',
  fieldwork: 'Fieldwork',
  crm: 'CRM',
  admin: 'Administration',
}

const MODULE_DESCRIPTIONS: Record<string, string> = {
  pm: 'Project, task, and delivery access',
  finance: 'Payments, invoices, and reporting',
  hr: 'People, leave, payroll, and performance',
  fieldwork: 'On-site jobs and service operations',
  crm: 'Leads, contacts, deals, and activities',
  admin: 'Users, roles, and system control',
}

type RoleFilter = 'all' | 'system' | 'custom'

const matrixKey = (moduleName: string, action: string) => `${moduleName.toLowerCase()}:${action.toLowerCase()}`
const normalizeArray = (value: unknown): any[] => (Array.isArray(value) ? value : [])

export default function AdminRolesPage() {
  const { roles, loading, refresh } = useRoles()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<RoleFilter>('all')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  const [editingRole, setEditingRole] = useState<any>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editSelected, setEditSelected] = useState<string[]>([])

  const [availablePairs, setAvailablePairs] = useState<Set<string>>(new Set())
  const [pairToPermId, setPairToPermId] = useState<Record<string, string>>({})
  const [allPermsCache, setAllPermsCache] = useState<any[]>([])

  const createPermissionSet = useMemo(() => new Set(selected), [selected])
  const editPermissionSet = useMemo(() => new Set(editSelected), [editSelected])

  const roleStats = useMemo(() => {
    const roleList = normalizeArray(roles)
    const total = roleList.length
    const system = roleList.filter((role: any) => Boolean(role?.isSystem)).length
    const custom = total - system
    const permissionCount = roleList.reduce((sum: number, role: any) => sum + normalizeArray(role?.permissions).length, 0)

    return { total, system, custom, permissionCount }
  }, [roles])

  const visibleRoles = useMemo(() => {
    const roleList = normalizeArray(roles)
    const query = search.trim().toLowerCase()

    return roleList.filter((role: any) => {
      if (filter === 'system' && !role?.isSystem) return false
      if (filter === 'custom' && role?.isSystem) return false
      if (!query) return true

      const nameMatches = String(role?.name || '').toLowerCase().includes(query)
      const descriptionMatches = String(role?.description || '').toLowerCase().includes(query)
      const permissionsMatches = normalizeArray(role?.permissions).some((permission: any) => {
        const permissionKey = String(permission?.permissionKey || '').toLowerCase()
        const moduleName = String(permission?.module || '').toLowerCase()
        const action = String(permission?.action || '').toLowerCase()
        return permissionKey.includes(query) || moduleName.includes(query) || action.includes(query)
      })

      return nameMatches || descriptionMatches || permissionsMatches
    })
  }, [filter, roles, search])

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const res = await adminApi.getPermissions()
        const data: any[] = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : []

        const mapping: Record<string, string> = {}
        const normalized = new Set<string>()
        data.forEach((permission: any) => {
          if (!permission.module || !permission.action) return
          const key = matrixKey(permission.module, permission.action)
          mapping[key] = String(permission.permissionKey ?? permission.id ?? key)
          normalized.add(key)
        })

        setAllPermsCache(data)
        setPairToPermId(mapping)
        setAvailablePairs(normalized)
      } catch {
        toast.error('Failed to load permissions')
      }
    }

    void loadPermissions()
  }, [])

  const toggleCreatePermission = (moduleName: string, action: string) => {
    const key = matrixKey(moduleName, action)
    setSelected((prev) => (prev.includes(key) ? prev.filter((entry) => entry !== key) : [...prev, key]))
  }

  const toggleEditPermission = (moduleName: string, action: string) => {
    const key = matrixKey(moduleName, action)
    setEditSelected((prev) => (prev.includes(key) ? prev.filter((entry) => entry !== key) : [...prev, key]))
  }

  const createRole = async () => {
    try {
      const permissionKeys = selected.map((pair) => pairToPermId[pair]).filter((value): value is string => Boolean(value))
      await adminApi.createRole({ name, description, permissionKeys, isActive: true })
      toast.success('Role created')
      setName('')
      setDescription('')
      setSelected([])
      await refresh()
    } catch {
      toast.error('Failed to create role')
    }
  }

  const openEditRole = (role: any) => {
    setEditingRole(role)
    setEditName(role.name || '')
    setEditDescription(role.description || '')

    const rolePerms: any[] = normalizeArray(role.permissions)
    const activePairs = rolePerms
      .map((permission: any) => {
        if (permission.module && permission.action) return matrixKey(permission.module, permission.action)
        if (permission.permissionKey) {
          const match = allPermsCache.find((entry: any) => entry.permissionKey === permission.permissionKey)
          if (match?.module && match?.action) return matrixKey(match.module, match.action)
        }
        return null
      })
      .filter((pair): pair is string => pair !== null)

    setEditSelected(activePairs)
  }

  const saveEditRole = async () => {
    if (!editingRole) return
    try {
      const permissionKeys = editSelected.map((pair) => pairToPermId[pair]).filter((value): value is string => Boolean(value))
      await adminApi.updateRole(editingRole.id, { description: editDescription })
      await adminApi.updateRolePermissions(editingRole.id, { permissionKeys })
      toast.success('Role updated')
      setEditingRole(null)
      await refresh()
    } catch {
      toast.error('Failed to update role')
    }
  }

  const deleteRole = async (role: any) => {
    if (role.isSystem) return
    try {
      await adminApi.deleteRole(role.id)
      toast.success('Role deleted')
      await refresh()
    } catch {
      toast.error('Failed to delete role')
    }
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_30%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-6 shadow-sm">
        <div className="absolute -right-10 top-0 h-36 w-36 rounded-full bg-sky-100/70 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-emerald-100/70 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Fresh role workspace
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Role Management</h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Define, organize, and maintain role definitions with full permission matrices. Keep authorization consistent across the entire platform.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-700">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <Shield className="h-4 w-4 text-sky-600" />
                {roleStats.system} system roles
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <Users className="h-4 w-4 text-emerald-600" />
                {roleStats.custom} custom roles
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <BadgeCheck className="h-4 w-4 text-violet-600" />
                {roleStats.permissionCount} permission links
              </span>
            </div>
          </div>

          <Link to="/admin/roles/create" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800 xl:whitespace-nowrap">
            <Plus className="h-4 w-4" />
            Create Role
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Shield} label="System Roles" value={roleStats.system} accent="from-amber-500 to-orange-500" />
        <StatCard icon={Layers3} label="Custom Roles" value={roleStats.custom} accent="from-sky-500 to-blue-500" />
        <StatCard icon={Users} label="Total Roles" value={roleStats.total} accent="from-emerald-500 to-teal-500" />
        <StatCard icon={BadgeCheck} label="Permission Links" value={roleStats.permissionCount} accent="from-violet-500 to-purple-500" />
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles, descriptions, or permissions"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {([
              { value: 'all', label: 'All roles' },
              { value: 'system', label: 'System' },
              { value: 'custom', label: 'Custom' },
            ] as const).map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${filter === option.value ? 'bg-slate-900 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500 shadow-sm">Loading roles...</div>
      ) : visibleRoles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center shadow-sm">
          <p className="text-base font-semibold text-slate-900">No roles match your filters</p>
          <p className="mt-1 text-sm text-slate-500">Try a different search term or switch to all roles.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleRoles.map((role: any) => {
            const permissions = normalizeArray(role.permissions)
            const preview = permissions.slice(0, 2)
            const isSystem = Boolean(role.isSystem)

            return (
              <article key={role.id} className="group rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-semibold text-slate-900 truncate">{role.name}</h2>
                      {isSystem ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 whitespace-nowrap">System</span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 whitespace-nowrap">Custom</span>
                      )}
                    </div>
                    <p className="text-xs leading-5 text-slate-600 line-clamp-2">{role.description || 'No description'}</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 px-2.5 py-2 text-right flex-shrink-0">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-slate-500 font-semibold">Perms</p>
                    <p className="text-sm font-semibold text-slate-900">{permissions.length}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {preview.map((permission: any) => (
                    <span key={permission.permissionKey || `${permission.module}:${permission.action}`} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                      {permission.permissionKey || `${permission.module}:${permission.action}`}
                    </span>
                  ))}
                  {permissions.length > 2 && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">+{permissions.length - 2}</span>}
                </div>

                <div className="mt-4 flex gap-2">
                  <Link to={`/admin/roles/${role.id}`} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-2 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                    Details
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                  <button
                    onClick={() => openEditRole(role)}
                    className="flex-1 inline-flex items-center justify-center rounded-xl bg-slate-100 px-2 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-xl border border-rose-200 px-2 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSystem}
                    onClick={() => void deleteRole(role)}
                    title={isSystem ? 'Cannot delete system roles' : ''}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {editingRole && (
        <RoleDialog
          title={`Edit Role: ${editingRole.name}`}
          description="Adjust the role description and permission set without changing the overall structure."
          roleName={editName}
          onRoleNameChange={setEditName}
          roleDescription={editDescription}
          onRoleDescriptionChange={setEditDescription}
          availablePairs={availablePairs}
          allPermissions={allPermsCache}
          selectedSet={editPermissionSet}
          onTogglePermission={toggleEditPermission}
          onToggleDashboardPermission={(action) => toggleEditPermission('dashboard', action)}
          onCancel={() => setEditingRole(null)}
          onSave={() => void saveEditRole()}
          saveLabel="Save changes"
          disableName={Boolean(editingRole.isSystem)}
        />
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: number; accent: string }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-sm`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] font-semibold text-slate-500">{label}</p>
          <p className="text-2xl font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

function RoleDialog({
  title,
  description,
  roleName,
  onRoleNameChange,
  roleDescription,
  onRoleDescriptionChange,
  availablePairs,
  allPermissions,
  selectedSet,
  onTogglePermission,
  onToggleDashboardPermission,
  onCancel,
  onSave,
  saveLabel,
  disableName,
}: {
  title: string
  description: string
  roleName: string
  onRoleNameChange: (value: string) => void
  roleDescription: string
  onRoleDescriptionChange: (value: string) => void
  availablePairs: Set<string>
  allPermissions: any[]
  selectedSet: Set<string>
  onTogglePermission: (moduleName: string, action: string) => void
  onToggleDashboardPermission: (action: string) => void
  onCancel: () => void
  onSave: () => void
  saveLabel: string
  disableName: boolean
}) {
  const [permissionSearch, setPermissionSearch] = useState('')

  const coveredPairs = useMemo(() => {
    const covered = new Set<string>()
    MODULES.forEach((moduleName) => {
      ACTIONS.forEach((action) => {
        covered.add(matrixKey(moduleName, action))
      })
    })
    DASHBOARD_PERMISSION_OPTIONS.forEach((option) => {
      covered.add(matrixKey('dashboard', option.action))
    })
    return covered
  }, [])

  const visibleGroups = useMemo(() => {
    const query = permissionSearch.trim().toLowerCase()

    return MODULES.map((moduleName) => {
      const permissions = ACTIONS.map((action) => {
        const key = matrixKey(moduleName, action)
        const supported = isActionSupported(moduleName as any, action as any) && availablePairs.has(key)
        const label = `${MODULE_LABELS[moduleName] || moduleName} ${action}`
        const matches = !query || key.includes(query) || label.toLowerCase().includes(query)
        return { key, moduleName, action, label, supported, matches }
      }).filter((permission) => permission.matches)

      return {
        moduleName,
        label: MODULE_LABELS[moduleName] || moduleName,
        description: MODULE_DESCRIPTIONS[moduleName] || 'Module permissions',
        permissions,
      }
    }).filter((group) => group.permissions.length > 0)
  }, [availablePairs, permissionSearch])

  const additionalPermissions = useMemo(() => {
    const query = permissionSearch.trim().toLowerCase()

    return (Array.isArray(allPermissions) ? allPermissions : [])
      .filter((permission) => permission?.module && permission?.action)
      .map((permission) => {
        const moduleName = String(permission.module)
        const action = String(permission.action)
        const key = matrixKey(moduleName, action)
        const permissionKey = String(permission.permissionKey ?? key)
        const matches =
          !query ||
          key.includes(query) ||
          permissionKey.toLowerCase().includes(query) ||
          moduleName.toLowerCase().includes(query) ||
          action.toLowerCase().includes(query)

        return {
          key,
          moduleName,
          action,
          permissionKey,
          matches,
        }
      })
      .filter((permission) => !coveredPairs.has(permission.key))
      .filter((permission) => permission.matches)
  }, [allPermissions, coveredPairs, permissionSearch])

  const handleSelectAll = () => {
    MODULES.forEach((moduleName) => {
      ACTIONS.forEach((action) => {
        const key = matrixKey(moduleName, action)
        const supported = isActionSupported(moduleName as any, action as any) && availablePairs.has(key)
        if (supported && !selectedSet.has(key)) {
          onTogglePermission(moduleName, action)
        }
      })
    })

    DASHBOARD_PERMISSION_OPTIONS.forEach((option) => {
      const key = matrixKey('dashboard', option.action)
      if (availablePairs.has(key) && !selectedSet.has(key)) {
        onToggleDashboardPermission(option.action)
      }
    })
  }

  const handleClearSelection = () => {
    MODULES.forEach((moduleName) => {
      ACTIONS.forEach((action) => {
        const key = matrixKey(moduleName, action)
        if (selectedSet.has(key)) {
          onTogglePermission(moduleName, action)
        }
      })
    })

    DASHBOARD_PERMISSION_OPTIONS.forEach((option) => {
      const key = matrixKey('dashboard', option.action)
      if (selectedSet.has(key)) {
        onToggleDashboardPermission(option.action)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>

        <div className="max-h-[calc(90vh-180px)] overflow-y-auto px-6 py-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Role name</label>
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
                placeholder="Role name"
                value={roleName}
                disabled={disableName}
                onChange={(e) => onRoleNameChange(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="Description"
                value={roleDescription}
                onChange={(e) => onRoleDescriptionChange(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Permission Matrix</h3>
                  <p className="text-sm text-slate-500">Select multiple permissions by module with clean grouped checkboxes.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={handleSelectAll} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                    Select all
                  </button>
                  <button onClick={handleClearSelection} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                    Clear all
                  </button>
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">{selectedSet.size} selected</span>
                </div>
              </div>

              <div className="mb-4 relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={permissionSearch}
                  onChange={(e) => setPermissionSearch(e.target.value)}
                  placeholder="Search by module, action, or key"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {visibleGroups.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">No permissions match your search.</div>
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {visibleGroups.map((group) => (
                    <article key={group.moduleName} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-slate-900">{group.label}</h4>
                            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 shadow-sm">{group.permissions.length} actions</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{group.description}</p>
                        </div>
                        <button
                          onClick={() => {
                            const supported = group.permissions.filter((permission) => permission.supported)
                            const allSelected = supported.length > 0 && supported.every((permission) => selectedSet.has(permission.key))
                            supported.forEach((permission) => {
                              if (allSelected && selectedSet.has(permission.key)) {
                                onTogglePermission(permission.moduleName, permission.action)
                              }
                              if (!allSelected && !selectedSet.has(permission.key)) {
                                onTogglePermission(permission.moduleName, permission.action)
                              }
                            })
                          }}
                          className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                          Toggle group
                        </button>
                      </div>

                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {group.permissions.map((permission) => {
                          const checked = selectedSet.has(permission.key)
                          return (
                            <label
                              key={permission.key}
                              className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-xs transition ${
                                permission.supported
                                  ? checked
                                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                  : 'cursor-not-allowed border-dashed border-slate-200 bg-white opacity-45'
                              }`}
                            >
                              <input
                                type="checkbox"
                                disabled={!permission.supported}
                                checked={checked}
                                onChange={() => onTogglePermission(permission.moduleName, permission.action)}
                                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="min-w-0">
                                <p className={`font-medium ${checked && permission.supported ? 'text-white' : 'text-slate-800'}`}>{permission.label}</p>
                                <p className={`text-[10px] ${checked && permission.supported ? 'text-slate-200' : 'text-slate-500'}`}>{permission.key}</p>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {additionalPermissions.length > 0 && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-slate-900">Additional permissions</h4>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                      {additionalPermissions.length} extra
                    </span>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    {additionalPermissions.map((permission) => {
                      const checked = selectedSet.has(permission.key)
                      return (
                        <label
                          key={permission.key}
                          className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-xs transition ${
                            checked
                              ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => onTogglePermission(permission.moduleName, permission.action)}
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="min-w-0">
                            <p className={`font-medium ${checked ? 'text-white' : 'text-slate-800'}`}>{permission.permissionKey}</p>
                            <p className={`text-[10px] ${checked ? 'text-slate-200' : 'text-slate-500'}`}>{permission.moduleName}:{permission.action}</p>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="text-base font-semibold text-slate-900">Dashboard Permissions</h3>
                <p className="mt-1 text-sm text-slate-500">Control dashboard-level views with independent checkboxes.</p>

                <div className="mt-4 grid grid-cols-1 gap-3">
                  {DASHBOARD_PERMISSION_OPTIONS.map((option) => {
                    const key = matrixKey('dashboard', option.action)
                    const exists = availablePairs.has(key)
                    const checked = selectedSet.has(key)

                    return (
                      <label
                        key={option.action}
                        className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition ${
                          exists
                            ? checked
                              ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                              : 'cursor-pointer border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            : 'border-dashed border-slate-200 opacity-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          disabled={!exists}
                          checked={checked}
                          onChange={() => onToggleDashboardPermission(option.action)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium">{option.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Permissions are stored as backend keys, so the matrix stays consistent with what the server actually enforces.
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white" onClick={onCancel}>
            Cancel
          </button>
          <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-slate-800" onClick={onSave}>
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  )
}