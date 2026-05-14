import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { invoiceApi } from '../../api/financeApi'
import { InvoiceEntity, InvoiceType, CreateInvoiceRequest } from '../../types/finance'
import { accountApi } from '../../api/crmApi'
import { Account } from '../../types/crm'
import { toast } from 'react-hot-toast'
import FinanceModuleHeader from '../../components/finance/FinanceModuleHeader'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const isValidUuid = (value: string): boolean => UUID_PATTERN.test(value)

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

export default function InvoiceForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountsLoading, setAccountsLoading] = useState(false)
  const [accountsLoadFailed, setAccountsLoadFailed] = useState(false)

  useEffect(() => {
    if (isEdit && id) loadItem()
  }, [id])

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      setAccountsLoading(true)
      setAccountsLoadFailed(false)
      const response = await accountApi.getAll(0, 200)
      setAccounts(extractPageContent<Account>(response.data))
    } catch {
      setAccounts([])
      setAccountsLoadFailed(true)
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
        setForm({
          invoiceNumber: e.invoiceNumber || '',
          soId: e.soId || '',
          accountId: e.accountId || '',
          entity: e.entity || 'AUSTRALIA',
          type: e.type || 'TAX_INVOICE',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.accountId || !form.entity || !form.type) {
      toast.error('Account, Entity, and Type are required'); return
    }
    if (!isValidUuid(form.accountId)) {
      toast.error('Please select a valid account')
      return
    }
    if (form.soId && !isValidUuid(form.soId)) {
      toast.error('Sales Order ID must be a valid UUID')
      return
    }
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
        toast.success('Invoice updated')
        navigate('/finance/invoices')
      } else {
        await invoiceApi.create(payload)
        toast.success('Invoice created')
        navigate('/finance/invoices')
      }
    } catch (error: any) { toast.error(error?.response?.data?.message || 'Failed to save invoice') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>

  return (
    <div className="space-y-6">
      <FinanceModuleHeader
        eyebrow="Invoice Workspace"
        title={isEdit ? 'Edit Invoice' : 'Create Invoice'}
        subtitle="Maintain invoice master data, entity alignment, due dates, and amount breakdowns in one structured form."
        actions={
          <button onClick={() => navigate('/finance/invoices')} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Back to Invoices
          </button>
        }
      />
      <div className="shell-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Invoice Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                <input type="text" name="invoiceNumber" value={form.invoiceNumber} onChange={handleChange} placeholder="Leave empty to auto-generate" className="pm-input text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account *</label>
                {accounts.length > 0 ? (
                  <select name="accountId" value={form.accountId} onChange={handleChange} required className="pm-select text-sm">
                    <option value="">{accountsLoading ? 'Loading accounts...' : 'Select account'}</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>{account.name} ({account.id.slice(0, 8)})</option>
                    ))}
                  </select>
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    {accountsLoading
                      ? 'Loading accounts...'
                      : accountsLoadFailed
                        ? 'Account options could not be loaded. Invoice creation is blocked until CRM accounts are available.'
                        : 'No accounts are available yet. Create an account first before creating an invoice.'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sales Order ID</label>
                <input type="text" name="soId" value={form.soId} onChange={handleChange} placeholder="Optional linked sales order UUID" className="pm-input text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entity *</label>
                <select name="entity" value={form.entity} onChange={handleChange} required className="pm-select text-sm">
                  {Object.values(InvoiceEntity).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select name="type" value={form.type} onChange={handleChange} required className="pm-select text-sm">
                  {Object.values(InvoiceType).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Dates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                <input type="date" name="issueDate" value={form.issueDate} onChange={handleChange} className="pm-input text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className="pm-input text-sm" />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Amounts</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
                <input type="number" step="0.01" name="subtotal" value={form.subtotal} onChange={handleChange} className="pm-input text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Amount</label>
                <input type="number" step="0.01" name="taxAmount" value={form.taxAmount} onChange={handleChange} className="pm-input text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                <input type="number" step="0.01" name="totalAmount" value={form.totalAmount} onChange={handleChange} className="pm-input text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <input type="text" name="currency" value={form.currency} onChange={handleChange} maxLength={3} className="pm-input text-sm" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="pm-textarea text-sm" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => navigate('/finance/invoices')} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving || (!isEdit && accounts.length === 0)} className="rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed">{saving ? 'Saving...' : isEdit ? 'Update Invoice' : 'Create Invoice'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
