// src/components/reports/ReportViewer.tsx
import { useState, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportApi, ReportResult, ReportExecutionRequest, ReportFilter, SortConfig } from '@/api/reportApi'
import { ReportTable } from './ReportTable'
import { ReportFilters } from './ReportFilters'
import { ReportToolbar } from './ReportToolbar'
import { toast } from 'sonner'

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
  const [activeView, setActiveView] = useState<'table' | 'chart'>('table')
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
      {activeView === 'table' ? (
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
      ) : (
        <div className="flex items-center justify-center h-96 bg-muted/30 rounded-lg border">
          <p className="text-muted-foreground">Charts coming soon</p>
        </div>
      )}
    </div>
  )
}
