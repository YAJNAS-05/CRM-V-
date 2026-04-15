import { ReportConfig } from '../EnterpriseReportBuilder'

export const ChartBuilder = ({ config, onUpdate, chartTypes }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-6">Chart Configuration</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Chart Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Chart Title</label>
            <input
              type="text"
              value={config.chartTitle}
              onChange={(e) => onUpdate({ chartTitle: e.target.value })}
              placeholder="Enter chart title"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Chart Description</label>
            <input
              type="text"
              value={config.chartDescription}
              onChange={(e) => onUpdate({ chartDescription: e.target.value })}
              placeholder="Enter chart description"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Chart Types */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-700 mb-4">Chart Type</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {chartTypes.map((chart: any) => (
              <button
                key={chart.type}
                onClick={() => onUpdate({ chartType: chart.type })}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition ${
                  config.chartType === chart.type
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="text-2xl">{chart.icon}</div>
                <div className="text-xs font-medium text-center">{chart.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Chart Options */}
        <div className="space-y-4 mb-8">
          <h3 className="font-medium text-slate-900">Chart Options</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stacked */}
            {['bar', 'area'].includes(config.chartType) && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <input
                  type="checkbox"
                  id="stacked"
                  checked={config.chartOptions.stacked}
                  onChange={(e) => onUpdate({
                    chartOptions: { ...config.chartOptions, stacked: e.target.checked }
                  })}
                  className="w-4 h-4"
                />
                <label htmlFor="stacked" className="text-sm font-medium text-slate-700">
                  Stacked
                </label>
              </div>
            )}

            {/* Show Legend */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <input
                type="checkbox"
                id="legend"
                checked={config.chartOptions.showLegend}
                onChange={(e) => onUpdate({
                  chartOptions: { ...config.chartOptions, showLegend: e.target.checked }
                })}
                className="w-4 h-4"
              />
              <label htmlFor="legend" className="text-sm font-medium text-slate-700">
                Show Legend
              </label>
            </div>

            {/* Show Grid */}
            {['bar', 'line', 'area', 'scatter'].includes(config.chartType) && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <input
                  type="checkbox"
                  id="grid"
                  checked={config.chartOptions.showGrid}
                  onChange={(e) => onUpdate({
                    chartOptions: { ...config.chartOptions, showGrid: e.target.checked }
                  })}
                  className="w-4 h-4"
                />
                <label htmlFor="grid" className="text-sm font-medium text-slate-700">
                  Show Grid
                </label>
              </div>
            )}

            {/* Responsive */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <input
                type="checkbox"
                id="responsive"
                checked={config.chartOptions.responsive}
                onChange={(e) => onUpdate({
                  chartOptions: { ...config.chartOptions, responsive: e.target.checked }
                })}
                className="w-4 h-4"
              />
              <label htmlFor="responsive" className="text-sm font-medium text-slate-700">
                Responsive
              </label>
            </div>
          </div>

          {/* Axis Labels */}
          {['bar', 'line', 'area', 'scatter'].includes(config.chartType) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">X-Axis Label</label>
                <input
                  type="text"
                  value={config.chartOptions.xAxisLabel || ''}
                  onChange={(e) => onUpdate({
                    chartOptions: { ...config.chartOptions, xAxisLabel: e.target.value }
                  })}
                  placeholder="e.g., Month, Category"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Y-Axis Label</label>
                <input
                  type="text"
                  value={config.chartOptions.yAxisLabel || ''}
                  onChange={(e) => onUpdate({
                    chartOptions: { ...config.chartOptions, yAxisLabel: e.target.value }
                  })}
                  placeholder="e.g., Amount, Count"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Theme Colors */}
        <div className="space-y-4">
          <h3 className="font-medium text-slate-900">Theme</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Primary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.theme.primaryColor}
                  onChange={(e) => onUpdate({
                    theme: { ...config.theme, primaryColor: e.target.value }
                  })}
                  className="w-12 h-10 border border-slate-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={config.theme.primaryColor}
                  readOnly
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Background Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.theme.backgroundColor}
                  onChange={(e) => onUpdate({
                    theme: { ...config.theme, backgroundColor: e.target.value }
                  })}
                  className="w-12 h-10 border border-slate-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={config.theme.backgroundColor}
                  readOnly
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Border Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.theme.borderColor}
                  onChange={(e) => onUpdate({
                    theme: { ...config.theme, borderColor: e.target.value }
                  })}
                  className="w-12 h-10 border border-slate-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={config.theme.borderColor}
                  readOnly
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
