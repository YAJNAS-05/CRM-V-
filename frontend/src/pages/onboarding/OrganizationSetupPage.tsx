import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from '../../api/authApi'
import { useAuthStore } from '../../store/authStore'
import { LOCAL_ORGANIZATION_STORAGE_KEY } from '../../lib/localAuth'

const slugify = (value: string) => {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (!normalized) {
    return `organization-${Math.random().toString(36).slice(2, 8)}`
  }

  return normalized
}

const OrganizationSetupPage: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [organizationName, setOrganizationName] = useState('')
  const [hasExistingOrganization, setHasExistingOrganization] = useState(false)
  const currentUser = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

  const helperText = useMemo(() => {
    if (hasExistingOrganization) {
      return 'Your organization is already configured. You can update its display name here.'
    }
    return 'Set up your organization to unlock invites, role management, and team onboarding.'
  }, [hasExistingOrganization])

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)

        const resolvedUser = currentUser ?? (await authApi.me())

        if (!resolvedUser) {
          navigate('/login', { replace: true })
          return
        }

        if (resolvedUser !== currentUser) {
          setUser(resolvedUser)
        }

        const storedOrganizationName = window.localStorage.getItem(LOCAL_ORGANIZATION_STORAGE_KEY) || ''
        setHasExistingOrganization(Boolean(storedOrganizationName))
        setOrganizationName(storedOrganizationName || resolvedUser.officeLocation || resolvedUser.fullName || '')
      } catch (error: any) {
        toast.error(error?.message || 'Failed to load organization setup.')
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [navigate])

  const handleSave = async () => {
    const trimmedName = organizationName.trim()
    if (trimmedName.length < 2) {
      toast.error('Organization name must be at least 2 characters.')
      return
    }

    setIsSaving(true)
    try {
      window.localStorage.setItem(LOCAL_ORGANIZATION_STORAGE_KEY, trimmedName)
      setHasExistingOrganization(true)
      setOrganizationName(trimmedName)

      if (currentUser) {
        setUser({
          ...currentUser,
          officeLocation: trimmedName,
        })
      }

      toast.success('Organization setup saved successfully.')
      navigate('/dashboard', { replace: true })
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save organization setup.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
        Loading organization setup...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">Initial Onboarding</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Organization Setup</h1>
        <p className="mt-2 text-sm text-slate-600">{helperText}</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Organization Name</label>
            <input
              type="text"
              value={organizationName}
              onChange={(event) => setOrganizationName(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Acme Corporation"
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Organization name is stored locally for this build.
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : hasExistingOrganization ? 'Save Changes' : 'Create Organization'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrganizationSetupPage