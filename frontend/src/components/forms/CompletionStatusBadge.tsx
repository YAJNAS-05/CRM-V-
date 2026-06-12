import React from 'react'
import type { FieldCompletionStatus } from '@/lib/formCompletion'

interface CompletionStatusBadgeProps {
  status: FieldCompletionStatus
  filled?: number
  total?: number
  className?: string
}

const CompletionStatusBadge: React.FC<CompletionStatusBadgeProps> = ({
  status,
  filled,
  total,
  className = '',
}) => {
  const isComplete = status === 'COMPLETED'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isComplete ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
      } ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-amber-500'}`}
        aria-hidden
      />
      {isComplete ? 'Completed' : 'Pending'}
      {!isComplete && filled !== undefined && total !== undefined ? (
        <span className="font-medium text-amber-700/80">
          ({filled}/{total})
        </span>
      ) : null}
    </span>
  )
}

export default CompletionStatusBadge
