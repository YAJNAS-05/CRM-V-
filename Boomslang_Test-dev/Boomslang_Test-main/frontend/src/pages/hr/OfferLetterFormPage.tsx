import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { offerLetterApi } from '../../api/hrApi'
import { CreateOfferLetterRequest, UpdateOfferLetterRequest } from '../../types/hr'
import { toast } from 'sonner'

const offerLetterSchema = z.object({
  candidateName: z.string().min(1, 'Candidate name is required'),
  candidateEmail: z.string().email('Invalid email address'),
  offerDate: z.string().optional(),
  expiryDate: z.string().optional(),
  salary: z.coerce.number().positive('Salary must be positive').optional().or(z.literal('')).transform((v) => v === '' ? undefined : Number(v)),
  currency: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
}).refine((d) => !d.offerDate || !d.expiryDate || d.expiryDate >= d.offerDate, {
  message: 'Expiry date must be on or after offer date',
  path: ['expiryDate'],
})

type FormData = z.infer<typeof offerLetterSchema>

const OfferLetterFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(offerLetterSchema),
  })

  const { data: existing } = useQuery({
    queryKey: ['offer-letter', id],
    queryFn: () => offerLetterApi.getById(id!),
    enabled: isEdit,
  })

  useEffect(() => {
    if (existing?.data?.data) {
      const l = existing.data.data
      reset({
        candidateName: l.candidateName,
        candidateEmail: l.candidateEmail,
        offerDate: l.offerDate ?? '',
        expiryDate: l.expiryDate ?? '',
        salary: l.salary ?? undefined,
        currency: l.currency ?? 'USD',
        notes: l.notes ?? '',
        status: l.status,
      })
    }
  }, [existing, reset])

  const createMutation = useMutation({
    mutationFn: (data: CreateOfferLetterRequest) => offerLetterApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offer-letters'] })
      toast.success('Offer letter created')
      navigate('/hr/offer-letters')
    },
    onError: () => toast.error('Failed to create offer letter'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateOfferLetterRequest) => offerLetterApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offer-letters'] })
      queryClient.invalidateQueries({ queryKey: ['offer-letter', id] })
      toast.success('Offer letter updated')
      navigate('/hr/offer-letters')
    },
    onError: () => toast.error('Failed to update offer letter'),
  })

  const onSubmit = (data: FormData) => {
    const clean: CreateOfferLetterRequest = {
      candidateName: data.candidateName,
      candidateEmail: data.candidateEmail,
      offerDate: data.offerDate || undefined,
      expiryDate: data.expiryDate || undefined,
      salary: data.salary != null ? Number(data.salary) : undefined,
      currency: data.currency || 'USD',
      notes: data.notes || undefined,
    }
    if (isEdit) {
      updateMutation.mutate({ ...clean, status: data.status as UpdateOfferLetterRequest['status'] })
    } else {
      createMutation.mutate(clean)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Edit Offer Letter' : 'New Offer Letter'}</h1>
        <p className="text-sm text-slate-500">Fill in the offer details below</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Candidate Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('candidateName')}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.candidateName ? 'border-red-500' : 'border-slate-200'}`}
              placeholder="Jane Doe"
            />
            {errors.candidateName && <p className="mt-1 text-xs text-red-600">{errors.candidateName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Candidate Email <span className="text-red-500">*</span>
            </label>
            <input
              {...register('candidateEmail')}
              type="email"
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.candidateEmail ? 'border-red-500' : 'border-slate-200'}`}
              placeholder="jane@example.com"
            />
            {errors.candidateEmail && <p className="mt-1 text-xs text-red-600">{errors.candidateEmail.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Offer Date</label>
            <input
              type="date"
              {...register('offerDate')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
            <input
              type="date"
              {...register('expiryDate')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Salary</label>
            <input
              type="number"
              step="0.01"
              {...register('salary')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="75000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
            <select
              {...register('currency')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
            </select>
          </div>
        </div>

        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              {...register('status')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
              <option value="EXPIRED">Expired</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea
            {...register('notes')}
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Additional notes..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/hr/offer-letters')}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isEdit ? 'Update Offer Letter' : 'Create Offer Letter'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default OfferLetterFormPage
