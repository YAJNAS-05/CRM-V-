import React from 'react'
import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { usePermissions } from '@/hooks/usePermissions'

const AccessContextBar: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const { primaryRole, dataScope } = usePermissions()

  if (!user) {
    return null
  }

  const roleLabel = primaryRole?.replace(/_/g, ' ') ?? 'User'
  const scopeLabel =
    dataScope === 'ORG' ? 'Org data' : dataScope === 'TEAM' ? 'Team data' : 'Own data'

  return (
    <div className="border-b border-slate-200/80 bg-slate-50/90 px-4 py-2 md:px-6">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <Shield className="h-3.5 w-3.5 text-blue-600" aria-hidden />
          <span>
            Signed in as <span className="font-semibold text-slate-800">{user.fullName || user.email}</span>
          </span>
          <span className="hidden text-slate-400 sm:inline">·</span>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-800">
            {roleLabel}
          </span>
          <span className="rounded-full bg-slate-200/80 px-2 py-0.5 font-medium text-slate-700">
            {scopeLabel}
          </span>
        </div>
        <Link
          to="/profile/access"
          className="font-semibold text-blue-600 hover:text-blue-800"
        >
          My access
        </Link>
      </div>
    </div>
  )
}

export default AccessContextBar
