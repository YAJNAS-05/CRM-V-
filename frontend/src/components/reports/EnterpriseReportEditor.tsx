import React, { useState, useCallback } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { ChevronDown, Plus, Trash2, Settings, Eye, Edit2, Save, X } from 'lucide-react'

interface ChartConfig {
  id: string
  type: 'bar' | 'line' | 'pie'
  title: string
  dataKey: string
  xAxis?: string
  yAxis?: string
  colors?: string[]
  visible: boolean
}

interface ReportConfig {
  name: string
  description: string
  charts: ChartConfig[]
  filters: FilterConfig[]
  layout: 'grid' | 'stack'
  columnCount: number
}

interface FilterConfig {
  id: string
  field: string
  label: string
  type: 'text' | 'date' | 'select' | 'daterange'
  value?: any
  options?: string[]
}

interface EnterpriseReportEditorProps {
  initialData?: any
  onSave?: (config: ReportConfig) => void
  onCancel?: () => void
  isEditing?: boolean
}

const DEFAULT_COLORS = ['#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#ec4899']

export const EnterpriseReportEditor: React.FC<EnterpriseReportEditorProps> = ({
  initialData,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const [config, setConfig] = useState<ReportConfig>({
    name: initialData?.name || 'New Report',
    description: initialData?.description || '',
    charts: initialData?.charts || [],
    filters: initialData?.filters || [],
    layout: 'grid',
    columnCount: 2
  })

  const [editingChart, setEditingChart] = useState<string | null>(null)
  const [editingFilter, setEditingFilter] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  // Mock data for preview
  const mockData = [
    { name: 'Jan', value: 4000, revenue: 2400 },
    { name: 'Feb', value: 3000, revenue: 1398 },
    { name: 'Mar', value: 2000, revenue: 9800 },
    { name: 'Apr', value: 2780, revenue: 3908 },
    { name: 'May', value: 1890, revenue: 4800 },
  ]

  const addChart = () => {
    const newChart: ChartConfig = {
      id: `chart-${Date.now()}`,
      type: 'bar',
      title: 'New Chart',
      dataKey: 'value',
      visible: true,
      colors: DEFAULT_COLORS
    }
    setConfig(prev => ({
      ...prev,
      charts: [...prev.charts, newChart]
    }))
  }

  const updateChart = (id: string, updates: Partial<ChartConfig>) => {
    setConfig(prev => ({
      ...prev,
      charts: prev.charts.map(c => c.id === id ? { ...c, ...updates } : c)
    }))
  }

  const removeChart = (id: string) => {
    setConfig(prev => ({
      ...prev,
      charts: prev.charts.filter(c => c.id !== id)
    }))
  }

  const addFilter = () => {
    const newFilter: FilterConfig = {
      id: `filter-${Date.now()}`,
      field: 'new_field',
      label: 'New Filter',
      type: 'text'
    }
    setConfig(prev => ({
      ...prev,
      filters: [...prev.filters, newFilter]
    }))
  }

  const updateFilter = (id: string, updates: Partial<FilterConfig>) => {
    setConfig(prev => ({
      ...prev,
      filters: prev.filters.map(f => f.id === id ? { ...f, ...updates } : f)
    }))
  }

  const removeFilter = (id: string) => {
    setConfig(prev => ({
      ...prev,
      filters: prev.filters.filter(f => f.id !== id)
    }))
  }

  const renderChart = (chart: ChartConfig, isEditable: boolean = false) => {
    const commonProps = {
      data: mockData,
      margin: { top: 20, right: 30, left: 0, bottom: 0 }
    }

    const wrapper = (children: React.ReactElement) => (
      <div className={`p-4 border border-border rounded-lg bg-card ${isEditable && editingChart === chart.id ? 'ring-2 ring-primary' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">{chart.title}</h3>
          {isEditable && (
            <div className="flex gap-2">
              <button
                onClick={() => setEditingChart(editingChart === chart.id ? null : chart.id)}
                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                title="Edit chart"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => removeChart(chart.id)}
                className="p-1 hover:bg-destructive/10 rounded text-destructive hover:text-destructive/80 transition-colors"
                title="Delete chart"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
        <ResponsiveContainer width="100%" height={300}>
          {children}
        </ResponsiveContainer>
      </div>
    )

    switch (chart.type) {
      case 'bar':
        return wrapper(
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={chart.dataKey} fill={chart.colors?.[0] || '#6366f1'} />
          </BarChart>
        )
      case 'line':
        return wrapper(
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={chart.dataKey} stroke={chart.colors?.[0] || '#6366f1'} />
          </LineChart>
        )
      case 'pie':
        return wrapper(
          <PieChart>
            <Pie
              data={mockData}
              dataKey={chart.dataKey}
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {mockData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={chart.colors?.[index % chart.colors.length] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        )
      default:
        return null
    }
  }

  if (previewMode && !isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{config.name}</h1>
            {config.description && <p className="text-muted-foreground mt-1">{config.description}</p>}
          </div>
          <button
            onClick={() => setPreviewMode(false)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            ← Back to Editor
          </button>
        </div>

        {config.filters.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="font-semibold mb-4">Filters</h2>
            <div className="grid grid-cols-2 gap-4">
              {config.filters.map(filter => (
                <div key={filter.id}>
                  <label className="text-sm font-medium text-foreground block mb-1">{filter.label}</label>
                  <input type="text" className="w-full px-3 py-2 border border-border rounded-lg bg-background" placeholder={`Enter ${filter.label}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`grid gap-6 ${config.layout === 'grid' ? `grid-cols-${config.columnCount}` : 'grid-cols-1'}`}>
          {config.charts.filter(c => c.visible).map(chart => (
            <div key={chart.id}>
              {renderChart(chart, false)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <input
            type="text"
            value={config.name}
            onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
            className="text-3xl font-bold bg-transparent border-0 border-b-2 border-transparent hover:border-b-2 hover:border-muted focus:border-b-2 focus:border-primary outline-none"
            placeholder="Report Name"
          />
          <textarea
            value={config.description}
            onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
            className="mt-2 w-full text-muted-foreground bg-transparent border-0 outline-none resize-none"
            placeholder="Add report description..."
            rows={2}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPreviewMode(true)}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 flex items-center gap-2"
          >
            <Eye size={16} /> Preview
          </button>
          {onSave && (
            <button
              onClick={() => onSave(config)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
            >
              <Save size={16} /> Save Report
            </button>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Charts Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Charts & Visualizations</h2>
              <button
                onClick={addChart}
                className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 flex items-center gap-1"
              >
                <Plus size={14} /> Add Chart
              </button>
            </div>

            <div className="space-y-4">
              {config.charts.map(chart => (
                <div key={chart.id} className={`space-y-2 p-4 border border-border rounded-lg transition-colors ${editingChart === chart.id ? 'bg-primary/5' : ''}`}>
                  {editingChart === chart.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Chart Title</label>
                          <input
                            type="text"
                            value={chart.title}
                            onChange={(e) => updateChart(chart.id, { title: e.target.value })}
                            className="w-full mt-1 px-2 py-1 text-sm border border-border rounded bg-background"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Type</label>
                          <select
                            value={chart.type}
                            onChange={(e) => updateChart(chart.id, { type: e.target.value as any })}
                            className="w-full mt-1 px-2 py-1 text-sm border border-border rounded bg-background"
                          >
                            <option value="bar">Bar Chart</option>
                            <option value="line">Line Chart</option>
                            <option value="pie">Pie Chart</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Data Key</label>
                          <input
                            type="text"
                            value={chart.dataKey}
                            onChange={(e) => updateChart(chart.id, { dataKey: e.target.value })}
                            className="w-full mt-1 px-2 py-1 text-sm border border-border rounded bg-background"
                            placeholder="e.g., value, revenue"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Visibility</label>
                          <select
                            value={chart.visible ? 'visible' : 'hidden'}
                            onChange={(e) => updateChart(chart.id, { visible: e.target.value === 'visible' })}
                            className="w-full mt-1 px-2 py-1 text-sm border border-border rounded bg-background"
                          >
                            <option value="visible">Visible</option>
                            <option value="hidden">Hidden</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Primary Color</label>
                        <input
                          type="color"
                          value={chart.colors?.[0] || '#6366f1'}
                          onChange={(e) => updateChart(chart.id, { colors: [e.target.value, ...((chart.colors || []).slice(1))] })}
                          className="mt-1 w-12 h-8 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{chart.title}</p>
                        <p className="text-xs text-muted-foreground">{chart.type.toUpperCase()} • Data: {chart.dataKey} {!chart.visible && '• Hidden'}</p>
                      </div>
                      <button
                        onClick={() => setEditingChart(chart.id)}
                        className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                  {renderChart(chart, true)}
                </div>
              ))}

              {config.charts.length === 0 && (
                <div className="text-center py-8 border border-dashed border-border rounded-lg text-muted-foreground">
                  <p>No charts yet. Add one to get started!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Layout Settings */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-sm">Layout Settings</h3>
            <div className="space-y-2 text-sm">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Layout Type</label>
                <select
                  value={config.layout}
                  onChange={(e) => setConfig(prev => ({ ...prev, layout: e.target.value as 'grid' | 'stack' }))}
                  className="w-full px-2 py-1 border border-border rounded text-xs bg-background"
                >
                  <option value="grid">Grid</option>
                  <option value="stack">Stack</option>
                </select>
              </div>
              {config.layout === 'grid' && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Columns</label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={config.columnCount}
                    onChange={(e) => setConfig(prev => ({ ...prev, columnCount: parseInt(e.target.value) }))}
                    className="w-full px-2 py-1 border border-border rounded text-xs bg-background"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Report Filters</h3>
              <button
                onClick={addFilter}
                className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                <Plus size={12} />
              </button>
            </div>
            <div className="space-y-2">
              {config.filters.map(filter => (
                <div key={filter.id} className="text-xs p-2 bg-muted/50 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium truncate">{filter.label}</span>
                    <button
                      onClick={() => removeFilter(filter.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  {editingFilter === filter.id ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={filter.label}
                        onChange={(e) => updateFilter(filter.id, { label: e.target.value })}
                        className="w-full px-1 py-1 text-xs border border-border rounded bg-background"
                        placeholder="Label"
                      />
                      <select
                        value={filter.type}
                        onChange={(e) => updateFilter(filter.id, { type: e.target.value as any })}
                        className="w-full px-1 py-1 text-xs border border-border rounded bg-background"
                      >
                        <option value="text">Text</option>
                        <option value="date">Date</option>
                        <option value="daterange">Date Range</option>
                        <option value="select">Select</option>
                      </select>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">{filter.type}</p>
                  )}
                </div>
              ))}
              {config.filters.length === 0 && (
                <p className="text-muted-foreground text-xs py-2">No filters added yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
