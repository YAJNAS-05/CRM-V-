import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WorkspaceUserProfile {
  id: string
  fullName: string
  email: string
}

export interface WorkspaceAttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  workDate: string
  punchIn: string
  punchOut?: string
  totalHours?: number
  note?: string
}

const nowIso = () => new Date().toISOString()

const formatWorkDate = (offsetDays = 0) => {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  return date.toISOString().split('T')[0]
}

const buildId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const roundHours = (value: number) => Math.round(value * 100) / 100

const buildSeedData = (user: WorkspaceUserProfile) => {
  const attendanceRecords: WorkspaceAttendanceRecord[] = [
    {
      id: `seed-attendance-${user.id}-1`,
      employeeId: user.id,
      employeeName: user.fullName,
      workDate: formatWorkDate(-3),
      punchIn: `${formatWorkDate(-3)}T09:02:00.000Z`,
      punchOut: `${formatWorkDate(-3)}T17:24:00.000Z`,
      totalHours: 8.37,
      note: 'Client support day',
    },
    {
      id: `seed-attendance-${user.id}-2`,
      employeeId: user.id,
      employeeName: user.fullName,
      workDate: formatWorkDate(-2),
      punchIn: `${formatWorkDate(-2)}T08:57:00.000Z`,
      punchOut: `${formatWorkDate(-2)}T17:09:00.000Z`,
      totalHours: 8.2,
      note: 'Focused delivery work',
    },
    {
      id: `seed-attendance-${user.id}-3`,
      employeeId: user.id,
      employeeName: user.fullName,
      workDate: formatWorkDate(-1),
      punchIn: `${formatWorkDate(-1)}T09:10:00.000Z`,
      punchOut: `${formatWorkDate(-1)}T18:01:00.000Z`,
      totalHours: 8.85,
      note: 'Review and testing',
    },
  ]

  return {
    attendanceRecords,
  }
}

interface EmployeeWorkspaceStore {
  seededUserIds: string[]
  attendanceRecords: WorkspaceAttendanceRecord[]
  ensureEmployeeWorkspace: (user: WorkspaceUserProfile) => void
  punchIn: (employeeId: string, employeeName: string, note?: string) => void
  punchOut: (employeeId: string) => void
  getCurrentPunch: (employeeId: string) => WorkspaceAttendanceRecord | null
}

export const useEmployeeWorkspaceStore = create<EmployeeWorkspaceStore>()(
  persist(
    (set, get) => ({
      seededUserIds: [],
      attendanceRecords: [],

      ensureEmployeeWorkspace: (user) => {
        const { seededUserIds } = get()
        if (seededUserIds.includes(user.id)) {
          return
        }

        const seedData = buildSeedData(user)
        set((state) => ({
          seededUserIds: [...state.seededUserIds, user.id],
          attendanceRecords: [...seedData.attendanceRecords, ...state.attendanceRecords],
        }))
      },

      punchIn: (employeeId, employeeName, note) => {
        const currentPunch = get().getCurrentPunch(employeeId)
        if (currentPunch) {
          return
        }

        const timestamp = nowIso()
        set((state) => ({
          attendanceRecords: [
            {
              id: buildId('attendance'),
              employeeId,
              employeeName,
              workDate: formatWorkDate(),
              punchIn: timestamp,
              note: note?.trim() || undefined,
            },
            ...state.attendanceRecords,
          ],
        }))
      },

      punchOut: (employeeId) => {
        set((state) => ({
          attendanceRecords: state.attendanceRecords.map((record) => {
            if (record.employeeId !== employeeId || record.punchOut) {
              return record
            }

            const punchOut = nowIso()
            const totalHours = roundHours((new Date(punchOut).getTime() - new Date(record.punchIn).getTime()) / 3600000)
            return {
              ...record,
              punchOut,
              totalHours,
            }
          }),
        }))
      },

      getCurrentPunch: (employeeId) =>
        get().attendanceRecords.find((record) => record.employeeId === employeeId && !record.punchOut) || null,
    }),
    {
      name: 'everx_employee_workspace_store',
      partialize: (state) => ({
        seededUserIds: state.seededUserIds,
        attendanceRecords: state.attendanceRecords,
      }),
    },
  ),
)
