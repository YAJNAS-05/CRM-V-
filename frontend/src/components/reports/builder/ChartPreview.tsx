import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import { ReportConfig, ColumnConfig } from '../EnterpriseReportBuilder'

const SAMPLE_DATA = [
  { name: 'Jan', value: 400, value2: 240 },
  { name: 'Feb', value: 300, value2: 221 },
  { name: 'Mar', value: 200, value2: 229 },
  { name: 'Apr', value: 278, value2: 200 },
  { name: 'May', value: 189, value2: 229 },
  { name: 'Jun', value: 239, value2: 200 },
]

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export const ChartPreview = ({ config, columns }: any) => {
  if (columns.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <p className="text-slate-500 mb-2">No columns selected</p>
            <p className="text-xs text-slate-400">Add columns to see chart preview</p>
          </div>
        </div>
      </div>
    )
  }

  const getChartComponent = () => {
    const chartProps = {
      data: SAMPLE_DATA,
      margin: { top: 20, right: 30, left: 0, bottom: 20 }
    }

    switch (config.chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...chartProps}>
              {config.chartOptions.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" label={{ value: config.chartOptions.xAxisLabel || 'Categories', position: 'insideBottom', offset: -10 }} />
              <YAxis label={{ value: config.chartOptions.yAxisLabel || 'Values', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              {config.chartOptions.showLegend && <Legend />}
              <Bar dataKey="value" fill={config.theme.primaryColor} />
              <Bar dataKey="value2" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...chartProps}>
              {config.chartOptions.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" label={{ value: config.chartOptions.xAxisLabel || 'Time', position: 'insideBottom', offset: -10 }} />
              <YAxis label={{ value: config.chartOptions.yAxisLabel || 'Values', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              {config.chartOptions.showLegend && <Legend />}
              <Line type="monotone" dataKey="value" stroke={config.theme.primaryColor} />
              <Line type="monotone" dataKey="value2" stroke="#10b981" />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...chartProps}>
              {config.chartOptions.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" label={{ value: config.chartOptions.xAxisLabel || 'Time', position: 'insideBottom', offset: -10 }} />
              <YAxis label={{ value: config.chartOptions.yAxisLabel || 'Values', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              {config.chartOptions.showLegend && <Legend />}
              {config.chartOptions.stacked ? (
                <>
                  <Area type="monotone" dataKey="value" stackId="1" stroke={config.theme.primaryColor} fill={config.theme.primaryColor} />
                  <Area type="monotone" dataKey="value2" stackId="1" stroke="#10b981" fill="#10b981" />
                </>
              ) : (
                <>
                  <Area type="monotone" dataKey="value" stroke={config.theme.primaryColor} fill={config.theme.primaryColor} />
                  <Area type="monotone" dataKey="value2" stroke="#10b981" fill="#10b981" />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={SAMPLE_DATA}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={120}
                fill={config.theme.primaryColor}
                dataKey="value"
              >
                {SAMPLE_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              {config.chartOptions.showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        )

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart {...chartProps}>
              {config.chartOptions.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="value" name="Value 1" label={{ value: config.chartOptions.xAxisLabel || 'X Axis', position: 'insideBottom', offset: -10 }} />
              <YAxis dataKey="value2" name="Value 2" label={{ value: config.chartOptions.yAxisLabel || 'Y Axis', angle: -90, position: 'insideLeft' }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              {config.chartOptions.showLegend && <Legend />}
              <Scatter dataKey="value2" data={SAMPLE_DATA} fill={config.theme.primaryColor} />
            </ScatterChart>
          </ResponsiveContainer>
        )

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={SAMPLE_DATA}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis />
              <Radar name="Value 1" dataKey="value" stroke={config.theme.primaryColor} fill={config.theme.primaryColor} fillOpacity={0.6} />
              <Radar name="Value 2" dataKey="value2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Tooltip />
              {config.chartOptions.showLegend && <Legend />}
            </RadarChart>
          </ResponsiveContainer>
        )

      default:
        return <div>Unknown chart type</div>
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">{config.chartTitle || 'Chart Preview'}</h2>
          {config.chartDescription && (
            <p className="text-sm text-slate-500 mt-1">{config.chartDescription}</p>
          )}
        </div>

        <div style={{ backgroundColor: config.theme.backgroundColor, borderColor: config.theme.borderColor }} className="border rounded-lg p-4">
          {getChartComponent()}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">💡 Preview Information</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• This is a preview using sample data with {config.columns.length} columns</li>
          <li>• Chart type: <span className="font-medium">{config.chartType.toUpperCase()}</span></li>
          <li>• The actual chart will display your real data when you save the report</li>
          <li>• Columns shown: {config.columns.filter((c: ColumnConfig) => c.visible).map((c: ColumnConfig) => c.label).join(', ')}</li>
          {config.filters.length > 0 && (
            <li>• Filters configured: {config.filters.length}</li>
          )}
        </ul>
      </div>
    </div>
  )
}
