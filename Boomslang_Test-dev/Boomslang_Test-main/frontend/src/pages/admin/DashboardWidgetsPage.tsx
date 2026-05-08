import { useState, useEffect } from 'react'
import { dashboardApi } from '../../api/dashboardApi'
import { GripVertical, Plus, X, Settings, Maximize2, Trash2, Save, Layout, BarChart3, PieChart, TrendingUp, Activity, Users, DollarSign, FileText } from 'lucide-react'

interface WidgetTemplate {
  id: string
  name: string
  type: string
  description: string
  icon: string
}

interface DashboardWidget {
  id: string
  templateId: string
  title: string
  position: { x: number; y: number; w: number; h: number }
  config: Record<string, any>
}

interface UserDashboard {
  id: string
  name: string
  widgets: DashboardWidget[]
}

const WIDGET_TEMPLATES: WidgetTemplate[] = [
  { id: 'kpi-card', name: 'KPI Card', type: 'kpi', description: 'Display single metric', icon: 'BarChart3' },
  { id: 'line-chart', name: 'Line Chart', type: 'chart', description: 'Trend visualization', icon: 'TrendingUp' },
  { id: 'bar-chart', name: 'Bar Chart', type: 'chart', description: 'Comparison visualization', icon: 'BarChart3' },
  { id: 'pie-chart', name: 'Pie Chart', type: 'chart', description: 'Distribution visualization', icon: 'PieChart' },
  { id: 'data-table', name: 'Data Table', type: 'table', description: 'Tabular data display', icon: 'FileText' },
  { id: 'activity-feed', name: 'Activity Feed', type: 'feed', description: 'Recent activities', icon: 'Activity' },
  { id: 'lead-source', name: 'Lead Source', type: 'chart', description: 'Lead source breakdown', icon: 'Users' },
  { id: 'revenue-chart', name: 'Revenue', type: 'chart', description: 'Revenue trends', icon: 'DollarSign' },
]

const getWidgetIcon = (iconName: string) => {
  switch (iconName) {
    case 'BarChart3': return <BarChart3 className="w-5 h-5" />
    case 'TrendingUp': return <TrendingUp className="w-5 h-5" />
    case 'PieChart': return <PieChart className="w-5 h-5" />
    case 'Activity': return <Activity className="w-5 h-5" />
    case 'Users': return <Users className="w-5 h-5" />
    case 'DollarSign': return <DollarSign className="w-5 h-5" />
    case 'FileText': return <FileText className="w-5 h-5" />
    default: return <BarChart3 className="w-5 h-5" />
  }
}

export default function DashboardWidgetsPage() {
  const [dashboards, setDashboards] = useState<UserDashboard[]>([])
  const [currentDashboard, setCurrentDashboard] = useState<UserDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [showWidgetPicker, setShowWidgetPicker] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    loadDashboards()
  }, [])

  const loadDashboards = async () => {
    try {
      setLoading(true)
      const response = await dashboardApi.getDashboards()
      setDashboards(response.data.data || [])
      if (response.data.data?.length > 0) {
        setCurrentDashboard(response.data.data[0])
      }
    } catch (error) {
      console.error('Failed to load dashboards:', error)
    } finally {
      setLoading(false)
    }
  }

  const addWidget = async (template: WidgetTemplate) => {
    if (!currentDashboard) return
    
    const newWidget: DashboardWidget = {
      id: Date.now().toString(),
      templateId: template.id,
      title: template.name,
      position: { x: 0, y: 0, w: 3, h: 2 },
      config: {},
    }

    try {
      await dashboardApi.addWidget(currentDashboard.id, newWidget)
      setCurrentDashboard({
        ...currentDashboard,
        widgets: [...currentDashboard.widgets, newWidget],
      })
      setShowWidgetPicker(false)
    } catch (error) {
      console.error('Failed to add widget:', error)
    }
  }

  const removeWidget = async (widgetId: string) => {
    if (!currentDashboard) return

    try {
      await dashboardApi.removeWidget(currentDashboard.id, widgetId)
      setCurrentDashboard({
        ...currentDashboard,
        widgets: currentDashboard.widgets.filter(w => w.id !== widgetId),
      })
    } catch (error) {
      console.error('Failed to remove widget:', error)
    }
  }

  const saveLayout = async () => {
    if (!currentDashboard) return

    try {
      await dashboardApi.saveLayout(currentDashboard.id, currentDashboard.widgets)
      setEditMode(false)
    } catch (error) {
      console.error('Failed to save layout:', error)
    }
  }

  const createDashboard = async () => {
    const name = prompt('Enter dashboard name:')
    if (!name) return

    try {
      const response = await dashboardApi.createDashboard({ name, widgets: [] })
      setDashboards([...dashboards, response.data.data])
      setCurrentDashboard(response.data.data)
    } catch (error) {
      console.error('Failed to create dashboard:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Widgets</h1>
          <p className="text-sm text-gray-500">Customize your dashboard layout and widgets</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={currentDashboard?.id || ''}
            onChange={(e) => {
              const dash = dashboards.find(d => d.id === e.target.value)
              setCurrentDashboard(dash || null)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            {dashboards.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <button
            onClick={createDashboard}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Plus className="w-4 h-4" />
            New Dashboard
          </button>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              editMode ? 'bg-indigo-600 text-white' : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            {editMode ? 'Exit Edit' : 'Edit Layout'}
          </button>
          {editMode && (
            <button
              onClick={saveLayout}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          )}
        </div>
      </div>

      {/* Widget Templates */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Available Widgets</h2>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {WIDGET_TEMPLATES.map(template => (
            <button
              key={template.id}
              onClick={() => addWidget(template)}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-center"
            >
              <div className="mx-auto w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-2">
                {getWidgetIcon(template.icon)}
              </div>
              <p className="font-medium text-gray-900 text-sm">{template.name}</p>
              <p className="text-xs text-gray-500 mt-1">{template.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="bg-white rounded-xl border border-gray-200 min-h-96">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">{currentDashboard?.name || 'Dashboard'}</h2>
          <span className="text-sm text-gray-500">
            {currentDashboard?.widgets.length || 0} widgets
          </span>
        </div>
        
        {currentDashboard?.widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Layout className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-lg font-medium">No widgets added</p>
            <p className="text-sm">Click a widget template above to add it to your dashboard</p>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentDashboard?.widgets.map((widget) => (
              <div
                key={widget.id}
                className={`bg-gray-50 rounded-lg border border-gray-200 p-4 ${
                  editMode ? 'cursor-move' : ''
                }`}
                style={{
                  gridColumn: `span ${widget.position.w}`,
                  gridRow: `span ${widget.position.h}`,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {editMode && <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />}
                    <h3 className="font-medium text-gray-900">{widget.title}</h3>
                  </div>
                  {editMode && (
                    <div className="flex items-center gap-1">
                      <button className="p-1 text-gray-400 hover:text-indigo-600">
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeWidget(widget.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="h-32 bg-white rounded border border-gray-100 flex items-center justify-center">
                  <p className="text-sm text-gray-400">Widget Content</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
