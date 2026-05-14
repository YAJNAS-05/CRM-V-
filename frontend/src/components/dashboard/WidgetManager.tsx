// src/components/dashboard/WidgetManager.tsx
import { useState } from 'react'
import { CreateWidgetRequest } from '@/api/dashboardApi'
import {
  BarChart3,
  LineChart,
  PieChart,
  AreaChart,
  Hash,
  TrendingUp,
  Table,
  Gauge,
  Code,
} from 'lucide-react'

interface WidgetManagerProps {
  onSubmit: (request: CreateWidgetRequest) => void
  isLoading?: boolean
}

const WIDGET_TYPES = [
  {
    type: 'CHART',
    label: 'Bar Chart',
    icon: BarChart3,
    description: 'Display data with bars',
    chartType: 'bar',
  },
  {
    type: 'CHART',
    label: 'Line Chart',
    icon: LineChart,
    description: 'Display data as a line',
    chartType: 'line',
  },
  {
    type: 'CHART',
    label: 'Pie Chart',
    icon: PieChart,
    description: 'Display data as slices',
    chartType: 'pie',
  },
  {
    type: 'CHART',
    label: 'Area Chart',
    icon: AreaChart,
    description: 'Display data as areas',
    chartType: 'area',
  },
  {
    type: 'KPI',
    label: 'KPI Card',
    icon: TrendingUp,
    description: 'Display key metrics',
    chartType: undefined,
  },
  {
    type: 'NUMBER',
    label: 'Number Metric',
    icon: Hash,
    description: 'Display a single number',
    chartType: undefined,
  },
  {
    type: 'TABLE',
    label: 'Data Table',
    icon: Table,
    description: 'Display tabular data',
    chartType: undefined,
  },
  {
    type: 'GAUGE',
    label: 'Gauge Chart',
    icon: Gauge,
    description: 'Display a gauge',
    chartType: undefined,
  },
  {
    type: 'CUSTOM',
    label: 'Custom HTML',
    icon: Code,
    description: 'Custom HTML content',
    chartType: undefined,
  },
]

export const WidgetManager = ({ onSubmit, isLoading }: WidgetManagerProps) => {
  const [selectedType, setSelectedType] = useState<string>('CHART')
  const [selectedChart, setSelectedChart] = useState<string>('bar')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [colSpan, setColSpan] = useState('3')
  const [rowSpan, setRowSpan] = useState('2')

  const widgetOptions = WIDGET_TYPES.filter(
    (w) => selectedType === 'CHART' || w.type === selectedType
  )

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('Please enter a widget title')
      return
    }

    const request: CreateWidgetRequest = {
      widgetType: selectedType,
      widgetTitle: title,
      description: description || undefined,
      colSpan: parseInt(colSpan),
      rowSpan: parseInt(rowSpan),
      config: {
        data: [],
        xAxis: 'name',
        yAxis: 'value',
      },
      chartType: selectedChart || undefined,
      backgroundColor: '#3b82f6',
      fontSize: 'medium',
      refreshInterval: 300,
    }

    onSubmit(request)
  }

  return (
    <div className="space-y-6">
      {/* Widget Type Selection */}
      <div className="space-y-3">
        <label className="text-base font-semibold block">Select Widget Type</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {widgetOptions.map((wt) => {
            const Icon = wt.icon
            return (
              <div
                key={`${wt.type}-${wt.chartType}`}
                className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                  selectedType === wt.type && selectedChart === (wt.chartType || wt.type)
                    ? 'ring-2 ring-primary border-primary'
                    : 'border-gray-200 hover:border-primary'
                }`}
                onClick={() => {
                  setSelectedType(wt.type)
                  if (wt.chartType) setSelectedChart(wt.chartType)
                }}
              >
                <div className="text-center space-y-2">
                  <Icon className="h-6 w-6 mx-auto" />
                  <div>
                    <p className="font-medium text-sm">{wt.label}</p>
                    <p className="text-xs text-gray-500">{wt.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Widget Details */}
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">Widget Title *</label>
          <input
            id="title"
            type="text"
            placeholder="e.g., Sales Overview"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
          <textarea
            id="description"
            placeholder="Optional description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="colSpan" className="block text-sm font-medium mb-1">Column Span (1-12)</label>
            <select
              id="colSpan"
              value={colSpan}
              onChange={(e) => setColSpan(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 6, 12].map((n) => (
                <option key={n} value={String(n)}>
                  {n} columns
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="rowSpan" className="block text-sm font-medium mb-1">Row Span (1-4)</label>
            <select
              id="rowSpan"
              value={rowSpan}
              onChange={(e) => setRowSpan(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={String(n)}>
                  {n} rows
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <button
          onClick={() => {
            setTitle('')
            setDescription('')
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
        >
          Clear
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {isLoading ? 'Adding...' : 'Add Widget'}
        </button>
      </div>
    </div>
  )
}

export default WidgetManager
