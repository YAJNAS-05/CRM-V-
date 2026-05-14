import type { ReactNode } from 'react'

type FinanceHeaderMetric = {
  label: string
  value: string | number
  accentClassName?: string
}

type FinanceModuleHeaderProps = {
  eyebrow: string
  title: string
  subtitle: string
  metrics?: FinanceHeaderMetric[]
  actions?: ReactNode
}

export default function FinanceModuleHeader({
  eyebrow,
  title,
  subtitle,
  metrics = [],
  actions,
}: FinanceModuleHeaderProps) {
  return (
    <section className="finance-hero p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>

      {metrics.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="finance-stat-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{metric.label}</p>
              <p className={`mt-2 text-xl font-bold ${metric.accentClassName || 'text-slate-900'}`}>{metric.value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}