import { useState } from 'react'
import { Search, Play, Save, Download, Trash2, Plus, ChevronRight, Database, Table, Columns, Filter, X } from 'lucide-react'
import { adminApi } from '../../api/adminApi'
import { toast } from 'sonner'

interface QueryCondition {
  id: string
  field: string
  operator: string
  value: string
  logic?: 'AND' | 'OR'
}

interface QueryJoin {
  id: string
  table: string
  type: 'INNER' | 'LEFT' | 'RIGHT'
  onLeft: string
  onRight: string
}

interface SavedQuery {
  id: string
  name: string
  description: string
  createdAt: string
}

const TABLE_OPTIONS = [
  { value: 'leads', label: 'Leads', columns: ['id', 'firstName', 'lastName', 'email', 'phone', 'company', 'status', 'source', 'createdAt'] },
  { value: 'opportunities', label: 'Opportunities', columns: ['id', 'name', 'value', 'stage', 'probability', 'closeDate', 'leadId', 'ownerId'] },
  { value: 'contacts', label: 'Contacts', columns: ['id', 'firstName', 'lastName', 'email', 'phone', 'accountId'] },
  { value: 'accounts', label: 'Accounts', columns: ['id', 'name', 'industry', 'type', 'website', 'revenue'] },
  { value: 'invoices', label: 'Invoices', columns: ['id', 'invoiceNumber', 'amount', 'status', 'dueDate', 'customerId'] },
  { value: 'field_jobs', label: 'Field Jobs', columns: ['id', 'jobNumber', 'status', 'type', 'scheduledDate', 'engineerId'] },
]

const OPERATORS = [
  { value: '=', label: 'Equals' },
  { value: '!=', label: 'Not Equals' },
  { value: '>', label: 'Greater Than' },
  { value: '<', label: 'Less Than' },
  { value: '>=', label: 'Greater or Equal' },
  { value: '<=', label: 'Less or Equal' },
  { value: 'LIKE', label: 'Contains' },
  { value: 'IN', label: 'In List' },
  { value: 'IS_NULL', label: 'Is Empty' },
  { value: 'IS_NOT_NULL', label: 'Is Not Empty' },
]

export default function QueryBuilderPage() {
  const [selectedTable, setSelectedTable] = useState('leads')
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['*'])
  const [conditions, setConditions] = useState<QueryCondition[]>([])
  const [joins, setJoins] = useState<QueryJoin[]>([])
  const [orderBy, setOrderBy] = useState('')
  const [orderDir, setOrderDir] = useState<'ASC' | 'DESC'>('ASC')
  const [limit, setLimit] = useState('100')
  const [queryResult, setQueryResult] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [savedQueries] = useState<SavedQuery[]>([
    { id: '1', name: 'High Value Opportunities', description: 'Opportunities > $50k', createdAt: '2024-01-15' },
    { id: '2', name: 'Overdue Invoices', description: 'Invoices past due date', createdAt: '2024-01-10' },
  ])

  const currentTable = TABLE_OPTIONS.find(t => t.value === selectedTable)

  const addCondition = () => {
    setConditions([...conditions, {
      id: Date.now().toString(),
      field: currentTable?.columns[0] || '',
      operator: '=',
      value: '',
      logic: conditions.length > 0 ? 'AND' : undefined,
    }])
  }

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id))
  }

  const updateCondition = (id: string, field: string, value: string) => {
    setConditions(conditions.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const toggleColumn = (col: string) => {
    if (col === '*') {
      setSelectedColumns(['*'])
    } else if (selectedColumns.includes(col)) {
      setSelectedColumns(selectedColumns.filter(c => c !== '*' && c !== col))
    } else {
      setSelectedColumns([...selectedColumns.filter(c => c !== '*'), col])
    }
  }

  const generateSql = () => {
    const cols = selectedColumns.includes('*') ? '*' : selectedColumns.join(', ')
    let sql = `SELECT ${cols}\nFROM ${selectedTable}`

    joins.forEach(join => {
      sql += `\n${join.type} JOIN ${join.table} ON ${join.onLeft} = ${join.onRight}`
    })

    if (conditions.length > 0) {
      sql += '\nWHERE '
      conditions.forEach((cond, idx) => {
        if (idx > 0) sql += ` ${cond.logic} `
        if (cond.operator === 'IS_NULL' || cond.operator === 'IS_NOT_NULL') {
          sql += `${cond.field} ${cond.operator}`
        } else if (cond.operator === 'IN') {
          sql += `${cond.field} IN (${cond.value})`
        } else if (cond.operator === 'LIKE') {
          sql += `${cond.field} LIKE '%${cond.value}%'`
        } else {
          sql += `${cond.field} ${cond.operator} '${cond.value}'`
        }
      })
    }

    if (orderBy) {
      sql += `\nORDER BY ${orderBy} ${orderDir}`
    }

    if (limit) {
      sql += `\nLIMIT ${limit}`
    }

    return sql
  }

  const runQuery = async () => {
    const sql = generateSql()
    setLoading(true)
    try {
      const response = await adminApi.executeQuery(sql)
      setQueryResult(response.data.data || [])
      toast.success('Query executed successfully')
    } catch (error: any) {
      console.error('Query execution failed:', error)
      toast.error(error.response?.data?.message || 'Failed to execute query')
      // Fallback to mock data for demo
      setQueryResult([
        { id: '1', name: 'Sample Result 1', status: 'Active' },
        { id: '2', name: 'Sample Result 2', status: 'Pending' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const saveQuery = async () => {
    const sql = generateSql()
    const name = prompt('Enter query name:')
    if (!name) return
    try {
      await adminApi.saveQuery(name, 'Custom query', sql)
      toast.success('Query saved successfully')
    } catch (error) {
      console.error('Save failed:', error)
      toast.error('Failed to save query')
    }
  }

  return (
    <div className="p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Query Builder</h1>
          <p className="text-sm text-gray-500">Build and execute custom queries</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={saveQuery}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Save className="w-4 h-4" />
            Save Query
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left Panel - Table & Columns */}
        <div className="w-64 bg-white rounded-xl border border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Tables
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {TABLE_OPTIONS.map(table => (
              <button
                key={table.value}
                onClick={() => setSelectedTable(table.value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 flex items-center gap-2 ${
                  selectedTable === table.value
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Table className="w-4 h-4" />
                {table.label}
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 flex items-center gap-2 mb-2">
              <Columns className="w-4 h-4" />
              Columns
            </h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedColumns.includes('*')}
                  onChange={() => toggleColumn('*')}
                  className="rounded"
                />
                <span className="font-medium">* (All)</span>
              </label>
              {currentTable?.columns.map(col => (
                <label key={col} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(col)}
                    onChange={() => toggleColumn(col)}
                    className="rounded"
                  />
                  {col}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Center Panel - Query Builder */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Table Selection */}
          <div className="p-4 border-b border-gray-200">
            <label className="text-sm font-medium text-gray-700 mb-2 block">From Table</label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {TABLE_OPTIONS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Conditions */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Conditions
              </h3>
              <button
                onClick={addCondition}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <Plus className="w-4 h-4" />
                Add Condition
              </button>
            </div>
            <div className="space-y-2">
              {conditions.map((condition, idx) => (
                <div key={condition.id} className="flex items-center gap-2">
                  {idx > 0 && (
                    <select
                      value={condition.logic}
                      onChange={(e) => updateCondition(condition.id, 'logic', e.target.value)}
                      className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </select>
                  )}
                  <select
                    value={condition.field}
                    onChange={(e) => updateCondition(condition.id, 'field', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {currentTable?.columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                  <select
                    value={condition.operator}
                    onChange={(e) => updateCondition(condition.id, 'operator', e.target.value)}
                    className="w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {OPERATORS.map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                  {!['IS_NULL', 'IS_NOT_NULL'].includes(condition.operator) && (
                    <input
                      type="text"
                      value={condition.value}
                      onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  )}
                  <button
                    onClick={() => removeCondition(condition.id)}
                    className="p-2 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {conditions.length === 0 && (
                <p className="text-sm text-gray-400 italic">No conditions added</p>
              )}
            </div>
          </div>

          {/* Order & Limit */}
          <div className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Order By</label>
                <select
                  value={orderBy}
                  onChange={(e) => setOrderBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">None</option>
                  {currentTable?.columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Direction</label>
                <select
                  value={orderDir}
                  onChange={(e) => setOrderDir(e.target.value as 'ASC' | 'DESC')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="ASC">Ascending</option>
                  <option value="DESC">Descending</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Limit</label>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* SQL Preview */}
          <div className="p-4 flex-1 overflow-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">SQL Preview</h3>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                {showPreview ? 'Hide' : 'Show'} SQL
              </button>
            </div>
            {showPreview && (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                {generateSql()}
              </pre>
            )}
          </div>

          {/* Run Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={runQuery}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Play className="w-5 h-5" />
              )}
              Run Query
            </button>
          </div>
        </div>

        {/* Right Panel - Results & Saved Queries */}
        <div className="w-72 flex flex-col gap-4">
          {/* Saved Queries */}
          <div className="bg-white rounded-xl border border-gray-200 flex-1 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Saved Queries</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {savedQueries.map(query => (
                <div
                  key={query.id}
                  className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer mb-2 border border-gray-100"
                >
                  <p className="font-medium text-gray-900 text-sm">{query.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{query.description}</p>
                  <p className="text-xs text-gray-400 mt-2">{query.createdAt}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          {queryResult && (
            <div className="bg-white rounded-xl border border-gray-200 max-h-64 overflow-hidden flex flex-col">
              <div className="p-3 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Results ({queryResult.length})</h3>
              </div>
              <div className="overflow-auto">
                <pre className="p-3 text-xs font-mono">
                  {JSON.stringify(queryResult, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
