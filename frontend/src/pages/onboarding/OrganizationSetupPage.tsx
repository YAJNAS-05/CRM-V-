import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'

interface AppUserRow {
  id: string
  org_id: string | null
  role: string | null
}

interface OrgRow {
  id: string
  name: string
  slug: string | null
}

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
  const [appUser, setAppUser] = useState<AppUserRow | null>(null)
  const [organization, setOrganization] = useState<OrgRow | null>(null)
  const [organizationName, setOrganizationName] = useState('')

  const hasExistingOrganization = Boolean(appUser?.org_id)

  const helperText = useMemo(() => {
    if (hasExistingOrganization) {
      return 'Your organization is already connected. You can update its display name here.'
    }
    return 'Set up your organization to unlock user invites, role management, and team onboarding.'
  }, [hasExistingOrganization])

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          navigate('/login', { replace: true })
          return
        }

        const { data: appUserData, error: appUserError } = await supabase
          .from('app_users')
          .select('id, org_id, role')
          .eq('auth_id', user.id)
          .maybeSingle()

        if (appUserError) {
          throw appUserError
        }

        if (!appUserData) {
          toast.error('User profile is not ready yet. Please try again in a moment.')
          navigate('/dashboard', { replace: true })
          return
        }

        setAppUser(appUserData)

        const defaultOrgName =
          typeof user.user_metadata?.org_name === 'string' ? user.user_metadata.org_name : ''

        if (appUserData.org_id) {
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('id, name, slug')
            .eq('id', appUserData.org_id)
            .maybeSingle()

          if (orgError) {
            throw orgError
          }

          if (orgData) {
            setOrganization(orgData)
            setOrganizationName(orgData.name)
          } else {
            setOrganizationName(defaultOrgName)
          }
        } else {
          setOrganizationName(defaultOrgName)
        }
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

    if (!appUser) {
      toast.error('User profile is not available yet.')
      return
    }

    setIsSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login', { replace: true })
        return
      }

      let orgId = appUser.org_id

      if (orgId) {
        const { error: updateOrgError } = await supabase
          .from('organizations')
          .update({
            name: trimmedName,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orgId)

        if (updateOrgError) {
          throw updateOrgError
        }
      } else {
        const { data: createdOrg, error: createOrgError } = await supabase
          .from('organizations')
          .insert({
            name: trimmedName,
            slug: slugify(trimmedName),
            owner_auth_id: user.id,
          })
          .select('id, name, slug')
          .single()

        if (createOrgError) {
          throw createOrgError
        }

        orgId = createdOrg.id
        setOrganization(createdOrg)

        const { error: updateUserError } = await supabase
          .from('app_users')
          .update({
            org_id: orgId,
            role: 'ADMIN',
            updated_at: new Date().toISOString(),
          })
          .eq('id', appUser.id)

        if (updateUserError) {
          throw updateUserError
        }

        setAppUser((prev) => (prev ? { ...prev, org_id: orgId, role: 'ADMIN' } : prev))

        await supabase.from('organization_members').upsert(
          {
            org_id: orgId,
            user_id: appUser.id,
            membership_role: 'OWNER',
          },
          { onConflict: 'org_id,user_id' }
        )

        const { data: adminRole } = await supabase
          .from('roles')
          .select('id,name')
          .in('name', ['SUPER_ADMIN', 'ADMIN'])
          .limit(1)

        if (adminRole && adminRole.length > 0) {
          await supabase.from('user_roles').upsert(
            {
              user_id: appUser.id,
              role_id: adminRole[0].id,
            },
            { onConflict: 'user_id,role_id' }
          )
        }
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

          {organization?.slug ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Current Slug: <span className="font-semibold text-slate-800">{organization.slug}</span>
            </div>
          ) : null}
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