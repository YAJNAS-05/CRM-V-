import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

export const FieldWorkListPage = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  // Fetch field work orders with actual API call
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['fieldwork', statusFilter],
    queryFn: async () => {
      try {
        const result = await fieldworkApi.getFieldJobs(0, 50)
        return result.content || []
      } catch (error) {
        console.error('Error fetching field work orders:', error)
        toast.error('Failed to load field work orders')
        return []
      }
    }
  })

  const workOrders = (response || []).map((job: FieldJobDto) => ({
    id: job.fieldJobId || '',
    workOrderNumber: `WO-${job.jobNumber}`,
    title: job.jobType || 'Untitled',
    location: job.siteCity || '',
    assignedTo: job.primaryEngineerName || 'Unassigned',
    status: (job.jobStatus as any) || 'SCHEDULED',
    priority: job.priority || 'MEDIUM',
    scheduledDate: job.scheduledStartDate || new Date().toISOString(),
    estimatedDuration: job.estimatedDurationDays || 0,
    category: job.jobType || '',
    description: job.linkedEntity || ''
  }))

  const filteredOrders = workOrders.filter((order: FieldWorkOrder) =>
    order.title.toLowerCase().includes(search.toLowerCase()) ||
    order.workOrderNumber.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-600'
      case 'HIGH':
        return 'text-orange-600'
      case 'MEDIUM':
        return 'text-yellow-600'
      case 'LOW':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Field Work Orders</h1>
        <p className="text-muted-foreground mt-1">Manage and track field service work orders</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            placeholder="Search work orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg bg-background"
          />
          <select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value || null)}
            className="px-3 py-2 border rounded-lg bg-background"
          >
            <option value="">All Status</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <button
          onClick={() => navigate('/fieldwork/new')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          + New Work Order
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted/20 rounded-lg border border-border/50 animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {search || statusFilter ? 'No work orders found' : 'No work orders yet'}
          </p>
          <button
            onClick={() => navigate('/fieldwork/new')}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Create your first work order
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order: FieldWorkOrder) => (
            <div
              key={order.id}
              className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/fieldwork/${order.id}`)}
            >
              <div className="mb-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{order.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">#{order.workOrderNumber}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span>{order.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned:</span>
                  <span>{order.assignedTo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority:</span>
                  <span className={getPriorityBadgeClass(order.priority)}>{order.priority}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                Scheduled: {new Date(order.scheduledDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
