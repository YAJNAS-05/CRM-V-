import { useState, useCallback, useMemo } from 'react'
import React from 'react'
import { BarChart, LineChart, PieChart, AreaChart, ScatterChart, Radar } from 'lucide-react'
import { reportApi } from '@/api/reportApi'
import { useNotification } from '@/hooks/useNotification'
import { useAuthStore } from '@/store/authStore'
import { FieldSelector } from './builder/FieldSelector'
import { ChartBuilder } from './builder/ChartBuilder'
import { FilterBuilder } from './builder/FilterBuilder'
import { ChartPreview } from './builder/ChartPreview'
import { DataSourceSelector } from './builder/DataSourceSelector'

export interface ReportConfig {
  name: string
  description: string
  module: string
  dataSource: string
  columns: ColumnConfig[]
  filters: FilterConfig[]
  chartType: ChartType
  chartTitle: string
  chartDescription: string
  chartOptions: ChartOptions
  theme: ThemeConfig
}

export interface ColumnConfig {
  name: string
  label: string
  type: 'string' | 'number' | 'date' | 'boolean'
  visible: boolean
  order: number
}

export interface FilterConfig {
  id: string
  field: string
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'between' | 'in'
  value: any
  label?: string
  type?: 'text' | 'number' | 'date' | 'select'
}

export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar'

export interface ChartOptions {
  stacked?: boolean
  responsive?: boolean
  showLegend?: boolean
  showGrid?: boolean
  xAxisLabel?: string
  yAxisLabel?: string
  colors?: string[]
}

export interface ThemeConfig {
  primaryColor: string
  backgroundColor: string
  borderColor: string
}

const CHART_TYPES: Array<{ type: ChartType; label: string; icon: React.ReactNode }> = [
  { type: 'bar', label: 'Bar Chart', icon: <BarChart size={20} /> },
  { type: 'line', label: 'Line Chart', icon: <LineChart size={20} /> },
  { type: 'pie', label: 'Pie Chart', icon: <PieChart size={20} /> },
  { type: 'area', label: 'Area Chart', icon: <AreaChart size={20} /> },
  { type: 'scatter', label: 'Scatter Chart', icon: <ScatterChart size={20} /> },
  { type: 'radar', label: 'Radar Chart', icon: <Radar size={20} /> },
]

const DEFAULT_MODULES = ['CRM', 'ERP', 'FINANCE', 'WAREHOUSE', 'OPERATIONS']

const DEFAULT_DATA_SOURCES = {
  CRM: ['Accounts', 'Contacts', 'Leads', 'Opportunities', 'Activities'],
  ERP: ['Inventory', 'Orders', 'Suppliers', 'Invoices', 'Shipments'],
  FINANCE: ['Transactions', 'Invoices', 'Payments', 'Reports', 'Budgets'],
  WAREHOUSE: ['Stock', 'Movements', 'Locations', 'Transfers'],
  OPERATIONS: ['Tasks', 'Projects', 'Resources', 'Schedules']
}

export const EnterpriseReportBuilder = ({ onSave, onCancel }: any) => {
  const { success, error } = useNotification()
  const user = useAuthStore((state: any) => state.user)
  const [activeTab, setActiveTab] = useState<'data' | 'columns' | 'filters' | 'chart' | 'preview' | 'json'>('data')
  const [isSaving, setIsSaving] = useState(false)

  const [config, setConfig] = useState<ReportConfig>({
    name: 'New Report',
    description: '',
    module: 'CRM',
    dataSource: 'Accounts',
    columns: [],
    filters: [],
    chartType: 'bar',
    chartTitle: 'Report Chart',
    chartDescription: '',
    chartOptions: {
      stacked: false,
      responsive: true,
      showLegend: true,
      showGrid: true,
    },
    theme: {
      primaryColor: '#3b82f6',
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
    },
  })

  const updateConfig = useCallback((updates: Partial<ReportConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }, [])

  const updateColumn = useCallback((index: number, updates: Partial<ColumnConfig>) => {
    setConfig(prev => ({
      ...prev,
      columns: prev.columns.map((col, i) =>
        i === index ? { ...col, ...updates } : col
      )
    }))
  }, [])

  const addColumn = useCallback((col: ColumnConfig) => {
    setConfig(prev => ({
      ...prev,
      columns: [...prev.columns, { ...col, order: prev.columns.length }]
    }))
  }, [])

  const removeColumn = useCallback((index: number) => {
    setConfig(prev => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== index).map((col, i) => ({ ...col, order: i }))
    }))
  }, [])

  const reorderColumns = useCallback((startIndex: number, endIndex: number) => {
    setConfig(prev => {
      const result = Array.from(prev.columns)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      return {
        ...prev,
        columns: result.map((col, i) => ({ ...col, order: i }))
      }
    })
  }, [])

  const updateFilter = useCallback((id: string, updates: Partial<FilterConfig>) => {
    setConfig(prev => ({
      ...prev,
      filters: prev.filters.map(f =>
        f.id === id ? { ...f, ...updates } : f
      )
    }))
  }, [])

  const addFilter = useCallback((filter: FilterConfig) => {
    setConfig(prev => ({
      ...prev,
      filters: [...prev.filters, filter]
    }))
  }, [])

  const removeFilter = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      filters: prev.filters.filter(f => f.id !== id)
    }))
  }, [])

  const handleSave = async () => {
    try {
      if (!config.name.trim()) {
        error('Validation Error', 'Report name is required')
        return
      }
      if (config.columns.length === 0) {
        error('Validation Error', 'At least one column is required')
        return
      }

      setIsSaving(true)
      const reportData = {
        reportName: config.name,
        description: config.description,
        module: config.module,
        reportType: 'CUSTOM',
        definition: config
      }

      const response = await reportApi.createReport(reportData)
      if (response.data?.data) {
        success('Report Created', `Report "${config.name}" created successfully`)
        onSave?.(response.data.data)
      }
    } catch (err: any) {
      error('Save Failed', err.response?.data?.message || 'Failed to save report')
    } finally {
      setIsSaving(false)
    }
  }

  const availableDataSources = DEFAULT_DATA_SOURCES[config.module as keyof typeof DEFAULT_DATA_SOURCES] || []

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Enterprise Report Builder</h1>
              <p className="text-sm text-slate-500 mt-1">Design custom reports with drag-and-drop, charts, and dynamic filters</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {isSaving ? 'Saving...' : 'Save Report'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-full mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'data', label: '1. Data Source' },
              { id: 'columns', label: '2. Columns' },
              { id: 'filters', label: '3. Filters' },
              { id: 'chart', label: '4. Chart' },
              { id: 'preview', label: '5. Preview' },
              { id: 'json', label: 'JSON' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 font-medium border-b-2 whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-full mx-auto px-6 py-6">
          {activeTab === 'data' && (
            <DataSourceSelector
              config={config}
              onUpdate={updateConfig}
              modules={DEFAULT_MODULES}
              dataSources={availableDataSources}
            />
          )}

          {activeTab === 'columns' && (
            <FieldSelector
              config={config}
              onAddColumn={addColumn}
              onUpdateColumn={updateColumn}
              onRemoveColumn={removeColumn}
              onReorderColumns={reorderColumns}
            />
          )}

          {activeTab === 'filters' && (
            <FilterBuilder
              config={config}
              columns={config.columns}
              onAddFilter={addFilter}
              onUpdateFilter={updateFilter}
              onRemoveFilter={removeFilter}
            />
          )}

          {activeTab === 'chart' && (
            <ChartBuilder
              config={config}
              onUpdate={updateConfig}
              chartTypes={CHART_TYPES}
            />
          )}

          {activeTab === 'preview' && (
            <ChartPreview config={config} columns={config.columns} />
          )}

          {activeTab === 'json' && (
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Report Configuration (JSON)</h2>
              <textarea
                value={JSON.stringify(config, null, 2)}
                readOnly
                className="w-full h-96 p-4 font-mono text-sm border border-slate-300 rounded bg-slate-50"
              />
              <p className="text-xs text-slate-500 mt-2">This JSON configuration defines your report. You can copy and version control it.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
