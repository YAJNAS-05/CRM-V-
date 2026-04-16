import { useEffect, useMemo, useRef, useState } from 'react'

export interface LookupOption {
  value: string
  label: string
  meta?: string
}

interface SearchableLookupSelectProps {
  label: string
  name: string
  value: string
  options: LookupOption[]
  onChange: (name: string, value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  helperText?: string
  noResultsText?: string
}

export default function SearchableLookupSelect({
  label,
  name,
  value,
  options,
  onChange,
  placeholder = 'Type to search...',
  required = false,
  disabled = false,
  helperText,
  noResultsText = 'No matching records',
}: SearchableLookupSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  )

  useEffect(() => {
    setQuery(selectedOption?.label || '')
  }, [selectedOption])

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const filteredOptions = useMemo(() => {
    if (!query.trim()) {
      return options.slice(0, 50)
    }

    const normalized = query.trim().toLowerCase()
    return options
      .filter((option) => {
        const combinedText = `${option.label} ${option.meta || ''}`.toLowerCase()
        return combinedText.includes(normalized)
      })
      .slice(0, 50)
  }, [options, query])

  const handleSelect = (option: LookupOption) => {
    onChange(name, option.value)
    setQuery(option.label)
    setIsOpen(false)
  }

  const handleClear = () => {
    onChange(name, '')
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required ? ' *' : ''}
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        />

        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
          {value ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="text-gray-500 hover:text-gray-700"
            aria-label={`Toggle ${label} options`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {helperText ? <p className="text-xs text-gray-500 mt-1">{helperText}</p> : null}

      {isOpen ? (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">{noResultsText}</div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50"
              >
                <div className="font-medium text-gray-800">{option.label}</div>
                {option.meta ? <div className="text-xs text-gray-500">{option.meta}</div> : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}
