import { FilterConfig, ColumnConfig } from '../EnterpriseReportBuilder'
import { Trash2, Plus } from 'lucide-react'

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'gt', label: 'Greater than' },
  { value: 'lt', label: 'Less than' },
  { value: 'between', label: 'Between' },
  { value: 'in', label: 'In list' },
]

export const FilterBuilder = ({ config, columns, onAddFilter, onUpdateFilter, onRemoveFilter }: any) => {
  const handleAddFilter = () => {
    if (columns.length === 0) return
    onAddFilter({
      id: Date.now().toString(),
      field: columns[0].name,
      operator: 'equals',
      value: '',
      label: `Filter ${config.filters.length + 1}`,
      type: 'text'
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Dynamic Filters</h2>
          <button
            onClick={handleAddFilter}
            disabled={columns.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            <Plus size={16} /> Add Filter
          </button>
        </div>

        {columns.length === 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-900">
              ⚠️ Add columns first before creating filters
            </p>
          </div>
        )}

        {config.filters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-2">No filters configured yet</p>
            <p className="text-xs text-slate-400">Filters are optional and help narrow down your report data</p>
          </div>
        ) : (
          <div className="space-y-4">
            {config.filters.map((filter: FilterConfig) => (
              <div key={filter.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-sm font-medium text-slate-700">{filter.label}</div>
                  <button
                    onClick={() => onRemoveFilter(filter.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Field Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Field</label>
                    <select
                      value={filter.field}
                      onChange={(e) => {
                        const selectedColumn = columns.find((c: ColumnConfig) => c.name === e.target.value)
                        onUpdateFilter(filter.id, {
                          field: e.target.value,
                          type: selectedColumn?.type === 'number' ? 'number' : 
                                 selectedColumn?.type === 'date' ? 'date' : 'text'
                        })
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {columns.map((col: ColumnConfig) => (
                        <option key={col.name} value={col.name}>
                          {col.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Operator Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Operator</label>
                    <select
                      value={filter.operator}
                      onChange={(e) => onUpdateFilter(filter.id, { operator: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {OPERATORS.map(op => (
                        <option key={op.value} value={op.value}>{op.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Value Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Value</label>
                    {filter.type === 'number' && (
                      <input
                        type="number"
                        value={filter.value}
                        onChange={(e) => onUpdateFilter(filter.id, { value: e.target.value })}
                        placeholder="Enter value"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                    {filter.type === 'date' && (
                      <input
                        type="date"
                        value={filter.value}
                        onChange={(e) => onUpdateFilter(filter.id, { value: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                    {filter.type === 'text' && (
                      <input
                        type="text"
                        value={filter.value}
                        onChange={(e) => onUpdateFilter(filter.id, { value: e.target.value })}
                        placeholder="Enter value"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                    {filter.type === 'select' && (
                      <input
                        type="text"
                        value={filter.value}
                        onChange={(e) => onUpdateFilter(filter.id, { value: e.target.value })}
                        placeholder="Comma-separated values"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                </div>

                {/* Label */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Display Label</label>
                  <input
                    type="text"
                    value={filter.label}
                    onChange={(e) => onUpdateFilter(filter.id, { label: e.target.value })}
                    placeholder="e.g., 'Revenue greater than $100k'"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">This label describes the filter to users</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>💡 Tip:</strong> Filters help users refine report data dynamically. Users can enable/disable filters at runtime.
          </p>
        </div>
      </div>
    </div>
  )
}
