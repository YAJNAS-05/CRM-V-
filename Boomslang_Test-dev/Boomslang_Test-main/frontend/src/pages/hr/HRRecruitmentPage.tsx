import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { employeeApi, positionApi } from '../../api/hrApi'
import { Employee, Position, CreatePositionRequest } from '../../types/hr'
import { toast } from 'sonner'

type PipelineCard = {
  id: string
  title: string
  subtitle?: string
  meta?: string
  badge?: string
  tone?: string
}

const HRRecruitmentPage: React.FC = () => {
  const [openPositions, setOpenPositions] = useState<Position[]>([])
  const [recentHires, setRecentHires] = useState<Employee[]>([])
  const [loadingLists, setLoadingLists] = useState(true)
  const [showNewPositionForm, setShowNewPositionForm] = useState(false)
  const [newPosition, setNewPosition] = useState<CreatePositionRequest>({ title: '', grade: '', currency: 'USD' })
  const [savingPosition, setSavingPosition] = useState(false)

  useEffect(() => {
    let active = true

    const loadLists = async () => {
      try {
        setLoadingLists(true)
        const [positionRes, hireRes] = await Promise.all([
          positionApi.getAll(0, 6, { sort: 'createdAt,desc' }),
          employeeApi.getAll(0, 4, { sort: 'hireDate,desc' }),
        ])

        if (!active) return

        setOpenPositions(positionRes.data.data?.content || [])
        setRecentHires(hireRes.data.data?.content || [])
      } catch (error) {
        console.error('Failed to load recruitment lists', error)
      } finally {
        if (active) {
          setLoadingLists(false)
        }
      }
    }

    loadLists()

    return () => {
      active = false
    }
  }, [])

  const formatDate = (date?: string | null) => {
    if (!date) return 'Date TBD'
    const parsed = new Date(date)
    return Number.isNaN(parsed.getTime())
      ? 'Date TBD'
      : parsed.toLocaleDateString('en-AU', { day: '2-digit', month: 'short' })
  }
  const formatEmploymentType = (employmentType: string) =>
    employmentType.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (char) => char.toUpperCase())
  const formatMoney = (value?: number | null, currency?: string | null) => {
    if (value === null || value === undefined) return '—'
    const currencyCode = currency || 'USD'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleCreatePosition = async () => {
    if (!newPosition.title.trim()) { toast.error('Position title is required'); return }
    try {
      setSavingPosition(true)
      const res = await positionApi.create(newPosition)
      if (res.data.data) setOpenPositions(prev => [res.data.data!, ...prev])
      setShowNewPositionForm(false)
      setNewPosition({ title: '', grade: '', currency: 'USD' })
      toast.success('Position created')
    } catch {
      toast.error('Failed to create position')
    } finally {
      setSavingPosition(false)
    }
  }

  const openRoleCards: PipelineCard[] = openPositions.map((position) => {
    const minLabel = position.minSalary !== null && position.minSalary !== undefined
      ? formatMoney(position.minSalary, position.currency)
      : 'Min —'
    const maxLabel = position.maxSalary !== null && position.maxSalary !== undefined
      ? formatMoney(position.maxSalary, position.currency)
      : 'Max —'
    return {
      id: position.id,
      title: position.title,
      subtitle: position.grade ? `Grade ${position.grade}` : 'Grade not set',
      meta: `${minLabel} · ${maxLabel}`,
      badge: 'Open role',
      tone: 'border-blue-200 bg-blue-50 text-blue-700',
    }
  })

  const hireCards: PipelineCard[] = recentHires.map((hire) => ({
    id: hire.id,
    title: `${hire.firstName} ${hire.lastName}`,
    subtitle: formatEmploymentType(hire.employmentType),
    meta: `Start ${formatDate(hire.hireDate)}`,
    badge: 'Hired',
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  }))

  const screeningCards: PipelineCard[] = []
  const rejectedCards: PipelineCard[] = []

  const summaryCards = [
    {
      label: 'Open positions',
      count: loadingLists ? '—' : openRoleCards.length,
      detail: 'Roles currently open',
    },
    {
      label: 'Screening',
      count: screeningCards.length,
      detail: 'Candidates in review',
    },
    {
      label: 'Hired',
      count: loadingLists ? '—' : hireCards.length,
      detail: 'Offers accepted',
    },
    {
      label: 'Rejected',
      count: rejectedCards.length,
      detail: 'Closed out candidates',
    },
  ]

  const pipelineColumns = [
    {
      key: 'open',
      title: 'Open positions',
      hint: 'Roles currently accepting applicants',
      items: openRoleCards,
      loading: loadingLists,
      empty: 'No open positions yet.',
    },
    {
      key: 'screening',
      title: 'Screening',
      hint: 'Candidates in review',
      items: screeningCards,
      loading: false,
      empty: 'No candidates in screening.',
    },
    {
      key: 'hired',
      title: 'Hired',
      hint: 'Offers accepted',
      items: hireCards,
      loading: loadingLists,
      empty: 'No hires yet.',
    },
    {
      key: 'rejected',
      title: 'Rejected',
      hint: 'Closed out candidates',
      items: rejectedCards,
      loading: false,
      empty: 'No rejections recorded.',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="shell-card p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Recruitment</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">Hiring pipeline</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Build job posts, track candidates, and convert applicants into employees.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowNewPositionForm(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + Post Position
            </button>
            <Link
              to="/hr/positions"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Open roles
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="shell-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">{card.label}</p>
              <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                {card.count}
              </span>
            </div>
            <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">{card.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="shell-card p-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Pipeline board</h2>
          <p className="text-xs text-slate-500 mt-1">Track candidates from open roles to final decisions.</p>
        </div>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
          {pipelineColumns.map((column) => (
            <div key={column.key} className="min-w-[240px] max-w-[300px] flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{column.title}</p>
                  <p className="text-xs text-slate-500">{column.hint}</p>
                </div>
                <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                  {column.loading ? '—' : column.items.length}
                </span>
              </div>
              <div className="mt-3 space-y-3">
                {column.loading ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-500">
                    Loading pipeline...
                  </div>
                ) : column.items.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-500">
                    {column.empty}
                  </div>
                ) : (
                  column.items.map((card) => (
                    <div key={card.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">{card.title}</p>
                        {card.badge && (
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${card.tone || 'border-slate-200 text-slate-500'}`}>
                            {card.badge}
                          </span>
                        )}
                      </div>
                      {card.subtitle && <p className="mt-1 text-xs text-slate-500">{card.subtitle}</p>}
                      {card.meta && <p className="mt-2 text-xs text-slate-400">{card.meta}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showNewPositionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Post New Position</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Job Title *</label>
                <input
                  type="text"
                  value={newPosition.title}
                  onChange={e => setNewPosition(p => ({ ...p, title: e.target.value }))}
                  className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Grade</label>
                <input type="text" value={newPosition.grade || ''}
                  onChange={e => setNewPosition(p => ({ ...p, grade: e.target.value }))}
                  className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="e.g. L4" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-xs font-semibold text-slate-600">Currency</label>
                  <input type="text" value={newPosition.currency || 'USD'}
                    onChange={e => setNewPosition(p => ({ ...p, currency: e.target.value }))}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Min Salary</label>
                  <input type="number" value={newPosition.minSalary ?? ''}
                    onChange={e => setNewPosition(p => ({ ...p, minSalary: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Max Salary</label>
                  <input type="number" value={newPosition.maxSalary ?? ''}
                    onChange={e => setNewPosition(p => ({ ...p, maxSalary: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowNewPositionForm(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleCreatePosition} disabled={savingPosition}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                {savingPosition ? 'Saving...' : 'Post Position'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HRRecruitmentPage
