import { useState, useEffect } from 'react'
import { dealApi } from '../../api/crmApi'
import { Deal } from '../../types/crm'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const DEAL_STAGES = [
  { key: 'PROSPECTING', label: 'Prospecting', color: 'border-gray-400', bg: 'bg-gray-50', headerBg: 'bg-gray-100' },
  { key: 'QUALIFICATION', label: 'Qualification', color: 'border-blue-400', bg: 'bg-blue-50', headerBg: 'bg-blue-100' },
  { key: 'PROPOSAL', label: 'Proposal', color: 'border-yellow-400', bg: 'bg-yellow-50', headerBg: 'bg-yellow-100' },
  { key: 'NEGOTIATION', label: 'Negotiation', color: 'border-orange-400', bg: 'bg-orange-50', headerBg: 'bg-orange-100' },
  { key: 'CLOSED_WON', label: 'Closed Won', color: 'border-green-400', bg: 'bg-green-50', headerBg: 'bg-green-100' },
  { key: 'CLOSED_LOST', label: 'Closed Lost', color: 'border-red-400', bg: 'bg-red-50', headerBg: 'bg-red-100' },
]

export default function DealKanbanPage() {
  const [dealsByStage, setDealsByStage] = useState<Record<string, Deal[]>>({})
  const [loading, setLoading] = useState(true)
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => { fetchDeals() }, [])

  const fetchDeals = async () => {
    try {
      setLoading(true)
      const stageDeals: Record<string, Deal[]> = {}
      await Promise.all(DEAL_STAGES.map(async (stage) => {
        try {
          const r = await dealApi.getByStage(stage.key, 0, 100)
          stageDeals[stage.key] = r.data.data?.content || []
        } catch { stageDeals[stage.key] = [] }
      }))
      setDealsByStage(stageDeals)
    } catch { toast.error('Failed to load pipeline') } finally { setLoading(false) }
  }

  const handleDragStart = (deal: Deal) => setDraggedDeal(deal)
  const handleDragOver = (e: React.DragEvent, stage: string) => { e.preventDefault(); setDragOverStage(stage) }
  const handleDragLeave = () => setDragOverStage(null)

  const handleDrop = async (targetStage: string) => {
    setDragOverStage(null)
    if (!draggedDeal || draggedDeal.stage === targetStage) { setDraggedDeal(null); return }
    const prev = { ...dealsByStage }
    setDealsByStage(s => {
      const n = { ...s }
      n[draggedDeal.stage] = n[draggedDeal.stage].filter(d => d.id !== draggedDeal.id)
      n[targetStage] = [...(n[targetStage] || []), { ...draggedDeal, stage: targetStage }]
      return n
    })
    try {
      await dealApi.update(draggedDeal.id, { stage: targetStage })
      toast.success(`Moved to ${targetStage.replace('_', ' ')}`)
    } catch {
      setDealsByStage(prev)
      toast.error('Failed to update stage')
    } finally { setDraggedDeal(null) }
  }

  const fmt = (v?: number) => v ? `$${v.toLocaleString()}` : '—'
  const stageTotal = (stage: string) => (dealsByStage[stage] || []).reduce((s, d) => s + (d.amount || 0), 0)
  const totalDeals = Object.values(dealsByStage).reduce((s, d) => s + d.length, 0)
  const totalValue = Object.values(dealsByStage).flat().reduce((s, d) => s + (d.amount || 0), 0)

  if (loading) return <div className="flex items-center justify-center py-24"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-900 rounded-full p-0.5">
            <Link to="/crm/deals" className="px-4 py-1.5 text-sm font-medium rounded-full text-gray-400 hover:text-white transition">List</Link>
            <Link to="/crm/deals/kanban" className="px-4 py-1.5 text-sm font-medium rounded-full bg-white text-gray-900 shadow-sm">Pipeline</Link>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
            <p className="text-sm text-gray-500 mt-0.5">{totalDeals} deals · {fmt(totalValue)} total value</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/crm/deals/new" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Deal
          </Link>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 220px)' }}>
        {DEAL_STAGES.map(stage => {
          const deals = dealsByStage[stage.key] || []
          const isDragOver = dragOverStage === stage.key
          return (
            <div
              key={stage.key}
              className={`flex-shrink-0 w-72 rounded-lg border-t-2 ${stage.color} bg-white border border-gray-200 flex flex-col transition-all ${isDragOver ? 'ring-2 ring-indigo-400 ring-offset-2' : ''}`}
              onDragOver={e => handleDragOver(e, stage.key)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(stage.key)}
            >
              <div className={`px-3 py-2.5 ${stage.headerBg} rounded-t-lg border-b border-gray-200`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-gray-700 uppercase">{stage.label}</h3>
                    <span className="bg-white text-xs font-bold text-gray-600 px-1.5 py-0.5 rounded">{deals.length}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-500">{fmt(stageTotal(stage.key))}</span>
                </div>
              </div>
              <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
                {deals.length === 0 && (
                  <div className="text-center py-8 text-xs text-gray-400">
                    {isDragOver ? 'Drop here' : 'No deals'}
                  </div>
                )}
                {deals.map(deal => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={() => handleDragStart(deal)}
                    onClick={() => navigate(`/crm/deals/${deal.id}`)}
                    className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow cursor-grab active:cursor-grabbing transition-shadow"
                  >
                    <p className="text-sm font-medium text-gray-900 mb-1.5 truncate">{deal.name}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700">{fmt(deal.amount)}</span>
                      {deal.probability !== undefined && (
                        <div className="flex items-center gap-1">
                          <div className="w-10 h-1 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${deal.probability}%` }}></div></div>
                          <span className="text-gray-400">{deal.probability}%</span>
                        </div>
                      )}
                    </div>
                    {deal.expectedCloseDate && (
                      <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {new Date(deal.expectedCloseDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
