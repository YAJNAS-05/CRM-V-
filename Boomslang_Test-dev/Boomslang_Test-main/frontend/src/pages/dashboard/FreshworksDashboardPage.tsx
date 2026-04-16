// src/pages/dashboard/FreshworksDashboardPage.tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { dashboardApi, Dashboard, DashboardWidget, CreateWidgetRequest } from '@/api/dashboardApi'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { Plus, Settings, MoreVertical, Trash2, LockOpen, Lock, Eye, EyeOff, X } from 'lucide-react'
import DashboardGrid from '@/components/dashboard/DashboardGrid'
import WidgetManager from '@/components/dashboard/WidgetManager'
import DashboardSettings from '@/components/dashboard/DashboardSettings'

export const FreshworksDashboardPage = () => {
  const { dashboardId: paramDashboardId } = useParams<{ dashboardId?: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((state: any) => state.user)
  const queryClient = useQueryClient()
  
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [showWidgetManager, setShowWidgetManager] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editingDashboard, setEditingDashboard] = useState(false)
  const [dashboardId, setDashboardId] = useState<number | null>(
    paramDashboardId ? parseInt(paramDashboardId) : null
  )

  // Fetch default dashboard if no ID provided
  const { data: defaultDashboard, isLoading: defaultLoading } = useQuery({
    queryKey: ['default-dashboard'],
    queryFn: async () => {
      try {
        const res = await dashboardApi.getDefaultDashboard()
        return res.data?.data
      } catch (err) {
        return null
      }
    },
    enabled: !dashboardId && !!user,
  })

  // Update dashboardId when defaultDashboard is fetched
  useEffect(() => {
    if (defaultDashboard && !dashboardId) {
      setDashboardId(defaultDashboard.dashboardId!)
    }
  }, [defaultDashboard, dashboardId])

  // Fetch dashboard
  const { data: fetchedDashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboard', dashboardId],
    queryFn: async () => {
      if (!dashboardId) return null
      try {
        const res = await dashboardApi.getDashboard(dashboardId)
        return res.data?.data
      } catch (err) {
        toast.error('Failed to load dashboard')
        return null
      }
    },
    enabled: !!dashboardId,
  })

  // Fetch widgets
  const { data: fetchedWidgets, isLoading: widgetsLoading } = useQuery({
    queryKey: ['dashboard-widgets', dashboardId],
    queryFn: async () => {
      if (!dashboardId) return []
      try {
        const res = await dashboardApi.getWidgets(dashboardId)
        return res.data?.data || []
      } catch (err) {
        toast.error('Failed to load widgets')
        return []
      }
    },
    enabled: !!dashboardId,
  })

  useEffect(() => {
    if (fetchedDashboard) setDashboard(fetchedDashboard)
  }, [fetchedDashboard])

  useEffect(() => {
    if (fetchedWidgets) setWidgets(fetchedWidgets)
  }, [fetchedWidgets])

  // Create widget mutation
  const createWidgetMutation = useMutation({
    mutationFn: async (request: CreateWidgetRequest) => {
      if (!dashboardId) throw new Error('No dashboard selected')
      const res = await dashboardApi.createWidget(dashboardId, request)
      return res.data?.data
    },
    onSuccess: (newWidget) => {
      if (newWidget) {
        setWidgets([...widgets, newWidget])
        queryClient.invalidateQueries({ queryKey: ['dashboard-widgets', dashboardId] })
        toast.success('Widget added successfully')
        setShowWidgetManager(false)
      }
    },
    onError: () => {
      toast.error('Failed to create widget')
    },
  })

  // Delete widget mutation
  const deleteWidgetMutation = useMutation({
    mutationFn: async (widgetId: number) => {
      if (!dashboardId) throw new Error('No dashboard selected')
      await dashboardApi.deleteWidget(dashboardId, widgetId)
    },
    onSuccess: (_, widgetId) => {
      setWidgets(widgets.filter(w => w.widgetId !== widgetId))
      queryClient.invalidateQueries({ queryKey: ['dashboard-widgets', dashboardId] })
      toast.success('Widget deleted')
    },
    onError: () => {
      toast.error('Failed to delete widget')
    },
  })

  // Update widget position mutation
  const updatePositionsMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!dashboardId) throw new Error('No dashboard selected')
      await dashboardApi.updateWidgetPositions(dashboardId, { updates })
    },
    onError: () => {
      toast.error('Failed to update widget positions')
    },
  })

  // Update widget visibility
  const toggleWidgetVisibility = async (widget: DashboardWidget) => {
    if (!dashboardId) return
    try {
      const updated = await dashboardApi.updateWidget(dashboardId, widget.widgetId!, {
        isVisible: !widget.isVisible,
      })
      setWidgets(widgets.map(w => w.widgetId === widget.widgetId ? updated.data?.data! : w))
      toast.success(`Widget ${widget.isVisible ? 'hidden' : 'shown'}`)
    } catch (err) {
      toast.error('Failed to update widget')
    }
  }

  // Update widget lock
  const toggleWidgetLock = async (widget: DashboardWidget) => {
    if (!dashboardId) return
    try {
      const updated = await dashboardApi.updateWidget(dashboardId, widget.widgetId!, {
        isLocked: !widget.isLocked,
      })
      setWidgets(widgets.map(w => w.widgetId === widget.widgetId ? updated.data?.data! : w))
      toast.success(`Widget ${widget.isLocked ? 'unlocked' : 'locked'}`)
    } catch (err) {
      toast.error('Failed to update widget')
    }
  }

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result

    if (!destination) return
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }

    const widgetId = parseInt(draggableId.replace('widget-', ''))
    const widget = widgets.find(w => w.widgetId === widgetId)
    if (!widget) return

    // Update local state
    const updated = [...widgets]
    const fromIndex = updated.findIndex(w => w.widgetId === widgetId)
    updated.splice(fromIndex, 1)
    updated.splice(destination.index, 0, widget)

    setWidgets(updated)

    // Send to backend
    const updates = updated.map((w, idx) => ({
      widgetId: w.widgetId,
      widgetOrder: idx,
    }))

    updatePositionsMutation.mutate(updates)
  }

  if (defaultLoading || dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <h2 className="text-2xl font-bold">No Dashboard Found</h2>
        <p className="text-gray-600">Create a new dashboard to get started</p>
        <button 
          onClick={() => navigate('/dashboard/new')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-40">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{dashboard.dashboardName}</h1>
              {dashboard.description && (
                <p className="text-gray-600 mt-1 text-sm">{dashboard.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowWidgetManager(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Add Widget
              </button>

              <div className="relative group">
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                  <MoreVertical className="h-4 w-4" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200 hidden group-hover:block">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                  <button
                    onClick={() => setEditingDashboard(true)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm border-t"
                  >
                    Edit Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Plus className="h-12 w-12 text-gray-400 mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No widgets yet</h3>
            <p className="text-gray-600 text-sm mb-4">
              Add your first widget to bring your dashboard to life
            </p>
            <button
              onClick={() => setShowWidgetManager(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Add Widget
            </button>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <DashboardGrid
              widgets={widgets}
              gridColumns={dashboard.gridColumns || 12}
              onDeleteWidget={(widgetId) => deleteWidgetMutation.mutate(widgetId)}
              onToggleVisibility={toggleWidgetVisibility}
              onToggleLock={toggleWidgetLock}
            />
          </DragDropContext>
        )}
      </div>

      {/* Widget Manager Modal */}
      {showWidgetManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold">Add Widget to Dashboard</h2>
                <p className="text-sm text-gray-600">
                  Select a widget type and configure it to visualize your data
                </p>
              </div>
              <button
                onClick={() => setShowWidgetManager(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <WidgetManager
                onSubmit={(request) => createWidgetMutation.mutate(request)}
                isLoading={createWidgetMutation.isPending}
              />
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Dashboard Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <DashboardSettings
                dashboard={dashboard}
                onClose={() => setShowSettings(false)}
                dashboardId={dashboardId!}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FreshworksDashboardPage
