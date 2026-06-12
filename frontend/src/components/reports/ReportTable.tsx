// src/components/reports/ReportTable.tsx
import { ReportColumn, SortConfig } from '@/api/reportApi'

interface ReportTableProps {
  columns: ReportColumn[]
  rows: Record<string, any>[]
  sorts: SortConfig[]
  onSortsChange: (sorts: SortConfig[]) => void
  isLoading: boolean
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export const ReportTable = ({
  columns,
  rows,
  sorts,
  onSortsChange,
  isLoading,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange
}: ReportTableProps) => {
  const handleSort = (field: string) => {
    const existing = sorts.find(s => s.field === field)
    if (!existing) {
      onSortsChange([{ field, direction: 'ASC', priority: 0 }])
    } else if (existing.direction === 'ASC') {
      onSortsChange(sorts.map(s =>
        s.field === field ? { ...s, direction: 'DESC' } : s
      ))
    } else {
      onSortsChange(sorts.filter(s => s.field !== field))
    }
  }

  const formatValue = (value: unknown, column: ReportColumn): string => {
    if (value === null || value === undefined) return '—'

    switch (column.dataType) {
      case 'CURRENCY':
        return new Intl.NumberFormat('en-AU', {
          style: 'currency',
          currency: 'AUD',
          minimumFractionDigits: 2
        }).format(Number(value))
      case 'DATE':
        return new Date(value as string).toLocaleDateString('en-AU', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      case 'NUMBER':
        return new Intl.NumberFormat('en-AU').format(Number(value))
      case 'BOOLEAN':
        return value ? 'Yes' : 'No'
      default:
        return String(value)
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const displayColumns =
    columns.length > 0
      ? columns
      : rows.length > 0
        ? Object.keys(rows[0]).map((key, index) => ({
            columnId: key,
            field: key,
            label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
            dataType: typeof rows[0][key] === 'number' ? 'NUMBER' : 'STRING',
            visible: true,
            sortable: true,
            aggregatable: typeof rows[0][key] === 'number',
            displayOrder: index,
            width: 150,
            alignment: typeof rows[0][key] === 'number' ? 'RIGHT' : 'LEFT',
          }))
        : []

  return (
    <div className="flex flex-col gap-2">
      {displayColumns.length === 0 && !isLoading ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          No data returned for this report.
        </div>
      ) : (
      <div className="overflow-auto rounded-lg border border-border max-h-[28rem]">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 sticky top-0 z-10">
            <tr>
              {displayColumns.map(col => (
                <th
                  key={col.columnId}
                  style={{ width: col.width || 150, minWidth: 80 }}
                  className="px-3 py-2 text-left font-medium text-muted-foreground
                             border-b border-border cursor-pointer select-none
                             hover:bg-muted/80 whitespace-nowrap"
                  onClick={() => col.sortable && handleSort(col.field)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (() => {
                      const sort = sorts.find(s => s.field === col.field)
                      if (!sort) return <span className="opacity-30">↕</span>
                      return sort.direction === 'ASC'
                        ? <span className="text-primary">↑</span>
                        : <span className="text-primary">↓</span>
                    })()}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {displayColumns.map(col => (
                      <td key={col.columnId} className="px-3 py-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    {displayColumns.map(col => (
                      <td
                        key={col.columnId}
                        className={`px-3 py-2 text-sm
                          ${col.alignment === 'RIGHT' ? 'text-right' : ''}
                          ${col.alignment === 'CENTER' ? 'text-center' : ''}`}
                      >
                        {formatValue(row[col.field] ?? row[col.columnId], col)}
                      </td>
                    ))}
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between px-1 text-sm text-muted-foreground">
        <span>
          {totalCount.toLocaleString()} total records
          {' · '}
          Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalCount)}
        </span>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={e => {
              onPageSizeChange(Number(e.target.value))
              onPageChange(0)
            }}
            className="text-sm border rounded px-2 py-1"
          >
            {[10, 20, 50, 100].map(n => (
              <option key={n} value={n}>{n} per page</option>
            ))}
          </select>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            className="px-2 py-1 border rounded disabled:opacity-40"
          >
            ←
          </button>
          <span>{page + 1} / {totalPages}</span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            className="px-2 py-1 border rounded disabled:opacity-40"
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}
