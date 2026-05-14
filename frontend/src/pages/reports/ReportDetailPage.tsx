// src/pages/reports/ReportDetailPage.tsx
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportApi, ReportFilter, ReportExecutionRequest } from '@/api/reportApi'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { ReportViewer } from '@/components/reports/ReportViewer'
import { JasperReportExporter } from '@/components/reports/JasperReportExporter'

export const ReportDetailPage = () => {
  const { reportId } = useParams<{ reportId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((state: any) => state.user)
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'EXCEL' | 'CSV'>('EXCEL')

  if (!reportId) {
    return <div className="p-4 text-center text-destructive">Invalid report ID</div>
  }

  const numericReportId = Number(reportId)
  
  if (isNaN(numericReportId)) {
    return <div className="p-4 text-center text-destructive">Invalid report ID: {reportId}</div>
  }

  // Fetch report definition
  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ['report', numericReportId],
    queryFn: async () => {
      try {
        const res = await reportApi.getReport(numericReportId)
        return res.data?.data
      } catch (err) {
        toast.error('Failed to load report')
        return null
      }
    }
  })

  // Fetch report results
  const { data: results, isLoading: resultsLoading, refetch: executeReport } = useQuery({
    queryKey: ['report-results', numericReportId, filters],
    queryFn: async () => {
      try {
        // Build filters array from the filters object
        const filterArray = Object.entries(filters)
          .filter(([, value]) => value !== undefined && value !== '')
          .map(([key, value]) => ({
            field: key,
            value: value,
            operator: 'eq'
          }))
        
        const executionRequest: ReportExecutionRequest = { 
          filters: filterArray as unknown as ReportFilter[],
          page: 0,
          pageSize: 100
        }
        const res = await reportApi.execute(numericReportId, executionRequest)
        if (res.data?.data) {
          return res.data.data
        }
        return null
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to execute report'
        toast.error(errorMessage)
        console.error('Report execution error:', err)
        return null
      }
    },
    enabled: numericReportId > 0,
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000
  })

  const canEdit = user && reportData && !reportData.isSystem && user.userId === reportData.ownedBy

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const response = await reportApi.export(numericReportId, exportFormat, { ...filters } as any)
      const blob = response.data as Blob
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${reportData?.reportName || 'report'}.${exportFormat.toLowerCase()}`
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
      
      toast.success(`Report exported as ${exportFormat}`)
    } catch (err) {
      toast.error('Failed to export report')
    } finally {
      setIsExporting(false)
    }
  }

  if (reportLoading) {
    return <div className="p-4 text-center text-muted-foreground">Loading report...</div>
  }

  if (!reportData) {
    return <div className="p-4 text-center text-destructive">Report not found</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/reports')}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Reports
        </button>
        <div className="flex gap-2 items-center">
          {canEdit && (
            <button
              onClick={() => navigate(`/reports/${numericReportId}/edit`)}
              className="text-sm px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Edit Report
            </button>
          )}
          {/* Jasper Export Options */}
          <JasperReportExporter
            reportId={numericReportId}
            reportName={reportData?.reportName || 'Report'}
            filters={{ ...filters }}
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h1 className="text-2xl font-bold">{reportData.reportName}</h1>
        {reportData.description && (
          <p className="text-muted-foreground mt-1">{reportData.description}</p>
        )}
      </div>

      {/* Filter Section */}
      {reportData?.definition && (reportData.definition as any).filters && (reportData.definition as any).filters.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="space-y-3">
            {((reportData.definition as any).filters as any[]).map((filter: any, idx: number) => (
              <div key={idx} className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">{filter.label}</label>
                  {filter.inputType === 'DATE_RANGE' ? (
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={filters[`${filter.field}_from`] || ''}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          [`${filter.field}_from`]: e.target.value
                        }))}
                        className="flex-1 px-2 py-1 text-sm border border-border rounded bg-background"
                      />
                      <input
                        type="date"
                        value={filters[`${filter.field}_to`] || ''}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          [`${filter.field}_to`]: e.target.value
                        }))}
                        className="flex-1 px-2 py-1 text-sm border border-border rounded bg-background"
                      />
                    </div>
                  ) : filter.inputType === 'SELECT' ? (
                    <select
                      value={filters[filter.field] || ''}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        [filter.field]: e.target.value
                      }))}
                      className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                    >
                      <option value="">Select...</option>
                      {filter.options?.map((opt: any) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={filter.inputType === 'NUMBER_RANGE' ? 'number' : 'text'}
                      value={filters[filter.field] || ''}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        [filter.field]: e.target.value
                      }))}
                      placeholder={`Enter ${filter.label.toLowerCase()}`}
                      className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Section */}
      {resultsLoading ? (
        <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
          Loading results...
        </div>
      ) : results ? (
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Results ({results.totalCount || 0} records)</h2>
          
          {results.rows && results.rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {results.columns?.map((col: any) => (
                      <th key={col.field} className="text-left px-4 py-2 font-semibold">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.rows.map((row: any, rowIdx: number) => (
                    <tr key={rowIdx} className="border-b border-border/50 hover:bg-muted/30">
                      {results.columns?.map((col: any) => (
                        <td key={col.field} className="px-4 py-2">
                          {/* Format based on data type */}
                          {col.dataType === 'CURRENCY' ? (
                            `$${Number(row[col.field]).toFixed(2)}`
                          ) : col.dataType === 'DATE' ? (
                            new Date(row[col.field]).toLocaleDateString()
                          ) : col.dataType === 'BOOLEAN' ? (
                            row[col.field] ? '✓' : '✗'
                          ) : (
                            String(row[col.field] || '')
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No data available</p>
          )}
        </div>
      ) : null}
    </div>
  )
}

