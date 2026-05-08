import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fieldworkApi } from '../../api/fieldworkApi'
import { FieldJobDto, TechnicianDto } from '../../types/fieldwork'
import { exportToExcel, getExportDateStamp } from '../../utils/exportToExcel'
import { FeatureGate } from '../../components/rbac'

interface FieldWorkOrder {
  id: number | string
  workOrderNumber: string
  title: string
  location: string
  assignedTo: string
  assignedTechnician?: TechnicianDto
  status: 'DRAFT' | 'SCHEDULED' | 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING_PARTS' | 'PENDING_CUSTOMER_APPROVAL' | 'COMPLETED' | 'CANCELLED' | 'REVERSED' | 'PENDING_SIGN_OFF'
  priority: 'ROUTINE' | 'URGENT' | 'CRITICAL' | 'EMERGENCY'
  scheduledDate: string
  estimatedDuration: number
  category: string
  description: string
  customerName: string
  customerPhone: string
  actualCost?: number
  estimatedCost?: number
  latitude?: number
  longitude?: number
  requiresParts: boolean
  requiresSpecialEquipment: boolean
  weatherDependent: boolean
}

const mapJobStatus = (status: FieldJobDto['status']): FieldWorkOrder['status'] => {
  switch (status) {
    case 'DRAFT':
      return 'DRAFT'
    case 'SCHEDULED':
      return 'SCHEDULED'
    case 'ASSIGNED':
      return 'ASSIGNED'
    case 'IN_PROGRESS':
      return 'IN_PROGRESS'
    case 'PENDING_PARTS':
      return 'PENDING_PARTS'
    case 'PENDING_CUSTOMER_APPROVAL':
      return 'PENDING_CUSTOMER_APPROVAL'
    case 'COMPLETED':
      return 'COMPLETED'
    case 'CANCELLED':
      return 'CANCELLED'
    case 'REVERSED':
      return 'REVERSED'
    case 'PENDING_SIGN_OFF':
      return 'PENDING_SIGN_OFF'
    default:
      return 'DRAFT'
  }
}

const mapJobPriority = (priority: FieldJobDto['priority']): FieldWorkOrder['priority'] => {
  switch (priority) {
    case 'EMERGENCY':
      return 'EMERGENCY'
    case 'CRITICAL':
      return 'CRITICAL'
    case 'URGENT':
      return 'URGENT'
    case 'ROUTINE':
      return 'ROUTINE'
    default:
      return 'ROUTINE'
  }
}

export const FieldWorkListPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const basePath = location.pathname.startsWith('/erp/field-jobs') ? '/erp/field-jobs' : '/fieldwork'
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [showTechnicianMap, setShowTechnicianMap] = useState(false)

  // Fetch available technicians for real-time tracking
  const { data: activeTechnicians } = useQuery({
    queryKey: ['active-technicians'],
    queryFn: async () => {
      try {
        const result = await fieldworkApi.getActiveEngineerLocations()
        return result.data || []
      } catch (error) {
        console.error('Error fetching active technicians:', error)
        return []
      }
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  const { data: urgentJobs } = useQuery({
    queryKey: ['urgent-jobs'],
    queryFn: async () => {
      try {
        const result = await fieldworkApi.getUrgentJobs()
        return result
      } catch (error) {
        console.error('Error fetching urgent jobs:', error)
        return []
      }
    },
    refetchInterval: 60000 // Refresh every minute
  })

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

  const workOrders: FieldWorkOrder[] = (response || []).map((job: FieldJobDto) => ({
    id: job.id || job.jobNumber,
    workOrderNumber: job.jobNumber ? `WO-${job.jobNumber}` : `WO-${job.id ?? 'N/A'}`,
    title: job.title || 'Untitled',
    location: job.location || 'Unknown',
    assignedTo: job.assignedTechnician?.firstName + ' ' + job.assignedTechnician?.lastName || 'Unassigned',
    assignedTechnician: job.assignedTechnician,
    status: mapJobStatus(job.status),
    priority: mapJobPriority(job.priority),
    scheduledDate: job.scheduledDate || new Date().toISOString(),
    estimatedDuration: job.estimatedDuration || 0,
    category: job.category || '',
    description: job.description || '',
    customerName: job.customerName || '',
    customerPhone: job.customerPhone || '',
    actualCost: job.actualCost || undefined,
    estimatedCost: job.estimatedCost || undefined,
    latitude: job.latitude || undefined,
    longitude: job.longitude || undefined,
    requiresParts: job.requiresParts || false,
    requiresSpecialEquipment: job.requiresSpecialEquipment || false,
    weatherDependent: job.weatherDependent || false
  }))

  const filteredOrders = workOrders.filter((order) =>
    order.title.toLowerCase().includes(search.toLowerCase()) ||
    order.workOrderNumber.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800'
      case 'ASSIGNED':
        return 'bg-indigo-100 text-indigo-800'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800'
      case 'PENDING_PARTS':
        return 'bg-orange-100 text-orange-800'
      case 'PENDING_CUSTOMER_APPROVAL':
        return 'bg-purple-100 text-purple-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'REVERSED':
        return 'bg-pink-100 text-pink-800'
      case 'PENDING_SIGN_OFF':
        return 'bg-teal-100 text-teal-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'EMERGENCY':
        return 'text-red-600 font-bold'
      case 'CRITICAL':
        return 'text-orange-600 font-semibold'
      case 'URGENT':
        return 'text-yellow-600'
      case 'ROUTINE':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const handleExport = () => {
    const rows = filteredOrders.map((order) => ({
      WorkOrderNumber: order.workOrderNumber,
      Title: order.title,
      Status: order.status,
      Priority: order.priority,
      Location: order.location,
      AssignedTo: order.assignedTo,
      ScheduledDate: order.scheduledDate,
      EstimatedDurationHours: order.estimatedDuration,
      Category: order.category,
      Description: order.description,
    }))

    exportToExcel(rows, {
      fileName: `EVERX_Work_Orders_${getExportDateStamp()}.xlsx`,
      sheetName: 'Work Orders',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Field Work Orders</h1>
        <p className="text-muted-foreground mt-1">Manage and track field service work orders</p>
      </div>

      {/* Real-time Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Technicians</p>
              <p className="text-2xl font-bold">{activeTechnicians?.length || 0}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xs font-bold">●</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Urgent Jobs</p>
              <p className="text-2xl font-bold text-red-600">{urgentJobs?.length || 0}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xs font-bold">!</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
              <p className="text-2xl font-bold">{workOrders?.length || 0}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xs font-bold">📋</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowTechnicianMap(!showTechnicianMap)}
          className="px-4 py-2 border border-border rounded-lg hover:bg-accent flex items-center gap-2"
        >
          🗺️ {showTechnicianMap ? 'Hide' : 'Show'} Technician Map
        </button>
        {urgentJobs && urgentJobs.length > 0 && (
          <button
            onClick={() => navigate(`${basePath}/urgent`)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            ⚠️ View Urgent Jobs ({urgentJobs.length})
          </button>
        )}
      </div>

      {/* Technician Map View */}
      {showTechnicianMap && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Active Technicians - Real-time Tracking</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeTechnicians?.slice(0, 8).map((tech: any, index: number) => (
              <div key={index} className="border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Technician {tech.technicianId}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last seen: {new Date(tech.timestamp).toLocaleTimeString()}
                </p>
                {tech.address && (
                  <p className="text-xs text-muted-foreground truncate">
                    📍 {tech.address}
                  </p>
                )}
              </div>
            ))}
            {(!activeTechnicians || activeTechnicians.length === 0) && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No active technicians currently tracked
              </div>
            )}
          </div>
        </div>
      )}

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
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PENDING_PARTS">Pending Parts</option>
            <option value="PENDING_CUSTOMER_APPROVAL">Pending Customer Approval</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="PENDING_SIGN_OFF">Pending Sign Off</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={filteredOrders.length === 0}
            className="px-4 py-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export
          </button>
          <FeatureGate requiredPermission="ERP_CREATE">
            <button
              onClick={() => navigate(`${basePath}/new`)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              + New Work Order
            </button>
          </FeatureGate>
        </div>
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
          <FeatureGate requiredPermission="ERP_CREATE">
            <button
              onClick={() => navigate(`${basePath}/new`)}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Create your first work order
            </button>
          </FeatureGate>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => navigate(`${basePath}/${order.id}`)}
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
