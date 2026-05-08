import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { acquisitionApi, equipmentApi, equipmentAssessmentApi } from '../../api/erpApi'
import { Equipment, EquipmentAcquisition } from '../../types/erp'
import { employeeApi } from '../../api/hrApi'
import { Employee } from '../../types/hr'
import SearchableLookupSelect from '../../components/form/SearchableLookupSelect'

const assessmentSchema = z.object({
  assessmentType: z.string().min(1, 'Assessment type is required'),
  outcome: z.string().min(1, 'Outcome is required'),
  conditionGrade: z.string().min(1, 'Condition grade is required'),
})

const ASSESSMENT_TYPES = ['PHYSICAL', 'REMOTE']
const OUTCOMES = ['BUY', 'REJECT', 'NEGOTIATE']
const CONDITION_GRADES = ['A', 'B', 'C', 'D']

interface FormData {
  assessmentNumber: string
  acquisitionId: string
  equipmentId: string
  assessmentType: string
  inspectionDate: string
  engineerAssigned: string
  tubeLifeRemaining: string
  imageQualityRating: string
  conditionGrade: string
  outcome: string
  notes: string
}

const defaultForm: FormData = {
  assessmentNumber: '',
  acquisitionId: '',
  equipmentId: '',
  assessmentType: 'PHYSICAL',
  inspectionDate: '',
  engineerAssigned: '',
  tubeLifeRemaining: '',
  imageQualityRating: '3',
  conditionGrade: 'B',
  outcome: 'BUY',
  notes: '',
}

export default function EquipmentAssessmentForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [acquisitions, setAcquisitions] = useState<EquipmentAcquisition[]>([])
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({})
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [engineers, setEngineers] = useState<Employee[]>([])

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
      const [acquisitionResponse, equipmentResponse, engineerResponse] = await Promise.all([
        acquisitionApi.getAll(0, 300),
        equipmentApi.getAll(0, 300),
        employeeApi.getAll(0, 300),
      ])

      setAcquisitions(acquisitionResponse.data?.data?.content || [])
      setEquipment(equipmentResponse.data?.content || [])
      setEngineers(engineerResponse.data?.data?.content || [])
    } catch {
      toast.error('Failed to load lookup data')
    } finally {
      setLookupLoading(false)
    }
  }

  const loadItem = async (itemId: string) => {
    try {
      setLoading(true)
      const response = await equipmentAssessmentApi.getById(itemId)
      if (response.data.success && response.data.data) {
        const data = response.data.data
        setForm({
          assessmentNumber: data.assessmentNumber || '',
          acquisitionId: data.acquisitionId || '',
          equipmentId: data.equipmentId || '',
          assessmentType: data.assessmentType || 'PHYSICAL',
          inspectionDate: data.inspectionDate || '',
          engineerAssigned: data.engineerAssigned || '',
          tubeLifeRemaining: data.tubeLifeRemaining != null ? String(data.tubeLifeRemaining) : '',
          imageQualityRating: data.imageQualityRating != null ? String(data.imageQualityRating) : '3',
          conditionGrade: data.conditionGrade || 'B',
          outcome: data.outcome || 'BUY',
          notes: data.notes || '',
        })
      }
    } catch {
      toast.error('Failed to load assessment')
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

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const acquisitionOptions = useMemo(
    () =>
      acquisitions.map((item) => ({
        value: item.id,
        label: item.acquisitionNumber,
        meta: item.stage,
      })),
    [acquisitions]
  )

  const equipmentOptions = useMemo(
    () =>
      equipment.map((item) => ({
        value: item.id,
        label: `${item.internalCode} | ${item.make || ''} ${item.model || ''}`.trim(),
        meta: item.status,
      })),
    [equipment]
  )

  const selectedEquipment = useMemo(
    () => equipment.find(eq => eq.id === form.equipmentId) || null,
    [equipment, form.equipmentId]
  )

  const engineerOptions = useMemo(
    () =>
      engineers.map(emp => ({
        value: `${emp.firstName} ${emp.lastName}`,
        label: `${emp.firstName} ${emp.lastName}`,
        meta: emp.jobTitle || emp.department || undefined,
      })),
    [engineers]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = assessmentSchema.safeParse({
      assessmentType: form.assessmentType,
      outcome: form.outcome,
      conditionGrade: form.conditionGrade,
    })
    if (!result.success) {
      const errs: Partial<Record<string, string>> = {}
      for (const issue of result.error.errors) {
        const key = issue.path[0] as string
        if (key && !errs[key]) errs[key] = issue.message
      }
      setFieldErrors(errs)
      toast.error('Please fix the highlighted fields')
      return
    }
    setFieldErrors({})

    try {
      setSaving(true)
      const payload = {
        assessmentType: form.assessmentType,
        inspectionDate: form.inspectionDate || undefined,
        engineerAssigned: form.engineerAssigned,
        conditionGrade: form.conditionGrade,
        outcome: form.outcome,
        notes: form.notes,
        acquisitionId: form.acquisitionId || undefined,
        equipmentId: form.equipmentId || undefined,
        tubeLifeRemaining: form.tubeLifeRemaining ? Number(form.tubeLifeRemaining) : undefined,
        imageQualityRating: form.imageQualityRating ? Number(form.imageQualityRating) : undefined,
      }

      if (isEdit && id) {
        const response = await equipmentAssessmentApi.update(id, payload)
        if (response.data.success) {
          toast.success('Assessment updated')
          navigate('/erp/equipment-assessments')
        }
      } else {
        const response = await equipmentAssessmentApi.create(payload)
        if (response.data.success) {
          toast.success('Assessment created')
          navigate('/erp/equipment-assessments')
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save assessment')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">Loading assessment...</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/erp/equipment-assessments')} className="text-blue-600 hover:text-blue-800">
          Back to Assessments
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Assessment' : 'Add Assessment'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {isEdit
              ? `Assessment Number: ${form.assessmentNumber || '-'}`
              : 'Assessment Number will be auto-generated when you save this record.'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Assessment Type *</label>
              <select name="assessmentType" value={form.assessmentType} onChange={handleChange} className="w-full border rounded px-3 py-2">
                {ASSESSMENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Outcome *</label>
              <select name="outcome" value={form.outcome} onChange={handleChange} className="w-full border rounded px-3 py-2">
                {OUTCOMES.map((outcome) => <option key={outcome} value={outcome}>{outcome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Condition Grade</label>
              <select name="conditionGrade" value={form.conditionGrade} onChange={handleChange} className="w-full border rounded px-3 py-2">
                {CONDITION_GRADES.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
              </select>
            </div>

            <SearchableLookupSelect
              label="Acquisition"
              name="acquisitionId"
              value={form.acquisitionId}
              options={acquisitionOptions}
              onChange={handleLookupChange}
              disabled={lookupLoading}
              placeholder="Search acquisition"
            />

            <SearchableLookupSelect
              label="Equipment"
              name="equipmentId"
              value={form.equipmentId}
              options={equipmentOptions}
              onChange={handleLookupChange}
              disabled={lookupLoading}
              placeholder="Search equipment"
            />

            <div>
              <label className="block text-sm font-medium mb-1">Inspection Date</label>
              <input type="date" name="inspectionDate" value={form.inspectionDate} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>

            <SearchableLookupSelect
              label="Engineer Assigned"
              name="engineerAssigned"
              value={form.engineerAssigned}
              options={engineerOptions}
              onChange={handleLookupChange}
              disabled={lookupLoading}
              placeholder="Search engineer by name"
            />
            <div>
              <label className="block text-sm font-medium mb-1">Tube Life Remaining</label>
              <input type="number" name="tubeLifeRemaining" value={form.tubeLifeRemaining} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image Quality Rating (1-5)</label>
              <input type="number" min={1} max={5} name="imageQualityRating" value={form.imageQualityRating} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
          </div>

          {selectedEquipment && (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="font-semibold text-slate-700 mb-2">Selected Equipment Details</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-slate-600">
                <span><span className="font-medium">Internal Code:</span> {selectedEquipment.internalCode || '—'}</span>
                <span><span className="font-medium">Make / Model:</span> {[selectedEquipment.make, selectedEquipment.model].filter(Boolean).join(' ') || '—'}</span>
                <span><span className="font-medium">Status:</span> {selectedEquipment.status || '—'}</span>
                <span><span className="font-medium">Category:</span> {selectedEquipment.category || '—'}</span>
                {selectedEquipment.serialNumber && (
                  <span><span className="font-medium">Serial No.:</span> {selectedEquipment.serialNumber}</span>
                )}
                {selectedEquipment.warehouseLocation && (
                  <span><span className="font-medium">Location:</span> {selectedEquipment.warehouseLocation}</span>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full border rounded px-3 py-2" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => navigate('/erp/equipment-assessments')} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : isEdit ? 'Update Assessment' : 'Create Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
