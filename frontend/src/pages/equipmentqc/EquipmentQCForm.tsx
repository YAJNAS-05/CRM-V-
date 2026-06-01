import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { acquisitionApi, equipmentApi, equipmentQcApi } from '../../api/erpApi'
import { Equipment, EquipmentAcquisition } from '../../types/erp'
import SearchableLookupSelect from '../../components/form/SearchableLookupSelect'

const PHANTOM_RESULTS = ['PASS', 'FAIL']
const OVERALL_RESULTS = ['PASS', 'FAIL', 'CONDITIONAL_PASS']

interface FormData {
  qcNumber: string
  equipmentId: string
  acquisitionId: string
  qcDate: string
  engineerAssigned: string
  phantomScanResult: string
  imageQualityRating: string
  overallResult: string
  qcNotes: string
}

const defaultForm: FormData = {
  qcNumber: '',
  equipmentId: '',
  acquisitionId: '',
  qcDate: new Date().toISOString().split('T')[0],
  engineerAssigned: '',
  phantomScanResult: 'PASS',
  imageQualityRating: '3',
  overallResult: 'PASS',
  qcNotes: '',
}

export default function EquipmentQCForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [acquisitions, setAcquisitions] = useState<EquipmentAcquisition[]>([])

  useEffect(() => {
    loadLookups()
  }, [])

  useEffect(() => {
    if (isEdit && id) {
      loadItem(id)
    }
  }, [id, isEdit])

  const loadLookups = async () => {
    try {
      setLookupLoading(true)
      const [equipmentResponse, acquisitionResponse] = await Promise.all([
        equipmentApi.getAll(0, 300),
        acquisitionApi.getAll(0, 300),
      ])

      setEquipment(equipmentResponse.data?.content || [])
      setAcquisitions(acquisitionResponse.data?.data?.content || [])
    } catch {
      toast.error('Failed to load lookup data')
    } finally {
      setLookupLoading(false)
    }
  }

  const loadItem = async (itemId: string) => {
    try {
      setLoading(true)
      const response = await equipmentQcApi.getById(itemId)
      if (response.data.success && response.data.data) {
        const data = response.data.data
        setForm({
          qcNumber: data.qcNumber || '',
          equipmentId: data.equipmentId || '',
          acquisitionId: data.acquisitionId || '',
          qcDate: data.qcDate || new Date().toISOString().split('T')[0],
          engineerAssigned: data.engineerAssigned || '',
          phantomScanResult: data.phantomScanResult || 'PASS',
          imageQualityRating: data.imageQualityRating != null ? String(data.imageQualityRating) : '3',
          overallResult: data.overallResult || 'PASS',
          qcNotes: data.qcNotes || '',
        })
      }
    } catch {
      toast.error('Failed to load QC record')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleLookupChange = (name: string, value: string) => {
    if (name === 'acquisitionId') {
      const selectedAcquisition = acquisitions.find((item) => item.id === value)
      setForm((prev) => ({
        ...prev,
        acquisitionId: value,
        equipmentId: selectedAcquisition?.equipmentId || prev.equipmentId,
      }))
      return
    }

    if (name === 'equipmentId') {
      const shouldClearAcquisition = Boolean(form.acquisitionId) && !acquisitions.some(
        (item) => item.id === form.acquisitionId && item.equipmentId === value
      )
      setForm((prev) => ({
        ...prev,
        equipmentId: value,
        acquisitionId: shouldClearAcquisition ? '' : prev.acquisitionId,
      }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const filteredAcquisitions = useMemo(
    () => acquisitions.filter((item) => !form.equipmentId || item.equipmentId === form.equipmentId || item.id === form.acquisitionId),
    [acquisitions, form.acquisitionId, form.equipmentId]
  )

  const filteredEquipment = useMemo(
    () => equipment.filter((item) => !form.acquisitionId || acquisitions.some(
      (acquisition) => acquisition.id === form.acquisitionId && acquisition.equipmentId === item.id
    ) || item.id === form.equipmentId),
    [acquisitions, equipment, form.acquisitionId, form.equipmentId]
  )

  const equipmentOptions = useMemo(
    () =>
      filteredEquipment.map((item) => ({
        value: item.id,
        label: `${item.internalCode} | ${item.make || ''} ${item.model || ''}`.trim(),
        meta: item.status,
      })),
    [filteredEquipment]
  )

  const acquisitionOptions = useMemo(
    () =>
      filteredAcquisitions.map((item) => ({
        value: item.id,
        label: item.acquisitionNumber,
        meta: item.stage,
      })),
    [filteredAcquisitions]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.equipmentId.trim() && !form.acquisitionId.trim()) {
      toast.error('Select Equipment or Acquisition')
      return
    }

    try {
      setSaving(true)
      const payload = {
        qcDate: form.qcDate,
        engineerAssigned: form.engineerAssigned,
        phantomScanResult: form.phantomScanResult,
        overallResult: form.overallResult,
        qcNotes: form.qcNotes,
        equipmentId: form.equipmentId || undefined,
        acquisitionId: form.acquisitionId || undefined,
        imageQualityRating: form.imageQualityRating ? Number(form.imageQualityRating) : undefined,
      }

      if (isEdit && id) {
        const response = await equipmentQcApi.update(id, payload)
        if (response.data.success) {
          toast.success('QC record updated')
          navigate('/erp/equipment-qc')
        }
      } else {
        const response = await equipmentQcApi.create(payload)
        if (response.data.success) {
          toast.success('QC record created')
          navigate('/erp/equipment-qc')
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save QC record')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">Loading QC record...</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/erp/equipment-qc')} className="text-blue-600 hover:text-blue-800">
          Back to Equipment QC
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Equipment QC' : 'Add Equipment QC'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {isEdit
              ? `QC Number: ${form.qcNumber || '-'}`
              : 'QC Number will be auto-generated when you save this record.'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <SearchableLookupSelect
              label="Equipment"
              name="equipmentId"
              value={form.equipmentId}
              options={equipmentOptions}
              onChange={handleLookupChange}
              disabled={lookupLoading}
              placeholder="Search equipment"
              helperText={form.acquisitionId ? 'Filtered from selected acquisition' : undefined}
            />

            <SearchableLookupSelect
              label="Acquisition"
              name="acquisitionId"
              value={form.acquisitionId}
              options={acquisitionOptions}
              onChange={handleLookupChange}
              disabled={lookupLoading}
              placeholder="Search acquisition"
              helperText={form.equipmentId ? 'Showing acquisitions for selected equipment' : undefined}
            />

            <div>
              <label className="block text-sm font-medium mb-1">QC Date *</label>
              <input type="date" name="qcDate" value={form.qcDate} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Engineer Assigned</label>
              <input name="engineerAssigned" value={form.engineerAssigned} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phantom Scan Result *</label>
              <select name="phantomScanResult" value={form.phantomScanResult} onChange={handleChange} className="w-full border rounded px-3 py-2">
                {PHANTOM_RESULTS.map((result) => <option key={result} value={result}>{result}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Overall Result *</label>
              <select name="overallResult" value={form.overallResult} onChange={handleChange} className="w-full border rounded px-3 py-2">
                {OVERALL_RESULTS.map((result) => <option key={result} value={result}>{result}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image Quality Rating (1-5)</label>
              <input type="number" min={1} max={5} name="imageQualityRating" value={form.imageQualityRating} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">QC Notes</label>
            <textarea name="qcNotes" value={form.qcNotes} onChange={handleChange} rows={3} className="w-full border rounded px-3 py-2" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => navigate('/erp/equipment-qc')} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : isEdit ? 'Update QC Record' : 'Create QC Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
