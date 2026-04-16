import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { equipmentApi } from '../../api/erpApi'
import { toast } from 'react-hot-toast'

const EQUIPMENT_CATEGORIES = [
  'CT', 'MRI', 'Ultrasound', 'Cath/Angio Lab', 'Mammography',
  'Molecular Imaging', 'X-Ray', 'C-Arm', 'CR/DR'
]

const EQUIPMENT_STATUSES = [
  'IN_STOCK', 'IN_WAREHOUSE', 'RESERVED', 'SOLD', 'RENTED', 'UNDER_MAINTENANCE', 'DECOMMISSIONED'
]

const MANUFACTURERS = ['Siemens', 'GE', 'Philips', 'Toshiba', 'Hitachi', 'Konica', 'Hologic', 'Canon', 'Fujifilm', 'Other']

const LOCATIONS = ['Australia', 'USA', 'Japan', 'Germany', 'UK', 'India', 'Other']
const SLICE_CONFIG_OPTIONS = ['4 Slice', '16 Slice', '32 Slice', '64 Slice', '128 Slice', '256 Slice', '320 Slice']

interface FormData {
  internalCode: string
  make: string
  model: string
  serialNumber: string
  category: string
  sliceConfig: string
  fieldStrength: string
  conditionGrade: string
  status: string
  warehouseLocation: string
  acquisitionCost: string
  acquisitionCurrency: string
  askingPrice: string
  askingCurrency: string
  yearOfManufacture: string
  hoursOfUse: string
  tgaCompliant: boolean
  ceMarked: boolean
  fdaCleared: boolean
  locationCountry: string
  software: string
  softwareVersion: string
  tubeType: string
  installedOptions: string
  detectorSize: string
  tubeReplaced: string
  tubeScanSeconds: string
  numRxChannels: string
  coils: string
  choiceOfProbes: string
  tubeManufactured: string
  flatDetectorManufactured: string
  notes: string
}

const defaultForm: FormData = {
  internalCode: '',
  make: '',
  model: '',
  serialNumber: '',
  category: '',
  sliceConfig: '',
  fieldStrength: '',
  conditionGrade: '',
  status: 'IN_STOCK',
  warehouseLocation: '',
  acquisitionCost: '',
  acquisitionCurrency: 'USD',
  askingPrice: '',
  askingCurrency: 'USD',
  yearOfManufacture: '',
  hoursOfUse: '',
  tgaCompliant: false,
  ceMarked: false,
  fdaCleared: false,
  locationCountry: '',
  software: '',
  softwareVersion: '',
  tubeType: '',
  installedOptions: '',
  detectorSize: '',
  tubeReplaced: '',
  tubeScanSeconds: '',
  numRxChannels: '',
  coils: '',
  choiceOfProbes: '',
  tubeManufactured: '',
  flatDetectorManufactured: '',
  notes: '',
}

export default function EquipmentForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit && id) {
      loadEquipment()
    }
  }, [id])

  const loadEquipment = async () => {
    try {
      setLoading(true)
      const response = await equipmentApi.getById(id!)
      if (response.success && response.data) {
        const e = response.data
        setForm({
          internalCode: e.internalCode || '',
          make: e.make || '',
          model: e.model || '',
          serialNumber: e.serialNumber || '',
          category: e.category || '',
          sliceConfig: e.sliceConfig || '',
          fieldStrength: e.fieldStrength || '',
          conditionGrade: e.conditionGrade || '',
          status: e.status || 'IN_STOCK',
          warehouseLocation: e.warehouseLocation || '',
          acquisitionCost: e.acquisitionCost?.toString() || '',
          acquisitionCurrency: e.acquisitionCurrency || 'USD',
          askingPrice: e.askingPrice?.toString() || '',
          askingCurrency: e.askingCurrency || 'USD',
          yearOfManufacture: e.yearOfManufacture?.toString() || '',
          hoursOfUse: e.hoursOfUse?.toString() || '',
          tgaCompliant: e.tgaCompliant || false,
          ceMarked: e.ceMarked || false,
          fdaCleared: e.fdaCleared || false,
          locationCountry: e.locationCountry || '',
          software: e.software || '',
          softwareVersion: e.softwareVersion || '',
          tubeType: e.tubeType || '',
          installedOptions: e.installedOptions || '',
          detectorSize: e.detectorSize || '',
          tubeReplaced: e.tubeReplaced || '',
          tubeScanSeconds: e.tubeScanSeconds?.toString() || '',
          numRxChannels: e.numRxChannels?.toString() || '',
          coils: e.coils || '',
          choiceOfProbes: e.choiceOfProbes || '',
          tubeManufactured: e.tubeManufactured || '',
          flatDetectorManufactured: e.flatDetectorManufactured || '',
          notes: e.notes || '',
        })
      }
    } catch (error) {
      toast.error('Failed to load equipment')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.internalCode || !form.make || !form.model || !form.category) {
      toast.error('SKU, Manufacturer, Model, and Category are required')
      return
    }
    try {
      setSaving(true)
      const payload = {
        ...form,
        acquisitionCost: form.acquisitionCost ? parseFloat(form.acquisitionCost) : null,
        askingPrice: form.askingPrice ? parseFloat(form.askingPrice) : null,
        yearOfManufacture: form.yearOfManufacture ? parseInt(form.yearOfManufacture) : null,
        hoursOfUse: form.hoursOfUse ? parseInt(form.hoursOfUse) : null,
        tubeScanSeconds: form.tubeScanSeconds ? parseInt(form.tubeScanSeconds) : null,
        numRxChannels: form.numRxChannels ? parseInt(form.numRxChannels) : null,
      }
      if (isEdit) {
        const response = await equipmentApi.update(id!, payload)
        if (response.success) {
          toast.success('Equipment updated successfully')
          navigate(`/erp/equipment/${id}`)
        }
      } else {
        const response = await equipmentApi.create(payload)
        if (response.success) {
          toast.success('Equipment created successfully')
          navigate('/erp/equipment')
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save equipment')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  const renderCategoryFields = () => {
    if (!form.category) return null

    switch (form.category) {
      case 'CT':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Serial Number</label>
              <input type="text" name="serialNumber" value={form.serialNumber} onChange={handleChange} className={inputClass} placeholder="e.g. 83305" />
            </div>
            <div>
              <label className={labelClass}>Software Version</label>
              <input type="text" name="softwareVersion" value={form.softwareVersion} onChange={handleChange} className={inputClass} placeholder="e.g. Syngo VB30A_SP10" />
            </div>
            <div>
              <label className={labelClass}>Tube Type</label>
              <input type="text" name="tubeType" value={form.tubeType} onChange={handleChange} className={inputClass} placeholder="e.g. STRATON MX-P" />
            </div>
            <div>
              <label className={labelClass}>Tube Replaced</label>
              <input type="text" name="tubeReplaced" value={form.tubeReplaced} onChange={handleChange} className={inputClass} placeholder="e.g. 19 December 2025" />
            </div>
            <div>
              <label className={labelClass}>Tube Scan Seconds</label>
              <input type="number" name="tubeScanSeconds" value={form.tubeScanSeconds} onChange={handleChange} className={inputClass} placeholder="e.g. 49217" />
            </div>
            <div>
              <label className={labelClass}>Slice Config</label>
              <select name="sliceConfig" value={form.sliceConfig} onChange={handleChange} className={inputClass}>
                <option value="">Select Slice Config</option>
                {SLICE_CONFIG_OPTIONS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>
        )

      case 'MRI':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Software</label>
              <input type="text" name="software" value={form.software} onChange={handleChange} className={inputClass} placeholder="e.g. NUMARIS/4" />
            </div>
            <div>
              <label className={labelClass}>Version</label>
              <input type="text" name="softwareVersion" value={form.softwareVersion} onChange={handleChange} className={inputClass} placeholder="e.g. Syngo MR E11" />
            </div>
            <div>
              <label className={labelClass}>Field Strength</label>
              <input type="text" name="fieldStrength" value={form.fieldStrength} onChange={handleChange} className={inputClass} placeholder="e.g. 1.5T or 3T" />
            </div>
            <div>
              <label className={labelClass}>Number of Rx Channels</label>
              <input type="number" name="numRxChannels" value={form.numRxChannels} onChange={handleChange} className={inputClass} placeholder="e.g. 8" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Coils</label>
              <textarea name="coils" value={form.coils} onChange={handleChange} rows={3} className={inputClass}
                placeholder="e.g. 4Ch_FlexLarge, 4Ch_FlexSmall, FootAnkle, 8Ch_Wrist, Body, BodyMatrix..." />
            </div>
          </div>
        )

      case 'Ultrasound':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Serial No</label>
              <input type="text" name="serialNumber" value={form.serialNumber} onChange={handleChange} className={inputClass} placeholder="e.g. E73088" />
            </div>
            <div>
              <label className={labelClass}>Software Version</label>
              <input type="text" name="softwareVersion" value={form.softwareVersion} onChange={handleChange} className={inputClass} placeholder="e.g. EC340" />
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>Installed Options</label>
              <textarea name="installedOptions" value={form.installedOptions} onChange={handleChange} rows={3} className={inputClass}
                placeholder="e.g. Advanced 4D, Vocal II, Advanced VCI, IOTA LR2..." />
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>Choice of Probes</label>
              <textarea name="choiceOfProbes" value={form.choiceOfProbes} onChange={handleChange} rows={2} className={inputClass}
                placeholder="e.g. C1-6, ML6-15-D, 9L-D, RIC5-9-D" />
            </div>
          </div>
        )

      case 'Cath/Angio Lab':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Tube Type</label>
              <input type="text" name="tubeType" value={form.tubeType} onChange={handleChange} className={inputClass} placeholder="e.g. Performix 160A" />
            </div>
            <div>
              <label className={labelClass}>Detector Size</label>
              <input type="text" name="detectorSize" value={form.detectorSize} onChange={handleChange} className={inputClass} placeholder="e.g. 40cm FP" />
            </div>
            <div>
              <label className={labelClass}>Software Version</label>
              <input type="text" name="softwareVersion" value={form.softwareVersion} onChange={handleChange} className={inputClass} placeholder="e.g. DL_21.0.9" />
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>Installed Options</label>
              <textarea name="installedOptions" value={form.installedOptions} onChange={handleChange} rows={3} className={inputClass}
                placeholder="e.g. Auto Pixel Shift, Cardiac & Dynamic, Denoising, DSA, Fluoro Store..." />
            </div>
          </div>
        )

      case 'Mammography':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Serial Number</label>
              <input type="text" name="serialNumber" value={form.serialNumber} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Condition Grade</label>
              <input type="text" name="conditionGrade" value={form.conditionGrade} onChange={handleChange} className={inputClass} placeholder="e.g. Good working condition" />
            </div>
          </div>
        )

      case 'Molecular Imaging':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Tube Type</label>
              <input type="text" name="tubeType" value={form.tubeType} onChange={handleChange} className={inputClass} placeholder="e.g. DURA 352-MV" />
            </div>
            <div>
              <label className={labelClass}>Software Version</label>
              <input type="text" name="softwareVersion" value={form.softwareVersion} onChange={handleChange} className={inputClass} placeholder="e.g. VA61C" />
            </div>
            <div>
              <label className={labelClass}>Tube Manufactured</label>
              <input type="text" name="tubeManufactured" value={form.tubeManufactured} onChange={handleChange} className={inputClass} placeholder="e.g. 2015" />
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>Installed Options</label>
              <textarea name="installedOptions" value={form.installedOptions} onChange={handleChange} rows={4} className={inputClass}
                placeholder="e.g. NMG AUTGOCONTOUR, NMG_90_76 ACQUISITION, NMG_180 ACQUISITION..." />
            </div>
          </div>
        )

      case 'X-Ray':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Serial Number</label>
              <input type="text" name="serialNumber" value={form.serialNumber} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tube Type</label>
              <input type="text" name="tubeType" value={form.tubeType} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Software Version</label>
              <input type="text" name="softwareVersion" value={form.softwareVersion} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Detector Size</label>
              <input type="text" name="detectorSize" value={form.detectorSize} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        )

      case 'C-Arm':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Serial Number</label>
              <input type="text" name="serialNumber" value={form.serialNumber} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Flat Detector Manufactured</label>
              <input type="text" name="flatDetectorManufactured" value={form.flatDetectorManufactured} onChange={handleChange} className={inputClass} placeholder="e.g. December 2021" />
            </div>
            <div>
              <label className={labelClass}>Condition Grade</label>
              <input type="text" name="conditionGrade" value={form.conditionGrade} onChange={handleChange} className={inputClass} placeholder="e.g. With Flat Detector & LCD monitors" />
            </div>
          </div>
        )

      case 'CR/DR':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Serial Number</label>
              <input type="text" name="serialNumber" value={form.serialNumber} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Software Version</label>
              <input type="text" name="softwareVersion" value={form.softwareVersion} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Condition Grade</label>
              <input type="text" name="conditionGrade" value={form.conditionGrade} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/erp/equipment')} className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm font-medium">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Equipment
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">{isEdit ? 'Edit Equipment' : 'Add New Equipment'}</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Category Selection */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
            <h2 className="text-lg font-semibold mb-1 text-indigo-900">Step 1 — Select Product Category</h2>
            <p className="text-sm text-indigo-600 mb-4">Choose the category first. The form fields below will update based on your selection.</p>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full md:w-1/2 border border-indigo-300 rounded-lg px-3 py-2.5 text-base font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">-- Select Category --</option>
              {EQUIPMENT_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Step 2+: Shown only when category selected */}
          {form.category && (
            <>
              <div>
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Step 2 — Product Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>SKU (Internal Code) *</label>
                    <input type="text" name="internalCode" value={form.internalCode} onChange={handleChange} required
                      className={inputClass} placeholder="e.g. EX4597" />
                  </div>
                  <div>
                    <label className={labelClass}>Manufacturer *</label>
                    <select name="make" value={form.make} onChange={handleChange} required className={inputClass}>
                      <option value="">-- Select Manufacturer --</option>
                      {MANUFACTURERS.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Model *</label>
                    <input type="text" name="model" value={form.model} onChange={handleChange} required
                      className={inputClass} placeholder="e.g. Definition Edge 128 Slice" />
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
                      className={inputClass} placeholder="e.g. 2015" min="1970" max="2030" />
                  </div>
                  <div>
                    <label className={labelClass}>Status</label>
                    <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                      {EQUIPMENT_STATUSES.map(s => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 3: Category-specific fields */}
              <div>
                <h2 className="text-lg font-semibold mb-1 text-gray-700">
                  Step 3 — {form.category} Specifications
                </h2>
                <p className="text-sm text-gray-500 mb-4">Fields specific to <span className="font-medium text-gray-700">{form.category}</span> equipment</p>
                {renderCategoryFields()}
              </div>

              {/* Step 4: Pricing */}
              <div>
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Step 4 — Pricing & Location</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Acquisition Cost</label>
                    <input type="number" name="acquisitionCost" value={form.acquisitionCost} onChange={handleChange}
                      className={inputClass} step="0.01" placeholder="0.00" />
                  </div>
                  <div>
                    <label className={labelClass}>Acquisition Currency</label>
                    <select name="acquisitionCurrency" value={form.acquisitionCurrency} onChange={handleChange} className={inputClass}>
                      <option value="USD">USD</option>
                      <option value="AUD">AUD</option>
                      <option value="EUR">EUR</option>
                      <option value="JPY">JPY</option>
                      <option value="GBP">GBP</option>
                    </select>
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
                    <label className={labelClass}>Asking Price</label>
                    <input type="number" name="askingPrice" value={form.askingPrice} onChange={handleChange}
                      className={inputClass} step="0.01" placeholder="0.00" />
                  </div>
                  <div>
                    <label className={labelClass}>Asking Currency</label>
                    <select name="askingCurrency" value={form.askingCurrency} onChange={handleChange} className={inputClass}>
                      <option value="USD">USD</option>
                      <option value="AUD">AUD</option>
                      <option value="EUR">EUR</option>
                      <option value="JPY">JPY</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Hours of Use</label>
                    <input type="number" name="hoursOfUse" value={form.hoursOfUse} onChange={handleChange} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Step 5: Compliance */}
              <div>
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Step 5 — Compliance</h2>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="tgaCompliant" checked={form.tgaCompliant} onChange={handleChange}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                    <span className="text-sm text-gray-700">TGA Compliant</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="ceMarked" checked={form.ceMarked} onChange={handleChange}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                    <span className="text-sm text-gray-700">CE Marked</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="fdaCleared" checked={form.fdaCleared} onChange={handleChange}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                    <span className="text-sm text-gray-700">FDA Cleared</span>
                  </label>
                </div>
              </div>

              {/* Step 6: Notes */}
              <div>
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Step 6 — Additional Notes</h2>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={4} className={inputClass}
                  placeholder="Any additional description or notes..." />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4 border-t">
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition">
                  {saving ? 'Saving...' : isEdit ? 'Update Equipment' : 'Create Equipment'}
                </button>
                <button type="button" onClick={() => navigate('/erp/equipment')}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition">
                  Cancel
                </button>
              </div>
            </>
          )}

          {/* Placeholder when no category is selected */}
          {!form.category && (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <p className="text-lg font-medium">Select a product category above to begin</p>
              <p className="text-sm mt-1">The form fields will appear based on your selection</p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
