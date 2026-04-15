import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fieldworkApi } from '../../api/fieldworkApi'
import { FieldJobDto } from '../../types/fieldwork'

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

export const FieldWorkDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: workOrder, isLoading, isError } = useQuery<FieldWorkOrder | null>({
    queryKey: ['fieldwork', id],
    queryFn: async () => {
      if (!id) return null
      try {
        const response = await fieldworkApi.getFieldJobById(parseInt(id))
        const job = response as FieldJobDto
        return {
          id: job.fieldJobId || id,
          workOrderNumber: `WO-${job.jobNumber}`,
          title: job.jobType || 'Untitled',
          location: job.siteCity || '',
          assignedTo: job.primaryEngineerName || 'Unassigned',
          status: (job.jobStatus as 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') || 'SCHEDULED',
          priority: (job.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') || 'MEDIUM',
          scheduledDate: job.scheduledStartDate || new Date().toISOString(),
          estimatedDuration: job.estimatedDurationDays || 0,
          category: job.jobType || '',
          description: job.linkedEntity || ''
        } as FieldWorkOrder
      } catch (error) {
        console.error('Error fetching work order:', error)
        toast.error('Failed to load work order')
        return null
      }
    }
  })

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground">Loading work order...</div>
  }

  if (!workOrder) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">Work order not found</p>
        <button
          onClick={() => navigate('/fieldwork')}
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
        onClick={() => navigate('/fieldwork')}
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
                {workOrder?.scheduledDate && new Date(workOrder.scheduledDate).toLocaleDateString()}
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
            onClick={() => navigate(`/fieldwork/${id}/edit`)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Edit
          </button>
          <button
            onClick={() => navigate('/fieldwork')}
            className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  )
}
