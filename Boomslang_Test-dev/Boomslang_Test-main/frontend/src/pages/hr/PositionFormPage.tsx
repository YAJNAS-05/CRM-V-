import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { positionApi } from '../../api/hrApi'
import { CreatePositionRequest } from '../../types/hr'

const positionSchema = z.object({
  title: z.string().min(1, 'Position title is required').max(100, 'Title must be under 100 characters'),
  grade: z.string().max(20, 'Grade must be under 20 characters').optional(),
  minSalary: z.number().positive('Minimum salary must be positive').optional(),
  maxSalary: z.number().positive('Maximum salary must be positive').optional(),
  currency: z.string().min(1, 'Currency is required'),
}).refine((data) => !data.minSalary || !data.maxSalary || data.minSalary <= data.maxSalary, {
  message: 'Minimum salary cannot be greater than maximum salary',
  path: ['maxSalary'],
})

const PositionFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState<CreatePositionRequest>({
    title: '',
    grade: '',
    minSalary: undefined,
    maxSalary: undefined,
    currency: 'USD',
  })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditing)

  useEffect(() => {
    if (isEditing && id) {
      loadPosition(id)
    }
  }, [id, isEditing])

  const loadPosition = async (positionId: string) => {
    try {
      setFetching(true)
      const response = await positionApi.getById(positionId)
      if (response.data.data) {
        const position = response.data.data
        setFormData({
          title: position.title,
          grade: position.grade || '',
          minSalary: position.minSalary ?? undefined,
          maxSalary: position.maxSalary ?? undefined,
          currency: position.currency || 'USD',
        })
      }
    } catch (error) {
      console.error('Failed to load position:', error)
      toast.error('Failed to load position')
    } finally {
      setFetching(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : Number(value),
    }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = positionSchema.safeParse(formData)
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
      setLoading(true)
      if (isEditing && id) {
        await positionApi.update(id, formData)
        toast.success('Position updated')
      } else {
        await positionApi.create(formData)
        toast.success('Position created')
      }
      navigate('/hr/positions')
    } catch (error) {
      console.error('Failed to save position:', error)
      toast.error('Failed to save position')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Position' : 'New Position'}</h1>
          <p className="text-sm text-gray-500">Define role grades and salary bands</p>
        </div>
        <Link to="/hr/positions" className="text-sm text-gray-600 hover:text-gray-900">
          Back to Positions
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`mt-1 w-full border rounded-lg px-3 py-2 ${fieldErrors.title ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {fieldErrors.title && <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Grade</label>
            <input
              type="text"
              name="grade"
              value={formData.grade || ''}
              onChange={handleChange}
              className={`mt-1 w-full border rounded-lg px-3 py-2 ${fieldErrors.grade ? 'border-red-500' : 'border-gray-300'}`}
            />
            {fieldErrors.grade && <p className="mt-1 text-xs text-red-600">{fieldErrors.grade}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Salary</label>
            <input
              type="number"
              name="minSalary"
              value={formData.minSalary ?? ''}
              onChange={handleNumberChange}
              className={`mt-1 w-full border rounded-lg px-3 py-2 ${fieldErrors.minSalary ? 'border-red-500' : 'border-gray-300'}`}
            />
            {fieldErrors.minSalary && <p className="mt-1 text-xs text-red-600">{fieldErrors.minSalary}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Salary</label>
            <input
              type="number"
              name="maxSalary"
              value={formData.maxSalary ?? ''}
              onChange={handleNumberChange}
              className={`mt-1 w-full border rounded-lg px-3 py-2 ${fieldErrors.maxSalary ? 'border-red-500' : 'border-gray-300'}`}
            />
            {fieldErrors.maxSalary && <p className="mt-1 text-xs text-red-600">{fieldErrors.maxSalary}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Currency</label>
            <input
              type="text"
              name="currency"
              value={formData.currency || ''}
              onChange={handleChange}
              className={`mt-1 w-full border rounded-lg px-3 py-2 ${fieldErrors.currency ? 'border-red-500' : 'border-gray-300'}`}
            />
            {fieldErrors.currency && <p className="mt-1 text-xs text-red-600">{fieldErrors.currency}</p>}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Position'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PositionFormPage
