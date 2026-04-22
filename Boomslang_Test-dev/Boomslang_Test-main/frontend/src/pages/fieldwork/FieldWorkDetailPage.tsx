import { FormEvent, useState } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fieldworkApi } from '../../api/fieldworkApi'
import { FieldJobDto, FieldJobStatus, FieldJobType, JobPriority } from '../../types/fieldwork'

interface FieldWorkOrder {
  id: number | string
  workOrderNumber: string
  title: string
  location: string
  assignedTo: string
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  scheduledDate: string
  estimatedDuration: number
  category: string
  description: string
}

interface NewFieldWorkForm {
  jobType: FieldJobType
  priority: JobPriority
  clientOrSellerName: string
  siteContactName: string
  siteContactEmail: string
  siteAddressLine1: string
  siteCity: string
  siteCountry: string
  linkedEntity: string
  startDate: string
  endDate: string
  internalNotes: string
}

const mapJobStatus = (status: FieldJobDto['jobStatus']): FieldWorkOrder['status'] => {
  switch (status) {
    case 'IN_PROGRESS':
    case 'PENDING_SIGN_OFF':
      return 'IN_PROGRESS'
    case 'COMPLETED':
      return 'COMPLETED'
    case 'CANCELLED':
    case 'REVERSED':
      return 'CANCELLED'
    case 'DRAFT':
    case 'ENGINEER_ASSIGNED':
    case 'SCHEDULED':
    default:
      return 'SCHEDULED'
  }
}

const mapJobPriority = (priority: FieldJobDto['priority']): FieldWorkOrder['priority'] => {
  switch (priority) {
    case 'EMERGENCY':
      return 'URGENT'
    case 'CRITICAL':
      return 'HIGH'
    case 'URGENT':
      return 'MEDIUM'
    case 'ROUTINE':
    default:
      return 'LOW'
  }
}

const toDateInputValue = (dateTime: string | undefined): string => {
  if (!dateTime) return ''
  const value = new Date(dateTime)
  if (Number.isNaN(value.getTime())) return ''
  return value.toISOString().slice(0, 10)
}

const formatEnumLabel = (value: string): string => value.replace(/_/g, ' ')

export const FieldWorkDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const isCreateMode = !id || id === 'new'
  const basePath = location.pathname.startsWith('/erp/field-jobs') ? '/erp/field-jobs' : '/fieldwork'

  const today = new Date().toISOString().slice(0, 10)
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const [isCreating, setIsCreating] = useState(false)
  const [createForm, setCreateForm] = useState<NewFieldWorkForm>({
    jobType: FieldJobType.INSTALLATION,
    priority: JobPriority.ROUTINE,
    clientOrSellerName: '',
    siteContactName: '',
    siteContactEmail: '',
    siteAddressLine1: '',
    siteCity: '',
    siteCountry: '',
    linkedEntity: '',
    startDate: today,
    endDate: tomorrow,
    internalNotes: '',
  })

  const { data: workOrder, isLoading } = useQuery<FieldWorkOrder | null>({
    queryKey: ['fieldwork', id],
    enabled: !isCreateMode && Boolean(id),
    queryFn: async () => {
      if (!id) return null
      try {
        const response = await fieldworkApi.getFieldJobById(id)
        const job = response as FieldJobDto
        return {
          id: job.fieldJobId || id,
          workOrderNumber: `WO-${job.jobNumber || job.fieldJobId || id}`,
          title: job.jobType || 'Untitled',
          location: job.siteCity || '',
          assignedTo: job.primaryEngineerName || 'Unassigned',
          status: mapJobStatus(job.jobStatus),
          priority: mapJobPriority(job.priority),
          scheduledDate: job.scheduledStartDate || new Date().toISOString(),
          estimatedDuration: job.estimatedDurationDays || 0,
          category: job.jobType || '',
          description: job.internalNotes || job.clientBriefNotes || job.linkedEntity || ''
        } as FieldWorkOrder
      } catch (error) {
        console.error('Error fetching work order:', error)
        toast.error('Failed to load work order')
        return null
      }
    }
  })

  const handleCreateFieldChange = (
    field: keyof NewFieldWorkForm,
    value: string
  ) => {
    setCreateForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!createForm.clientOrSellerName || !createForm.siteContactName || !createForm.siteContactEmail) {
      toast.error('Client and contact details are required')
      return
    }

    if (!createForm.siteAddressLine1 || !createForm.siteCity) {
      toast.error('Site address and city are required')
      return
    }

    const scheduledStartDate = new Date(`${createForm.startDate}T09:00:00`).toISOString()
    const scheduledEndDate = new Date(`${createForm.endDate}T17:00:00`).toISOString()

    if (new Date(scheduledEndDate).getTime() < new Date(scheduledStartDate).getTime()) {
      toast.error('End date must be after start date')
      return
    }

    const payload: FieldJobDto = {
      jobNumber: `JOB-${Date.now()}`,
      jobType: createForm.jobType,
      jobStatus: FieldJobStatus.DRAFT,
      priority: createForm.priority,
      clientOrSellerName: createForm.clientOrSellerName,
      siteContactName: createForm.siteContactName,
      siteContactEmail: createForm.siteContactEmail,
      siteAddressLine1: createForm.siteAddressLine1,
      siteCity: createForm.siteCity,
      siteCountry: createForm.siteCountry || undefined,
      linkedEntity: createForm.linkedEntity || undefined,
      scheduledStartDate,
      scheduledEndDate,
      internalNotes: createForm.internalNotes || undefined,
    }

    try {
      setIsCreating(true)
      const created = await fieldworkApi.createFieldJob(payload)
      toast.success('Work order created successfully')
      const createdId = created.fieldJobId ?? created.jobNumber
      if (createdId) {
        navigate(`${basePath}/${createdId}`)
      } else {
        navigate(basePath)
      }
    } catch (error) {
      console.error('Error creating work order:', error)
      toast.error(fieldworkApi.parseError(error))
    } finally {
      setIsCreating(false)
    }
  }

  if (isCreateMode) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(basePath)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Work Orders
        </button>

        <div className="bg-card border border-border rounded-lg p-6">
          <h1 className="text-2xl font-bold">Create Work Order</h1>
          <p className="text-muted-foreground mt-1">Add a new field work job with key scheduling details.</p>

          <form onSubmit={handleCreateSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Job Type</label>
                <select
                  value={createForm.jobType}
                  onChange={(e) => handleCreateFieldChange('jobType', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                >
                  {Object.values(FieldJobType).map((jobType) => (
                    <option key={jobType} value={jobType}>{formatEnumLabel(jobType)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Priority</label>
                <select
                  value={createForm.priority}
                  onChange={(e) => handleCreateFieldChange('priority', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                >
                  {Object.values(JobPriority).map((priority) => (
                    <option key={priority} value={priority}>{formatEnumLabel(priority)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Client or Seller Name</label>
                <input
                  type="text"
                  value={createForm.clientOrSellerName}
                  onChange={(e) => handleCreateFieldChange('clientOrSellerName', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Linked Entity</label>
                <input
                  type="text"
                  value={createForm.linkedEntity}
                  onChange={(e) => handleCreateFieldChange('linkedEntity', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                  placeholder="Optional reference"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Site Contact Name</label>
                <input
                  type="text"
                  value={createForm.siteContactName}
                  onChange={(e) => handleCreateFieldChange('siteContactName', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Site Contact Email</label>
                <input
                  type="email"
                  value={createForm.siteContactEmail}
                  onChange={(e) => handleCreateFieldChange('siteContactEmail', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Site Address</label>
                <input
                  type="text"
                  value={createForm.siteAddressLine1}
                  onChange={(e) => handleCreateFieldChange('siteAddressLine1', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">City</label>
                <input
                  type="text"
                  value={createForm.siteCity}
                  onChange={(e) => handleCreateFieldChange('siteCity', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Country</label>
                <input
                  type="text"
                  value={createForm.siteCountry}
                  onChange={(e) => handleCreateFieldChange('siteCountry', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                <input
                  type="date"
                  value={createForm.startDate}
                  onChange={(e) => handleCreateFieldChange('startDate', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">End Date</label>
                <input
                  type="date"
                  value={createForm.endDate}
                  onChange={(e) => handleCreateFieldChange('endDate', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Internal Notes</label>
              <textarea
                value={createForm.internalNotes}
                onChange={(e) => handleCreateFieldChange('internalNotes', e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                rows={4}
                placeholder="Optional notes for internal team"
              />
            </div>

            <div className="pt-4 border-t border-border flex gap-3">
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60"
              >
                {isCreating ? 'Creating...' : 'Create Work Order'}
              </button>
              <button
                type="button"
                onClick={() => navigate(basePath)}
                className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground">Loading work order...</div>
  }

  if (!workOrder) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">Work order not found</p>
        <button
          onClick={() => navigate(basePath)}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Back to work orders
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate(basePath)}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Work Orders
      </button>

      <div className="bg-card border border-border rounded-lg p-6">
        <h1 className="text-2xl font-bold">{workOrder?.title || 'Work Order'}</h1>
        <p className="text-muted-foreground mt-1">#{workOrder?.workOrderNumber}</p>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <p className="mt-1 font-semibold">{workOrder?.status}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Priority</label>
              <p className="mt-1 font-semibold">{workOrder?.priority}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Location</label>
              <p className="mt-1">{workOrder?.location}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
              <p className="mt-1">{workOrder?.assignedTo}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Scheduled Date</label>
              <p className="mt-1">
                {toDateInputValue(workOrder?.scheduledDate) || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Estimated Duration</label>
              <p className="mt-1">{workOrder?.estimatedDuration} hours</p>
            </div>
          </div>
        </div>

        {workOrder?.description && (
          <div className="mt-6 pt-6 border-t border-border">
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <p className="mt-2">{workOrder.description}</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-border flex gap-3">
          <button
            onClick={() => navigate(basePath)}
            className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  )
}
