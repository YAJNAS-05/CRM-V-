import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { insightsApi } from '../../api/insightsApi'
import { InsightItem, InsightSection } from '../../types/insights'

const formatCount = (value: number) => new Intl.NumberFormat().format(value)

const categoryStyles: Record<string, string> = {
  inputs: 'bg-slate-100 text-slate-700',
  approvals: 'bg-rose-50 text-rose-700',
  tasks: 'bg-amber-50 text-amber-700',
}

const InsightCard = ({ item }: { item: InsightItem }) => {
  const categoryLabel = item.category ? item.category.toUpperCase() : null
  const categoryClass = item.category ? (categoryStyles[item.category] || 'bg-slate-100 text-slate-700') : ''

  const content = (
    <div className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        <span>{item.key.replace(/_/g, ' ')}</span>
        {categoryLabel ? (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${categoryClass}`}>{categoryLabel}</span>
        ) : null}
      </div>
      <div className="mt-4">
        <div className="text-3xl font-extrabold text-slate-900">{formatCount(item.count)}</div>
        <p className="mt-1 text-sm font-medium text-slate-600">{item.label}</p>
      </div>
    </div>
  )

  if (item.href) {
    return (
      <Link to={item.href} className="block h-full">
        {content}
      </Link>
    )
  }

  return content
}

export const MyInsightsPage = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-insights'],
    queryFn: insightsApi.getMyInsights,
  })

  const sections: InsightSection[] = useMemo(() => data?.sections ?? [], [data])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading your insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="shell-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Personal workspace</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">My Insights</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              A cross-module snapshot of the work you own, approvals waiting on you, and inputs you have created.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-rose-700">
          <p className="font-semibold">Unable to load insights</p>
          <p className="text-sm mt-1">Please try again or check your permissions.</p>
        </div>
      ) : sections.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
          No insights available yet. Once you start creating records, your activity will show up here.
        </div>
      ) : (
        sections.map((section) => (
          <div key={section.module} className="shell-card p-5 sm:p-6 space-y-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">{section.module}</p>
              <h2 className="text-lg font-semibold text-slate-900 mt-1">{section.title}</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {section.items.map((item) => (
                <InsightCard key={`${section.module}-${item.key}`} item={item} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
