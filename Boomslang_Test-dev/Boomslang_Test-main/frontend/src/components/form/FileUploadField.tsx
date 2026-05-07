import React, { useRef, useState } from 'react'

interface FileUploadFieldProps {
  label?: string
  name?: string
  value?: string
  onChange: (url: string) => void
  accept?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  hint?: string
}

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|svg|bmp)(\?.*)?$/i

function isImageUrl(url: string): boolean {
  return IMAGE_EXTENSIONS.test(url)
}

function getFilenameFromUrl(url: string): string {
  try {
    const parts = url.split('/')
    const last = parts[parts.length - 1].split('?')[0]
    return decodeURIComponent(last) || url
  } catch {
    return url
  }
}

/**
 * FileUploadField — reusable file URL input with preview.
 *
 * The backend stores file references as URLs (S3 pre-signed URLs or direct links).
 * This component lets users:
 *  - Paste / type a URL directly
 *  - Select a local file to get its name (URL must be provided separately or
 *    via a backend pre-signed URL endpoint once available)
 */
const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  name,
  value = '',
  onChange,
  accept,
  placeholder = 'https://storage.example.com/file.pdf',
  disabled = false,
  error,
  hint,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [urlInputMode, setUrlInputMode] = useState(!value)
  const [dragging, setDragging] = useState(false)

  const hasValue = Boolean(value)
  const isImage = hasValue && isImageUrl(value)
  const displayName = hasValue ? getFilenameFromUrl(value) : ''

  const handleFileSelect = (file: File) => {
    // In the absence of a backend upload endpoint, we use an object URL for
    // in-session preview. The caller should replace this with a real S3 URL
    // after uploading through a backend presigned URL endpoint.
    const objectUrl = URL.createObjectURL(file)
    onChange(objectUrl)
    setUrlInputMode(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
    // Reset so same file can be re-selected
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    if (disabled) return
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleClear = () => {
    onChange('')
    setUrlInputMode(true)
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {hasValue && !urlInputMode ? (
        /* Preview card */
        <div className="relative rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
          {isImage ? (
            <div className="relative h-40 flex items-center justify-center bg-white">
              <img
                src={value}
                alt={displayName}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">{displayName}</p>
                <p className="text-xs text-gray-400 truncate">{value}</p>
              </div>
            </div>
          )}

          {/* Actions overlay */}
          <div className="absolute top-2 right-2 flex gap-1.5">
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white/90 hover:bg-white border border-gray-200 rounded-md shadow-sm text-gray-600 hover:text-blue-600 transition"
              title="Open file"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open
            </a>
            {!disabled && (
              <>
                <button
                  type="button"
                  onClick={() => setUrlInputMode(true)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white/90 hover:bg-white border border-gray-200 rounded-md shadow-sm text-gray-600 hover:text-indigo-600 transition"
                  title="Edit URL"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white/90 hover:bg-white border border-gray-200 rounded-md shadow-sm text-red-500 hover:text-red-700 transition"
                  title="Remove file"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Remove
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Upload zone + URL input */
        <div className="space-y-2">
          {!disabled && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer transition
                ${dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/30'}`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Click to select or drag & drop</p>
                <p className="text-xs text-gray-400 mt-0.5">{accept ? accept.replace(/,/g, ', ') : 'Any file type'}</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={handleInputChange}
                name={name}
                disabled={disabled}
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or paste URL</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <input
            type="url"
            value={value}
            onChange={handleUrlChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition
              ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}
              ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          />

          {value && (
            <button
              type="button"
              onClick={() => setUrlInputMode(false)}
              className="text-xs text-blue-600 hover:underline"
            >
              Show preview →
            </button>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

export default FileUploadField
