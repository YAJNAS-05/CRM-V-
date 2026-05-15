// src/components/dashboard/DashboardSettings.tsx
import { useState } from 'react'
import { Dashboard } from '@/api/dashboardApi'
import { dashboardApi } from '@/api/dashboardApi'
import { toast } from 'sonner'

interface DashboardSettingsProps {
  dashboard: Dashboard
  dashboardId: number
  onClose: () => void
}

export const DashboardSettings = ({
  dashboard,
  dashboardId,
  onClose,
}: DashboardSettingsProps) => {
  const [name, setName] = useState(dashboard.dashboardName)
  const [description, setDescription] = useState(dashboard.description || '')
  const [gridColumns, setGridColumns] = useState(String(dashboard.gridColumns || 12))
  const [isShared, setIsShared] = useState(dashboard.isShared || false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await dashboardApi.updateDashboard(dashboardId, {
        dashboardName: name,
        description: description || undefined,
        isShared,
      })
      toast.success('Dashboard settings updated')
      onClose()
    } catch (err) {
      toast.error('Failed to update dashboard')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">Dashboard Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter dashboard name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="gridColumns" className="block text-sm font-medium mb-1">Grid Columns</label>
        <select
          id="gridColumns"
          value={gridColumns}
          onChange={(e) => setGridColumns(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="6">6 columns</option>
          <option value="12">12 columns (default)</option>
          <option value="16">16 columns</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="shared"
          type="checkbox"
          checked={isShared}
          onChange={(e) => setIsShared(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600"
        />
        <label htmlFor="shared" className="cursor-pointer text-sm">
          Share this dashboard with other users
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}

export default DashboardSettings
