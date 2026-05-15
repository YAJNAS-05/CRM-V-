import { useEffect, useState, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { dealApi } from '../../api/crmApi'
import { Deal } from '../../types/crm'
import { useAuthStore } from '../../store/authStore'
import DealsViewHeader from './components/DealsViewHeader'

type StageConfig = {
  key: string
  label: string
  border: string
  columnBg: string
  headerBg: string
  badgeBg: string
  dot: string
}

const DEAL_STAGES: StageConfig[] = [
  {
    key: 'PROSPECTING',
    label: 'Prospecting',
    border: 'border-slate-300',
    columnBg: 'from-slate-50 via-white to-white',
    headerBg: 'from-slate-100 to-slate-50',
    badgeBg: 'bg-slate-100 text-slate-700',
    dot: 'bg-slate-500',
  },
  {
    key: 'QUALIFICATION',
    label: 'Qualification',
    border: 'border-sky-200',
    columnBg: 'from-sky-50 via-white to-white',
    headerBg: 'from-sky-100 to-sky-50',
    badgeBg: 'bg-sky-100 text-sky-700',
    dot: 'bg-sky-500',
  },
  {
    key: 'PROPOSAL',
    label: 'Proposal',
    border: 'border-amber-200',
    columnBg: 'from-amber-50 via-white to-white',
    headerBg: 'from-amber-100 to-amber-50',
    badgeBg: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },
  {
    key: 'NEGOTIATION',
    label: 'Negotiation',
    border: 'border-orange-200',
    columnBg: 'from-orange-50 via-white to-white',
    headerBg: 'from-orange-100 to-orange-50',
    badgeBg: 'bg-orange-100 text-orange-700',
    dot: 'bg-orange-500',
  },
  {
    key: 'CLOSED_WON',
    label: 'Closed Won',
    border: 'border-emerald-200',
    columnBg: 'from-emerald-50 via-white to-white',
    headerBg: 'from-emerald-100 to-emerald-50',
    badgeBg: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  {
    key: 'CLOSED_LOST',
    label: 'Closed Lost',
    border: 'border-rose-200',
    columnBg: 'from-rose-50 via-white to-white',
    headerBg: 'from-rose-100 to-rose-50',
    badgeBg: 'bg-rose-100 text-rose-700',
    dot: 'bg-rose-500',
  },
]

export default function DealKanbanPage() {
  const permissions = useAuthStore((state) => state.user?.permissions)
  const canCreate = permissions?.includes('CRM_CREATE') ?? false
  const canEdit = permissions?.includes('CRM_EDIT') ?? false
  const [dealsByStage, setDealsByStage] = useState<Record<string, Deal[]>>({})
  const [loading, setLoading] = useState(true)
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDeals()
  }, [])

  const fetchStageDeals = async (stageKey: string) => {
    const pageSize = 100
    let pageIndex = 0
    let totalPages = 1
    const allDeals: Deal[] = []

    while (pageIndex < totalPages) {
      const response = await dealApi.getByStage(stageKey, pageIndex, pageSize)
      const data = response.data.data

      if (Array.isArray(data)) {
        return data
      }

      const content = data?.content || []
      allDeals.push(...content)

      if (typeof data?.totalPages === 'number') {
        totalPages = data.totalPages
      } else if (content.length < pageSize) {
        totalPages = pageIndex + 1
      } else {
        totalPages = pageIndex + 2
      }

      if (content.length === 0) {
        break
      }

      pageIndex += 1
    }

    return allDeals
  }

  const fetchDeals = async () => {
    try {
      setLoading(true)
      const stageDeals: Record<string, Deal[]> = {}

      await Promise.all(DEAL_STAGES.map(async (stage) => {
        try {
          stageDeals[stage.key] = await fetchStageDeals(stage.key)
        } catch {
          stageDeals[stage.key] = []
        }
      }))

      setDealsByStage(stageDeals)
    } catch {
      toast.error('Failed to load pipeline')
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (deal: Deal) => {
    if (!canEdit) return
    setDraggedDeal(deal)
  }

  const handleDragEnd = () => {
    setDraggedDeal(null)
    setDragOverStage(null)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>, stage: string) => {
    if (!canEdit) return
    event.preventDefault()
    setDragOverStage(stage)
  }

  const handleDragLeave = () => {
    setDragOverStage(null)
  }

  const handleDrop = async (targetStage: string) => {
    if (!canEdit) return
    setDragOverStage(null)
    if (!draggedDeal || draggedDeal.stage === targetStage) {
      setDraggedDeal(null)
      return
    }

    const sourceStage = draggedDeal.stage
    const targetLabel = DEAL_STAGES.find((stage) => stage.key === targetStage)?.label || targetStage.replace('_', ' ')
    const previousState = { ...dealsByStage }

    setDealsByStage((state) => {
      const nextState = { ...state }
      nextState[sourceStage] = (nextState[sourceStage] || []).filter((deal) => deal.id !== draggedDeal.id)
      nextState[targetStage] = [...(nextState[targetStage] || []), { ...draggedDeal, stage: targetStage }]
      return nextState
    })

    try {
      await dealApi.update(draggedDeal.id, { stage: targetStage })
      toast.success(`Moved to ${targetLabel}`)
    } catch {
      setDealsByStage(previousState)
      toast.error('Failed to update stage')
    } finally {
      setDraggedDeal(null)
    }
  }

  const formatCurrency = (value?: number) => (value ? `$${value.toLocaleString()}` : '$0')

  const formatDate = (dateText?: string) => {
    if (!dateText) return 'No close date'
    const parsed = new Date(dateText)
    if (Number.isNaN(parsed.getTime())) return 'No close date'
    return parsed.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const stageTotal = (stage: string) => (dealsByStage[stage] || []).reduce((sum, deal) => sum + (deal.amount || 0), 0)
  const allDeals = Object.values(dealsByStage).flat()
  const totalDeals = allDeals.length
  const totalValue = allDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0)
  const averageDeal = totalDeals > 0 ? totalValue / totalDeals : 0

  const closingSoon = allDeals.filter((deal) => {
    if (!deal.expectedCloseDate) return false
    const closeDate = new Date(deal.expectedCloseDate)
    if (Number.isNaN(closeDate.getTime())) return false

    const today = new Date()
    const thirtyDaysFromNow = new Date(today)
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    return closeDate >= today && closeDate <= thirtyDaysFromNow
  }).length

  const headerMetrics = [
    { label: 'Open Deals', value: totalDeals },
    { label: 'Pipeline Value', value: formatCurrency(totalValue) },
    { label: 'Avg Deal Size', value: formatCurrency(averageDeal) },
    { label: 'Closing in 30 Days', value: closingSoon },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-sky-600" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <DealsViewHeader
        activeView="kanban"
        title="Deal Workboard"
        subtitle="Fresh Kanban view for pipeline execution and stage movement."
        metrics={headerMetrics}
        canCreate={canCreate}
      />

      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-max gap-4" style={{ minHeight: 'calc(100vh - 300px)' }}>
          {DEAL_STAGES.map((stage) => {
            const deals = dealsByStage[stage.key] || []
            const isDragOver = dragOverStage === stage.key
            const value = stageTotal(stage.key)
            const valueShare = totalValue > 0 ? Math.round((value / totalValue) * 100) : 0

            return (
              <div
                key={stage.key}
                className={`h-full w-[310px] flex-shrink-0 rounded-2xl border bg-gradient-to-b ${stage.columnBg} ${stage.border} shadow-sm transition-all ${isDragOver ? 'ring-2 ring-sky-400 ring-offset-2' : ''}`}
                onDragOver={(event) => handleDragOver(event, stage.key)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(stage.key)}
              >
                <div className={`rounded-t-2xl border-b ${stage.border} bg-gradient-to-r ${stage.headerBg} px-4 py-3`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${stage.dot}`} />
                      <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-slate-700">{stage.label}</h3>
                      <span className={`rounded-md px-1.5 py-0.5 text-xs font-bold ${stage.badgeBg}`}>{deals.length}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-600">{formatCurrency(value)}</span>
                  </div>

                  <div className="mt-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/70">
                      <div className={`h-full rounded-full ${stage.dot}`} style={{ width: `${valueShare}%` }} />
                    </div>
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">{valueShare}% of pipeline value</p>
                  </div>
                </div>

                <div className="max-h-[calc(100vh-360px)] min-h-[220px] flex-1 space-y-3 overflow-y-auto p-3">
                  {deals.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 py-9 text-center text-xs font-medium text-slate-400">
                      {isDragOver ? 'Drop here' : 'No deals'}
                    </div>
                  )}

                  {deals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable={canEdit}
                      onDragStart={() => handleDragStart(deal)}
                      onDragEnd={handleDragEnd}
                      onClick={() => navigate(`/crm/deals/${deal.id}`)}
                      className={`group rounded-xl border border-slate-200 bg-white/95 p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} ${draggedDeal?.id === deal.id ? 'opacity-70 ring-2 ring-sky-300' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-sm font-semibold text-slate-900">{deal.name}</p>
                        <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${stage.dot}`} />
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{formatCurrency(deal.amount)}</span>
                        {deal.probability !== undefined && (
                          <div className="flex items-center gap-1">
                            <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full bg-sky-500"
                                style={{ width: `${Math.max(0, Math.min(100, deal.probability))}%` }}
                              />
                            </div>
                            <span className="font-semibold text-slate-500">{deal.probability}%</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                        <p className="inline-flex items-center gap-1">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {formatDate(deal.expectedCloseDate)}
                        </p>
                        <span className="font-semibold text-slate-400 transition group-hover:text-slate-600">Open</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
