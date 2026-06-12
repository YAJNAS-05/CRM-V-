import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import {
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  ArrowUpDown,
  BarChart3,
  Copy,
  Download,
  Eye,
  EyeOff,
  Filter,
  GripVertical,
  Hash,
  LayoutTemplate,
  Paintbrush,
  Plus,
  Save,
  Settings,
  SlidersHorizontal,
  Table2,
  Trash2,
  Type,
} from 'lucide-react'
import { toast } from 'sonner'
import axiosInstance from '../../api/axiosInstance'
import { reportApi } from '../../api/reportApi'
import {
  AggregationType,
  DataRow,
  FilterConfig,
  KNOWN_DATA_SOURCES,
  applyCombinedFilters,
  buildGroupedSeries,
  buildTableRows,
  calculateAggregate,
  formatCalculatedMetric,
  getFallbackRows,
  normalizeRowsFromPayload,
} from './customReportEngine'

type WidgetType = 'chart' | 'metric' | 'table' | 'text'
type PanelMode = 'add' | 'configure' | 'filters' | 'styling' | 'report'

interface Widget {
  id: string
  type: WidgetType
  title: string
  config: any
  position: number
}

interface WidgetComputation {
  rows: DataRow[]
  chartPoints?: Array<{ label: string; value: number }>
  metricValue?: number
  tableRows?: DataRow[]
  tableColumns?: string[]
  warning?: string
  source: string
  rowCount: number
}

interface CustomReport {
  id?: string
  name: string
  description: string
  widgets: Widget[]
  refreshRate?: number
  filters?: any
}

interface WidgetLibraryItem {
  type: WidgetType
  title: string
  description: string
  icon: React.ReactNode
}

const DEFAULT_REPORT_CONFIG = {
  canvasSize: '16:9',
  displayMode: 'landscape',
  showGrid: 'snap',
}

const DEFAULT_GLOBAL_FILTERS: FilterConfig = {
  dateRange: 'all',
  field: '',
  operator: 'contains',
  value: '',
  dateField: '',
}

const INITIAL_REPORT_STATE: CustomReport = {
  name: 'Untitled Report',
  description: '',
  widgets: [],
  refreshRate: 15,
  filters: {
    reportConfig: DEFAULT_REPORT_CONFIG,
    globalFilters: DEFAULT_GLOBAL_FILTERS,
  },
}

const WIDGET_LIBRARY: WidgetLibraryItem[] = [
  {
    type: 'chart',
    title: 'Chart',
    description: 'Visualize trends and comparisons',
    icon: <BarChart3 className="w-5 h-5 text-slate-700" />,
  },
  {
    type: 'metric',
    title: 'Metric',
    description: 'Highlight key KPI values',
    icon: <Hash className="w-5 h-5 text-slate-700" />,
  },
  {
    type: 'table',
    title: 'Table',
    description: 'Display granular records',
    icon: <Table2 className="w-5 h-5 text-slate-700" />,
  },
  {
    type: 'text',
    title: 'Text',
    description: 'Add context and commentary',
    icon: <Type className="w-5 h-5 text-slate-700" />,
  },
]

const createDefaultWidgetConfig = (type: WidgetType) => {
  const baseStyle = {
    opacity: 100,
    background: '#ffffff',
    borderColor: '#dbeafe',
    borderRadius: 12,
    borderWidth: 1,
    showDescription: false,
    description: '',
  }

  const baseFilters = {
    dateRange: 'last_30_days',
    dateField: 'createdAt',
    field: '',
    operator: 'contains',
    value: '',
  }

  if (type === 'chart') {
    return {
      chartType: 'bar',
      dataSource: '/v1/crm/reports/pipeline',
      xField: 'stage',
      yField: 'count',
      groupBy: 'stage',
      aggregate: 'sum',
      aggregateField: 'count',
      maxItems: 8,
      filters: baseFilters,
      layout: {
        colSpan: 6,
        rowSpan: 1,
      },
      style: baseStyle,
    }
  }

  if (type === 'metric') {
    return {
      label: 'Total Revenue',
      dataSource: '/v1/crm/deals',
      valueField: 'amount',
      aggregation: 'sum',
      format: 'currency',
      groupBy: '',
      filters: {
        ...baseFilters,
        dateRange: 'this_month',
      },
      layout: {
        colSpan: 6,
        rowSpan: 1,
      },
      style: baseStyle,
    }
  }

  if (type === 'table') {
    return {
      dataSource: '/v1/crm/deals',
      columns: 'name,stage,amount',
      pageSize: 10,
      sortField: 'createdAt',
      sortDirection: 'desc',
      groupBy: '',
      aggregation: 'count',
      aggregateField: 'amount',
      filters: baseFilters,
      layout: {
        colSpan: 12,
        rowSpan: 2,
      },
      style: baseStyle,
    }
  }

  return {
    content: 'Type your text content here',
    layout: {
      colSpan: 12,
      rowSpan: 1,
    },
    style: baseStyle,
  }
}

const mergeWidgetConfig = (type: WidgetType, config?: any) => {
  const defaults = createDefaultWidgetConfig(type)
  return {
    ...defaults,
    ...(config || {}),
    filters: {
      ...(defaults as any).filters,
      ...(config?.filters || {}),
    },
    style: {
      ...(defaults as any).style,
      ...(config?.style || {}),
    },
  }
}

const createWidget = (type: WidgetType, title?: string, config?: any): Widget => ({
  id: `widget-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type,
  title:
    title ||
    {
      chart: 'Chart Widget',
      metric: 'Metric Widget',
      table: 'Table Widget',
      text: 'Text Widget',
    }[type],
  config: mergeWidgetConfig(type, config),
  position: 0,
})

const reindexWidgets = (widgets: Widget[]) =>
  widgets.map((widget, index) => ({
    ...widget,
    position: index,
  }))

const parseColumns = (columns: string | undefined) => {
  if (!columns) return ['name', 'stage', 'amount']
  return columns
    .split(',')
    .map((column) => column.trim())
    .filter(Boolean)
}

const panelLabel: Record<Exclude<PanelMode, 'add'>, string> = {
  configure: 'Configuration',
  filters: 'Filters',
  styling: 'Styling',
  report: 'Report settings',
}

const CUSTOM_REPORTS_AVAILABLE =
  import.meta.env.VITE_ENABLE_CUSTOM_REPORTS_API === 'true' ||
  import.meta.env.VITE_ENABLE_CUSTOM_REPORTS_DRAFT_MODE === 'true' ||
  import.meta.env.DEV

export const CustomReportBuilderPage: React.FC = () => {
  const { reportId } = useParams<{ reportId?: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const [report, setReport] = useState<CustomReport>(INITIAL_REPORT_STATE)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null)
  const [panelMode, setPanelMode] = useState<PanelMode>('add')
  const [previewMode, setPreviewMode] = useState(false)
  const [widgetSearch, setWidgetSearch] = useState('')
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(INITIAL_REPORT_STATE))
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [lastAppliedAt, setLastAppliedAt] = useState<string | null>(null)
  const [sourceRowsBySource, setSourceRowsBySource] = useState<Record<string, DataRow[]>>({})
  const [sourceLoadingBySource, setSourceLoadingBySource] = useState<Record<string, boolean>>({})
  const [sourceErrorBySource, setSourceErrorBySource] = useState<Record<string, string>>({})

  if (!CUSTOM_REPORTS_AVAILABLE) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <h1 className="text-2xl font-semibold">Custom Reports Unavailable</h1>
          <p className="mt-2 text-sm text-amber-800">
            This builder is disabled because neither the custom reports API nor draft mode is enabled.
          </p>
          <button
            onClick={() => navigate('/reports')}
            className="mt-4 rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
          >
            Back to Reports
          </button>
        </div>
      </div>
    )
  }

  const selectedWidget = useMemo(
    () => report.widgets.find((widget) => widget.id === selectedWidgetId) || null,
    [report.widgets, selectedWidgetId]
  )

  const reportConfig = {
    ...DEFAULT_REPORT_CONFIG,
    ...(report.filters?.reportConfig || {}),
  }

  const globalFilters: FilterConfig = {
    ...DEFAULT_GLOBAL_FILTERS,
    ...(report.filters?.globalFilters || {}),
  }

  const isDirty = useMemo(() => JSON.stringify(report) !== savedSnapshot, [report, savedSnapshot])

  const filteredWidgetLibrary = useMemo(() => {
    const query = widgetSearch.trim().toLowerCase()
    if (!query) return WIDGET_LIBRARY
    return WIDGET_LIBRARY.filter((item) => {
      return (
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
      )
    })
  }, [widgetSearch])

  const selectedWidgetFields = useMemo(() => {
    if (!selectedWidget) return []
    const source = selectedWidget.config?.dataSource
    if (!source) return []

    const rows = sourceRowsBySource[source] || []
    if (rows.length === 0) return []

    return Object.keys(rows[0])
  }, [selectedWidget, sourceRowsBySource])

  const computedWidgets = useMemo<Record<string, WidgetComputation>>(() => {
    const result: Record<string, WidgetComputation> = {}

    for (const widget of report.widgets) {
      const source = widget.config?.dataSource || ''
      const rows = source ? sourceRowsBySource[source] || [] : []
      const filteredRows = applyCombinedFilters(rows, widget.config?.filters, globalFilters)

      if (widget.type === 'chart') {
        const chartPoints = buildGroupedSeries(filteredRows, {
          groupBy: widget.config?.groupBy || widget.config?.xField,
          aggregation: widget.config?.aggregate || 'sum',
          aggregateField: widget.config?.aggregateField || widget.config?.yField,
          maxItems: widget.config?.maxItems || 8,
        })

        result[widget.id] = {
          rows: filteredRows,
          chartPoints,
          source,
          rowCount: filteredRows.length,
          warning: chartPoints.length === 0 ? 'No matching chart data' : undefined,
        }
        continue
      }

      if (widget.type === 'metric') {
        const metricValue = calculateAggregate(
          filteredRows,
          widget.config?.aggregation || 'sum',
          widget.config?.valueField
        )

        result[widget.id] = {
          rows: filteredRows,
          metricValue,
          source,
          rowCount: filteredRows.length,
          warning: filteredRows.length === 0 ? 'No matching metric data' : undefined,
        }
        continue
      }

      if (widget.type === 'table') {
        const table = buildTableRows(filteredRows, {
          columns: parseColumns(widget.config?.columns),
          pageSize: widget.config?.pageSize,
          sortField: widget.config?.sortField,
          sortDirection: widget.config?.sortDirection,
          groupBy: widget.config?.groupBy,
          aggregation: widget.config?.aggregation,
          aggregateField: widget.config?.aggregateField,
        })

        result[widget.id] = {
          rows: filteredRows,
          tableRows: table.rows,
          tableColumns: table.columns,
          source,
          rowCount: table.totalRows,
          warning: table.rows.length === 0 ? 'No matching table rows' : undefined,
        }
        continue
      }

      result[widget.id] = {
        rows: [],
        source,
        rowCount: 0,
      }
    }

    return result
  }, [globalFilters, report.widgets, sourceRowsBySource])

  useEffect(() => {
    if (reportId && reportId !== 'new') {
      loadReport()
    }
  }, [reportId])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('mode') === 'preview') {
      setPreviewMode(true)
    }
  }, [location.search])

  useEffect(() => {
    if (report.widgets.length === 0) {
      setSelectedWidgetId(null)
      return
    }

    if (!selectedWidgetId || !report.widgets.some((widget) => widget.id === selectedWidgetId)) {
      setSelectedWidgetId(report.widgets[0].id)
    }
  }, [report.widgets, selectedWidgetId])

  useEffect(() => {
    const sources = Array.from(
      new Set(
        report.widgets
          .map((widget) => widget.config?.dataSource)
          .filter((source): source is string => Boolean(source))
      )
    )

    const missingSources = sources.filter(
      (source) => !sourceRowsBySource[source] && !sourceLoadingBySource[source]
    )

    if (missingSources.length === 0) return

    let isCancelled = false

    const loadMissingSources = async () => {
      for (const source of missingSources) {
        if (isCancelled) return

        setSourceLoadingBySource((prev) => ({ ...prev, [source]: true }))

        try {
          const response = await axiosInstance.get(source)
          const parsedRows = normalizeRowsFromPayload(response)
          const rows = parsedRows.length > 0 ? parsedRows : getFallbackRows(source)
          if (!isCancelled) {
            setSourceRowsBySource((prev) => ({ ...prev, [source]: rows }))
            setSourceErrorBySource((prev) => ({ ...prev, [source]: '' }))
          }
        } catch {
          const fallbackRows = getFallbackRows(source)
          if (!isCancelled) {
            setSourceRowsBySource((prev) => ({ ...prev, [source]: fallbackRows }))
            setSourceErrorBySource((prev) => ({
              ...prev,
              [source]: 'Live source unavailable. Showing fallback dataset.',
            }))
          }
        } finally {
          if (!isCancelled) {
            setSourceLoadingBySource((prev) => ({ ...prev, [source]: false }))
          }
        }
      }
    }

    loadMissingSources()

    return () => {
      isCancelled = true
    }
  }, [report.widgets, sourceLoadingBySource, sourceRowsBySource])

  const loadReport = async () => {
    try {
      setLoading(true)
      const data = await reportApi.getCustomReport(reportId!)
      const normalized: CustomReport = {
        ...INITIAL_REPORT_STATE,
        ...data,
        widgets: reindexWidgets(
          (data?.widgets || []).map((widget: Widget) => ({
            ...widget,
            config: mergeWidgetConfig(widget.type, widget.config),
          }))
        ),
        filters: {
          ...(data?.filters || {}),
          reportConfig: {
            ...DEFAULT_REPORT_CONFIG,
            ...(data?.filters?.reportConfig || {}),
          },
          globalFilters: {
            ...DEFAULT_GLOBAL_FILTERS,
            ...(data?.filters?.globalFilters || {}),
          },
        },
      }
      setReport(normalized)
      setSavedSnapshot(JSON.stringify(normalized))
      if (normalized.widgets.length > 0) {
        setSelectedWidgetId(normalized.widgets[0].id)
        setPanelMode('configure')
      }
      setError(null)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load report')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const validateWidget = (widget: Widget) => {
    if (!widget.title.trim()) {
      return `Widget #${widget.position + 1}: title is required`
    }

    if (widget.type === 'chart') {
      if (!widget.config?.dataSource) return `Widget "${widget.title}": data source is required`
      if (!widget.config?.groupBy && !widget.config?.xField) return `Widget "${widget.title}": group by field is required`
      if (!widget.config?.aggregate && !widget.config?.yField) return `Widget "${widget.title}": aggregation is required`
    }

    if (widget.type === 'metric') {
      if (!widget.config?.dataSource) return `Widget "${widget.title}": data source is required`
      if (!widget.config?.valueField) return `Widget "${widget.title}": value field is required`
      if (!widget.config?.aggregation) return `Widget "${widget.title}": aggregation is required`
    }

    if (widget.type === 'table') {
      if (!widget.config?.dataSource) return `Widget "${widget.title}": data source is required`
      if (!widget.config?.columns) return `Widget "${widget.title}": at least one column is required`
    }

    if (widget.type === 'text') {
      if (!widget.config?.content?.trim()) return `Widget "${widget.title}": content is required`
    }

    return null
  }

  const validateReport = (state: CustomReport) => {
    if (!state.name.trim()) return 'Report name is required'
    if (state.widgets.length === 0) return 'Add at least one widget before saving'

    for (const widget of state.widgets) {
      const widgetError = validateWidget(widget)
      if (widgetError) return widgetError
    }

    return null
  }

  const handleSaveReport = async () => {
    const validationError = validateReport(report)
    if (validationError) {
      setError(validationError)
      toast.error(validationError)
      return
    }

    try {
      setSaving(true)
      if (report.id) {
        await reportApi.updateCustomReport(report.id, report)
        setSavedSnapshot(JSON.stringify(report))
      } else {
        const saved = await reportApi.createCustomReport(report)
        const updatedReport = {
          ...report,
          id: saved.id,
        }
        setReport(updatedReport)
        setSavedSnapshot(JSON.stringify(updatedReport))
        navigate(`/reports/custom/${saved.id}`)
      }
      setLastSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      setError(null)
      toast.success('Report saved successfully')
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to save report'
      setError(message)
      toast.error(message)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Discard and leave builder?')
      if (!confirmed) return
    }
    navigate('/reports')
  }

  const appendWidgets = (widgetsToAdd: Widget[]) => {
    if (widgetsToAdd.length === 0) return

    setReport((prev) => ({
      ...prev,
      widgets: reindexWidgets([...prev.widgets, ...widgetsToAdd]),
    }))
    setSelectedWidgetId(widgetsToAdd[0].id)
    setPreviewMode(false)
    setPanelMode('configure')
    setError(null)
  }

  const handleAddWidget = (type: WidgetType) => {
    appendWidgets([createWidget(type)])
  }

  const handleApplyTemplate = (templateId: 'sales' | 'executive' | 'ops') => {
    if (templateId === 'sales') {
      appendWidgets([
        createWidget('chart', 'Sales Pipeline', {
          chartType: 'bar',
          dataSource: '/v1/crm/reports/pipeline',
          xField: 'stage',
          yField: 'count',
        }),
        createWidget('metric', 'Won Revenue', {
          label: 'Won Revenue',
          valueField: 'wonValue',
          aggregation: 'sum',
          format: 'currency',
        }),
        createWidget('table', 'Deals Table', {
          dataSource: '/v1/crm/deals',
          columns: 'name,stage,amount',
          pageSize: 10,
        }),
      ])
      toast.success('Sales template added')
      return
    }

    if (templateId === 'executive') {
      appendWidgets([
        createWidget('metric', 'Total Leads', {
          label: 'Total Leads',
          valueField: 'totalLeads',
          aggregation: 'sum',
          format: 'number',
        }),
        createWidget('metric', 'Win Rate', {
          label: 'Win Rate',
          valueField: 'winRate',
          aggregation: 'avg',
          format: 'percent',
        }),
        createWidget('chart', 'Conversion Trend', {
          chartType: 'line',
          dataSource: '/v1/crm/reports/conversion',
          xField: 'month',
          yField: 'conversionRate',
        }),
      ])
      toast.success('Executive template added')
      return
    }

    appendWidgets([
      createWidget('table', 'Field Job Backlog', {
        dataSource: '/field-jobs',
        columns: 'jobNumber,priority,jobStatus',
      }),
      createWidget('chart', 'Field Job Status Mix', {
        chartType: 'pie',
        dataSource: '/field-jobs',
        xField: 'jobStatus',
        aggregate: 'count',
      }),
      createWidget('text', 'Operations Notes', {
        content: 'Add field work notes and on-call action items for review.',
      }),
    ])
    toast.success('Operations template added')
  }

  const handleRemoveWidget = (widgetId: string) => {
    setReport((prev) => ({
      ...prev,
      widgets: reindexWidgets(prev.widgets.filter((widget) => widget.id !== widgetId)),
    }))

    if (selectedWidgetId === widgetId) {
      setSelectedWidgetId(null)
    }
  }

  const handleDuplicateWidget = (widgetId: string) => {
    setReport((prev) => {
      const index = prev.widgets.findIndex((widget) => widget.id === widgetId)
      if (index < 0) return prev

      const source = prev.widgets[index]
      const duplicated = createWidget(source.type, `${source.title} Copy`, source.config)
      const nextWidgets = [...prev.widgets]
      nextWidgets.splice(index + 1, 0, duplicated)

      return {
        ...prev,
        widgets: reindexWidgets(nextWidgets),
      }
    })

    setSelectedWidgetId((prevSelected) => prevSelected || widgetId)
    toast.success('Widget duplicated')
  }

  const handleMoveWidget = (widgetId: string, direction: 'up' | 'down') => {
    setReport((prev) => {
      const index = prev.widgets.findIndex((widget) => widget.id === widgetId)
      if (index < 0) return prev

      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= prev.widgets.length) return prev

      const nextWidgets = [...prev.widgets]
      const [moved] = nextWidgets.splice(index, 1)
      nextWidgets.splice(target, 0, moved)

      return {
        ...prev,
        widgets: reindexWidgets(nextWidgets),
      }
    })
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    if (result.destination.index === result.source.index) return

    setReport((prev) => {
      const nextWidgets = [...prev.widgets]
      const [moved] = nextWidgets.splice(result.source.index, 1)
      nextWidgets.splice(result.destination!.index, 0, moved)
      return {
        ...prev,
        widgets: reindexWidgets(nextWidgets),
      }
    })
  }

  const handleResizeWidget = (
    widgetId: string,
    direction: 'wider' | 'narrower' | 'taller' | 'shorter'
  ) => {
    const spanSteps = {
      col: { min: 3, max: 12 },
      row: { min: 1, max: 4 },
    }

    setReport((prev) => ({
      ...prev,
      widgets: prev.widgets.map((widget) => {
        if (widget.id !== widgetId) return widget

        const currentLayout = {
          colSpan: Number(widget.config?.layout?.colSpan || 6),
          rowSpan: Number(widget.config?.layout?.rowSpan || 1),
        }

        const nextLayout = { ...currentLayout }
        if (direction === 'wider') {
          nextLayout.colSpan = Math.min(spanSteps.col.max, currentLayout.colSpan + 3)
        }
        if (direction === 'narrower') {
          nextLayout.colSpan = Math.max(spanSteps.col.min, currentLayout.colSpan - 3)
        }
        if (direction === 'taller') {
          nextLayout.rowSpan = Math.min(spanSteps.row.max, currentLayout.rowSpan + 1)
        }
        if (direction === 'shorter') {
          nextLayout.rowSpan = Math.max(spanSteps.row.min, currentLayout.rowSpan - 1)
        }

        return {
          ...widget,
          config: {
            ...(widget.config || {}),
            layout: nextLayout,
          },
        }
      }),
    }))
  }

  const handleUpdateWidget = (widgetId: string, updates: Partial<Widget>) => {
    setReport((prev) => ({
      ...prev,
      widgets: prev.widgets.map((widget) =>
        widget.id === widgetId
          ? {
              ...widget,
              ...updates,
            }
          : widget
      ),
    }))
  }

  const handleUpdateSelectedWidget = (updates: Partial<Widget>) => {
    if (!selectedWidget) return
    handleUpdateWidget(selectedWidget.id, updates)
  }

  const handleUpdateSelectedWidgetConfig = (key: string, value: any) => {
    if (!selectedWidget) return
    handleUpdateWidget(selectedWidget.id, {
      config: {
        ...(selectedWidget.config || {}),
        [key]: value,
      },
    })
  }

  const handleUpdateSelectedWidgetFilter = (key: string, value: any) => {
    if (!selectedWidget) return
    const currentFilters = selectedWidget.config?.filters || {}
    handleUpdateSelectedWidgetConfig('filters', {
      ...currentFilters,
      [key]: value,
    })
  }

  const handleUpdateSelectedWidgetStyle = (key: string, value: any) => {
    if (!selectedWidget) return
    const currentStyle = selectedWidget.config?.style || {}
    handleUpdateSelectedWidgetConfig('style', {
      ...currentStyle,
      [key]: value,
    })
  }

  const handleUpdateReportConfig = (key: string, value: any) => {
    setReport((prev) => {
      const currentFilters = prev.filters || {}
      const currentReportConfig = currentFilters.reportConfig || DEFAULT_REPORT_CONFIG
      return {
        ...prev,
        filters: {
          ...currentFilters,
          reportConfig: {
            ...currentReportConfig,
            [key]: value,
          },
        },
      }
    })
  }

  const handleUpdateGlobalFilter = (key: keyof FilterConfig, value: any) => {
    setReport((prev) => {
      const currentFilters = prev.filters || {}
      return {
        ...prev,
        filters: {
          ...currentFilters,
          globalFilters: {
            ...DEFAULT_GLOBAL_FILTERS,
            ...(currentFilters.globalFilters || {}),
            [key]: value,
          },
        },
      }
    })
  }

  const handleApplyPanel = (mode: Exclude<PanelMode, 'add'>) => {
    if (mode !== 'report' && !selectedWidget) {
      setError('Select a widget before applying panel changes')
      toast.error('Select a widget before applying panel changes')
      return
    }

    if (selectedWidget) {
      const widgetError = validateWidget(selectedWidget)
      if (widgetError) {
        setError(widgetError)
        toast.error(widgetError)
        return
      }
    }

    setError(null)
    setLastAppliedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    toast.success(`${panelLabel[mode]} applied`)
  }

  const handleDownloadReport = async () => {
    try {
      if (!report.id) {
        toast.error('Save the report before downloading')
        return
      }

      const data = await reportApi.exportCustomReport(report.id)
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${report.name}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to download report'
      setError(message)
      toast.error(message)
      console.error(err)
    }
  }

  const handleDuplicateReport = async () => {
    try {
      setSaving(true)
      const cloned = { ...report }
      delete cloned.id
      const saved = await reportApi.createCustomReport(cloned)
      toast.success('Report duplicated')
      navigate(`/reports/custom/${saved.id}`)
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to duplicate report'
      setError(message)
      toast.error(message)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const renderWidgetPreview = (widget: Widget) => {
    const style = widget.config?.style || {}
    const computed = computedWidgets[widget.id]
    const source = computed?.source
    const sourceLoading = source ? sourceLoadingBySource[source] : false
    const sourceWarning = source ? sourceErrorBySource[source] : ''

    const wrapperStyle: React.CSSProperties = {
      opacity: Number(style.opacity ?? 100) / 100,
      background: style.background || '#ffffff',
      borderColor: style.borderColor || '#dbeafe',
      borderWidth: Number(style.borderWidth ?? 1),
      borderRadius: Number(style.borderRadius ?? 12),
    }

    const renderDescription = style.showDescription && style.description

    if (sourceLoading && widget.type !== 'text') {
      return (
        <div className="h-full min-h-[170px] border p-4 flex items-center justify-center" style={wrapperStyle}>
          <p className="text-sm text-slate-500">Loading data source...</p>
        </div>
      )
    }

    if (widget.type === 'chart') {
      const chartType = widget.config?.chartType || 'bar'
      const points = computed?.chartPoints || []
      const maxValue = Math.max(...points.map((point) => point.value), 1)

      const renderPie = () => {
        const total = points.reduce((acc, point) => acc + point.value, 0)
        if (total <= 0) {
          return <p className="text-xs text-slate-500 text-center mt-8">No chart values available</p>
        }

        const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#06b6d4']
        let cumulative = 0
        const segments = points.map((point, index) => {
          const start = (cumulative / total) * 360
          cumulative += point.value
          const end = (cumulative / total) * 360
          return `${colors[index % colors.length]} ${start}deg ${end}deg`
        })

        return (
          <div className="flex flex-col md:flex-row items-center gap-4 mt-2">
            <div
              className="w-24 h-24 rounded-full border border-slate-200"
              style={{
                background: `conic-gradient(${segments.join(',')})`,
              }}
            ></div>
            <div className="text-xs space-y-1 w-full">
              {points.slice(0, 4).map((point, index) => (
                <div key={`${widget.id}-pie-${point.label}`} className="flex justify-between gap-2">
                  <span className="text-slate-600 truncate">{point.label}</span>
                  <span className="font-medium text-slate-800">{point.value.toFixed(2)}</span>
                </div>
              ))}
              {points.length > 4 ? <p className="text-slate-500">+{points.length - 4} more groups</p> : null}
            </div>
          </div>
        )
      }

      const renderLine = () => {
        if (points.length === 0) {
          return <p className="text-xs text-slate-500 text-center mt-8">No chart values available</p>
        }

        const step = points.length > 1 ? 100 / (points.length - 1) : 0
        const d = points
          .map((point, index) => {
            const x = index * step
            const y = 100 - (point.value / maxValue) * 100
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
          })
          .join(' ')

        return (
          <div className="mt-2">
            <svg viewBox="0 0 100 100" className="w-full h-24">
              <path d={d} fill="none" stroke="#2563eb" strokeWidth="2" />
              {points.map((point, index) => {
                const x = index * step
                const y = 100 - (point.value / maxValue) * 100
                return <circle key={`${widget.id}-dot-${point.label}`} cx={x} cy={y} r="1.8" fill="#2563eb" />
              })}
            </svg>
            <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-500 mt-1">
              {points.slice(0, 3).map((point) => (
                <span key={`${widget.id}-line-label-${point.label}`} className="truncate">
                  {point.label}
                </span>
              ))}
            </div>
          </div>
        )
      }

      return (
        <div className="h-full min-h-[170px] border p-4 flex flex-col justify-start overflow-hidden" style={wrapperStyle}>
          {chartType === 'pie'
            ? renderPie()
            : chartType === 'line'
            ? renderLine()
            : (
              <div className="h-24 flex items-end justify-center gap-2 mt-2">
                {points.length === 0 ? (
                  <p className="text-xs text-slate-500">No chart values available</p>
                ) : (
                  points.map((point, index) => (
                    <div key={`${widget.id}-bar-${point.label}-${index}`} className="flex flex-col items-center gap-1">
                      <div
                        className="w-7 rounded-t bg-blue-500"
                        style={{
                          height: `${Math.max(8, (point.value / maxValue) * 95)}px`,
                        }}
                      ></div>
                      <span className="text-[10px] text-slate-500 max-w-[44px] truncate">{point.label}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          <p className="mt-3 text-xs text-center text-slate-600">
            {chartType.toUpperCase()} grouped by {widget.config?.groupBy || widget.config?.xField || 'x'}
          </p>
          <p className="text-[11px] text-slate-500 text-center mt-1">
            {computed?.rowCount || 0} rows processed from {source || 'n/a'}
          </p>
          {computed?.warning ? <p className="mt-1 text-[11px] text-amber-600">{computed.warning}</p> : null}
          {sourceWarning ? <p className="mt-1 text-[11px] text-amber-600">{sourceWarning}</p> : null}
          {renderDescription ? <p className="mt-2 text-xs text-slate-500 break-words whitespace-pre-wrap">{style.description}</p> : null}
        </div>
      )
    }

    if (widget.type === 'metric') {
      const metricValue = computed?.metricValue || 0
      return (
        <div className="h-full min-h-[170px] border p-4 flex flex-col justify-center overflow-auto" style={wrapperStyle}>
          <p className="text-sm text-slate-500">{widget.config?.label || 'Metric'}</p>
          <p className="text-4xl font-semibold text-slate-800 mt-2">
            {formatCalculatedMetric(metricValue, widget.config?.format)}
          </p>
          <p className="text-xs text-slate-500 mt-3 uppercase tracking-wide">
            {widget.config?.aggregation || 'sum'} of {widget.config?.valueField || 'value'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">{computed?.rowCount || 0} rows matched</p>
          {computed?.warning ? <p className="mt-1 text-[11px] text-amber-600">{computed.warning}</p> : null}
          {sourceWarning ? <p className="mt-1 text-[11px] text-amber-600">{sourceWarning}</p> : null}
          {renderDescription ? <p className="mt-2 text-xs text-slate-500 break-words whitespace-pre-wrap">{style.description}</p> : null}
        </div>
      )
    }

    if (widget.type === 'table') {
      const columns = computed?.tableColumns || parseColumns(widget.config?.columns)
      const rows = computed?.tableRows || []

      return (
        <div className="h-full min-h-[170px] border p-3 overflow-auto" style={wrapperStyle}>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                {columns.slice(0, 3).map((column) => (
                  <th key={`${widget.id}-head-${column}`} className="text-left pb-2 text-slate-500">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 3).map((row, rowIndex) => (
                <tr key={`${widget.id}-row-${rowIndex}`} className="border-t border-slate-100">
                  {columns.slice(0, 3).map((column) => (
                    <td key={`${widget.id}-cell-${rowIndex}-${column}`} className="py-2 text-slate-700">
                      {typeof row[column] === 'number'
                        ? Number(row[column]).toLocaleString()
                        : String(row[column] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[11px] text-slate-500">{computed?.rowCount || 0} rows available</p>
          {computed?.warning ? <p className="mt-1 text-[11px] text-amber-600">{computed.warning}</p> : null}
          {sourceWarning ? <p className="mt-1 text-[11px] text-amber-600">{sourceWarning}</p> : null}
          {renderDescription ? <p className="mt-2 text-xs text-slate-500 break-words whitespace-pre-wrap">{style.description}</p> : null}
        </div>
      )
    }

    return (
      <div className="h-full min-h-[170px] border p-4 overflow-auto flex flex-col" style={wrapperStyle}>
        <p className="text-sm text-slate-700 whitespace-pre-wrap break-words leading-6 text-left">
          {widget.config?.content || 'Add text content from Customize panel.'}
        </p>
        {renderDescription ? <p className="mt-3 text-xs text-slate-500 break-words whitespace-pre-wrap">{style.description}</p> : null}
      </div>
    )
  }

  const showGrid =
    reportConfig.showGrid === 'always' || (reportConfig.showGrid === 'snap' && !previewMode)

  const canvasLayout = useMemo(() => {
    const [ratioWidth, ratioHeight] = (reportConfig.canvasSize || '16:9')
      .split(':')
      .map((value) => Number(value) || 1)
    const landscape = reportConfig.displayMode !== 'portrait'
    const widthUnits = landscape ? ratioWidth : ratioHeight
    const heightUnits = landscape ? ratioHeight : ratioWidth
    return {
      aspectRatio: `${widthUnits} / ${heightUnits}`,
      minHeight: landscape ? 520 : 680,
    }
  }, [reportConfig.canvasSize, reportConfig.displayMode])

  const canvasStyle: React.CSSProperties = {
    ...(showGrid
      ? {
          backgroundImage:
            'linear-gradient(to right, rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.18) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }
      : {}),
    aspectRatio: canvasLayout.aspectRatio,
    minHeight: canvasLayout.minHeight,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 -mx-4 -my-4 md:-mx-6 md:-my-6 lg:-mx-8 lg:-my-8">
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-sm">
        <div className="px-4 py-3 md:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 max-w-2xl">
            <input
              type="text"
              value={report.name}
              onChange={(e) => setReport({ ...report, name: e.target.value })}
              className="text-3xl font-semibold text-slate-900 bg-transparent border-none focus:ring-0 focus:outline-none w-full"
            />
            <textarea
              value={report.description}
              onChange={(e) => setReport({ ...report, description: e.target.value })}
              className="mt-2 text-slate-700 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:outline-none resize-y min-h-[68px] w-full px-3 py-2"
              placeholder="Describe this report"
              rows={2}
            />
            <div className="mt-1 flex items-center gap-3 text-xs">
              <span className={isDirty ? 'text-amber-600 font-medium' : 'text-emerald-600 font-medium'}>
                {isDirty ? 'Unsaved changes' : 'All changes saved'}
              </span>
              {lastSavedAt ? <span className="text-slate-500">Last saved at {lastSavedAt}</span> : null}
              {lastAppliedAt ? <span className="text-slate-500">Last apply at {lastAppliedAt}</span> : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/reports')}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Saved Reports
            </button>

            {report.id && (
              <>
                <button
                  onClick={handleDownloadReport}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                  title="Download"
                >
                  <Download className="w-4 h-4 text-slate-700" />
                </button>
                <button
                  onClick={handleDuplicateReport}
                  disabled={saving}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                  title="Duplicate report"
                >
                  <Copy className="w-4 h-4 text-slate-700" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setPanelMode('add')}
              className="inline-flex items-center gap-2 px-4 py-2 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50"
            >
              <Plus className="w-4 h-4" />
              Add Widgets
            </button>

            <button
              onClick={() => setPreviewMode((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {previewMode ? 'Edit' : 'Preview'}
            </button>

            <button
              onClick={handleDiscard}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Discard
            </button>

            <button
              onClick={handleSaveReport}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {error && (
          <div className="px-6 pb-3">
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
          </div>
        )}
      </div>

      <div className="px-6 py-4">
        <div className="grid grid-cols-12 gap-4 min-h-[calc(100vh-170px)]">
          <div className="col-span-12 xl:col-span-9">
            <div className="bg-slate-200/70 border border-slate-300 rounded-xl w-full p-4 md:p-6" style={canvasStyle}>
              {report.widgets.length === 0 ? (
                <div className="h-full min-h-[620px] flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <Settings className="w-14 h-14 mx-auto mb-4 opacity-60" />
                    <p className="text-lg font-medium">Drag and drop widgets to create your report</p>
                    <p className="text-sm mt-2">Use Add Widgets to insert Chart, Metric, Table, or Text widgets</p>
                    <button
                      onClick={() => setPanelMode('add')}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Widget
                    </button>
                  </div>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="custom-report-widget-canvas">
                    {(dropProvided) => (
                      <div
                        ref={dropProvided.innerRef}
                        {...dropProvided.droppableProps}
                        className="grid grid-cols-12 gap-4 auto-rows-[minmax(220px,auto)]"
                      >
                        {report.widgets.map((widget, index) => {
                          const isSelected = selectedWidgetId === widget.id
                          const isFirst = index === 0
                          const isLast = index === report.widgets.length - 1
                          const layout = {
                            colSpan: Number(widget.config?.layout?.colSpan || 6),
                            rowSpan: Number(widget.config?.layout?.rowSpan || 1),
                          }

                          return (
                            <Draggable
                              key={widget.id}
                              draggableId={widget.id}
                              index={index}
                              isDragDisabled={previewMode}
                            >
                              {(dragProvided) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => {
                                    setSelectedWidgetId(widget.id)
                                    if (!previewMode) {
                                      setPanelMode('configure')
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      setSelectedWidgetId(widget.id)
                                      if (!previewMode) {
                                        setPanelMode('configure')
                                      }
                                    }
                                  }}
                                  style={{
                                    ...dragProvided.draggableProps.style,
                                    gridColumn: `span ${layout.colSpan}`,
                                    gridRow: `span ${layout.rowSpan}`,
                                  }}
                                  className={`bg-white rounded-xl border p-4 transition cursor-pointer h-full flex flex-col ${
                                    isSelected
                                      ? 'border-blue-500 ring-2 ring-blue-100'
                                      : 'border-slate-200 hover:border-blue-300'
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="min-w-0">
                                      <p className="text-xs uppercase tracking-wide text-slate-500">{widget.type} widget</p>
                                      {isSelected && !previewMode ? (
                                        <input
                                          value={widget.title}
                                          onChange={(e) =>
                                            handleUpdateWidget(widget.id, {
                                              title: e.target.value,
                                            })
                                          }
                                          onClick={(e) => e.stopPropagation()}
                                          className="mt-1 text-lg font-semibold text-slate-900 bg-transparent border-none focus:ring-0 focus:outline-none p-0 w-full"
                                        />
                                      ) : (
                                        <h3 className="text-lg font-semibold text-slate-900 mt-1 truncate">{widget.title}</h3>
                                      )}
                                    </div>

                                    {!previewMode && (
                                      <div className="flex items-center gap-1 ml-2">
                                        <button
                                          {...dragProvided.dragHandleProps}
                                          onClick={(e) => e.stopPropagation()}
                                          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
                                          title="Drag to reorder"
                                        >
                                          <GripVertical className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleResizeWidget(widget.id, 'narrower')
                                          }}
                                          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
                                          title="Reduce width"
                                        >
                                          <ArrowLeftRight className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleResizeWidget(widget.id, 'wider')
                                          }}
                                          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 text-xs font-semibold"
                                          title="Increase width"
                                        >
                                          W+
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleResizeWidget(widget.id, 'shorter')
                                          }}
                                          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
                                          title="Reduce height"
                                        >
                                          <ArrowUpDown className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleResizeWidget(widget.id, 'taller')
                                          }}
                                          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 text-xs font-semibold"
                                          title="Increase height"
                                        >
                                          H+
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleMoveWidget(widget.id, 'up')
                                          }}
                                          disabled={isFirst}
                                          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                                          title="Move up"
                                        >
                                          <ArrowUp className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleMoveWidget(widget.id, 'down')
                                          }}
                                          disabled={isLast}
                                          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                                          title="Move down"
                                        >
                                          <ArrowDown className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleDuplicateWidget(widget.id)
                                          }}
                                          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
                                          title="Duplicate widget"
                                        >
                                          <Copy className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleRemoveWidget(widget.id)
                                          }}
                                          className="p-1.5 rounded-md text-red-500 hover:bg-red-50"
                                          title="Remove widget"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex-1 min-h-0">{renderWidgetPreview(widget)}</div>

                                  {!previewMode && (
                                    <div className="mt-3 flex items-center justify-between">
                                      <span className="text-xs text-slate-500">
                                        Position {widget.position + 1} | Span {layout.colSpan}x{layout.rowSpan}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setSelectedWidgetId(widget.id)
                                          setPanelMode('configure')
                                        }}
                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                      >
                                        Customize
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          )
                        })}
                        {dropProvided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
          </div>

          <div className="col-span-12 xl:col-span-3">
            <div className="flex min-h-[680px] h-full">
              <div className="w-12 shrink-0 bg-white border border-r-0 rounded-l-xl py-3 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPanelMode('configure')}
                  className={`p-2 rounded-lg ${panelMode === 'configure' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}
                  title="Widget Configuration"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPanelMode('filters')}
                  className={`p-2 rounded-lg ${panelMode === 'filters' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}
                  title="Filters"
                >
                  <Filter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPanelMode('styling')}
                  className={`p-2 rounded-lg ${panelMode === 'styling' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}
                  title="Styling"
                >
                  <Paintbrush className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPanelMode('report')}
                  className={`p-2 rounded-lg ${panelMode === 'report' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}
                  title="Report Configuration"
                >
                  <LayoutTemplate className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPanelMode('add')}
                  className={`p-2 rounded-lg ${panelMode === 'add' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}
                  title="Add Widgets"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 bg-white border rounded-r-xl p-4 overflow-y-auto">
                {panelMode === 'add' && (
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-1">Add Widgets</h2>
                    <p className="text-sm text-slate-500 mb-3">Build from scratch or start with a template</p>

                    <div className="grid grid-cols-1 gap-2 mb-4">
                      <button
                        onClick={() => handleApplyTemplate('sales')}
                        className="text-left p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
                      >
                        <p className="font-medium text-slate-800">Sales Pipeline Template</p>
                        <p className="text-xs text-slate-500">Chart + metric + deals table</p>
                      </button>
                      <button
                        onClick={() => handleApplyTemplate('executive')}
                        className="text-left p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
                      >
                        <p className="font-medium text-slate-800">Executive Snapshot Template</p>
                        <p className="text-xs text-slate-500">KPI cards + trend chart</p>
                      </button>
                      <button
                        onClick={() => handleApplyTemplate('ops')}
                        className="text-left p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
                      >
                        <p className="font-medium text-slate-800">Operations Template</p>
                        <p className="text-xs text-slate-500">SLA list + workload chart + notes</p>
                      </button>
                    </div>

                    <input
                      value={widgetSearch}
                      onChange={(e) => setWidgetSearch(e.target.value)}
                      placeholder="Search widgets"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4"
                    />

                    <div className="space-y-3">
                      {filteredWidgetLibrary.length === 0 ? (
                        <p className="text-sm text-slate-500">No widgets match your search.</p>
                      ) : (
                        filteredWidgetLibrary.map((item) => (
                          <button
                            key={item.type}
                            onClick={() => handleAddWidget(item.type)}
                            className="w-full text-left p-4 border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition"
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">{item.icon}</div>
                              <div>
                                <p className="font-semibold text-slate-900">{item.title}</p>
                                <p className="text-sm text-slate-500">{item.description}</p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {panelMode === 'configure' && (
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Widget Configuration</h2>

                    {!selectedWidget ? (
                      <p className="text-sm text-slate-500">Select a widget from the canvas to configure it.</p>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Title</label>
                          <input
                            value={selectedWidget.title}
                            onChange={(e) => handleUpdateSelectedWidget({ title: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                          />
                        </div>

                        {selectedWidget.type === 'chart' && (
                          <>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Chart Type</label>
                              <select
                                value={selectedWidget.config?.chartType || 'bar'}
                                onChange={(e) => handleUpdateSelectedWidgetConfig('chartType', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                              >
                                <option value="bar">Bar</option>
                                <option value="line">Line</option>
                                <option value="pie">Pie</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Data Source</label>
                              <select
                                value={selectedWidget.config?.dataSource || ''}
                                onChange={(e) => handleUpdateSelectedWidgetConfig('dataSource', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-2"
                              >
                                {KNOWN_DATA_SOURCES.map((source) => (
                                  <option key={source.value} value={source.value}>
                                    {source.label}
                                  </option>
                                ))}
                              </select>
                              <input
                                value={selectedWidget.config?.dataSource || ''}
                                onChange={(e) => handleUpdateSelectedWidgetConfig('dataSource', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Group By Field</label>
                                <input
                                  value={selectedWidget.config?.groupBy || selectedWidget.config?.xField || ''}
                                  onChange={(e) => {
                                    handleUpdateSelectedWidgetConfig('groupBy', e.target.value)
                                    handleUpdateSelectedWidgetConfig('xField', e.target.value)
                                  }}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Aggregate Field</label>
                                <input
                                  value={selectedWidget.config?.aggregateField || selectedWidget.config?.yField || ''}
                                  onChange={(e) => {
                                    handleUpdateSelectedWidgetConfig('aggregateField', e.target.value)
                                    handleUpdateSelectedWidgetConfig('yField', e.target.value)
                                  }}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Aggregation</label>
                              <select
                                value={selectedWidget.config?.aggregate || 'sum'}
                                onChange={(e) => handleUpdateSelectedWidgetConfig('aggregate', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                              >
                                <option value="sum">Sum</option>
                                <option value="avg">Average</option>
                                <option value="count">Count</option>
                                <option value="min">Minimum</option>
                                <option value="max">Maximum</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Top Groups</label>
                              <input
                                type="number"
                                min="1"
                                max="25"
                                value={selectedWidget.config?.maxItems || 8}
                                onChange={(e) =>
                                  handleUpdateSelectedWidgetConfig(
                                    'maxItems',
                                    e.target.value ? parseInt(e.target.value) : 8
                                  )
                                }
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                              />
                            </div>
                          </>
                        )}

                        {selectedWidget.type === 'metric' && (
                          <>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Metric Label</label>
                              <input
                                value={selectedWidget.config?.label || ''}
                                onChange={(e) => handleUpdateSelectedWidgetConfig('label', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Data Source</label>
                              <select
                                value={selectedWidget.config?.dataSource || ''}
                                onChange={(e) => handleUpdateSelectedWidgetConfig('dataSource', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-2"
                              >
                                {KNOWN_DATA_SOURCES.map((source) => (
                                  <option key={source.value} value={source.value}>
                                    {source.label}
                                  </option>
                                ))}
                              </select>
                              <input
                                value={selectedWidget.config?.dataSource || ''}
                                onChange={(e) => handleUpdateSelectedWidgetConfig('dataSource', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Value Field</label>
                              <input
                                value={selectedWidget.config?.valueField || ''}
                                onChange={(e) => handleUpdateSelectedWidgetConfig('valueField', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Aggregation</label>
                                <select
                                  value={selectedWidget.config?.aggregation || 'sum'}
                                  onChange={(e) => handleUpdateSelectedWidgetConfig('aggregation', e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                >
                                  <option value="sum">Sum</option>
                                  <option value="avg">Average</option>
                                  <option value="count">Count</option>
                                  <option value="min">Minimum</option>
                                  <option value="max">Maximum</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Format</label>
                                <select
                                  value={selectedWidget.config?.format || 'number'}
                                  onChange={(e) => handleUpdateSelectedWidgetConfig('format', e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                >
                                  <option value="number">Number</option>
                                  <option value="currency">Currency</option>
                                  <option value="percent">Percent</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Optional Group By</label>
                              <input
                                value={selectedWidget.config?.groupBy || ''}
                                onChange={(e) => handleUpdateSelectedWidgetConfig('groupBy', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                placeholder="owner"
                              />
                            </div>
                          </>
                        )}

                        {selectedWidget.type === 'table' && (
                          <>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Data Source</label>
                              <input
                                value={selectedWidget.config?.dataSource || ''}
                                onChange={(e) => handleUpdateSelectedWidgetConfig('dataSource', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Group By (optional)</label>
                                <input
                                  value={selectedWidget.config?.groupBy || ''}
                                  onChange={(e) => handleUpdateSelectedWidgetConfig('groupBy', e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Aggregate Field</label>
                                <input
                                  value={selectedWidget.config?.aggregateField || ''}
                                  onChange={(e) => handleUpdateSelectedWidgetConfig('aggregateField', e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Aggregation</label>
                                <select
                                  value={selectedWidget.config?.aggregation || 'count'}
                                  onChange={(e) => handleUpdateSelectedWidgetConfig('aggregation', e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                >
                                  <option value="count">Count</option>
                                  <option value="sum">Sum</option>
                                  <option value="avg">Average</option>
                                  <option value="min">Minimum</option>
                                  <option value="max">Maximum</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Sort Field</label>
                                <input
                                  value={selectedWidget.config?.sortField || ''}
                                  onChange={(e) => handleUpdateSelectedWidgetConfig('sortField', e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Sort Direction</label>
                              <select
                                value={selectedWidget.config?.sortDirection || 'desc'}
                                onChange={(e) => handleUpdateSelectedWidgetConfig('sortDirection', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                              >
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Columns (comma separated)</label>
                              <input
                                value={selectedWidget.config?.columns || ''}
                                onChange={(e) => handleUpdateSelectedWidgetConfig('columns', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Page Size</label>
                              <input
                                type="number"
                                min="1"
                                value={selectedWidget.config?.pageSize || 10}
                                onChange={(e) =>
                                  handleUpdateSelectedWidgetConfig(
                                    'pageSize',
                                    e.target.value ? parseInt(e.target.value) : 10
                                  )
                                }
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                              />
                            </div>
                          </>
                        )}

                        {selectedWidgetFields.length > 0 && (
                          <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Detected Fields</p>
                            <p className="text-xs text-slate-600">{selectedWidgetFields.join(', ')}</p>
                          </div>
                        )}

                        {selectedWidget.type === 'text' && (
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Content</label>
                            <textarea
                              rows={6}
                              value={selectedWidget.config?.content || ''}
                              onChange={(e) => handleUpdateSelectedWidgetConfig('content', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 leading-6 bg-white resize-y"
                            />
                          </div>
                        )}

                        <button
                          onClick={() => handleApplyPanel('configure')}
                          className="w-full py-2 rounded-lg bg-blue-600 text-white font-medium"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {panelMode === 'filters' && (
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Filters</h2>

                    {!selectedWidget ? (
                      <p className="text-sm text-slate-500">Select a widget to configure widget filters.</p>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Date Range</label>
                          <select
                            value={selectedWidget.config?.filters?.dateRange || 'last_30_days'}
                            onChange={(e) => handleUpdateSelectedWidgetFilter('dateRange', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                          >
                            <option value="today">Today</option>
                            <option value="last_7_days">Last 7 days</option>
                            <option value="last_30_days">Last 30 days</option>
                            <option value="this_month">This month</option>
                            <option value="this_quarter">This quarter</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Filter Field</label>
                          <input
                            value={selectedWidget.config?.filters?.field || ''}
                            onChange={(e) => handleUpdateSelectedWidgetFilter('field', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            placeholder="status"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Operator</label>
                          <select
                            value={selectedWidget.config?.filters?.operator || 'contains'}
                            onChange={(e) => handleUpdateSelectedWidgetFilter('operator', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                          >
                            <option value="contains">Contains</option>
                            <option value="equals">Equals</option>
                            <option value="not_equals">Not equals</option>
                            <option value="gt">Greater than</option>
                            <option value="gte">Greater than or equal</option>
                            <option value="lt">Less than</option>
                            <option value="lte">Less than or equal</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Filter Value</label>
                          <input
                            value={selectedWidget.config?.filters?.value || ''}
                            onChange={(e) => handleUpdateSelectedWidgetFilter('value', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            placeholder="OPEN"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Date Field</label>
                          <input
                            value={selectedWidget.config?.filters?.dateField || ''}
                            onChange={(e) => handleUpdateSelectedWidgetFilter('dateField', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            placeholder="createdAt"
                          />
                        </div>

                        <button
                          onClick={() => handleApplyPanel('filters')}
                          className="w-full py-2 rounded-lg bg-blue-600 text-white font-medium"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {panelMode === 'styling' && (
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Styling</h2>

                    {!selectedWidget ? (
                      <p className="text-sm text-slate-500">Select a widget to apply styling options.</p>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                            Opacity ({selectedWidget.config?.style?.opacity ?? 100})
                          </label>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={selectedWidget.config?.style?.opacity ?? 100}
                            onChange={(e) => handleUpdateSelectedWidgetStyle('opacity', parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Background</label>
                            <input
                              type="color"
                              value={selectedWidget.config?.style?.background || '#ffffff'}
                              onChange={(e) => handleUpdateSelectedWidgetStyle('background', e.target.value)}
                              className="w-full h-10 border border-slate-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Border Color</label>
                            <input
                              type="color"
                              value={selectedWidget.config?.style?.borderColor || '#dbeafe'}
                              onChange={(e) => handleUpdateSelectedWidgetStyle('borderColor', e.target.value)}
                              className="w-full h-10 border border-slate-300 rounded-lg"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Border Radius</label>
                            <input
                              type="number"
                              min="0"
                              value={selectedWidget.config?.style?.borderRadius ?? 12}
                              onChange={(e) =>
                                handleUpdateSelectedWidgetStyle('borderRadius', parseInt(e.target.value || '0'))
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Border Width</label>
                            <input
                              type="number"
                              min="0"
                              value={selectedWidget.config?.style?.borderWidth ?? 1}
                              onChange={(e) =>
                                handleUpdateSelectedWidgetStyle('borderWidth', parseInt(e.target.value || '0'))
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            />
                          </div>
                        </div>

                        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={Boolean(selectedWidget.config?.style?.showDescription)}
                            onChange={(e) =>
                              handleUpdateSelectedWidgetStyle('showDescription', e.target.checked)
                            }
                            className="rounded border-slate-300"
                          />
                          Show widget description
                        </label>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Description</label>
                          <textarea
                            rows={4}
                            value={selectedWidget.config?.style?.description || ''}
                            onChange={(e) => handleUpdateSelectedWidgetStyle('description', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 leading-6 bg-white resize-y"
                          />
                        </div>

                        <button
                          onClick={() => handleApplyPanel('styling')}
                          className="w-full py-2 rounded-lg bg-blue-600 text-white font-medium"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {panelMode === 'report' && (
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Report Configuration</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Canvas Size</label>
                        <select
                          value={reportConfig.canvasSize}
                          onChange={(e) => handleUpdateReportConfig('canvasSize', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        >
                          <option value="16:9">16:9</option>
                          <option value="4:3">4:3</option>
                          <option value="1:1">1:1</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Display Mode</label>
                        <div className="flex items-center gap-4 text-sm">
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="radio"
                              checked={reportConfig.displayMode === 'portrait'}
                              onChange={() => handleUpdateReportConfig('displayMode', 'portrait')}
                            />
                            Portrait
                          </label>
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="radio"
                              checked={reportConfig.displayMode === 'landscape'}
                              onChange={() => handleUpdateReportConfig('displayMode', 'landscape')}
                            />
                            Landscape
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Grid Display</label>
                        <select
                          value={reportConfig.showGrid}
                          onChange={(e) => handleUpdateReportConfig('showGrid', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        >
                          <option value="always">Show grid</option>
                          <option value="snap">Show grid only on snap</option>
                          <option value="never">Never</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Auto Refresh Rate (minutes)</label>
                        <input
                          type="number"
                          min="0"
                          value={report.refreshRate || 0}
                          onChange={(e) =>
                            setReport({
                              ...report,
                              refreshRate: e.target.value ? parseInt(e.target.value) : undefined,
                            })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          Global Filter (applies to all widgets)
                        </p>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Global Date Range</label>
                            <select
                              value={globalFilters.dateRange || 'all'}
                              onChange={(e) => handleUpdateGlobalFilter('dateRange', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            >
                              <option value="all">All time</option>
                              <option value="today">Today</option>
                              <option value="last_7_days">Last 7 days</option>
                              <option value="last_30_days">Last 30 days</option>
                              <option value="this_month">This month</option>
                              <option value="this_quarter">This quarter</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Global Date Field</label>
                            <input
                              value={globalFilters.dateField || ''}
                              onChange={(e) => handleUpdateGlobalFilter('dateField', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                              placeholder="createdAt"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Global Filter Field</label>
                            <input
                              value={globalFilters.field || ''}
                              onChange={(e) => handleUpdateGlobalFilter('field', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                              placeholder="status"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Global Operator</label>
                            <select
                              value={globalFilters.operator || 'contains'}
                              onChange={(e) => handleUpdateGlobalFilter('operator', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            >
                              <option value="contains">Contains</option>
                              <option value="equals">Equals</option>
                              <option value="not_equals">Not equals</option>
                              <option value="gt">Greater than</option>
                              <option value="gte">Greater than or equal</option>
                              <option value="lt">Less than</option>
                              <option value="lte">Less than or equal</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Global Filter Value</label>
                            <input
                              value={globalFilters.value || ''}
                              onChange={(e) => handleUpdateGlobalFilter('value', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                              placeholder="OPEN"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleApplyPanel('report')}
                        className="w-full py-2 rounded-lg bg-blue-600 text-white font-medium"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
