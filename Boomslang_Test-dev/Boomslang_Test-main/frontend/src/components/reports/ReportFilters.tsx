// src/components/reports/ReportFilters.tsx
import { useState } from 'react'
import { ReportFilter } from '@/api/reportApi'

interface ReportFiltersProps {
  filters: ReportFilter[]
  onFiltersChange: (filters: ReportFilter[]) => void
  dateFrom?: string | null
  dateTo?: string | null
  onDateFromChange?: (date: string | null) => void
  onDateToChange?: (date: string | null) => void
}

export const ReportFilters = ({
  filters = [],
  onFiltersChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange
}: ReportFiltersProps) => {
  const [expanded, setExpanded] = useState(false)

  const handleFilterChange = (filterId: string, value: any) => {
    const existing = filters.find(f => f.filterId === filterId)
    if (value === null || value === undefined || value === '') {
      onFiltersChange(filters.filter(f => f.filterId !== filterId))
    } else if (existing) {
      onFiltersChange(
        filters.map(f =>
          f.filterId === filterId ? { ...f, value } : f
        )
      )
    } else {
      // Create a new filter with the provided value
      onFiltersChange([...filters, { 
        filterId,
        field: filterId,
        label: filterId,
        operator: 'EQUALS',
        value,
        inputType: 'text'
      } as ReportFilter])
    }
  }

  const handleRemoveFilter = (filterId: string) => {
    onFiltersChange(filters.filter(f => f.filterId !== filterId))
  }

  const renderFilterInput = (filter: ReportFilter) => {
    switch (filter.operator) {
      case 'DATE_BETWEEN':
        const [start, end] = (filter.value || []).length === 2
          ? filter.value
          : ['', '']
        return (
          <div className="flex gap-2" key={filter.filterId}>
            <input
              type="date"
              value={start}
              onChange={e => handleFilterChange(filter.filterId, [e.target.value, end])}
              className="text-sm border rounded px-2 py-1"
              placeholder="From"
            />
            <input
              type="date"
              value={end}
              onChange={e => handleFilterChange(filter.filterId, [start, e.target.value])}
              className="text-sm border rounded px-2 py-1"
              placeholder="To"
            />
            {(start || end) && (
              <button
                onClick={() => handleRemoveFilter(filter.filterId)}
                className="text-xs text-destructive hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        )

      case 'IN':
      case 'NOT_IN':
        const values = Array.isArray(filter.value) ? filter.value : []
        return (
          <div className="flex gap-2 flex-wrap" key={filter.filterId}>
            {(filter.options || []).map(opt => (
              <label key={opt.value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={values.includes(opt.value)}
                  onChange={e => {
                    const newVals = e.target.checked
                      ? [...values, opt.value]
                      : values.filter(v => v !== opt.value)
                    handleFilterChange(filter.filterId, newVals)
                  }}
                  className="w-4 h-4"
                />
                {opt.label}
              </label>
            ))}
            {values.length > 0 && (
              <button
                onClick={() => handleRemoveFilter(filter.filterId)}
                className="text-xs text-destructive hover:underline"
              >
                Clear All
              </button>
            )}
          </div>
        )

      case 'BETWEEN':
        const [minVal, maxVal] = (filter.value || []).length === 2
          ? filter.value
          : ['', '']
        return (
          <div className="flex gap-2" key={filter.filterId}>
            <input
              type="number"
              value={minVal}
              onChange={e => handleFilterChange(filter.filterId, [e.target.value, maxVal])}
              className="text-sm border rounded px-2 py-1 w-24"
              placeholder="Min"
            />
            <input
              type="number"
              value={maxVal}
              onChange={e => handleFilterChange(filter.filterId, [minVal, e.target.value])}
              className="text-sm border rounded px-2 py-1 w-24"
              placeholder="Max"
            />
            {(minVal || maxVal) && (
              <button
                onClick={() => handleRemoveFilter(filter.filterId)}
                className="text-xs text-destructive hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        )

      case 'CONTAINS':
      case 'NOT_CONTAINS':
        return (
          <div className="flex gap-2" key={filter.filterId}>
            <input
              type="text"
              value={filter.value || ''}
              onChange={e => handleFilterChange(filter.filterId, e.target.value)}
              className="text-sm border rounded px-2 py-1 flex-1"
              placeholder={`${filter.operator === 'CONTAINS' ? 'Contains' : 'Does not contain'} "${filter.label}"`}
            />
            {filter.value && (
              <button
                onClick={() => handleRemoveFilter(filter.filterId)}
                className="text-xs text-destructive hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        )

      default:
        return (
          <div className="flex gap-2" key={filter.filterId}>
            <input
              type="text"
              value={filter.value || ''}
              onChange={e => handleFilterChange(filter.filterId, e.target.value)}
              className="text-sm border rounded px-2 py-1 flex-1"
              placeholder={`Filter by ${filter.label}`}
            />
            {filter.value && (
              <button
                onClick={() => handleRemoveFilter(filter.filterId)}
                className="text-xs text-destructive hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        )
    }
  }

  // If no filters and no date range, don't show anything
  if ((!filters || filters.length === 0) && !dateFrom && !dateTo) {
    return null
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm font-medium flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <span>{expanded ? '▼' : '▶'}</span>
        Filters {(filters?.length || 0) > 0 && `(${filters.length})`}
      </button>

      {expanded && (
        <div className="grid gap-3 p-3 bg-muted/40 rounded-lg border border-border/50">
          {/* Date range section */}
          {(dateFrom !== undefined || dateTo !== undefined) && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">From Date</label>
                <input
                  type="date"
                  value={dateFrom || ''}
                  onChange={e => onDateFromChange?.(e.target.value || null)}
                  className="w-full text-sm border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">To Date</label>
                <input
                  type="date"
                  value={dateTo || ''}
                  onChange={e => onDateToChange?.(e.target.value || null)}
                  className="w-full text-sm border rounded px-2 py-1"
                />
              </div>
            </div>
          )}

          {/* Custom filters */}
          {filters && filters.map(filter => (
            <div key={filter.filterId} className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {filter.label}
              </label>
              {renderFilterInput(filter)}
            </div>
          ))}

          {filters && filters.length > 0 && (
            <button
              onClick={() => onFiltersChange([])}
              className="text-xs text-destructive hover:underline mt-2 pt-2 border-t border-border/30"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
