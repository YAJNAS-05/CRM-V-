import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning'
import { invoiceApi } from '../../api/financeApi'
import { InvoiceEntity, InvoiceType, CreateInvoiceRequest } from '../../types/finance'
import { toast } from 'react-hot-toast'

interface FormData {
  invoiceNumber: string
  soId: string
  accountId: string
  entity: string
  type: string
  issueDate: string
  dueDate: string
  currency: string
  subtotal: string
  taxAmount: string
  totalAmount: string
  notes: string
}

const defaultForm: FormData = {
  invoiceNumber: '',
  soId: '',
  accountId: '',
  entity: 'AUSTRALIA',
  type: 'TAX_INVOICE',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  currency: 'USD',
  subtotal: '',
  taxAmount: '',
  totalAmount: '',
  notes: '',
}

/**
 * Enhanced Invoice Form with unsaved changes warning support.
 * 
 * Features:
 * - Tracks form modifications (isDirty state)
 * - Warns user before navigation away from modified form
 * - Shows browser alert on tab close/refresh if unsaved changes
 * - React Router navigation blocker for route changes
 */
export default function InvoiceFormWithDirtyTracking() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [originalForm, setOriginalForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Track if form is dirty (has unsaved changes)
  const isDirty = JSON.stringify(form) !== JSON.stringify(originalForm)

  // Apply unsaved changes warning hook
  const blocker = useUnsavedChangesWarning(isDirty)

  useEffect(() => {
    if (isEdit && id) loadItem()
  }, [id])

  const loadItem = async () => {
    try {
      setLoading(true)
      const response = await invoiceApi.getById(id!)
      const invoice = response.data?.data
      if (!invoice) {
        toast.error('Invoice not found')
        navigate('/finance/invoices')
        return
      }
      const formData: FormData = {
        invoiceNumber: invoice.invoiceNumber || '',
        soId: invoice.soId || '',
        accountId: invoice.accountId || '',
        entity: invoice.entity || 'AUSTRALIA',
        type: invoice.type || 'TAX_INVOICE',
        issueDate: invoice.issueDate ? new Date(invoice.issueDate).toISOString().split('T')[0] : '',
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
        currency: invoice.currency || 'USD',
        subtotal: invoice.subtotal?.toString() || '',
        taxAmount: invoice.taxAmount?.toString() || '',
        totalAmount: invoice.totalAmount?.toString() || '',
        notes: invoice.notes || '',
      }
      setForm(formData)
      setOriginalForm(formData)
    } catch (error: any) {
      toast.error('Failed to load invoice')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isDirty) {
      return
    }

    try {
      setSaving(true)
      
      const payload: CreateInvoiceRequest = {
        invoiceNumber: form.invoiceNumber,
        soId: form.soId,
        accountId: form.accountId,
        entity: form.entity as InvoiceEntity,
        type: form.type as InvoiceType,
        issueDate: form.issueDate,
        dueDate: form.dueDate || undefined,
        currency: form.currency,
        subtotal: parseFloat(form.subtotal),
        taxAmount: parseFloat(form.taxAmount),
        totalAmount: parseFloat(form.totalAmount),
        notes: form.notes,
      }

      if (isEdit && id) {
        await invoiceApi.update(id, payload)
      } else {
        await invoiceApi.create(payload)
      }

      // Mark form as clean after successful save
      setOriginalForm(form)
      toast.success(isEdit ? 'Invoice updated successfully' : 'Invoice created successfully')
      navigate('/finance/invoices')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save invoice')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?')
      if (!confirmed) return
    }
    navigate('/finance/invoices')
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-6">
          {isEdit ? 'Edit Invoice' : 'Create Invoice'}
        </h1>

        {isDirty && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
            ⚠️ You have unsaved changes. Don't forget to save before leaving!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
            <input
              type="text"
              name="invoiceNumber"
              value={form.invoiceNumber}
              onChange={handleInputChange}
              placeholder="Auto-generated if left blank"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Entity</label>
              <select
                name="entity"
                value={form.entity}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="AUSTRALIA">Australia</option>
                <option value="USA">USA</option>
                <option value="JAPAN">Japan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="TAX_INVOICE">Tax Invoice</option>
                <option value="CREDIT_NOTE">Credit Note</option>
                <option value="PROFORMA">Proforma</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Issue Date</label>
              <input
                type="date"
                name="issueDate"
                value={form.issueDate}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !isDirty}
              className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Invoice'}
            </button>
          </div>
        </form>
      </div>

      {/* Navigation Blocker Modal (optional - show custom modal instead of browser default) */}
      {blocker.state === 'blocked' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h2 className="text-xl font-bold mb-4">Unsaved Changes</h2>
            <p className="text-gray-600 mb-6">
              You have unsaved changes. Do you want to leave without saving?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => blocker.proceed?.()}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md"
              >
                Leave Without Saving
              </button>
              <button
                onClick={() => blocker.reset?.()}
                className="px-4 py-2 bg-gray-300 text-gray-800 hover:bg-gray-400 rounded-md"
              >
                Stay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
