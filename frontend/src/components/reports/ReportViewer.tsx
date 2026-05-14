// src/components/reports/ReportViewer.tsx
import { useState, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportApi, ReportResult, ReportExecutionRequest, ReportFilter, SortConfig } from '@/api/reportApi'
import { ReportTable } from './ReportTable'
import { ReportFilters } from './ReportFilters'
import { ReportToolbar } from './ReportToolbar'
import { toast } from 'sonner'
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts'

interface ReportViewerProps {
  reportId: number
  defaultFilters?: ReportFilter[]
  showCharts?: boolean
}

export const ReportViewer = ({
  reportId,
  defaultFilters,
  showCharts = true
}: ReportViewerProps) => {
  const [filters, setFilters] = useState<ReportFilter[]>(defaultFilters ?? [])
  const [sorts, setSorts] = useState<SortConfig[]>([])
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({})
  const [dateFrom, setDateFrom] = useState<string | null>(null)
  const [dateTo, setDateTo] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Fetch report definition
  const { data: reportDefData } = useQuery({
    queryKey: ['report-def', reportId],
    queryFn: async () => {
      const res = await reportApi.getReport(reportId)
      return res.data.data
    }
  })

  // Build execution request
  const executionRequest: ReportExecutionRequest = useMemo(() => ({
    filters,
    sorts,
    page,
    pageSize,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined
  }), [filters, sorts, page, pageSize, dateFrom, dateTo])

  // Execute report
  const { data: resultData, isLoading, isFetching, isError } = useQuery({
    queryKey: ['report-result', reportId, JSON.stringify(executionRequest)],
    queryFn: async () => {
      const res = await reportApi.execute(reportId, executionRequest)
      return res.data.data as ReportResult
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData as any,
    retry: 1
  })

  // Show error toast if query fails
  if (isError) {
    toast.error('Failed to execute report')
  }

  const handleExport = useCallback(async (format: 'CSV' | 'EXCEL') => {
    try {
      setIsExporting(true)
      const response = await reportApi.export(reportId, format, executionRequest)
      // When responseType is 'blob', axios stores the blob in response.data
      const blob = response.data
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const ext = format === 'EXCEL' ? 'xlsx' : format.toLowerCase()
      a.download = `${reportDefData?.reportName || 'report'}_${new Date().toISOString().split('T')[0]}.${ext}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Report exported as ${format}`)
    } catch (error) {
      toast.error(`Failed to export as ${format}`)
    } finally {
      setIsExporting(false)
    }
  }, [reportId, executionRequest, reportDefData?.reportName])

  const visibleColumns = resultData?.columns.filter(
    col => columnVisibility[col.columnId] !== false
  ) ?? []

  const chartConfig = useMemo(() => {
    if (!resultData) return null

    if (Array.isArray(resultData.chartData) && resultData.chartData.length > 0) {
      const sample = resultData.chartData[0] as Record<string, unknown>
      const keys = Object.keys(sample)
      const xKey = keys.find((k) => typeof sample[k] === 'string') || keys[0]
      const yKey = keys.find((k) => typeof sample[k] === 'number') || keys[1]
      if (xKey && yKey) {
        return { xKey, yKey, points: resultData.chartData }
      }
    }

    const rows = resultData.rows || []
    if (rows.length === 0) return null
    const sampleRow = rows[0]
    const rowKeys = Object.keys(sampleRow)
    const xKey = rowKeys.find((k) => typeof sampleRow[k] === 'string')
    const yKey = rowKeys.find((k) => typeof sampleRow[k] === 'number')
    if (!xKey || !yKey) return null

    return {
      xKey,
      yKey,
      points: rows.slice(0, 20),
    }
  }, [resultData])

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Toolbar */}
      <ReportToolbar
        reportName={reportDefData?.reportName ?? 'Report'}
        columns={resultData?.columns ?? []}
        onColumnsChange={(newColumns) => {
          // Update visibility based on the columns returned
          const newVisibility: Record<string, boolean> = {}
          newColumns.forEach(col => {
            newVisibility[col.columnId] = col.visible !== false
          })
          setColumnVisibility(newVisibility)
        }}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {/* Filters */}
      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />

      {/* Main content */}
      <ReportTable
        columns={visibleColumns}
        rows={resultData?.rows ?? []}
        sorts={sorts}
        onSortsChange={setSorts}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        totalCount={resultData?.totalCount ?? 0}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {showCharts && chartConfig && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Chart Preview</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartConfig.points}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chartConfig.xKey} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey={chartConfig.yKey} fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {showCharts && !chartConfig && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          No chartable data found for the current report result.
        </div>
      )}
    </div>
  )
}
