import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { documentApi } from '../../api/hrApi'
import { CreateHrDocumentRequest } from '../../types/hr'
import { toast } from 'sonner'

const DOCUMENT_TYPES = [
  'PASSPORT',
  'NATIONAL_ID',
  'DRIVING_LICENSE',
  'EDUCATIONAL_CERTIFICATE',
  'EMPLOYMENT_CONTRACT',
  'NDA',
  'TAX_FORM',
  'BANK_DETAILS',
  'MEDICAL_CERTIFICATE',
  'OTHER',
]

const DocumentUploadPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm<CreateHrDocumentRequest>()

  const createMutation = useMutation({
    mutationFn: documentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-documents'] })
      toast.success('Document uploaded')
      navigate('/hr/documents')
    },
    onError: () => toast.error('Failed to upload document'),
  })

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Upload Document</h1>
        <p className="text-sm text-slate-500">Add a new employee document record</p>
      </div>

      <form
        onSubmit={handleSubmit((data) => createMutation.mutate(data))}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Employee ID <span className="text-red-500">*</span>
          </label>
          <input
            {...register('employeeId', { required: 'Employee ID is required' })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="UUID of the employee"
          />
          {errors.employeeId && <p className="mt-1 text-xs text-red-600">{errors.employeeId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Document Type <span className="text-red-500">*</span>
          </label>
          <select
            {...register('documentType', { required: 'Document type is required' })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select type…</option>
            {DOCUMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
          {errors.documentType && <p className="mt-1 text-xs text-red-600">{errors.documentType.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            File Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('fileName', { required: 'File name is required' })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. passport_johndoe.pdf"
          />
          {errors.fileName && <p className="mt-1 text-xs text-red-600">{errors.fileName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">File URL</label>
          <input
            {...register('fileUrl')}
            type="url"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://storage.example.com/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea
            {...register('notes')}
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any additional notes..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/hr/documents')}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            Upload Document
          </button>
        </div>
      </form>
    </div>
  )
}

export default DocumentUploadPage
