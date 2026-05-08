import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import useEmployeeWorkspace from '../../hooks/useEmployeeWorkspace'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { attendanceApi } from '../../api/hrApi'
import type { AttendancePunch } from '../../types/hr'

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
  const queryClient = useQueryClient()

  const [currentTime, setCurrentTime] = useState(nowLabel())
  const [note, setNote] = useState('')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  const { data: punchesData, isLoading: isLoadingPunches } = useQuery({
    queryKey: ['attendance', 'me', 'last30'],
    queryFn: async () => {
      const response = await attendanceApi.getMe()
      return response.data.data || []
    },
  })

  const myRecords: AttendancePunch[] = useMemo(() => {
    return (punchesData || [])
      .slice()
      .sort((left, right) => new Date(right.punchIn).getTime() - new Date(left.punchIn).getTime())
  }, [punchesData])

  const currentPunch = useMemo(() => myRecords.find((record) => !record.punchOut) || null, [myRecords])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(nowLabel())
      if (currentPunch) {
        setElapsedSeconds(Math.max(0, Math.floor((Date.now() - new Date(currentPunch.punchIn).getTime()) / 1000)))
      }
    }, 1000)

    return () => window.clearInterval(interval)
  }, [currentPunch])

  const checkInMutation = useMutation({
    mutationFn: (notes?: string) => attendanceApi.checkIn(notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'me', 'last30'] })
      toast.success('Checked in successfully')
      setNote('')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to check in')
    },
  })

  const checkOutMutation = useMutation({
    mutationFn: () => attendanceApi.checkOut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'me', 'last30'] })
      toast.success('Checked out successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to check out')
    },
  })

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
                checkOutMutation.mutate()
              }}
              disabled={checkOutMutation.isPending}
              className="rounded-2xl bg-rose-600 px-10 py-4 text-lg font-bold text-white shadow-lg hover:bg-rose-700 disabled:opacity-50"
            >
              {checkOutMutation.isPending ? 'Punching out...' : 'Punch Out'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                checkInMutation.mutate(note || undefined)
              }}
              disabled={checkInMutation.isPending}
              className="rounded-2xl bg-emerald-600 px-10 py-4 text-lg font-bold text-white shadow-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {checkInMutation.isPending ? 'Punching in...' : 'Punch In'}
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
              {isLoadingPunches ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">Loading attendance...</td>
                </tr>
              ) : myRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">No attendance records yet.</td>
                </tr>
              ) : myRecords.map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-4 text-slate-900">{record.workDate || today}</td>
                  <td className="px-4 py-4 text-slate-600">{new Date(record.punchIn).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-4 text-slate-600">{record.punchOut ? new Date(record.punchOut).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }) : 'Active'}</td>
                  <td className="px-4 py-4 font-semibold text-slate-900">{record.totalHours != null ? `${record.totalHours.toFixed(2)}h` : '—'}</td>
                  <td className="px-4 py-4 text-slate-600">{record.notes || '—'}</td>
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
