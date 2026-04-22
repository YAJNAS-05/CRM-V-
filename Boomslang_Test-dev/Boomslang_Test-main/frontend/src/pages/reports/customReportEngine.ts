export type DataRow = Record<string, any>

export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max'
export type FilterOperator =
  | 'contains'
  | 'equals'
  | 'not_equals'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'

export type DateRangeType =
  | 'all'
  | 'today'
  | 'last_7_days'
  | 'last_30_days'
  | 'this_month'
  | 'this_quarter'

export interface FilterConfig {
  field?: string
  operator?: FilterOperator | string
  value?: any
  dateRange?: DateRangeType | string
  dateField?: string
}

export interface GroupedSeriesOptions {
  groupBy?: string
  aggregation?: AggregationType | string
  aggregateField?: string
  maxItems?: number
}

export interface TableBuildOptions {
  columns?: string[]
  pageSize?: number
  sortField?: string
  sortDirection?: 'asc' | 'desc' | string
  groupBy?: string
  aggregation?: AggregationType | string
  aggregateField?: string
}

export const KNOWN_DATA_SOURCES = [
  { value: '/v1/crm/deals', label: 'CRM Deals' },
  { value: '/v1/crm/reports/pipeline', label: 'CRM Pipeline' },
  { value: '/v1/crm/reports/conversion', label: 'CRM Conversion' },
  { value: '/field-jobs', label: 'Field Jobs' },
]

const isEmptyValue = (value: any) =>
  value === undefined || value === null || (typeof value === 'string' && value.trim() === '')

const normalizeValue = (value: any) => {
  if (typeof value === 'string') return value.trim().toLowerCase()
  return value
}

export const toNumber = (value: any): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'boolean') return value ? 1 : 0
  if (typeof value === 'string') {
    const cleaned = value.replace(/[$,%\s,]/g, '')
    const parsed = Number(cleaned)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

export const normalizeRowsFromPayload = (payload: any): DataRow[] => {
  const queue = [payload]
  const visited = new Set<any>()

  while (queue.length > 0) {
    const current = queue.shift()
    if (visited.has(current)) continue
    visited.add(current)

    if (Array.isArray(current)) {
      return current.map((item) => (typeof item === 'object' && item !== null ? item : { value: item }))
    }

    if (current && typeof current === 'object') {
      const keys = ['data', 'content', 'rows', 'items', 'list', 'result', 'records']
      for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(current, key)) {
          queue.push(current[key])
        }
      }
    }
  }

  return []
}

export const inferDateField = (rows: DataRow[]): string | null => {
  if (rows.length === 0) return null
  const keys = Object.keys(rows[0])
  return keys.find((key) => /(date|time|at)/i.test(key)) || null
}

const getDateRangeStart = (range: string): Date | null => {
  const now = new Date()
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (range === 'today') return current
  if (range === 'last_7_days') {
    const start = new Date(current)
    start.setDate(start.getDate() - 7)
    return start
  }
  if (range === 'last_30_days') {
    const start = new Date(current)
    start.setDate(start.getDate() - 30)
    return start
  }
  if (range === 'this_month') {
    return new Date(current.getFullYear(), current.getMonth(), 1)
  }
  if (range === 'this_quarter') {
    const quarterStartMonth = Math.floor(current.getMonth() / 3) * 3
    return new Date(current.getFullYear(), quarterStartMonth, 1)
  }

  return null
}

export const applyFieldFilter = (
  rows: DataRow[],
  field?: string,
  operator: FilterOperator | string = 'contains',
  value?: any
): DataRow[] => {
  if (!field || isEmptyValue(value)) return rows

  const normalizedOperator = (operator || 'contains').toLowerCase()
  const normalizedTarget = normalizeValue(value)

  return rows.filter((row) => {
    const currentValue = row[field]
    const normalizedCurrent = normalizeValue(currentValue)

    if (normalizedOperator === 'equals') {
      return normalizedCurrent === normalizedTarget
    }

    if (normalizedOperator === 'not_equals') {
      return normalizedCurrent !== normalizedTarget
    }

    if (normalizedOperator === 'contains') {
      return String(normalizedCurrent ?? '').includes(String(normalizedTarget ?? ''))
    }

    const left = toNumber(currentValue)
    const right = toNumber(value)

    if (normalizedOperator === 'gt') return left > right
    if (normalizedOperator === 'gte') return left >= right
    if (normalizedOperator === 'lt') return left < right
    if (normalizedOperator === 'lte') return left <= right

    return true
  })
}

export const applyDateFilter = (
  rows: DataRow[],
  dateRange: DateRangeType | string = 'all',
  dateField?: string
): DataRow[] => {
  if (!dateRange || dateRange === 'all') return rows

  const effectiveField = dateField || inferDateField(rows)
  if (!effectiveField) return rows

  const start = getDateRangeStart(dateRange)
  if (!start) return rows

  return rows.filter((row) => {
    const value = row[effectiveField]
    if (!value) return false

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return false

    return parsed.getTime() >= start.getTime()
  })
}

export const applyCombinedFilters = (
  rows: DataRow[],
  widgetFilters?: FilterConfig,
  globalFilters?: FilterConfig
): DataRow[] => {
  const effectiveDateRange =
    (widgetFilters?.dateRange && widgetFilters.dateRange !== 'all'
      ? widgetFilters.dateRange
      : globalFilters?.dateRange) || 'all'

  const effectiveDateField = widgetFilters?.dateField || globalFilters?.dateField

  let nextRows = applyDateFilter(rows, effectiveDateRange, effectiveDateField)

  if (globalFilters?.field) {
    nextRows = applyFieldFilter(
      nextRows,
      globalFilters.field,
      globalFilters.operator || 'contains',
      globalFilters.value
    )
  }

  if (widgetFilters?.field) {
    nextRows = applyFieldFilter(
      nextRows,
      widgetFilters.field,
      widgetFilters.operator || 'contains',
      widgetFilters.value
    )
  }

  return nextRows
}

export const calculateAggregate = (
  rows: DataRow[],
  aggregation: AggregationType | string = 'count',
  field?: string
): number => {
  const normalizedAggregation = (aggregation || 'count').toLowerCase()

  if (normalizedAggregation === 'count') return rows.length

  const numericValues = rows
    .map((row) => (field ? row[field] : row.value))
    .map((value) => toNumber(value))

  if (numericValues.length === 0) return 0

  if (normalizedAggregation === 'sum') {
    return numericValues.reduce((acc, value) => acc + value, 0)
  }

  if (normalizedAggregation === 'avg') {
    const total = numericValues.reduce((acc, value) => acc + value, 0)
    return total / numericValues.length
  }

  if (normalizedAggregation === 'min') {
    return Math.min(...numericValues)
  }

  if (normalizedAggregation === 'max') {
    return Math.max(...numericValues)
  }

  return rows.length
}

export const buildGroupedSeries = (
  rows: DataRow[],
  options: GroupedSeriesOptions
): Array<{ label: string; value: number }> => {
  const groupBy = options.groupBy || 'category'
  const aggregation = options.aggregation || 'count'
  const aggregateField = options.aggregateField
  const maxItems = options.maxItems || 12

  const grouped = new Map<string, DataRow[]>()

  for (const row of rows) {
    const key = String(row[groupBy] ?? 'Unspecified')
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(row)
  }

  return Array.from(grouped.entries())
    .map(([label, groupedRows]) => ({
      label,
      value: calculateAggregate(groupedRows, aggregation, aggregateField),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, maxItems)
}

export const buildTableRows = (
  rows: DataRow[],
  options: TableBuildOptions
): { rows: DataRow[]; columns: string[]; totalRows: number } => {
  const pageSize = options.pageSize || 10
  const sortField = options.sortField
  const sortDirection = (options.sortDirection || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc'
  const explicitColumns = Array.isArray(options.columns) ? options.columns.filter(Boolean) : []

  if (options.groupBy) {
    const grouped = buildGroupedSeries(rows, {
      groupBy: options.groupBy,
      aggregation: options.aggregation || 'count',
      aggregateField: options.aggregateField,
      maxItems: pageSize,
    })

    const valueKey = `${options.aggregation || 'count'}_${options.aggregateField || 'value'}`

    return {
      rows: grouped.map((point) => ({
        [options.groupBy as string]: point.label,
        [valueKey]: point.value,
      })),
      columns: [options.groupBy, valueKey].filter(Boolean) as string[],
      totalRows: grouped.length,
    }
  }

  const sortedRows = [...rows]
  if (sortField) {
    sortedRows.sort((a, b) => {
      const left = a[sortField]
      const right = b[sortField]

      if (typeof left === 'number' && typeof right === 'number') {
        return sortDirection === 'asc' ? left - right : right - left
      }

      const leftText = String(left ?? '')
      const rightText = String(right ?? '')
      return sortDirection === 'asc'
        ? leftText.localeCompare(rightText)
        : rightText.localeCompare(leftText)
    })
  }

  const columns = explicitColumns.length > 0 ? explicitColumns : Object.keys(sortedRows[0] || {}).slice(0, 8)

  return {
    rows: sortedRows.slice(0, pageSize),
    columns,
    totalRows: sortedRows.length,
  }
}

export const formatCalculatedMetric = (value: number, format?: string) => {
  if (format === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value)
  }

  if (format === 'percent') {
    const percentValue = Math.abs(value) <= 1 ? value * 100 : value
    return `${percentValue.toFixed(2)}%`
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value)
}

export const getFallbackRows = (dataSource: string): DataRow[] => {
  const now = new Date()

  if (dataSource.includes('pipeline')) {
    return [
      { stage: 'New', count: 18, amount: 72000, createdAt: now.toISOString() },
      { stage: 'Qualified', count: 12, amount: 104000, createdAt: now.toISOString() },
      { stage: 'Proposal', count: 8, amount: 88000, createdAt: now.toISOString() },
      { stage: 'Won', count: 6, amount: 143000, createdAt: now.toISOString() },
    ]
  }

  if (dataSource.includes('conversion')) {
    return [
      { month: 'Jan', conversionRate: 24.5, leads: 120, createdAt: now.toISOString() },
      { month: 'Feb', conversionRate: 29.3, leads: 138, createdAt: now.toISOString() },
      { month: 'Mar', conversionRate: 27.8, leads: 132, createdAt: now.toISOString() },
      { month: 'Apr', conversionRate: 31.2, leads: 145, createdAt: now.toISOString() },
    ]
  }

  if (dataSource.includes('field-jobs')) {
    return [
      {
        jobNumber: 'JOB-101',
        jobStatus: 'SCHEDULED',
        priority: 'CRITICAL',
        primaryEngineerName: 'Asha',
        scheduledStartDate: now.toISOString(),
      },
      {
        jobNumber: 'JOB-102',
        jobStatus: 'IN_PROGRESS',
        priority: 'URGENT',
        primaryEngineerName: 'Ravi',
        scheduledStartDate: now.toISOString(),
      },
      {
        jobNumber: 'JOB-103',
        jobStatus: 'SCHEDULED',
        priority: 'ROUTINE',
        primaryEngineerName: 'Asha',
        scheduledStartDate: now.toISOString(),
      },
      {
        jobNumber: 'JOB-104',
        jobStatus: 'COMPLETED',
        priority: 'EMERGENCY',
        primaryEngineerName: 'Mina',
        scheduledStartDate: now.toISOString(),
      },
    ]
  }

  return [
    {
      name: 'Deal Alpha',
      stage: 'Won',
      amount: 42000,
      owner: 'Asha',
      status: 'OPEN',
      createdAt: now.toISOString(),
    },
    {
      name: 'Deal Beta',
      stage: 'Proposal',
      amount: 31000,
      owner: 'Ravi',
      status: 'OPEN',
      createdAt: now.toISOString(),
    },
    {
      name: 'Deal Gamma',
      stage: 'Qualified',
      amount: 27000,
      owner: 'Mina',
      status: 'CLOSED',
      createdAt: now.toISOString(),
    },
    {
      name: 'Deal Delta',
      stage: 'Won',
      amount: 68000,
      owner: 'Asha',
      status: 'OPEN',
      createdAt: now.toISOString(),
    },
  ]
}
