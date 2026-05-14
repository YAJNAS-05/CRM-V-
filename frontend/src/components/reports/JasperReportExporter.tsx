import { useState } from 'react'
import { reportApi } from '@/api/reportApi'
import { ReportExecutionRequest } from '@/api/reportApi'
import { useNotification } from '@/hooks/useNotification'
import { FileDown, Loader2 } from 'lucide-react'

interface JasperReportExporterProps {
  reportId: number
  reportName: string
  filters?: ReportExecutionRequest
  onExportStart?: () => void
  onExportComplete?: () => void
}

export const JasperReportExporter = ({
  reportId,
  reportName,
  filters = {},
  onExportStart,
  onExportComplete
}: JasperReportExporterProps) => {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf')
  const { success, error } = useNotification()

  const handleExport = async () => {
    try {
      setIsExporting(true)
      onExportStart?.()

      // Prepare request
      const request: ReportExecutionRequest = {
        ...filters,
        page: null as any // Clear pagination for export
      }

      // Determine which export to use
      let blob: Blob
      const timestamp = new Date().toISOString().split('T')[0]
      const fileName = `${reportName}-${timestamp}`

      if (exportFormat === 'pdf') {
        const response = await reportApi.jasperExportPdf(reportId, request)
        blob = response.data as Blob
        downloadFile(blob, `${fileName}.pdf`, 'application/pdf')
        success('PDF Generated', `${reportName}.pdf downloaded successfully`)
      } else {
        const response = await reportApi.jasperExportExcel(reportId, request)
        blob = response.data as Blob
        downloadFile(blob, `${fileName}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        success('Excel Generated', `${reportName}.xlsx downloaded successfully`)
      }

      onExportComplete?.()
    } catch (err) {
      error('Export Failed', `Failed to generate ${exportFormat.toUpperCase()}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      console.error('Export error:', err)
    } finally {
      setIsExporting(false)
    }
  }

  const downloadFile = (blob: Blob, fileName: string, mimeType: string) => {
    const url = window.URL.createObjectURL(new Blob([blob], { type: mimeType }))
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={exportFormat}
        onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'excel')}
        disabled={isExporting}
        className="px-3 py-2 border rounded-lg bg-background text-sm"
      >
        <option value="pdf">PDF</option>
        <option value="excel">Excel</option>
      </select>
      
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <FileDown className="w-4 h-4" />
            Export
          </>
        )}
      </button>
    </div>
  )
}
