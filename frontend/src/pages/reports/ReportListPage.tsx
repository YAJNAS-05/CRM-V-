import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  FileSpreadsheet,
  LayoutTemplate,
  LineChart,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react'
import { reportApi, ReportDefinition } from '@/api/reportApi'
import { useNotification } from '@/hooks/useNotification'
import { FeatureGate } from '@/components/rbac'

type TabKey = 'all' | 'standard' | 'custom' | 'templates'

interface CustomReportItem {
  id: string
  name: string
  description?: string
  widgets?: unknown[]
  createdAt?: string
  updatedAt?: string
}

interface PagedResponse<T> {
  content?: T[]
  totalElements?: number
}

const MODULE_COLORS: Record<string, string> = {
  CRM: 'bg-blue-50 text-blue-700 border-blue-100',
  ERP: 'bg-violet-50 text-violet-700 border-violet-100',
  FINANCE: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  ANALYTICS: 'bg-slate-50 text-slate-700 border-slate-100',
}

export const ReportListPage = () => {
  const navigate = useNavigate()
  const { success, error } = useNotification()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [isDeletingCustom, setIsDeletingCustom] = useState<string | null>(null)

  const { data: standardPage, isLoading: standardLoading } = useQuery({
    queryKey: ['standard-reports'],
    queryFn: async () => {
      const res = await reportApi.listReports(undefined, 0, 100)
      return (res.data?.data || res.data) as PagedResponse<ReportDefinition>
    },
  })

  const {
    data: customPage,
    isLoading: customLoading,
    refetch: refetchCustom,
  } = useQuery({
    queryKey: ['custom-reports'],
    queryFn: () => reportApi.listCustomReports(0, 200),
  })

  const standardReports = useMemo(() => {
    const rows = Array.isArray(standardPage?.content) ? standardPage.content : []
    return rows.filter((r: ReportDefinition & { reportType?: string }) =>
      !r.reportType || r.reportType === 'STANDARD' || (r as { isSystem?: boolean }).isSystem
    )
  }, [standardPage])

  const customReports: CustomReportItem[] = useMemo(() => {
    const rows = Array.isArray(customPage?.content) ? customPage.content : []
    return rows as CustomReportItem[]
  }, [customPage])

  const stats = useMemo(
    () => ({
      standard: standardReports.length,
      custom: customReports.length,
      total: standardReports.length + customReports.length,
    }),
    [standardReports.length, customReports.length]
  )

  const filterText = search.trim().toLowerCase()

  const filteredStandard = useMemo(
    () =>
      standardReports.filter((r) => {
        if (!filterText) return true
        return (
          r.reportName?.toLowerCase().includes(filterText) ||
          r.module?.toLowerCase().includes(filterText) ||
          r.description?.toLowerCase().includes(filterText)
        )
      }),
    [standardReports, filterText]
  )

  const filteredCustom = useMemo(
    () =>
      [...customReports]
        .filter((r) => {
          if (!filterText) return true
          return (
            r.name?.toLowerCase().includes(filterText) ||
            r.description?.toLowerCase().includes(filterText)
          )
        })
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt || 0).getTime() -
            new Date(a.updatedAt || a.createdAt || 0).getTime()
        ),
    [customReports, filterText]
  )

  const showStandard = activeTab === 'all' || activeTab === 'standard'
  const showCustom = activeTab === 'all' || activeTab === 'custom'
  const isLoading = standardLoading || customLoading

  const handleDeleteCustomReport = async (reportId: string, reportName: string) => {
    if (!confirm(`Delete "${reportName}"? This cannot be undone.`)) return
    try {
      setIsDeletingCustom(reportId)
      await reportApi.deleteCustomReport(reportId)
      success('Report deleted', 'Custom report removed successfully')
      await refetchCustom()
    } catch (err) {
      error('Delete failed', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsDeletingCustom(null)
    }
  }

  const moduleBadge = (module: string) => {
    const cls = MODULE_COLORS[module?.toUpperCase()] || MODULE_COLORS.ANALYTICS
    return (
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${cls}`}>
        {module || 'GENERAL'}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#0d2a79] via-[#123691] to-[#1d4ed8] p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-100/90">
              Analytics & Reporting
            </p>
            <h1 className="mt-1 text-3xl font-bold">Reports Workspace</h1>
            <p className="mt-2 max-w-2xl text-sm text-blue-100/90">
              Freshservice-style analytics hub: run standard reports, build custom dashboards,
              and export insights across CRM, ERP, and Finance.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <FeatureGate requiredPermission="REPORT_VIEW">
              <button
                type="button"
                onClick={() => navigate('/reports/templates')}
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
              >
                <LayoutTemplate className="h-4 w-4" />
                Templates
              </button>
            </FeatureGate>
            <FeatureGate requiredPermission="REPORT_VIEW">
              <button
                type="button"
                onClick={() => navigate('/reports/custom')}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#0d2a79] hover:bg-blue-50"
              >
                <Plus className="h-4 w-4" />
                New custom report
              </button>
            </FeatureGate>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
            <p className="text-xs text-blue-100">Total catalog</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
            <p className="text-xs text-blue-100">Standard reports</p>
            <p className="text-2xl font-bold">{stats.standard}</p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
            <p className="text-xs text-blue-100">Custom dashboards</p>
            <p className="text-2xl font-bold">{stats.custom}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {(
            [
              ['all', 'All'],
              ['standard', 'Standard'],
              ['custom', 'Custom'],
              ['templates', 'Templates'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                key === 'templates' ? navigate('/reports/templates') : setActiveTab(key)
              }
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                activeTab === key
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl border bg-slate-50" />
          ))}
        </div>
      ) : (
        <>
          {showStandard && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-900">Standard reports</h2>
              </div>
              {filteredStandard.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
                  No standard reports match your search.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredStandard.map((report) => (
                    <article
                      key={report.reportId}
                      className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-700">
                          {report.reportName}
                        </h3>
                        {moduleBadge(report.module)}
                      </div>
                      <p className="mb-4 line-clamp-2 min-h-[40px] text-sm text-slate-600">
                        {report.description || 'Enterprise standard report'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <LineChart className="h-3.5 w-3.5" />
                          Live data
                        </span>
                        <button
                          type="button"
                          onClick={() => navigate(`/reports/view/${report.reportId}`)}
                          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Run report
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {showCustom && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-600" />
                <h2 className="text-lg font-semibold text-slate-900">Custom dashboards</h2>
              </div>
              {filteredCustom.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <p className="text-sm text-slate-500">No custom reports yet.</p>
                  <FeatureGate requiredPermission="REPORT_VIEW">
                    <button
                      type="button"
                      onClick={() => navigate('/reports/custom')}
                      className="mt-3 text-sm font-semibold text-blue-600 hover:underline"
                    >
                      Create your first custom report
                    </button>
                  </FeatureGate>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredCustom.map((report) => (
                    <article
                      key={report.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-violet-300 hover:shadow-md"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-slate-900">{report.name}</h3>
                        <span className="rounded bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                          CUSTOM
                        </span>
                      </div>
                      <p className="mb-2 text-xs text-slate-500">
                        {Array.isArray(report.widgets) ? report.widgets.length : 0} widgets
                      </p>
                      <p className="mb-4 line-clamp-2 min-h-[40px] text-sm text-slate-600">
                        {report.description || 'Custom analytics dashboard'}
                      </p>
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/reports/custom/${report.id}?mode=preview`)}
                          className="rounded border px-2.5 py-1 text-xs hover:bg-slate-50"
                        >
                          Preview
                        </button>
                        <FeatureGate requiredPermission="REPORT_VIEW">
                          <button
                            type="button"
                            onClick={() => navigate(`/reports/custom/${report.id}`)}
                            className="rounded border px-2.5 py-1 text-xs hover:bg-slate-50"
                          >
                            Edit
                          </button>
                        </FeatureGate>
                        <FeatureGate requiredPermission="REPORT_VIEW">
                          <button
                            type="button"
                            disabled={isDeletingCustom === report.id}
                            onClick={() => handleDeleteCustomReport(report.id, report.name)}
                            className="rounded border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            {isDeletingCustom === report.id ? '...' : 'Delete'}
                          </button>
                        </FeatureGate>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <div className="flex items-start gap-2">
          <FileSpreadsheet className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
          <p>
            Standard reports support CSV, Excel, and PDF export. Custom reports are stored in the
            database and sync across sessions (no browser-only draft mode required in dev).
          </p>
        </div>
      </div>
    </div>
  )
}
