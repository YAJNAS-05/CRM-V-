import React from 'react'

export interface ColumnDef<T> {
  key: string
  header: React.ReactNode
  cell: (row: T, index: number) => React.ReactNode
  headerClass?: string
  cellClass?: string
  sortable?: boolean
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  rows: T[]
  getRowKey: (row: T) => string
  /** If provided, renders a leading checkbox column */
  onSelectRow?: (row: T) => void
  isRowSelected?: (row: T) => boolean
  allSelected?: boolean
  someSelected?: boolean
  onSelectAll?: () => void
  /** Emitted when a sortable column header is clicked */
  onSort?: (key: string) => void
  sortKey?: string
  sortDir?: 'asc' | 'desc'
  loading?: boolean
  emptyMessage?: React.ReactNode
  /** Row click handler */
  onRowClick?: (row: T) => void
  rowClass?: (row: T) => string
}

function DataTable<T>({
  columns,
  rows,
  getRowKey,
  onSelectRow,
  isRowSelected,
  allSelected,
  someSelected,
  onSelectAll,
  onSort,
  sortKey,
  sortDir,
  loading,
  emptyMessage,
  onRowClick,
  rowClass,
}: DataTableProps<T>) {
  const showSelect = Boolean(onSelectRow)

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70">
            {showSelect && (
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={el => { if (el) el.indeterminate = someSelected ?? false }}
                  onChange={onSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 cursor-pointer"
                />
              </th>
            )}
            {columns.map(col => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-400 ${col.sortable ? 'cursor-pointer select-none hover:text-gray-600' : ''} ${col.headerClass ?? ''}`}
                onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortKey === col.key && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {sortDir === 'asc'
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />}
                    </svg>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + (showSelect ? 1 : 0)} className="text-center py-16 text-gray-400">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                </div>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (showSelect ? 1 : 0)} className="text-center py-16 text-gray-400 text-sm">
                {emptyMessage ?? 'No records found.'}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => {
              const selected = isRowSelected?.(row)
              return (
                <tr
                  key={getRowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-gray-50 last:border-0 transition ${onRowClick ? 'cursor-pointer hover:bg-gray-50/70' : ''} ${selected ? 'bg-indigo-50/40' : ''} ${rowClass?.(row) ?? ''}`}
                >
                  {showSelect && (
                    <td className="w-10 px-4 py-3" onClick={e => { e.stopPropagation(); onSelectRow?.(row) }}>
                      <input
                        type="checkbox"
                        checked={selected ?? false}
                        onChange={() => onSelectRow?.(row)}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map(col => (
                    <td key={col.key} className={`px-4 py-3 ${col.cellClass ?? ''}`}>
                      {col.cell(row, idx)}
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
