// src/components/reports/ReportToolbar.tsx
import { useState } from 'react'
import { ReportColumn } from '@/api/reportApi'

interface ReportToolbarProps {
  columns: ReportColumn[]
  onColumnsChange: (columns: ReportColumn[]) => void
  onExport: (format: 'CSV' | 'EXCEL') => Promise<void>
  isExporting: boolean
  onSchedule?: () => void
  reportName?: string
}

export const ReportToolbar = ({
  columns,
  onColumnsChange,
  onExport,
  isExporting,
  onSchedule,
  reportName = 'Report'
}: ReportToolbarProps) => {
  const [columnPickerOpen, setColumnPickerOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduleFreq, setScheduleFreq] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY')

  const handleToggleColumn = (columnId: string) => {
    onColumnsChange(
      columns.map(c =>
        c.columnId === columnId ? { ...c, visible: !c.visible } : c
      )
    )
  }

  const handleScheduleReport = () => {
    console.log(`Scheduling ${reportName} for ${scheduleFreq}`)
    setScheduleOpen(false)
    setScheduleFreq('DAILY')
  }

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 bg-muted/20 rounded-lg border border-border/50">
      {/* Left: Export Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onExport('CSV')}
          disabled={isExporting}
          title="Export to CSV"
          className="px-3 py-1 text-sm border rounded hover:bg-muted disabled:opacity-40
                     flex items-center gap-1"
        >
          {isExporting ? '⟳' : '↓'} CSV
        </button>
        <button
          onClick={() => onExport('EXCEL')}
          disabled={isExporting}
          title="Export to Excel"
          className="px-3 py-1 text-sm border rounded hover:bg-muted disabled:opacity-40
                     flex items-center gap-1"
        >
          {isExporting ? '⟳' : '↓'} EXCEL
        </button>
      </div>

      {/* Middle: Column Picker */}
      <div className="relative">
        <button
          onClick={() => setColumnPickerOpen(!columnPickerOpen)}
          className="px-3 py-1 text-sm border rounded hover:bg-muted flex items-center gap-1"
          title="Toggle column visibility"
        >
          ⊞ Columns ({columns.filter(c => c.visible).length}/{columns.length})
        </button>
        {columnPickerOpen && (
          <div className="absolute right-0 mt-1 w-48 bg-popover border border-border rounded-lg
                          shadow-lg p-2 z-50 space-y-1">
            {columns.map(col => (
              <label
                key={col.columnId}
                className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-muted/50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={col.visible}
                  onChange={() => handleToggleColumn(col.columnId)}
                  className="w-4 h-4"
                />
                <span className="flex-1 truncate">{col.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Right: Schedule Button */}
      {onSchedule && (
        <div className="relative">
          <button
            onClick={() => setScheduleOpen(!scheduleOpen)}
            className="px-3 py-1 text-sm border rounded hover:bg-muted flex items-center gap-1"
            title="Schedule report delivery"
          >
            📅 Schedule
          </button>
          {scheduleOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-popover border border-border rounded-lg
                            shadow-lg p-3 z-50 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Frequency</label>
                <select
                  value={scheduleFreq}
                  onChange={e => setScheduleFreq(e.target.value as any)}
                  className="w-full text-sm border rounded px-2 py-1 mt-1"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2 border-t border-border/30">
                <button
                  onClick={handleScheduleReport}
                  className="flex-1 px-3 py-1 text-sm bg-primary text-primary-foreground rounded
                             hover:bg-primary/90"
                >
                  Schedule
                </button>
                <button
                  onClick={() => setScheduleOpen(false)}
                  className="flex-1 px-3 py-1 text-sm border rounded hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
