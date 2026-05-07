import React, { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { attendanceApi } from '../../api/hrApi'
import { AttendancePunch } from '../../types/hr'

const formatDate = (value: Date) => value.toISOString().split('T')[0]

const AttendancePage: React.FC = () => {
  const queryClient = useQueryClient()
  const [employeeId, setEmployeeId] = useState('')
  const [start, setStart] = useState(() => formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)))
  const [end, setEnd] = useState(() => formatDate(new Date()))

  const [editingPunch, setEditingPunch] = useState<AttendancePunch | null>(null)
  const [correctionIn, setCorrectionIn] = useState('')
  const [correctionOut, setCorrectionOut] = useState('')
  const [correctionNotes, setCorrectionNotes] = useState('')

  const { data: punches, isLoading } = useQuery({
    queryKey: ['hr-attendance', start, end, employeeId],
    queryFn: async () => {
      const res = await attendanceApi.getAll({ start, end, employeeId: employeeId || undefined })
      return res.data.data || []
    },
  })

  const correctionMutation = useMutation({
    mutationFn: (payload: { punchId: string; punchIn: string; punchOut?: string | null; notes?: string | null }) =>
      attendanceApi.correction(payload.punchId, { punchIn: payload.punchIn, punchOut: payload.punchOut, notes: payload.notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-attendance'] })
      toast.success('Correction saved')
      setEditingPunch(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save correction')
    },
  })

  const weekHours = useMemo(() => {
    const values = punches || []
    const last5 = values.slice(0, 5)
    return last5.reduce((sum, p) => sum + (p.totalHours || 0), 0)
  }, [punches])

  return (
    <div className="space-y-6">
      <div className="shell-card p-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Time & Attendance</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Attendance</h1>
        <p className="text-sm text-slate-600 mt-1">Review punch history and apply corrections when needed.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="shell-card p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{weekHours.toFixed(1)}h</p>
          <p className="text-xs text-slate-500 mt-1">This Week (loaded)</p>
        </div>
        <div className="shell-card p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{punches?.length || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Records Loaded</p>
        </div>
        <div className="shell-card p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{start}</p>
          <p className="text-xs text-slate-500 mt-1">Start</p>
        </div>
        <div className="shell-card p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{end}</p>
          <p className="text-xs text-slate-500 mt-1">End</p>
        </div>
      </div>

      <div className="shell-card p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Start</label>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">End</label>
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Employee ID (optional)</label>
            <input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="Filter by employee UUID" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>
      </div>

      <div className="shell-card p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Attendance History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Punch In</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Punch Out</th>
                <th className="pb-3 text-right text-xs font-semibold text-slate-500 uppercase">Hours</th>
                <th className="pb-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="pb-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-slate-500">Loading attendance...</td>
                </tr>
              ) : (punches || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-slate-500">No records found for selected range.</td>
                </tr>
              ) : (punches || []).map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3 font-medium text-slate-900">{p.workDate}</td>
                  <td className="py-3 text-slate-700">
                    {new Date(p.punchIn).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 text-slate-700">
                    {p.punchOut
                      ? new Date(p.punchOut).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
                      : <span className="text-amber-600">Active</span>}
                  </td>
                  <td className="py-3 text-right font-semibold text-slate-900">
                    {p.totalHours != null ? `${p.totalHours.toFixed(2)}h` : '-'}
                  </td>
                  <td className="py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      p.totalHours != null
                        ? p.totalHours >= 8
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      {p.totalHours != null ? (p.totalHours >= 8 ? 'Full Day' : 'Partial') : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPunch(p)
                        setCorrectionIn(p.punchIn)
                        setCorrectionOut(p.punchOut || '')
                        setCorrectionNotes(p.notes || '')
                      }}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Correct
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingPunch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">Attendance correction</h2>
            <p className="mt-1 text-sm text-slate-600">Update punch-in/out times and notes.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Punch in (ISO)</label>
                <input value={correctionIn} onChange={(e) => setCorrectionIn(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Punch out (ISO)</label>
                <input value={correctionOut} onChange={(e) => setCorrectionOut(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Notes</label>
                <textarea value={correctionNotes} onChange={(e) => setCorrectionNotes(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingPunch(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={correctionMutation.isPending}
                onClick={() => {
                  if (!correctionIn.trim()) {
                    toast.error('Punch in is required')
                    return
                  }
                  correctionMutation.mutate({
                    punchId: editingPunch.id,
                    punchIn: correctionIn.trim(),
                    punchOut: correctionOut.trim() ? correctionOut.trim() : null,
                    notes: correctionNotes.trim() ? correctionNotes.trim() : null,
                  })
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {correctionMutation.isPending ? 'Saving...' : 'Save correction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendancePage
