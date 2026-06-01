import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { adminApi } from '@/api/adminApi'
import { ACTIONS, MODULES, isActionSupported } from '@/components/rbac/permissionMatrix'
import { BadgeCheck, ChevronLeft, Shield, Trash2 } from 'lucide-react'

const DASHBOARD_PERMISSION_OPTIONS = [
  { action: 'self_view', label: 'Personal Dashboard View' },
  { action: 'team_view', label: 'Team Dashboard View' },
  { action: 'finance_view', label: 'Finance Dashboard View' },
  { action: 'hr_view', label: 'HR Dashboard View' },
  { action: 'tech_view', label: 'Technician Dashboard View' },
  { action: 'operations_view', label: 'Operations Dashboard View' },
  { action: 'view', label: 'Generic Dashboard View' },
] as const

const matrixKey = (moduleName: string, action: string) => `${moduleName.toLowerCase()}:${action.toLowerCase()}`
const normalizeArray = (value: unknown): any[] => (Array.isArray(value) ? value : [])

export default function RoleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [role, setRole] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [availablePairs, setAvailablePairs] = useState<Set<string>>(new Set())
  const [pairToPermId, setPairToPermId] = useState<Record<string, string>>({})
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const selectedSet = useMemo(() => new Set(selected), [selected])
  const permissionCount = selected.length
  const dashboardPermissionCount = normalizeArray(role?.permissions).filter((permission: any) => String(permission.module || '').toLowerCase() === 'dashboard').length

  const load = async () => {
    if (!id) return
    setLoading(true)
    try {
      const rolesRes = await adminApi.getRoles()
      const raw = rolesRes.data?.data ?? rolesRes.data
      const allRoles: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : []
      const found = allRoles.find((entry: any) => String(entry.id) === String(id))

      if (!found) {
        toast.error('Role not found')
        navigate('/admin/roles')
        return
      }

      setRole(found)
      setName(found.name || '')
      setDescription(found.description || '')

      const permRes = await adminApi.getPermissions()
      const allPerms: any[] = Array.isArray(permRes.data?.data)
        ? permRes.data.data
        : Array.isArray(permRes.data)
          ? permRes.data
          : []

      const mapping: Record<string, string> = {}
      allPerms.forEach((permission: any) => {
        if (permission.module && permission.action) {
          const key = matrixKey(permission.module, permission.action)
          mapping[key] = String(permission.permissionKey ?? permission.id ?? key)
        }
      })

      setPairToPermId(mapping)
      setAvailablePairs(new Set(Object.keys(mapping)))

      const rolePerms: any[] = normalizeArray(found.permissions)
      const activePairs = rolePerms
        .map((permission: any) => {
          if (permission.module && permission.action) return matrixKey(permission.module, permission.action)
          if (permission.permissionKey) {
            const match = allPerms.find((entry: any) => entry.permissionKey === permission.permissionKey)
            if (match?.module && match?.action) return matrixKey(match.module, match.action)
          }
          return null
        })
        .filter((pair): pair is string => pair !== null)

      setSelected(activePairs)
    } catch {
      toast.error('Failed to load role details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [id])

  const togglePermission = (moduleName: string, action: string) => {
    const key = matrixKey(moduleName, action)
    setSelected((prev) => (prev.includes(key) ? prev.filter((entry) => entry !== key) : [...prev, key]))
  }

  const save = async () => {
    if (!id) return
    setSaving(true)
    try {
      await adminApi.updateRole(id, { description })
      const permissionKeys = selected.map((pair) => pairToPermId[pair]).filter((value): value is string => Boolean(value))
      await adminApi.updateRolePermissions(id, { permissionKeys })
      toast.success('Role updated successfully')
      await load()
    } catch {
      toast.error('Failed to save role')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRole = async () => {
    if (!id) return
    if (!confirm(`Delete role "${name}"? This cannot be undone.`)) return
    try {
      await adminApi.deleteRole(id)
      toast.success('Role deleted')
      navigate('/admin/roles')
    } catch {
      toast.error('Failed to delete role')
    }
  }

  if (loading) {
      const [search, setSearch] = useState('')
    return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">Loading role...</div>
  }

  if (!role) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 shadow-sm">
        Role not found.{' '}
        <button className="font-medium text-blue-600 underline underline-offset-4" onClick={() => navigate('/admin/roles')}>
          Back to roles
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => navigate('/admin/roles')}>
              <ChevronLeft className="h-4 w-4" />
              Back to roles
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{name || role.name}</h1>
              {role.isSystem || role.is_system_role ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
                  <Shield className="h-3.5 w-3.5" />
                  System role
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Custom role
                </span>
              )}
            </div>

            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              {description || 'Describe the role clearly so it is easy to audit and maintain.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <MetricPill label="Selected permissions" value={permissionCount} />
            <MetricPill label="Dashboard permissions" value={dashboardPermissionCount} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Name</p>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
            value={name}
            disabled={Boolean(role.isSystem || role.is_system_role)}
            onChange={(e) => setName(e.target.value)}
            placeholder="Role name"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Description</p>
          <textarea
            className="mt-2 min-h-[56px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Role description"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Permission Matrix</h2>
            <p className="text-sm text-slate-500">Toggle permissions directly from the matrix.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">{selected.length} selected</span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Module</th>
                {ACTIONS.map((action) => (
                  <th key={action} className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {action}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((moduleName) => (
                <tr key={moduleName} className="border-t hover:bg-slate-50/70">
                  <td className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-700">{moduleName}</td>
                  {ACTIONS.map((action) => {
                    const key = matrixKey(moduleName, action)
                    const supported = isActionSupported(moduleName as any, action as any) && availablePairs.has(key)
                    return (
                      <td key={key} className="px-2 py-3 text-center">
                        <input
                          type="checkbox"
                          disabled={!supported}
                          checked={selectedSet.has(key)}
                          onChange={() => togglePermission(moduleName, action)}
                          className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${!supported ? 'opacity-30' : ''}`}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Dashboard permissions</h3>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {DASHBOARD_PERMISSION_OPTIONS.map((option) => {
              const key = matrixKey('dashboard', option.action)
              const exists = availablePairs.has(key)

              return (
                <label key={option.action} className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm ${exists ? 'cursor-pointer border-slate-200 hover:border-slate-300 hover:bg-slate-50' : 'border-dashed border-slate-200 opacity-50'}`}>
                  <input
                    type="checkbox"
                    disabled={!exists}
                    checked={selectedSet.has(key)}
                    onChange={() => togglePermission('dashboard', option.action)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-slate-700">{option.label}</span>
                </label>
              )
            })}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-slate-500">This screen updates the role description and the backend permission keys together.</span>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50" onClick={handleDeleteRole} disabled={Boolean(role.isSystem || role.is_system_role)}>
              <Trash2 className="h-4 w-4" />
              Delete role
            </button>
            <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60" onClick={() => void save()} disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="text-xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}