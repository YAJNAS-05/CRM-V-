import { Link } from 'react-router-dom'

type DealsHeaderMetric = {
  label: string
  value: string | number
}

type DealsViewHeaderProps = {
  activeView: 'list' | 'kanban'
  title: string
  subtitle: string
  metrics: DealsHeaderMetric[]
  canCreate?: boolean
}

export default function DealsViewHeader({ activeView, title, subtitle, metrics, canCreate = true }: DealsViewHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="pointer-events-none absolute -left-24 -top-24 h-52 w-52 rounded-full bg-sky-100/70 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-56 w-56 rounded-full bg-amber-100/60 blur-2xl" />

      <div className="relative p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex rounded-lg border border-slate-300 bg-slate-100 p-1 shadow-sm">
              <Link
                to="/crm/deals"
                className={`min-w-[90px] rounded-md px-4 py-2 text-center text-sm font-semibold transition ${
                  activeView === 'list'
                    ? 'border border-slate-200 bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
                }`}
              >
                List
              </Link>
              <Link
                to="/crm/deals/kanban"
                className={`min-w-[90px] rounded-md px-4 py-2 text-center text-sm font-semibold transition ${
                  activeView === 'kanban'
                    ? 'border border-slate-200 bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
                }`}
              >
                Pipeline
              </Link>
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
              <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            </div>
          </div>

          {canCreate && (
            <Link
              to="/crm/deals/new"
              className="inline-flex items-center rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
            >
              <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Deal
            </Link>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-xl border border-slate-200 bg-white/90 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{metric.label}</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
