import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { AttendancePunch } from '../../types/hr'

const today = () => new Date().toISOString().split('T')[0]
const nowStr = () => new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

const SAMPLE_HISTORY: AttendancePunch[] = [
  { id: '1', employeeId: 'me', punchIn: '2026-04-14T08:58:00Z', punchOut: '2026-04-14T17:02:00Z', workDate: '2026-04-14', totalHours: 8.07 },
  { id: '2', employeeId: 'me', punchIn: '2026-04-13T09:01:00Z', punchOut: '2026-04-13T17:30:00Z', workDate: '2026-04-13', totalHours: 8.48 },
  { id: '3', employeeId: 'me', punchIn: '2026-04-12T08:45:00Z', punchOut: '2026-04-12T17:00:00Z', workDate: '2026-04-12', totalHours: 8.25 },
  { id: '4', employeeId: 'me', punchIn: '2026-04-11T09:15:00Z', punchOut: '2026-04-11T18:00:00Z', workDate: '2026-04-11', totalHours: 8.75 },
  { id: '5', employeeId: 'me', punchIn: '2026-04-10T08:55:00Z', punchOut: '2026-04-10T17:05:00Z', workDate: '2026-04-10', totalHours: 8.17 },
]
const HR_ATTENDANCE_DEMO_MODE = import.meta.env.VITE_HR_ATTENDANCE_DEMO_MODE === 'true'

const AttendancePage: React.FC = () => {
  const [punchHistory, setPunchHistory] = useState<AttendancePunch[]>(HR_ATTENDANCE_DEMO_MODE ? SAMPLE_HISTORY : [])
  const [currentPunch, setCurrentPunch] = useState<AttendancePunch | null>(null)
  const [currentTime, setCurrentTime] = useState(nowStr())
  const [notes, setNotes] = useState('')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(nowStr())
      if (currentPunch) {
        const inTime = new Date(currentPunch.punchIn).getTime()
        const elapsed = Math.floor((Date.now() - inTime) / 1000)
        setElapsedSeconds(elapsed)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [currentPunch])

  const formatElapsed = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const handlePunchIn = () => {
    if (!HR_ATTENDANCE_DEMO_MODE) {
      toast.info('Attendance demo mode is disabled. Connect the backend endpoint to enable live punch tracking.')
      return
    }
    const newPunch: AttendancePunch = {
      id: String(Date.now()),
      employeeId: 'me',
      punchIn: new Date().toISOString(),
      workDate: today(),
      notes: notes || null,
    }
    setCurrentPunch(newPunch)
    setElapsedSeconds(0)
    toast.success(`Punched in at ${currentTime}`)
    setNotes('')
  }

  const handlePunchOut = () => {
    if (!HR_ATTENDANCE_DEMO_MODE) {
      toast.info('Attendance demo mode is disabled')
      return
    }
    if (!currentPunch) return
    const punchOut = new Date().toISOString()
    const inTime = new Date(currentPunch.punchIn).getTime()
    const totalMs = Date.now() - inTime
    const totalHours = Math.round((totalMs / 3_600_000) * 100) / 100
    const completed: AttendancePunch = { ...currentPunch, punchOut, totalHours }
    setPunchHistory((prev) => [completed, ...prev])
    setCurrentPunch(null)
    setElapsedSeconds(0)
    toast.success(`Punched out at ${currentTime}. ${totalHours}h recorded.`)
  }

  const isPunchedIn = currentPunch !== null
  const weekHours = punchHistory.slice(0, 5).reduce((sum, p) => sum + (p.totalHours || 0), 0)

  return (
    <div className="space-y-6">
      <div className="shell-card p-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Time & Attendance</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Attendance</h1>
        <p className="text-sm text-slate-600 mt-1">Track your daily punch-in and punch-out times.</p>
        {!HR_ATTENDANCE_DEMO_MODE && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Demo dataset is disabled. Enable VITE_HR_ATTENDANCE_DEMO_MODE=true for local simulation mode.
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="shell-card p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{weekHours.toFixed(1)}h</p>
          <p className="text-xs text-slate-500 mt-1">This Week</p>
        </div>
        <div className="shell-card p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{punchHistory.length}</p>
          <p className="text-xs text-slate-500 mt-1">Days Recorded</p>
        </div>
        <div className="shell-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{isPunchedIn ? 'IN' : 'OUT'}</p>
          <p className="text-xs text-slate-500 mt-1">Current Status</p>
        </div>
        <div className="shell-card p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{isPunchedIn ? formatElapsed(elapsedSeconds) : '--:--:--'}</p>
          <p className="text-xs text-slate-500 mt-1">Session Time</p>
        </div>
      </div>

      {/* Punch card */}
      <div className="shell-card p-8 text-center">
        <p className="text-5xl font-mono font-bold text-slate-900">{currentTime}</p>
        <p className="text-sm text-slate-500 mt-1">{new Date().toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

        {isPunchedIn && (
          <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 inline-block">
            <p className="text-sm font-semibold text-emerald-700">
              Punched in at {new Date(currentPunch!.punchIn).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-xs text-emerald-600">Session: {formatElapsed(elapsedSeconds)}</p>
          </div>
        )}

        {!isPunchedIn && (
          <div className="mt-4">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional note (e.g. WFH, client site)"
              className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm text-center"
            />
          </div>
        )}

        <div className="mt-6">
          {isPunchedIn ? (
            <button
              type="button"
              onClick={handlePunchOut}
              className="rounded-2xl bg-rose-600 px-12 py-4 text-xl font-bold text-white shadow-lg hover:bg-rose-700 active:scale-95 transition"
            >
              Punch Out
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePunchIn}
              className="rounded-2xl bg-emerald-600 px-12 py-4 text-xl font-bold text-white shadow-lg hover:bg-emerald-700 active:scale-95 transition"
            >
              Punch In
            </button>
          )}
        </div>
      </div>

      {/* History */}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {punchHistory.map((p) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AttendancePage
