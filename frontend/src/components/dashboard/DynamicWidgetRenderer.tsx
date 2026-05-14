// src/components/dashboard/DynamicWidgetRenderer.tsx
import { useMemo } from 'react'
import { DashboardWidget } from '@/api/dashboardApi'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp } from 'lucide-react'

interface DynamicWidgetRendererProps {
  widget: DashboardWidget
}

const COLORS = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
]

export const DynamicWidgetRenderer = ({ widget }: DynamicWidgetRendererProps) => {
  const renderChart = () => {
    const config = widget.config as any || {}
    const data = config.data || []

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <span className="text-sm">No data available</span>
        </div>
      )
    }

    const xAxisKey = config.xAxis || 'name'
    const yAxisKey = config.yAxis || 'value'

    switch (widget.chartType || widget.widgetType) {
      case 'bar':
      case 'CHART':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={yAxisKey} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={yAxisKey} stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={80}
                fill="#8884d8"
                dataKey={yAxisKey}
              >
                {data.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey={yAxisKey}
                fill="#3b82f6"
                stroke="#2563eb"
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'KPI':
      case 'NUMBER':
      case 'METRIC':
        const value = config.value || 0
        const format = widget.metricFormat || 'number'
        const formatted = format === 'currency' ? `$${value.toLocaleString()}` : value

        return (
          <div className="flex flex-col items-center justify-center h-full space-y-2">
            <div className="text-4xl font-bold text-primary">{formatted}</div>
            <div className="text-sm text-muted-foreground text-center">
              {widget.metricLabel || 'Metric'}
            </div>
            {config.trend && (
              <div className={`flex items-center gap-1 ${config.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">{Math.abs(config.trend)}%</span>
              </div>
            )}
          </div>
        )

      case 'TABLE':
        return (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {config.columns?.map((col: string, idx: number) => (
                    <th key={idx} className="text-left p-2 font-medium">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 10).map((row: any, idx: number) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    {config.columns?.map((col: string, cidx: number) => (
                      <td key={cidx} className="p-2">
                        {row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      case 'CUSTOM':
        return <div dangerouslySetInnerHTML={{ __html: config.html }} />

      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <span className="text-sm">Widget type not supported</span>
          </div>
        )
    }
  }

  return renderChart()
}

export default DynamicWidgetRenderer
