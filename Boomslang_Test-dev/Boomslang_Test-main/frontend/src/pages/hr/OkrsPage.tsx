import { useState, useEffect } from 'react'
import { objectiveApi, okrCycleApi, keyResultApi, okrDashboardApi } from '../../api/okrApi'
import { Objective, OkrCycle, KeyResult, OkrDashboardDto } from '../../types/hr'
import { formatDate, formatPercent } from '../../utils/formatters'
import {
  Plus,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  BarChart3,
} from 'lucide-react'

export default function OkrsPage() {
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [cycles, setCycles] = useState<OkrCycle[]>([])
  const [dashboard, setDashboard] = useState<OkrDashboardDto | null>(null)
  const [selectedCycle, setSelectedCycle] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set())
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [selectedCycle])

  const loadData = async () => {
    try {
      setLoading(true)
      const [objectivesRes, cyclesRes, dashboardRes] = await Promise.all([
        objectiveApi.getAll(selectedCycle || undefined),
        okrCycleApi.getAll(),
        okrDashboardApi.getDashboard(),
      ])
      setObjectives(objectivesRes.data.data)
      setCycles(cyclesRes.data.data)
      setDashboard(dashboardRes.data.data)
    } catch (error) {
      console.error('Failed to load OKRs:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedObjectives)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedObjectives(newSet)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'ARCHIVED':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getKrStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600'
      case 'IN_PROGRESS':
        return 'text-blue-600'
      case 'AT_RISK':
        return 'text-red-600'
      case 'NOT_STARTED':
        return 'text-gray-400'
      default:
        return 'text-gray-600'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-blue-500'
    if (progress >= 20) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OKRs - Objectives & Key Results</h1>
          <p className="text-sm text-gray-500">Track employee performance and goal achievement</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Create Objective
        </button>
      </div>

      {/* Dashboard Stats */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-sm">Total Objectives</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{dashboard.totalObjectives}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Avg Progress</span>
            </div>
            <p className="text-2xl font-bold text-indigo-600">{formatPercent(dashboard.averageProgress)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 text-green-500 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">Completed</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{dashboard.completedObjectives}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">On Track</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{dashboard.onTrackObjectives}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 text-yellow-500 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Behind</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{dashboard.behindObjectives}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">At Risk</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{dashboard.atRiskObjectives}</p>
          </div>
        </div>
      )}

      {/* Cycle Filter */}
      <div className="flex items-center gap-4">
        <select
          value={selectedCycle}
          onChange={(e) => setSelectedCycle(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Cycles</option>
          {cycles.map((cycle) => (
            <option key={cycle.id} value={cycle.id}>
              {cycle.name} ({formatDate(cycle.startDate)} - {formatDate(cycle.endDate)})
            </option>
          ))}
        </select>
      </div>

      {/* Objectives List */}
      <div className="space-y-4">
        {objectives.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No objectives found. Create your first OKR!</p>
          </div>
        ) : (
          objectives.map((objective) => (
            <div key={objective.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Objective Header */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleExpand(objective.id)}
                      className="mt-1 text-gray-400 hover:text-gray-600"
                    >
                      {expandedObjectives.has(objective.id) ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(objective.status)}`}>
                          {objective.status}
                        </span>
                        <span className="text-xs text-gray-500">{objective.category}</span>
                        {objective.weight !== 1 && (
                          <span className="text-xs text-indigo-600">Weight: {objective.weight}x</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900">{objective.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{objective.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Owner: {objective.employeeName}</span>
                        <span>Cycle: {objective.cycleName}</span>
                        {objective.endDate && (
                          <span>Due: {formatDate(objective.endDate)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Progress Circle */}
                    <div className="text-center">
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="text-gray-200"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className={getProgressColor(objective.progress)}
                            strokeDasharray={`${(objective.progress / 100) * 175.93} 175.93`}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                          {formatPercent(objective.progress)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-2 text-gray-400 hover:text-indigo-600">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Results */}
              {expandedObjectives.has(objective.id) && (
                <div className="border-t border-gray-200 bg-gray-50">
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Key Results ({objective.keyResults?.length || 0})
                    </h4>
                    <div className="space-y-3">
                      {objective.keyResults?.map((kr) => (
                        <KeyResultItem key={kr.id} kr={kr} onUpdate={loadData} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function KeyResultItem({ kr, onUpdate }: { kr: KeyResult; onUpdate: () => void }) {
  const [updating, setUpdating] = useState(false)

  const handleProgressUpdate = async (newValue: number) => {
    try {
      setUpdating(true)
      await keyResultApi.updateProgress(kr.id, {
        currentValue: newValue,
        notes: 'Updated from dashboard',
      })
      onUpdate()
    } catch (error) {
      console.error('Failed to update KR progress:', error)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="bg-white p-3 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium ${getKrStatusColor(kr.status)}`}>
              {kr.status}
            </span>
            {kr.confidenceLevel && (
              <span className="text-xs text-gray-500">
                Confidence: {kr.confidenceLevel}/10
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-900">{kr.title}</p>
          <p className="text-xs text-gray-500">{kr.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              {kr.currentValue} / {kr.targetValue} {kr.unit}
            </p>
            <div className="w-32 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full ${getProgressColor(kr.progress)}`}
                style={{ width: `${Math.min(kr.progress, 100)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              disabled={updating}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
              defaultValue={kr.currentValue}
              onBlur={(e) => handleProgressUpdate(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function getKrStatusColor(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return 'text-green-600'
    case 'IN_PROGRESS':
      return 'text-blue-600'
    case 'AT_RISK':
      return 'text-red-600'
    case 'NOT_STARTED':
      return 'text-gray-400'
    default:
      return 'text-gray-600'
  }
}

function getProgressColor(progress: number): string {
  if (progress >= 80) return 'bg-green-500'
  if (progress >= 50) return 'bg-blue-500'
  if (progress >= 20) return 'bg-yellow-500'
  return 'bg-red-500'
}
