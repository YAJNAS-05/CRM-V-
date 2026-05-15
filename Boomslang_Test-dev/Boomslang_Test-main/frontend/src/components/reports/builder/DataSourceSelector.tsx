import { ReportConfig } from '../EnterpriseReportBuilder'

export const DataSourceSelector = ({ config, onUpdate, modules, dataSources }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-6">Data Source Configuration</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Report Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Report Name *</label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Enter report name"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <input
              type="text"
              value={config.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Enter report description"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Module */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Module *</label>
            <select
              value={config.module}
              onChange={(e) => onUpdate({ module: e.target.value, dataSource: '' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {modules.map((m: string) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Data Source */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Data Source *</label>
            <select
              value={config.dataSource}
              onChange={(e) => onUpdate({ dataSource: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select data source...</option>
              {dataSources.map((ds: string) => (
                <option key={ds} value={ds}>{ds}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Selected:</strong> {config.module} → {config.dataSource || 'Not selected'}
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Next, select columns from this data source to display in your report.
          </p>
        </div>
      </div>
    </div>
  )
}
