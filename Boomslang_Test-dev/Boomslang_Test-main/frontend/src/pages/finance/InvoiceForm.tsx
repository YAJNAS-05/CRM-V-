import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { invoiceApi } from '../../api/financeApi'
import { InvoiceEntity, InvoiceType, CreateInvoiceRequest } from '../../types/finance'
import { accountApi } from '../../api/crmApi'
import { Account } from '../../types/crm'
import CustomFieldsPanel from '../../components/config/CustomFieldsPanel'
import { useCustomFields } from '../../hooks/useCustomFields'
import { useLayoutConfig } from '../../hooks/useLayoutConfig'
import { toast } from 'react-hot-toast'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const invoiceSchema = z.object({
  invoiceNumber: z.string().optional(),
  soId: z
    .string()
    .optional()
    .refine((v) => !v || UUID_PATTERN.test(v), { message: 'Sales Order ID must be a valid UUID' }),
  accountId: z
    .string()
    .min(1, 'Account is required')
    .refine((v) => UUID_PATTERN.test(v), { message: 'Please select a valid account' }),
  entity: z.nativeEnum(InvoiceEntity, { errorMap: () => ({ message: 'Entity is required' }) }),
  type: z.nativeEnum(InvoiceType, { errorMap: () => ({ message: 'Type is required' }) }),
  issueDate: z.string().optional(),
  dueDate: z.string().optional(),
  currency: z.string().length(3, 'Currency must be a 3-letter code').optional().or(z.literal('')),
  subtotal: z.string().optional(),
  taxAmount: z.string().optional(),
  totalAmount: z.string().optional(),
  notes: z.string().optional(),
}).refine(
  (data) => {
    if (data.issueDate && data.dueDate) {
      return new Date(data.dueDate) >= new Date(data.issueDate)
    }
    return true
  },
  { message: 'Due date must be on or after issue date', path: ['dueDate'] }
)

type FormData = z.infer<typeof invoiceSchema>

const extractEntity = <T,>(payload: unknown): T | null => {
  if (payload === null || payload === undefined) return null
  if (typeof payload !== 'object') return payload as T
  const wrapped = payload as { data?: unknown }
  return (wrapped.data ?? payload) as T
}

const extractPageContent = <T,>(payload: unknown): T[] => {
  const data = extractEntity<unknown>(payload)
  if (!data || typeof data !== 'object') return []
  const content = (data as { content?: unknown }).content
  return Array.isArray(content) ? (content as T[]) : []
}

const defaultForm: FormData = {
  invoiceNumber: '',
  soId: '',
  accountId: '',
  entity: InvoiceEntity.AUSTRALIA,
  type: InvoiceType.TAX_INVOICE,
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  currency: 'USD',
  subtotal: '',
  taxAmount: '',
  totalAmount: '',
  notes: '',
}

export default function InvoiceForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountsLoading, setAccountsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: defaultForm,
  })
  const {
    definitions: customFieldDefinitions,
    values: customFieldValues,
    setValue: setCustomFieldValue,
    isLoading: customFieldsLoading,
    save: saveCustomFields,
  } = useCustomFields({ module: 'FINANCE', entity: 'INVOICE', entityId: id })
  const { layout: invoiceLayout } = useLayoutConfig({ module: 'FINANCE', entity: 'INVOICE' })

  useEffect(() => {
    if (isEdit && id) loadItem()
  }, [id])

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      setAccountsLoading(true)
      const response = await accountApi.getAll(0, 200)
      setAccounts(extractPageContent<Account>(response.data))
    } catch {
      setAccounts([])
    } finally {
      setAccountsLoading(false)
    }
  }

  const loadItem = async () => {
    try {
      setLoading(true)
      const response = await invoiceApi.getById(id!)
      const e = extractEntity<any>(response.data)
      if (e) {
        reset({
          invoiceNumber: e.invoiceNumber || '',
          soId: e.soId || '',
          accountId: e.accountId || '',
          entity: e.entity || InvoiceEntity.AUSTRALIA,
          type: e.type || InvoiceType.TAX_INVOICE,
          issueDate: e.issueDate || '',
          dueDate: e.dueDate || '',
          currency: e.currency || 'USD',
          subtotal: e.subtotal?.toString() || '',
          taxAmount: e.taxAmount?.toString() || '',
          totalAmount: e.totalAmount?.toString() || '',
          notes: e.notes || '',
        })
      }
    } catch { toast.error('Failed to load invoice') }
    finally { setLoading(false) }
  }

  const onSubmit = async (form: FormData) => {
    try {
      setSaving(true)
      const payload: CreateInvoiceRequest = {
        invoiceNumber: form.invoiceNumber || '',
        accountId: form.accountId,
        entity: form.entity as InvoiceEntity,
        type: form.type as InvoiceType,
        soId: form.soId || undefined,
        issueDate: form.issueDate || undefined,
        dueDate: form.dueDate || undefined,
        currency: form.currency || undefined,
        subtotal: form.subtotal ? parseFloat(form.subtotal) : undefined,
        taxAmount: form.taxAmount ? parseFloat(form.taxAmount) : undefined,
        totalAmount: form.totalAmount ? parseFloat(form.totalAmount) : undefined,
        notes: form.notes || undefined,
      }
      if (isEdit) {
        await invoiceApi.update(id!, {
          issueDate: form.issueDate || undefined,
          dueDate: form.dueDate || undefined,
          subtotal: form.subtotal ? parseFloat(form.subtotal) : undefined,
          taxAmount: form.taxAmount ? parseFloat(form.taxAmount) : undefined,
          totalAmount: form.totalAmount ? parseFloat(form.totalAmount) : undefined,
          notes: form.notes || undefined,
        })
        try { await saveCustomFields(id) } catch { toast.error('Invoice saved, but custom fields failed to save') }
        toast.success('Invoice updated')
        navigate('/finance/invoices')
      } else {
        const response = await invoiceApi.create(payload)
        const createdId = extractEntity<{ id?: string }>(response.data)?.id
        if (createdId) {
          try { await saveCustomFields(createdId) } catch { toast.error('Invoice saved, but custom fields failed to save') }
        }
        toast.success('Invoice created')
        navigate('/finance/invoices')
      }
    } catch (error: any) { toast.error(error?.response?.data?.message || 'Failed to save invoice') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/finance/invoices')} className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Invoices
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Invoice' : 'Create New Invoice'}</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Invoice Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                <input type="text" {...register('invoiceNumber')} placeholder="Leave empty to auto-generate" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account *</label>
                {accounts.length > 0 ? (
                  <select {...register('accountId')} className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.accountId ? 'border-red-500' : 'border-gray-300'}`}>
                    <option value="">{accountsLoading ? 'Loading accounts...' : 'Select account'}</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>{account.name} ({account.id.slice(0, 8)})</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" {...register('accountId')} placeholder="Account UUID" className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.accountId ? 'border-red-500' : 'border-gray-300'}`} />
                )}
                {errors.accountId && <p className="mt-1 text-xs text-red-600">{errors.accountId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sales Order ID</label>
                <input type="text" {...register('soId')} placeholder="Optional linked sales order UUID" className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.soId ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.soId && <p className="mt-1 text-xs text-red-600">{errors.soId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entity *</label>
                <select {...register('entity')} className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.entity ? 'border-red-500' : 'border-gray-300'}`}>
                  {Object.values(InvoiceEntity).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.entity && <p className="mt-1 text-xs text-red-600">{errors.entity.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select {...register('type')} className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.type ? 'border-red-500' : 'border-gray-300'}`}>
                  {Object.values(InvoiceType).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
                {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type.message}</p>}
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Dates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                <input type="date" {...register('issueDate')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" {...register('dueDate')} className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.dueDate ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.dueDate && <p className="mt-1 text-xs text-red-600">{errors.dueDate.message}</p>}
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Amounts</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
                <input type="number" step="0.01" min="0" {...register('subtotal')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Amount</label>
                <input type="number" step="0.01" min="0" {...register('taxAmount')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                <input type="number" step="0.01" min="0" {...register('totalAmount')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <input type="text" {...register('currency')} maxLength={3} className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.currency ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.currency && <p className="mt-1 text-xs text-red-600">{errors.currency.message}</p>}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea {...register('notes')} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <CustomFieldsPanel
            title="Custom Invoice Fields"
            definitions={customFieldDefinitions}
            values={customFieldValues}
            onChange={setCustomFieldValue}
            isLoading={customFieldsLoading}
            layout={invoiceLayout}
          />
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => navigate('/finance/invoices')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : isEdit ? 'Update Invoice' : 'Create Invoice'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
