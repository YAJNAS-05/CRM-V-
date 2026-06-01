import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { adminApi } from '@/api/adminApi'
import { ACTIONS, MODULES, isActionSupported } from '@/components/rbac/permissionMatrix'
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  CheckCheck,
  ChevronRight,
  Layers3,
  Search,
  Shield,
  Sparkles,
  SlidersHorizontal,
  Undo2,
  Wand2,
} from 'lucide-react'

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

const matrixKey = (moduleName: string, action: string) => `${moduleName.toLowerCase()}:${action.toLowerCase()}`

const presets = [
  {
    id: 'basic',
    label: 'Basic user',
    description: 'Read-only access for routine work',
    permissions: ['pm:view', 'crm:view', 'fieldwork:view'],
  },
  {
    id: 'ops',
    label: 'Ops lead',
    description: 'Assignments, edits, and exports',
    permissions: ['pm:view', 'pm:create', 'pm:edit', 'pm:assign', 'pm:export', 'fieldwork:view', 'fieldwork:create', 'fieldwork:edit', 'fieldwork:assign', 'fieldwork:export', 'crm:view', 'crm:assign'],
  },
  {
    id: 'finance',
    label: 'Finance pro',
    description: 'Financial workflows and approvals',
    permissions: ['finance:view', 'finance:create', 'finance:edit', 'finance:approve', 'finance:export', 'crm:view'],
  },
] as const

function MetricCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="text-lg font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default function RoleCreatePage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [availablePairs, setAvailablePairs] = useState<Set<string>>(new Set())
  const [pairToPermId, setPairToPermId] = useState<Record<string, string>>({})
  const [allPermissions, setAllPermissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const selectedSet = useMemo(() => new Set(selected), [selected])

  useEffect(() => {
    const loadPermissions = async () => {
      setLoading(true)
      try {
        const response = await adminApi.getPermissions()
        const data: any[] = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : []

        const mapping: Record<string, string> = {}
        const pairs = new Set<string>()

        data.forEach((permission: any) => {
          if (!permission.module || !permission.action) return
          const key = matrixKey(permission.module, permission.action)
          mapping[key] = String(permission.permissionKey ?? permission.id ?? key)
          pairs.add(key)
        })

        setAllPermissions(data)
        setPairToPermId(mapping)
        setAvailablePairs(pairs)
      } catch {
        toast.error('Failed to load permissions')
      } finally {
        setLoading(false)
      }
    }

    void loadPermissions()
  }, [])

  const togglePermission = (moduleName: string, action: string) => {
    const key = matrixKey(moduleName, action)
    setSelected((prev) => (prev.includes(key) ? prev.filter((entry) => entry !== key) : [...prev, key]))
  }

  const applyPreset = (presetId: string) => {
    const preset = presets.find((item) => item.id === presetId)
    if (!preset) return
    const next = preset.permissions.filter((permissionKey) => availablePairs.has(permissionKey))
    setSelected(next)
  }

  const clearSelection = () => setSelected([])
  const selectAll = () => setSelected(Array.from(availablePairs))

  const saveRole = async () => {
    const trimmedName = name.trim().toUpperCase()
    if (!trimmedName) {
      toast.error('Role name is required')
      return
    }

    setSaving(true)
    try {
      const permissionKeys = selected.map((pair) => pairToPermId[pair]).filter((value): value is string => Boolean(value))
      await adminApi.createRole({
        name: trimmedName,
        description: description.trim(),
        permissionKeys,
        isActive: true,
      })

      toast.success('Role created successfully')
      navigate('/admin/roles')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create role')
    } finally {
      setSaving(false)
    }
  }

  const permissionCount = selected.length
  const moduleCount = new Set(selected.map((entry) => entry.split(':')[0])).size

  const visibleGroups = useMemo(() => {
    const query = search.trim().toLowerCase()
    return MODULES.map((moduleName) => {
      const permissions = ACTIONS.map((action) => {
        const key = matrixKey(moduleName, action)
        const exists = availablePairs.has(key)
        const supported = exists && isActionSupported(moduleName as any, action as any)
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
  }, [availablePairs, search])

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

  const additionalPermissions = useMemo(() => {
    const query = search.trim().toLowerCase()

    return allPermissions
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
  }, [allPermissions, coveredPairs, search])

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_30%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-6 shadow-sm">
        <div className="absolute -right-10 top-0 h-36 w-36 rounded-full bg-sky-100/70 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-emerald-100/70 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl space-y-5">
            <button
              onClick={() => navigate('/admin/roles')}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to roles
            </button>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Fresh role builder
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Create Role</h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Build a reusable access profile with a clearer structure: name, purpose, quick presets, permission search, and a live summary of what this role can do.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-700">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <Shield className="h-4 w-4 text-sky-600" />
                Permission matrix ready
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <BadgeCheck className="h-4 w-4 text-emerald-600" />
                {permissionCount} selected
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <Layers3 className="h-4 w-4 text-violet-600" />
                {moduleCount} modules touched
              </span>
            </div>
          </div>

          <aside className="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Live summary</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Role preview</h2>
              </div>
              <div className="rounded-2xl bg-slate-50 px-3 py-2 text-right">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Selected</p>
                <p className="text-lg font-semibold text-slate-900">{permissionCount}</p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Generated role key</p>
                <p className="mt-1 break-all text-sm font-medium text-slate-900">{name.trim() ? name.trim().toUpperCase() : 'ROLE_NAME'}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">Keep the name uppercase and descriptive. This becomes the backend role name.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MetricCard label="Permissions" value={permissionCount} icon={CheckCheck} />
                <MetricCard label="Modules" value={moduleCount} icon={BriefcaseBusiness} />
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                  Quick presets
                </div>
                <div className="mt-3 space-y-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset.id)}
                      className="w-full rounded-2xl border border-slate-200 px-3 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{preset.label}</p>
                          <p className="text-xs text-slate-500">{preset.description}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 text-sm text-slate-600">
                Permissions are stored as backend keys, so what you select here matches the server-side access rules exactly.
              </div>
            </div>
          </aside>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Role name</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="FIELD_MANAGER"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Description</p>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Can manage field jobs and service actions"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Permission matrix</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">Choose what this role can do</h2>
            <p className="mt-1 text-sm text-slate-500">Search, compare, and select permissions by module. Disabled actions remain visible but cannot be selected.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={selectAll} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              <CheckCheck className="h-4 w-4" />
              Select all available
            </button>
            <button onClick={clearSelection} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              <Undo2 className="h-4 w-4" />
              Clear selection
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search permissions by label, module, or action"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-white px-3 py-2 shadow-sm">{permissionCount} selected</span>
            <span className="rounded-full bg-white px-3 py-2 shadow-sm">{visibleGroups.length} visible modules</span>
          </div>
        </div>

        {loading ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">Loading permissions...</div>
        ) : visibleGroups.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">No permissions match your search. Try a different term or clear the filter.</div>
        ) : (
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {visibleGroups.map((group) => (
              <article key={group.moduleName} className="rounded-[1.75rem] border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">{group.label}</h3>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 shadow-sm">{group.permissions.length} actions</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{group.description}</p>
                  </div>

                  <button
                    onClick={() => {
                      const groupKeys = group.permissions.filter((permission) => permission.supported).map((permission) => permission.key)
                      const allSelected = groupKeys.every((entry) => selectedSet.has(entry))
                      setSelected((prev) => (allSelected ? prev.filter((entry) => !groupKeys.includes(entry)) : Array.from(new Set([...prev, ...groupKeys]))))
                    }}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    Toggle group
                  </button>
                </div>

                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {group.permissions.map((permission) => {
                    const checked = selectedSet.has(permission.key)
                    return (
                      <label
                        key={permission.key}
                        className={`flex items-start gap-3 rounded-2xl border px-3 py-3 text-sm transition ${
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
                          onChange={() => togglePermission(permission.moduleName, permission.action)}
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="min-w-0">
                          <p className={`font-medium ${checked && permission.supported ? 'text-white' : 'text-slate-800'}`}>{permission.label}</p>
                          <p className={`text-xs ${checked && permission.supported ? 'text-slate-200' : 'text-slate-500'}`}>{permission.key}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <BarChart3 className="h-4 w-4 text-slate-500" />
            Dashboard permissions
          </h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      : 'cursor-not-allowed border-dashed border-slate-200 bg-white opacity-45'
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled={!exists}
                    checked={checked}
                    onChange={() => togglePermission('dashboard', option.action)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium">{option.label}</span>
                </label>
              )
            })}
          </div>
        </div>

        {additionalPermissions.length > 0 && (
          <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-900">Additional permissions</h3>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                {additionalPermissions.length} extra
              </span>
            </div>
            <p className="mb-3 text-xs text-slate-500">All backend permissions are available here when they are outside the standard matrix.</p>

            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
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
                      onChange={() => togglePermission(permission.moduleName, permission.action)}
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
      </section>

      <div className="flex items-center justify-end gap-3 pb-4">
        <button onClick={() => navigate('/admin/roles')} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
          Cancel
        </button>
        <button onClick={() => void saveRole()} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
          <Wand2 className="h-4 w-4" />
          {saving ? 'Creating...' : 'Create Role'}
        </button>
      </div>
    </div>
  )
}