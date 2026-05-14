import { Link } from 'react-router-dom'
import { FeatureGate } from '../rbac'

type CrmHeaderMetric = {
  label: string
  value: string | number
  accentClassName?: string
}

type CrmModuleHeaderProps = {
  eyebrow: string
  title: string
  subtitle: string
  metrics: CrmHeaderMetric[]
  createHref?: string
  createLabel?: string
  requiredCreatePermission?: string
}

export default function CrmModuleHeader({
  eyebrow,
  title,
  subtitle,
  metrics,
  createHref,
  createLabel,
  requiredCreatePermission = 'CRM_CREATE',
}: CrmModuleHeaderProps) {
  return (
    <section className="crm-hero">
      <div className="relative p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="relative max-w-3xl">
            <p className="pm-section-title">{eyebrow}</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 md:text-[15px]">{subtitle}</p>
          </div>

          {createHref && createLabel ? (
            <FeatureGate requiredPermission={requiredCreatePermission}>
              <Link
                to={createHref}
                className="relative inline-flex items-center rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
              >
                <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {createLabel}
              </Link>
            </FeatureGate>
          ) : null}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="crm-stat-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{metric.label}</p>
              <p className={`mt-2 text-xl font-bold ${metric.accentClassName || 'text-slate-900'}`}>{metric.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
