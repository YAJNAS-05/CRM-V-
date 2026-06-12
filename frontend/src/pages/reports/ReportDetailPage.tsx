import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { reportApi } from '@/api/reportApi'
import { ReportViewer } from '@/components/reports/ReportViewer'
import { JasperReportExporter } from '@/components/reports/JasperReportExporter'
import { BarChart3, Clock, Database } from 'lucide-react'

export const ReportDetailPage = () => {
  const { reportId } = useParams<{ reportId: string }>()
  const navigate = useNavigate()

  if (!reportId) {
    return <div className="p-4 text-center text-destructive">Invalid report ID</div>
  }

  const numericReportId = Number(reportId)

  if (Number.isNaN(numericReportId)) {
    return <div className="p-4 text-center text-destructive">Invalid report ID: {reportId}</div>
  }

  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ['report', numericReportId],
    queryFn: async () => {
      const res = await reportApi.getReport(numericReportId)
      return res.data?.data
    },
  })

  if (reportLoading) {
    return <div className="p-6 text-center text-muted-foreground">Loading report...</div>
  }

  if (!reportData) {
    return <div className="p-6 text-center text-destructive">Report not found</div>
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/reports')}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Reports
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              <BarChart3 className="h-3.5 w-3.5" />
              {reportData.module || 'REPORT'}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{reportData.reportName}</h1>
            {reportData.description && (
              <p className="mt-1 max-w-3xl text-sm text-slate-600">{reportData.description}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-500">
              <Database className="h-3.5 w-3.5" />
              Live query
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              Auto-refresh on filter
            </span>
            <JasperReportExporter
              reportId={numericReportId}
              reportName={reportData.reportName || 'Report'}
            />
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <ReportViewer reportId={numericReportId} showCharts />
      </div>
    </div>
  )
}
