import React, { useState } from 'react'
import { toast } from 'sonner'

type CommType = 'email' | 'call' | 'meeting' | 'note'

interface CommEntry {
  id: string
  type: CommType
  subject: string
  body: string
  direction?: 'inbound' | 'outbound'
  durationMin?: number
  attendees?: string
  createdBy: string
  createdAt: string
}

interface CommunicationHistoryProps {
  entityName?: string
}

const TYPE_META: Record<CommType, { label: string; color: string; icon: React.ReactNode }> = {
  email: {
    label: 'Email',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  call: {
    label: 'Call',
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
  meeting: {
    label: 'Meeting',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  note: {
    label: 'Note',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
}

const SAMPLE_COMMS: CommEntry[] = [
  { id: '1', type: 'email', subject: 'Introduction & product overview', body: 'Hi, attached is our product overview deck. Looking forward to connecting!', direction: 'outbound', createdBy: 'Alice Johnson', createdAt: new Date(Date.now() - 8 * 86400000).toISOString() },
  { id: '2', type: 'call', subject: 'Discovery call — 25 min', body: 'Discussed pain points in current workflow. They are evaluating 3 vendors. Follow-up in 2 weeks.', direction: 'inbound', durationMin: 25, createdBy: 'Alice Johnson', createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: '3', type: 'meeting', subject: 'Demo session', body: 'Full product demo. Team was impressed with the reporting module.', attendees: 'Alice Johnson, Bob Smith, Sarah Lee', createdBy: 'Bob Smith', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
]

const EMPTY_FORM = { type: 'email' as CommType, subject: '', body: '', direction: 'outbound' as 'inbound' | 'outbound', durationMin: '', attendees: '' }

const CommunicationHistory: React.FC<CommunicationHistoryProps> = ({ entityName }) => {
  const [comms, setComms] = useState<CommEntry[]>(SAMPLE_COMMS)
  const [filter, setFilter] = useState<CommType | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = filter === 'all' ? comms : comms.filter(c => c.type === filter)

  const handleLog = () => {
    if (!form.subject.trim()) { toast.error('Subject is required'); return }
    const entry: CommEntry = {
      id: Date.now().toString(),
      type: form.type,
      subject: form.subject,
      body: form.body,
      direction: form.direction,
      durationMin: form.durationMin ? Number(form.durationMin) : undefined,
      attendees: form.attendees || undefined,
      createdBy: 'You',
      createdAt: new Date().toISOString(),
    }
    setComms(prev => [entry, ...prev])
    setForm(EMPTY_FORM)
    setShowForm(false)
    toast.success('Communication logged')
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900">Communications</h3>
          {entityName && <p className="text-xs text-gray-400 mt-0.5">History for {entityName}</p>}
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Log
        </button>
      </div>

      {/* Log form */}
      {showForm && (
        <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as CommType }))}
                className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg">
                <option value="email">Email</option>
                <option value="call">Call</option>
                <option value="meeting">Meeting</option>
                <option value="note">Note</option>
              </select>
            </div>
            {(form.type === 'email' || form.type === 'call') && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Direction</label>
                <select value={form.direction} onChange={e => setForm(f => ({ ...f, direction: e.target.value as 'inbound' | 'outbound' }))}
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg">
                  <option value="outbound">Outbound</option>
                  <option value="inbound">Inbound</option>
                </select>
              </div>
            )}
            {form.type === 'call' && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Duration (min)</label>
                <input type="number" value={form.durationMin} onChange={e => setForm(f => ({ ...f, durationMin: e.target.value }))}
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg" />
              </div>
            )}
            {form.type === 'meeting' && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Attendees</label>
                <input type="text" value={form.attendees} placeholder="Comma separated names"
                  onChange={e => setForm(f => ({ ...f, attendees: e.target.value }))}
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Subject *</label>
            <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Notes / Body</label>
            <textarea value={form.body} rows={3} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleLog} className="text-xs px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold">Save</button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }} className="text-xs px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-100 pb-1">
        {(['all', 'email', 'call', 'meeting', 'note'] as const).map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`text-xs px-3 py-1 rounded-lg font-medium transition capitalize ${filter === t ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}>
            {t === 'all' ? `All (${comms.length})` : t}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No communications logged yet.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => {
            const meta = TYPE_META[c.type]
            const isExpanded = expandedId === c.id
            return (
              <div key={c.id} className="flex gap-3">
                <div className={`mt-1 flex items-center justify-center w-8 h-8 rounded-full border shrink-0 ${meta.color}`}>{meta.icon}</div>
                <div className="flex-1 min-w-0">
                  <button onClick={() => setExpandedId(isExpanded ? null : c.id)}
                    className="w-full text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${meta.color}`}>{meta.label}</span>
                      {c.direction && <span className="text-[10px] text-gray-400">{c.direction === 'inbound' ? '← Inbound' : '→ Outbound'}</span>}
                      {c.durationMin && <span className="text-[10px] text-gray-400">{c.durationMin} min</span>}
                      <span className="text-[10px] text-gray-400 ml-auto">{new Date(c.createdAt).toLocaleDateString()} · {c.createdBy}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-1 truncate">{c.subject}</p>
                  </button>
                  {isExpanded && (
                    <div className="mt-2 text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border border-gray-100">
                      {c.body || <span className="italic text-gray-400">No notes.</span>}
                      {c.attendees && <p className="mt-2 text-xs text-gray-400">Attendees: {c.attendees}</p>}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CommunicationHistory
