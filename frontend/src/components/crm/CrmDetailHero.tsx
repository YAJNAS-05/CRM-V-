import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type CrmDetailMetric = {
  label: string
  value: string | number
  accentClassName?: string
}

type CrmDetailHeroProps = {
  backHref: string
  backLabel: string
  title: string
  subtitle: string
  avatarText?: string
  badges?: ReactNode[]
  actions?: ReactNode
  metrics?: CrmDetailMetric[]
}

export default function CrmDetailHero({
  backHref,
  backLabel,
  title,
  subtitle,
  avatarText,
  badges = [],
  actions,
  metrics = [],
}: CrmDetailHeroProps) {
  return (
    <section className="crm-hero">
      <div className="relative p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <Link to={backHref} className="text-sm font-semibold text-sky-600 hover:text-sky-700">
              ← {backLabel}
            </Link>

            <div className="mt-4 flex items-start gap-4">
              {avatarText ? (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-lg font-bold text-sky-700">
                  {avatarText}
                </div>
              ) : null}

              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">{title}</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600 md:text-[15px]">{subtitle}</p>
                {badges.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {badges.map((badge, index) => (
                      <span key={typeof badge === 'string' ? badge : `badge-${index}`} className="pm-badge bg-white/85 text-slate-700 ring-1 ring-slate-200">
                        {badge}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {actions ? <div className="relative flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>

        {metrics.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="crm-stat-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{metric.label}</p>
                <p className={`mt-2 text-xl font-bold ${metric.accentClassName || 'text-slate-900'}`}>{metric.value}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
