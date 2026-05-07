import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children: React.ReactNode
  footer?: React.ReactNode
  closeOnBackdrop?: boolean
  hideCloseButton?: boolean
}

const SIZE_CLASSES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-5xl',
}

/**
 * Reusable Modal / Dialog component (G-09)
 *
 * Usage:
 *   <Modal open={show} onClose={() => setShow(false)} title="Confirm Action">
 *     <p>Are you sure?</p>
 *   </Modal>
 */
const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  closeOnBackdrop = true,
  hideCloseButton = false,
}) => {
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-desc' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`relative w-full ${SIZE_CLASSES[size]} bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] focus:outline-none`}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || !hideCloseButton) && (
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
            <div>
              {title && <h2 id="modal-title" className="text-lg font-bold text-gray-900">{title}</h2>}
              {description && <p id="modal-desc" className="text-sm text-gray-500 mt-0.5">{description}</p>}
            </div>
            {!hideCloseButton && (
              <button
                onClick={onClose}
                className="ml-4 text-gray-400 hover:text-gray-700 transition rounded-lg p-1 -mr-1"
                aria-label="Close dialog"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export default Modal
