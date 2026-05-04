import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import useEmployeeWorkspace from '../../hooks/useEmployeeWorkspace'
import { useEmployeeWorkspaceStore } from '../../store/employeeWorkspaceStore'

const nowLabel = () =>
  new Date().toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

const formatElapsed = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainder = seconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

const EmployeeAttendancePage: React.FC = () => {
  const { workspaceUser } = useEmployeeWorkspace()
  const attendanceRecords = useEmployeeWorkspaceStore((state) => state.attendanceRecords)
  const getCurrentPunch = useEmployeeWorkspaceStore((state) => state.getCurrentPunch)
  const punchIn = useEmployeeWorkspaceStore((state) => state.punchIn)
  const punchOut = useEmployeeWorkspaceStore((state) => state.punchOut)

  const [currentTime, setCurrentTime] = useState(nowLabel())
  const [note, setNote] = useState('')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const myRecords = useMemo(() => {
    if (!workspaceUser) return []
    return attendanceRecords
      .filter((record) => record.employeeId === workspaceUser.id)
      .sort((left, right) => new Date(right.punchIn).getTime() - new Date(left.punchIn).getTime())
  }, [attendanceRecords, workspaceUser])

  const currentPunch = workspaceUser ? getCurrentPunch(workspaceUser.id) : null

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(nowLabel())
      if (currentPunch) {
        setElapsedSeconds(Math.max(0, Math.floor((Date.now() - new Date(currentPunch.punchIn).getTime()) / 1000)))
      }
    }, 1000)

    return () => window.clearInterval(interval)
  }, [currentPunch])

  const weekHours = useMemo(() => {
    const start = new Date()
    start.setDate(start.getDate() - 6)
    start.setHours(0, 0, 0, 0)
    return myRecords
      .filter((record) => new Date(record.workDate) >= start)
      .reduce((total, record) => total + (record.totalHours || 0), 0)
  }, [myRecords])

  if (!workspaceUser) {
    return <div className="shell-card p-8 text-sm text-slate-500">Loading your attendance workspace...</div>
  }

  return (
    <div className="space-y-6">
      <div className="shell-card p-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Employee workspace</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Attendance</h1>
        <p className="mt-2 text-sm text-slate-600">Punch in and out from here or directly from the top header. Both views stay in sync.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="This Week" value={`${weekHours.toFixed(1)}h`} />
        <Metric title="Days Recorded" value={myRecords.filter((record) => record.totalHours).length} />
        <Metric title="Current Status" value={currentPunch ? 'IN' : 'OUT'} tone={currentPunch ? 'text-emerald-600' : 'text-slate-900'} />
        <Metric title="Session" value={currentPunch ? formatElapsed(elapsedSeconds) : '--:--:--'} />
      </div>

      <div className="shell-card p-8 text-center">
        <p className="text-5xl font-mono font-bold text-slate-900">{currentTime}</p>
        <p className="mt-2 text-sm text-slate-500">{new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>

        {currentPunch ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
            <p className="text-sm font-semibold">Checked in at {new Date(currentPunch.punchIn).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="mt-1 text-xs">Session running: {formatElapsed(elapsedSeconds)}</p>
          </div>
        ) : (
          <div className="mt-6 mx-auto max-w-sm">
            <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional note (WFH, client site, testing window...)" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-center" />
          </div>
        )}

        <div className="mt-8">
          {currentPunch ? (
            <button
              type="button"
              onClick={() => {
                punchOut(workspaceUser.id)
                toast.success('Checked out successfully')
              }}
              className="rounded-2xl bg-rose-600 px-10 py-4 text-lg font-bold text-white shadow-lg hover:bg-rose-700"
            >
              Punch Out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                punchIn(workspaceUser.id, workspaceUser.fullName, note)
                setNote('')
                toast.success('Checked in successfully')
              }}
              className="rounded-2xl bg-emerald-600 px-10 py-4 text-lg font-bold text-white shadow-lg hover:bg-emerald-700"
            >
              Punch In
            </button>
          )}
        </div>
      </div>

      <div className="shell-card overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Attendance history</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Punch In</th>
                <th className="px-4 py-3">Punch Out</th>
                <th className="px-4 py-3">Hours</th>
                <th className="px-4 py-3">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myRecords.map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-4 text-slate-900">{record.workDate}</td>
                  <td className="px-4 py-4 text-slate-600">{new Date(record.punchIn).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-4 text-slate-600">{record.punchOut ? new Date(record.punchOut).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }) : 'Active'}</td>
                  <td className="px-4 py-4 font-semibold text-slate-900">{record.totalHours != null ? `${record.totalHours.toFixed(2)}h` : '—'}</td>
                  <td className="px-4 py-4 text-slate-600">{record.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const Metric = ({ title, value, tone = 'text-slate-900' }: { title: string; value: string | number; tone?: string }) => (
  <div className="shell-card p-5">
    <p className="text-sm text-slate-500">{title}</p>
    <p className={`mt-3 text-3xl font-bold ${tone}`}>{value}</p>
  </div>
)

export default EmployeeAttendancePage