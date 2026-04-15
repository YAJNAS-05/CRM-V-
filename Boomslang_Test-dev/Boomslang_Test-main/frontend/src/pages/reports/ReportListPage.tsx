// src/pages/reports/ReportListPage.tsx
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { reportApi } from '@/api/reportApi'
import { useNotification } from '@/hooks/useNotification'
import { useAuthStore } from '@/store/authStore'

interface Report {
  reportId: number | string
  reportName: string
  module: string
  description?: string
  columnCount?: number
  isSystem?: boolean
  ownedBy?: string | number
}

export const ReportListPage = () => {
  const navigate = useNavigate()
  const { success, error } = useNotification()
  const user = useAuthStore((state: any) => state.user)
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState<string | null>(null)
  const [isCloning, setIsCloning] = useState<string | number | null>(null)

  // Fetch reports list
  const { data: reports = [], isLoading, refetch } = useQuery({
    queryKey: ['reports', moduleFilter],
    queryFn: async () => {
      try {
        const response = await reportApi.listReports(moduleFilter || undefined)
        // Backend returns Page<ReportDefinitionEntity>, extract content array
        const pageData = response.data?.data as any
        return pageData?.content || []
      } catch {
        return []
      }
    }
  })

  // Fetch modules for filter
  const { data: modules = [] } = useQuery({
    queryKey: ['report-modules'],
    queryFn: async () => {
      try {
        const response = await reportApi.getModules()
        const data = response.data?.data as any[] || []
        // Extract module names if they're objects with 'name' property
        return Array.isArray(data) && data.length > 0 && typeof data[0] === 'object'
          ? data.map((m: any) => ({ name: m.name, displayName: m.displayName }))
          : ['CRM', 'ERP', 'FINANCE'].map(n => ({ name: n, displayName: n }))
      } catch {
        return ['CRM', 'ERP', 'FINANCE'].map(n => ({ name: n, displayName: n }))
      }
    }
  })

  // Filter reports based on search
  const filteredReports: Report[] = useMemo(() => {
    if (!Array.isArray(reports)) return []
    return reports
      .filter((r: any) => r && r.reportId) // Filter out invalid entries
      .map((r: any) => ({
        reportId: r.reportId,
        reportName: r.reportName || 'Untitled Report',
        module: r.module || 'UNKNOWN',
        description: r.description,
        columnCount: r.columns?.length || 0,
        isSystem: r.isSystem,
        ownedBy: r.ownedBy
      }))
      .filter((r: Report) =>
        r.reportName.toLowerCase().includes(search.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
      )
  }, [reports, search])

  const handleCloneReport = async (reportId: number | string, moduleName: string) => {
    try {
      setIsCloning(reportId)
      const cloned = await reportApi.cloneReport(reportId as number, moduleName)
      const clonedReport = cloned.data?.data as Report
      success('Report Cloned', `Report cloned as "${clonedReport.reportName}"`)
      await refetch()
    } catch (err) {
      error('Clone Failed', `Failed to clone: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsCloning(null)
    }
  }

  const handleDeleteReport = async (reportId: number | string, reportName: string) => {
    if (!confirm(`Delete report "${reportName}"? This cannot be undone.`)) return

    try {
      await reportApi.deleteReport(reportId as number)
      success('Report Deleted', 'Report deleted successfully')
      await refetch()
    } catch (err) {
      error('Delete Failed', `Failed to delete: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-1">Browse, run, and manage reports</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg bg-background"
          />
          <select
            value={moduleFilter || ''}
            onChange={(e: any) => setModuleFilter(e.target.value || null)}
            className="px-3 py-2 border rounded-lg bg-background"
          >
            <option value="">All Modules</option>
            {Array.isArray(modules) && modules.map((m: any) => {
              const name = typeof m === 'string' ? m : m.name
              const displayName = typeof m === 'string' ? m : (m.displayName || m.name)
              return (
                <option key={name} value={name}>{displayName}</option>
              )
            })}
          </select>
        </div>
        <button
          onClick={() => navigate('/reports/builder')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          + New Report
        </button>
      </div>

      {/* Reports Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 bg-muted/20 rounded-lg border border-border/50 animate-pulse"
            />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {search || moduleFilter ? 'No reports found' : 'No reports yet'}
          </p>
          <button
            onClick={() => navigate('/reports/builder')}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Create your first report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report: Report) => (
            <div
              key={report.reportId}
              className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
            >
              {/* Header */}
              <div className="mb-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3
                    className="font-semibold text-foreground cursor-pointer hover:text-primary truncate flex-1"
                    onClick={() => navigate(`/reports/${report.reportId}`)}
                  >
                    {report.reportName}
                  </h3>
                  <span className="text-xs px-2 py-1 bg-muted rounded whitespace-nowrap">
                    {report.module}
                  </span>
                </div>
                {!report.isSystem && (
                  <p className="text-xs text-muted-foreground">
                    by {report.ownedBy || 'System'}
                  </p>
                )}
              </div>

              {/* Description */}
              {report.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {report.description}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {report.columnCount || 0} columns
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/reports/${report.reportId}`)}
                    className="text-xs px-3 py-1 border rounded hover:bg-muted"
                  >
                    View
                  </button>
                  {user && (
                    <button
                      onClick={() => handleCloneReport(report.reportId, report.module)}
                      disabled={isCloning === report.reportId}
                      className="text-xs px-3 py-1 border rounded hover:bg-muted disabled:opacity-40"
                      title="Clone to create an editable copy"
                    >
                      {isCloning === report.reportId ? '...' : 'Clone'}
                    </button>
                  )}
                  {!report.isSystem && user?.userId === report.ownedBy && (
                    <button
                      onClick={() => navigate(`/reports/${report.reportId}/edit`)}
                      className="text-xs px-3 py-1 border rounded hover:bg-muted"
                    >
                      Edit
                    </button>
                  )}
                  {!report.isSystem && user?.userId === report.ownedBy && (
                    <button
                      onClick={() => handleDeleteReport(report.reportId, report.reportName)}
                      className="text-xs px-3 py-1 border rounded text-destructive hover:bg-destructive/10"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
