import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { trainingApi } from '../../api/hrApi'
import { CreateTrainingRequest, UpdateTrainingRequest } from '../../types/hr'
import { toast } from 'sonner'

const trainingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  trainerName: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxParticipants: z.coerce.number().int().positive('Must be a positive number').optional().or(z.literal('')).transform((v) => v === '' ? undefined : Number(v)),
  location: z.string().optional(),
  departmentId: z.string().optional(),
  status: z.string().optional(),
}).refine((d) => !d.startDate || !d.endDate || d.endDate >= d.startDate, {
  message: 'End date must be on or after start date',
  path: ['endDate'],
})

type FormData = z.infer<typeof trainingSchema>

const TrainingFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(trainingSchema),
  })

  const { data: existing } = useQuery({
    queryKey: ['training', id],
    queryFn: () => trainingApi.getById(id!),
    enabled: isEdit,
  })

  useEffect(() => {
    if (existing?.data?.data) {
      const t = existing.data.data
      reset({
        title: t.title,
        description: t.description ?? '',
        trainerName: t.trainerName ?? '',
        startDate: t.startDate ?? '',
        endDate: t.endDate ?? '',
        maxParticipants: t.maxParticipants ?? undefined,
        location: t.location ?? '',
        departmentId: t.departmentId ?? '',
        status: t.status,
      })
    }
  }, [existing, reset])

  const createMutation = useMutation({
    mutationFn: (data: CreateTrainingRequest) => trainingApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] })
      toast.success('Training created')
      navigate('/hr/trainings')
    },
    onError: () => toast.error('Failed to create training'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateTrainingRequest) => trainingApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] })
      queryClient.invalidateQueries({ queryKey: ['training', id] })
      toast.success('Training updated')
      navigate('/hr/trainings')
    },
    onError: () => toast.error('Failed to update training'),
  })

  const onSubmit = (data: FormData) => {
    const clean: CreateTrainingRequest = {
      title: data.title,
      description: data.description || undefined,
      trainerName: data.trainerName || undefined,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
      maxParticipants: data.maxParticipants != null ? Number(data.maxParticipants) : undefined,
      location: data.location || undefined,
      departmentId: data.departmentId || undefined,
    }
    if (isEdit) {
      updateMutation.mutate({ ...clean, status: data.status as UpdateTrainingRequest['status'] })
    } else {
      createMutation.mutate(clean)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Edit Training' : 'New Training'}</h1>
        <p className="text-sm text-slate-500">Fill in the training session details below</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
          <input
            {...register('title')}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-slate-200'}`}
            placeholder="e.g. Safety Induction"
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Training description..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Trainer Name</label>
            <input
              {...register('trainerName')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <input
              {...register('location')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Room 101 / Online"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              {...register('startDate')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
            <input
              type="date"
              {...register('endDate')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Max Participants</label>
            <input
              type="number"
              {...register('maxParticipants')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="20"
            />
          </div>
          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PLANNED">Planned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/hr/trainings')}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isEdit ? 'Update Training' : 'Create Training'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default TrainingFormPage
