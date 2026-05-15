import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { reportApi } from '@/api/reportApi'
import { useNotification } from '@/hooks/useNotification'

interface CustomReportItem {
  id: string
  name: string
  description?: string
  widgets?: any[]
  createdAt?: string
  updatedAt?: string
}

export const ReportListPage = () => {
  const navigate = useNavigate()
  const { success, error } = useNotification()
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isDeletingCustom, setIsDeletingCustom] = useState<string | null>(null)

  const {
    data: customReports = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['custom-reports'],
    queryFn: async () => {
      try {
        const page = await reportApi.listCustomReports(0, 500)
        return Array.isArray(page?.content) ? page.content : []
      } catch {
        return []
      }
    },
  })

  const filteredCustomReports: CustomReportItem[] = useMemo(() => {
    if (!Array.isArray(customReports)) return []

    const filtered = customReports.filter((report: CustomReportItem) => {
      const titleMatch = report.name?.toLowerCase().includes(search.toLowerCase())
      const descriptionMatch = report.description?.toLowerCase().includes(search.toLowerCase())
      return Boolean(titleMatch || descriptionMatch)
    })

    return [...filtered].sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime()
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime()
      return bTime - aTime
    })
  }, [customReports, search])

  const handleDeleteCustomReport = async (reportId: string, reportName: string) => {
    if (!confirm(`Delete saved report "${reportName}"? This cannot be undone.`)) return

    try {
      setIsDeletingCustom(reportId)
      await reportApi.deleteCustomReport(reportId)
      success('Report Deleted', 'Saved report deleted successfully')
      await refetch()
    } catch (err) {
      error('Delete Failed', `Failed to delete saved report: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsDeletingCustom(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Saved Reports</h1>
        <p className="text-muted-foreground mt-1">All saved custom reports are available here.</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search saved reports..."
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg bg-background"
        />
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm border-l ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              List
            </button>
          </div>

          <button
            onClick={() => navigate('/reports/custom')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            + New Custom Report
          </button>
        </div>
      </div>

      {isLoading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`saved-skeleton-${i}`}
                className="h-44 bg-muted/20 rounded-lg border border-border/50 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`saved-list-skeleton-${i}`}
                className="h-20 bg-muted/20 rounded-lg border border-border/50 animate-pulse"
              />
            ))}
          </div>
        )
      ) : filteredCustomReports.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          {search ? 'No saved reports match your search' : 'No saved custom reports yet'}
        </div>
      ) : (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomReports.map((report) => (
              <div key={report.id} className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                <div className="mb-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate flex-1">{report.name || 'Untitled Saved Report'}</h3>
                    <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded whitespace-nowrap">
                      SAVED
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Array.isArray(report.widgets) ? report.widgets.length : 0} widgets
                  </p>
                </div>

                {report.description ? (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3 min-h-[60px]">{report.description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground mb-3 min-h-[60px]">No description</p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Updated {report.updatedAt ? new Date(report.updatedAt).toLocaleDateString() : 'just now'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/reports/custom/${report.id}?mode=preview`)}
                      className="text-xs px-3 py-1 border rounded hover:bg-muted"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/reports/custom/${report.id}`)}
                      className="text-xs px-3 py-1 border rounded hover:bg-muted"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCustomReport(report.id, report.name)}
                      disabled={isDeletingCustom === report.id}
                      className="text-xs px-3 py-1 border rounded text-destructive hover:bg-destructive/10 disabled:opacity-40"
                    >
                      {isDeletingCustom === report.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden bg-card">
            <div className="hidden md:grid md:grid-cols-12 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-50 border-b border-border">
              <div className="md:col-span-5">Report</div>
              <div className="md:col-span-2">Widgets</div>
              <div className="md:col-span-2">Updated</div>
              <div className="md:col-span-3 text-right">Actions</div>
            </div>

            {filteredCustomReports.map((report) => (
              <div
                key={`list-${report.id}`}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 px-4 py-4 border-b border-border last:border-b-0"
              >
                <div className="md:col-span-5 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground truncate">{report.name || 'Untitled Saved Report'}</p>
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded whitespace-nowrap">SAVED</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {report.description || 'No description'}
                  </p>
                </div>

                <div className="md:col-span-2 text-sm text-slate-700 flex items-center">
                  {Array.isArray(report.widgets) ? report.widgets.length : 0} widgets
                </div>

                <div className="md:col-span-2 text-sm text-slate-600 flex items-center">
                  {report.updatedAt ? new Date(report.updatedAt).toLocaleDateString() : 'just now'}
                </div>

                <div className="md:col-span-3 flex items-center md:justify-end gap-2">
                  <button
                    onClick={() => navigate(`/reports/custom/${report.id}?mode=preview`)}
                    className="text-xs px-3 py-1 border rounded hover:bg-muted"
                  >
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/reports/custom/${report.id}`)}
                    className="text-xs px-3 py-1 border rounded hover:bg-muted"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCustomReport(report.id, report.name)}
                    disabled={isDeletingCustom === report.id}
                    className="text-xs px-3 py-1 border rounded text-destructive hover:bg-destructive/10 disabled:opacity-40"
                  >
                    {isDeletingCustom === report.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
