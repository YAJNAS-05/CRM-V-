import React from 'react'

export interface BulkAction {
  label: string
  icon?: React.ReactNode
  variant?: 'default' | 'danger'
  onClick: () => void
}

interface BulkActionBarProps {
  count: number
  onClear: () => void
  actions: BulkAction[]
}

/**
 * Floating bulk-action bar that appears when items are selected.
 * Place anywhere in the page — it renders as a fixed bottom bar.
 */
const BulkActionBar: React.FC<BulkActionBarProps> = ({ count, onClear, actions }) => {
  if (count === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-gray-900 text-white rounded-2xl shadow-2xl px-4 py-3 min-w-[340px] max-w-[90vw]">
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-xs font-black shrink-0">
        {count}
      </span>
      <span className="text-sm font-medium flex-1">
        {count === 1 ? '1 item selected' : `${count} items selected`}
      </span>
      <div className="flex items-center gap-2">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              action.variant === 'danger'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
        <button
          onClick={onClear}
          className="ml-1 text-gray-400 hover:text-white text-xs font-semibold px-2 py-1"
        >
          Clear
        </button>
      </div>
    </div>
  )
}

export default BulkActionBar
