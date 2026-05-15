// src/components/dashboard/WidgetCard.tsx
import { useState } from 'react'
import { DashboardWidget } from '@/api/dashboardApi'
import { MoreVertical, Trash2, Eye, EyeOff, Lock, LockOpen } from 'lucide-react'
import DynamicWidgetRenderer from './DynamicWidgetRenderer'

interface WidgetCardProps {
  widget: DashboardWidget
  onDelete: (widgetId: number) => void
  onToggleVisibility: (widget: DashboardWidget) => void
  onToggleLock: (widget: DashboardWidget) => void
}

export const WidgetCard = ({
  widget,
  onDelete,
  onToggleVisibility,
  onToggleLock,
}: WidgetCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      className="h-full flex flex-col border-l-4 hover:shadow-lg transition-shadow bg-white rounded-lg"
      style={{
        borderLeftColor: widget.backgroundColor || '#3b82f6',
        backgroundColor: widget.backgroundColor ? `${widget.backgroundColor}15` : '#fff',
      }}
    >
      <div className="flex flex-row items-start justify-between space-y-0 pb-3 p-4 border-b">
        <div className="flex-1">
          <h3 className="text-base font-semibold truncate">
            {widget.widgetTitle}
          </h3>
          {widget.description && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              {widget.description}
            </p>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:bg-gray-100 rounded"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
              <button
                onClick={() => {
                  onToggleVisibility(widget)
                  setMenuOpen(false)
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
              >
                {widget.isVisible ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Show
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  onToggleLock(widget)
                  setMenuOpen(false)
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm border-t"
              >
                {widget.isLocked ? (
                  <>
                    <LockOpen className="h-4 w-4" />
                    Unlock
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Lock
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  widget.widgetId && onDelete(widget.widgetId)
                  setMenuOpen(false)
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-sm text-red-600 border-t"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <DynamicWidgetRenderer widget={widget} />
      </div>

      {widget.lastRefreshedAt && (
        <div className="text-xs text-gray-500 px-4 py-2 border-t">
          Last updated: {new Date(widget.lastRefreshedAt).toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}

export default WidgetCard
