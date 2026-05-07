// src/pages/reports/ReportDetailPage.tsx
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportApi, ReportFilter, ReportExecutionRequest } from '@/api/reportApi'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { ReportViewer } from '@/components/reports/ReportViewer'
import { JasperReportExporter } from '@/components/reports/JasperReportExporter'

const FREQ_CRON: Record<string, string> = {
  DAILY: '0 8 * * *',
  WEEKLY: '0 8 * * MON',
  MONTHLY: '0 8 1 * *',
}

export const ReportDetailPage = () => {
  const { reportId } = useParams<{ reportId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((state: any) => state.user)
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'EXCEL' | 'CSV'>('EXCEL')
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({
    scheduleName: '',
    frequency: 'WEEKLY',
    recipients: '',
    exportFormat: 'EXCEL',
  })
  const [isSavingSchedule, setIsSavingSchedule] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareForm, setShareForm] = useState({ email: '', permission: 'VIEW' as 'VIEW' | 'EDIT' | 'ADMIN' })
  const [sharedWith, setSharedWith] = useState<{ email: string; permission: string }[]>([])

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

  const handleSaveSchedule = async () => {
    if (!scheduleForm.scheduleName.trim()) { toast.error('Schedule name is required'); return }
    const recipientList = scheduleForm.recipients.split(',').map(r => r.trim()).filter(Boolean)
    if (recipientList.length === 0) { toast.error('At least one recipient email is required'); return }
    try {
      setIsSavingSchedule(true)
      await reportApi.createSchedule(numericReportId, {
        scheduleName: scheduleForm.scheduleName,
        frequency: scheduleForm.frequency,
        cronExpression: FREQ_CRON[scheduleForm.frequency],
        recipients: recipientList,
        exportFormat: scheduleForm.exportFormat,
      })
      toast.success('Report schedule saved')
      setShowScheduleModal(false)
      setScheduleForm({ scheduleName: '', frequency: 'WEEKLY', recipients: '', exportFormat: 'EXCEL' })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save schedule')
    } finally {
      setIsSavingSchedule(false)
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
          <button
            onClick={() => setShowScheduleModal(true)}
            className="text-sm px-3 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 border border-border"
          >
            Schedule Report
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className="text-sm px-3 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 border border-border"
          >
            Share
          </button>
          <button
            onClick={() => window.print()}
            className="text-sm px-3 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 border border-border print:hidden"
            title="Print or Save as PDF"
          >
            Export PDF
          </button>
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

      {/* Share Report Modal (RPT-03) */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Share Report</h2>
              <button onClick={() => setShowShareModal(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="space-y-3 mb-5">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={shareForm.email}
                  onChange={e => setShareForm(p => ({ ...p, email: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-border rounded bg-background text-sm"
                  placeholder="user@company.com"
                />
                <select
                  value={shareForm.permission}
                  onChange={e => setShareForm(p => ({ ...p, permission: e.target.value as 'VIEW' | 'EDIT' | 'ADMIN' }))}
                  className="px-2 py-2 border border-border rounded bg-background text-sm"
                >
                  <option value="VIEW">View</option>
                  <option value="EDIT">Edit</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <button
                  onClick={() => {
                    const email = shareForm.email.trim()
                    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error('Valid email required'); return }
                    if (sharedWith.some(s => s.email === email)) { toast.error('Already shared with this user'); return }
                    setSharedWith(prev => [...prev, { email, permission: shareForm.permission }])
                    setShareForm(p => ({ ...p, email: '' }))
                    toast.success(`Shared with ${email}`)
                  }}
                  className="px-3 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
                >
                  Add
                </button>
              </div>
            </div>
            {sharedWith.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Not shared with anyone yet.</p>
            ) : (
              <div className="space-y-2 mb-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Shared With</p>
                {sharedWith.map((s, i) => (
                  <div key={i} className="flex items-center justify-between border border-border rounded px-3 py-2 text-sm">
                    <span>{s.email}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        s.permission === 'ADMIN' ? 'bg-red-50 text-red-700' :
                        s.permission === 'EDIT' ? 'bg-amber-50 text-amber-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>{s.permission}</span>
                      <button onClick={() => setSharedWith(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-muted-foreground hover:text-destructive text-xs">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground mb-3">Anyone with the link:</p>
              <div className="flex gap-2">
                <select className="flex-1 px-2 py-2 border border-border rounded bg-background text-sm">
                  <option value="">Restricted (only added users)</option>
                  <option value="VIEW">Anyone in org — View</option>
                  <option value="EDIT">Anyone in org — Edit</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Report Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Schedule Report</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Schedule Name *</label>
                <input
                  type="text"
                  value={scheduleForm.scheduleName}
                  onChange={e => setScheduleForm(p => ({ ...p, scheduleName: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-border rounded bg-background text-sm"
                  placeholder="e.g. Weekly Sales Report"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Frequency</label>
                <select
                  value={scheduleForm.frequency}
                  onChange={e => setScheduleForm(p => ({ ...p, frequency: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-border rounded bg-background text-sm"
                >
                  <option value="DAILY">Daily (8:00 AM)</option>
                  <option value="WEEKLY">Weekly (Monday 8:00 AM)</option>
                  <option value="MONTHLY">Monthly (1st 8:00 AM)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Export Format</label>
                <select
                  value={scheduleForm.exportFormat}
                  onChange={e => setScheduleForm(p => ({ ...p, exportFormat: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-border rounded bg-background text-sm"
                >
                  <option value="EXCEL">Excel</option>
                  <option value="CSV">CSV</option>
                  <option value="PDF">PDF</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Recipients (comma-separated emails) *</label>
                <textarea
                  value={scheduleForm.recipients}
                  onChange={e => setScheduleForm(p => ({ ...p, recipients: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-border rounded bg-background text-sm"
                  rows={2}
                  placeholder="user@company.com, manager@company.com"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-sm border border-border rounded hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSchedule}
                disabled={isSavingSchedule}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
              >
                {isSavingSchedule ? 'Saving...' : 'Save Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

