import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { settingsApi } from '../../api/erpApi'
import { toast } from 'react-hot-toast'

interface NumberingPattern {
  id?: number
  documentType: string
  prefix: string
  pattern: string
  sequenceWidth: number
  nextSequence: number
  description?: string
  example?: string
}

const PATTERN_HELP = `
Pattern placeholders:
• {PREFIX} - Document prefix (e.g., SO)
• {YYYY} - Current year (e.g., 2026)
• {MM} - Current month (e.g., 06)
• {DD} - Current day (e.g., 07)
• {NNNNNN} - Sequence number (e.g., 000001, 0001, etc.)

Examples:
• SO-{YYYY}-{NNNNNN} → SO-2026-000001
• {PREFIX}-{MM}/{NNNNNN} → SO-06/001
• {PREFIX}{YYYY}{MM}{NNNNNN} → SO202606001
`

export default function SalesOrderSettingsPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pattern, setPattern] = useState<NumberingPattern>({
    documentType: 'SALES_ORDER',
    prefix: 'SO',
    pattern: '{PREFIX}-{YYYY}-{NNNNNN}',
    sequenceWidth: 6,
    nextSequence: 1,
    description: 'Sales Order numbering pattern',
  })
  const [preview, setPreview] = useState('')
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    loadPattern()
  }, [])

  const loadPattern = async () => {
    try {
      setLoading(true)
      const response = await settingsApi.getNumberingPattern('SALES_ORDER')
      if (response.data.success && response.data.data) {
        setPattern(response.data.data)
        setPreview(response.data.data.example || '')
      }
    } catch (error: any) {
      // Pattern might not exist yet, use defaults
      generatePreview()
    } finally {
      setLoading(false)
    }
  }

  const generatePreview = async () => {
    try {
      const response = await settingsApi.previewNumberingPattern('SALES_ORDER', pattern)
      if (response.data.success) {
        setPreview(response.data.data)
      }
    } catch (error: any) {
      toast.error('Failed to generate preview')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const updatedPattern = {
      ...pattern,
      [name]: name === 'sequenceWidth' || name === 'nextSequence' ? parseInt(value) : value,
    }
    setPattern(updatedPattern)
    
    // Auto-generate preview on change
    if (name === 'pattern' || name === 'prefix' || name === 'sequenceWidth' || name === 'nextSequence') {
      try {
        settingsApi.previewNumberingPattern('SALES_ORDER', updatedPattern).then(res => {
          if (res.data.success) {
            setPreview(res.data.data)
          }
        })
      } catch {}
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await settingsApi.saveNumberingPattern('SALES_ORDER', pattern)
      if (response.data.success) {
        toast.success('SO numbering pattern saved successfully')
        setPattern(response.data.data)
        setPreview(response.data.data.example || '')
      } else {
        toast.error(response.data.message || 'Failed to save pattern')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save numbering pattern')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/erp/sales-orders')} className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Sales Orders
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-2">SO Numbering Settings</h1>
        <p className="text-gray-600 mb-6">Configure how Sales Order numbers are generated with custom patterns and sequences</p>

        <div className="space-y-6">
          {/* Pattern Configuration */}
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Numbering Pattern</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prefix</label>
                <input
                  type="text"
                  name="prefix"
                  value={pattern.prefix}
                  onChange={handleChange}
                  maxLength={100}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="SO"
                />
                <p className="text-xs text-gray-500 mt-1">Document prefix (e.g., SO for Sales Order)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sequence Width</label>
                <input
                  type="number"
                  name="sequenceWidth"
                  value={pattern.sequenceWidth}
                  onChange={handleChange}
                  min="1"
                  max="20"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Number of digits for sequence (e.g., 6 → 000001)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Sequence</label>
                <input
                  type="number"
                  name="nextSequence"
                  value={pattern.nextSequence}
                  onChange={handleChange}
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Next number to be used in sequence</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  name="description"
                  value={pattern.description || ''}
                  onChange={handleChange}
                  maxLength={500}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Description of this numbering pattern"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pattern Format</label>
              <textarea
                name="pattern"
                value={pattern.pattern}
                onChange={handleChange}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="{PREFIX}-{YYYY}-{NNNNNN}"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use placeholders: {'{'}PREFIX{'}'}, {'{'}YYYY{'}'}, {'{'}MM{'}'}, {'{'}DD{'}'}, {'{'}NNNNNN{'}'}
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
            <h2 className="text-lg font-semibold mb-3 text-green-900">Preview</h2>
            <div className="bg-white border border-green-300 rounded p-4">
              <p className="text-sm text-gray-600 mb-2">Next Sales Order number will be:</p>
              <p className="text-3xl font-bold text-green-600 font-mono">{preview}</p>
            </div>
          </div>

          {/* Help */}
          <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center text-blue-600 hover:text-blue-800 font-semibold"
            >
              <svg className={`w-5 h-5 mr-2 transform ${showHelp ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Pattern Help & Examples
            </button>
            {showHelp && (
              <div className="mt-4 text-sm text-gray-700 bg-white p-4 rounded border border-blue-200">
                <pre className="whitespace-pre-wrap font-mono text-xs">{PATTERN_HELP}</pre>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/erp/sales-orders')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Pattern'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
