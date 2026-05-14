import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { sparePartApi, supplierApi } from '../../api/erpApi'
import { Supplier } from '../../types/erp'
import { toast } from 'react-hot-toast'
import SearchableLookupSelect from '../../components/form/SearchableLookupSelect'

const SPARE_PART_CATEGORIES = ['Probes', 'Injectors', 'Coils', 'CR/DR']

const MANUFACTURERS = ['GE', 'Siemens', 'Philips', 'Toshiba', 'Hitachi', 'Konica', 'Canon', 'Fujifilm', 'Other']

const LOCATIONS = ['Australia', 'USA', 'Japan', 'Germany', 'UK', 'India', 'Other']

interface FormData {
  partNumber: string
  name: string
  description: string
  category: string
  manufacturer: string
  locationCountry: string
  yearOfManufacture: string
  compatibleModels: string
  stockQty: string
  reorderPoint: string
  unitCost: string
  currency: string
  supplierId: string
  warehouseLocation: string
}

const defaultForm: FormData = {
  partNumber: '',
  name: '',
  description: '',
  category: '',
  manufacturer: '',
  locationCountry: '',
  yearOfManufacture: '',
  compatibleModels: '',
  stockQty: '',
  reorderPoint: '',
  unitCost: '',
  currency: 'USD',
  supplierId: '',
  warehouseLocation: '',
}

export default function SparePartForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  useEffect(() => {
    loadSuppliers()
  }, [])

  useEffect(() => {
    if (isEdit && id) loadItem()
  }, [id, isEdit])

  const loadSuppliers = async () => {
    try {
      setLookupLoading(true)
      const response = await supplierApi.getAll(0, 200)
      setSuppliers(response.data?.data?.content || [])
    } catch {
      toast.error('Failed to load suppliers')
    } finally {
      setLookupLoading(false)
    }
  }

  const loadItem = async () => {
    try {
      setLoading(true)
      const response = await sparePartApi.getById(id!)
      const d = response.data
      if (d.success && d.data) {
        const e = d.data
        setForm({
          partNumber: e.partNumber || '',
          name: e.name || '',
          description: e.description || '',
          category: e.category || '',
          manufacturer: e.manufacturer || '',
          locationCountry: e.locationCountry || '',
          yearOfManufacture: e.yearOfManufacture?.toString() || '',
          compatibleModels: e.compatibleModels?.join(', ') || '',
          stockQty: e.stockQty?.toString() || '',
          reorderPoint: e.reorderPoint?.toString() || '',
          unitCost: e.unitCost?.toString() || '',
          currency: e.currency || 'USD',
          supplierId: e.supplierId || '',
          warehouseLocation: e.warehouseLocation || '',
        })
      }
    } catch { toast.error('Failed to load spare part') }
    finally { setLoading(false) }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleLookupChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const supplierOptions = useMemo(
    () =>
      suppliers.map((supplier) => ({
        value: supplier.id,
        label: supplier.companyName,
        meta: [supplier.country, supplier.paymentTerms].filter(Boolean).join(' | ') || undefined,
      })),
    [suppliers]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.partNumber || !form.name || !form.category) { toast.error('Part Number, Name, and Category are required'); return }
    try {
      setSaving(true)
      const payload = {
        ...form,
        compatibleModels: form.compatibleModels ? form.compatibleModels.split(',').map(s => s.trim()).filter(Boolean) : [],
        stockQty: form.stockQty ? parseInt(form.stockQty) : null,
        reorderPoint: form.reorderPoint ? parseInt(form.reorderPoint) : null,
        unitCost: form.unitCost ? parseFloat(form.unitCost) : null,
        yearOfManufacture: form.yearOfManufacture ? parseInt(form.yearOfManufacture) : null,
        supplierId: form.supplierId || null,
      }
      if (isEdit) {
        const response = await sparePartApi.update(id!, payload)
        if (response.data.success) { toast.success('Spare part updated'); navigate(`/erp/spareparts`) }
      } else {
        const response = await sparePartApi.create(payload)
        if (response.data.success) { toast.success('Spare part created'); navigate('/erp/spareparts') }
      }
    } catch (error: any) { toast.error(error?.response?.data?.message || 'Failed to save spare part') }
    finally { setSaving(false) }
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  const renderCategoryFields = () => {
    if (!form.category) return null

    switch (form.category) {
      case 'Probes':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className={labelClass}>Compatible Models (comma-separated)</label>
              <input type="text" name="compatibleModels" value={form.compatibleModels} onChange={handleChange}
                className={inputClass} placeholder="e.g. GE Vivid E9, GE Vivid E95" />
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={inputClass}
                placeholder="e.g. 6Tc TEE probe for GE Vivid E9, Manufactured: August 2013, Location: Australia (EX1220)" />
            </div>
          </div>
        )

      case 'Injectors':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className={labelClass}>Compatible Models (comma-separated)</label>
              <input type="text" name="compatibleModels" value={form.compatibleModels} onChange={handleChange}
                className={inputClass} placeholder="e.g. CT Scanner Model X, CT Scanner Model Y" />
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={inputClass}
                placeholder="Injector specifications and details..." />
            </div>
          </div>
        )

      case 'Coils':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className={labelClass}>Compatible Models (comma-separated)</label>
              <input type="text" name="compatibleModels" value={form.compatibleModels} onChange={handleChange}
                className={inputClass} placeholder="e.g. Siemens Essenza 1.5T, Siemens Aera" />
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={inputClass}
                placeholder="e.g. 4Ch FlexLarge coil, compatible with Siemens MRI systems" />
            </div>
          </div>
        )

      case 'CR/DR':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className={labelClass}>Compatible Models (comma-separated)</label>
              <input type="text" name="compatibleModels" value={form.compatibleModels} onChange={handleChange}
                className={inputClass} placeholder="e.g. Konica Regius 110, Fujifilm FCR" />
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={inputClass}
                placeholder="CR/DR component details..." />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/erp/spareparts')} className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm font-medium">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Spare Parts
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">{isEdit ? 'Edit Spare Part' : 'Add New Spare Part'}</h1>
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Step 1: Category Selection */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
            <h2 className="text-lg font-semibold mb-1 text-indigo-900">Step 1 — Select Spare Part Category</h2>
            <p className="text-sm text-indigo-600 mb-4">Choose the category first. Additional fields will appear based on your selection.</p>
            <select name="category" value={form.category} onChange={handleChange} required
              className="w-full md:w-1/2 border border-indigo-300 rounded-lg px-3 py-2.5 text-base font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
              <option value="">-- Select Category --</option>
              {SPARE_PART_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {form.category && (
            <>
              {/* Step 2: Product Information */}
              <div>
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Step 2 — Part Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Part Number *</label>
                    <input type="text" name="partNumber" value={form.partNumber} onChange={handleChange} required className={inputClass} placeholder="e.g. SP-4553" />
                  </div>
                  <div>
                    <label className={labelClass}>Name *</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} required className={inputClass} placeholder="e.g. 6Tc TEE Probe" />
                  </div>
                  <div>
                    <label className={labelClass}>Manufacturer</label>
                    <select name="manufacturer" value={form.manufacturer} onChange={handleChange} className={inputClass}>
                      <option value="">-- Select Manufacturer --</option>
                      {MANUFACTURERS.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Location</label>
                    <select name="locationCountry" value={form.locationCountry} onChange={handleChange} className={inputClass}>
                      <option value="">-- Select Location --</option>
                      {LOCATIONS.map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Year of Manufacture</label>
                    <input type="number" name="yearOfManufacture" value={form.yearOfManufacture} onChange={handleChange}
                      className={inputClass} placeholder="e.g. 2013" min="1970" max="2030" />
                  </div>
                </div>
              </div>

              {/* Step 3: Category-specific fields */}
              <div>
                <h2 className="text-lg font-semibold mb-1 text-gray-700">Step 3 — {form.category} Details</h2>
                <p className="text-sm text-gray-500 mb-4">Fields specific to <span className="font-medium text-gray-700">{form.category}</span></p>
                {renderCategoryFields()}
              </div>

              {/* Step 4: Inventory & Pricing */}
              <div>
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Step 4 — Inventory & Pricing</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Stock Quantity</label>
                    <input type="number" name="stockQty" value={form.stockQty} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Reorder Point</label>
                    <input type="number" name="reorderPoint" value={form.reorderPoint} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Warehouse Location</label>
                    <select name="warehouseLocation" value={form.warehouseLocation} onChange={handleChange} className={inputClass}>
                      <option value="">-- Select Warehouse Location --</option>
                      {LOCATIONS.map((location) => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Unit Cost</label>
                    <input type="number" step="0.01" name="unitCost" value={form.unitCost} onChange={handleChange} className={inputClass} placeholder="0.00" />
                  </div>
                  <div>
                    <label className={labelClass}>Currency</label>
                    <select name="currency" value={form.currency} onChange={handleChange} className={inputClass}>
                      <option value="USD">USD</option>
                      <option value="AUD">AUD</option>
                      <option value="EUR">EUR</option>
                      <option value="JPY">JPY</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <SearchableLookupSelect
                      label="Supplier"
                      name="supplierId"
                      value={form.supplierId}
                      options={supplierOptions}
                      onChange={handleLookupChange}
                      disabled={lookupLoading}
                      placeholder="Search supplier by company name"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4 border-t">
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition">
                  {saving ? 'Saving...' : isEdit ? 'Update Spare Part' : 'Create Spare Part'}
                </button>
                <button type="button" onClick={() => navigate('/erp/spareparts')}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition">
                  Cancel
                </button>
              </div>
            </>
          )}

          {!form.category && (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <p className="text-lg font-medium">Select a spare part category above to begin</p>
              <p className="text-sm mt-1">The form fields will appear based on your selection</p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
