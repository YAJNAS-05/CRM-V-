import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type WorkspaceProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'IN_REVIEW' | 'DONE'
export type WorkspaceTaskStatus = 'TODO' | 'IN_PROGRESS' | 'ON_HOLD' | 'IN_REVIEW' | 'DONE'
export type WorkspacePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type WorkspaceProjectSource = 'LOCAL' | 'FIELD_JOB'

export interface WorkspaceUserProfile {
  id: string
  fullName: string
  email: string
}

export interface WorkspaceProject {
  id: string
  code: string
  name: string
  client: string
  product?: string
  status: WorkspaceProjectStatus
  priority: WorkspacePriority
  description?: string
  startDate?: string
  dueDate?: string
  ownerId: string
  ownerName: string
  team: string[]
  source: WorkspaceProjectSource
  linkedFieldJobId?: string
  progress: number
  createdAt: string
  updatedAt: string
}

export interface WorkspaceTask {
  id: string
  projectId: string
  title: string
  description?: string
  status: WorkspaceTaskStatus
  priority: WorkspacePriority
  assigneeId: string
  assigneeName: string
  creatorId?: string
  creatorName?: string
  dueDate?: string
  estimateHours?: number
  loggedHours: number
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface WorkspaceTimeEntry {
  id: string
  projectId: string
  taskId: string
  employeeId: string
  employeeName: string
  workDate: string
  hours: number
  note?: string
  createdAt: string
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

export interface WorkspaceTaskTimer {
  taskId: string
  projectId: string
  startedAt: number
  timeEntryId?: string
  note?: string
}

export interface WorkspaceProjectDraft {
  id?: string
  code?: string
  name: string
  client: string
  product?: string
  status: WorkspaceProjectStatus
  priority: WorkspacePriority
  description?: string
  startDate?: string
  dueDate?: string
  ownerId: string
  ownerName: string
  team: string[]
  source?: WorkspaceProjectSource
  linkedFieldJobId?: string
}

export interface WorkspaceTaskDraft {
  id?: string
  projectId: string
  title: string
  description?: string
  status: WorkspaceTaskStatus
  priority: WorkspacePriority
  assigneeId: string
  assigneeName: string
  creatorId?: string
  creatorName?: string
  dueDate?: string
  estimateHours?: number
  tags?: string[]
}

export interface WorkspaceTimeEntryDraft {
  projectId: string
  taskId: string
  employeeId: string
  employeeName: string
  workDate: string
  hours: number
  note?: string
}

export interface WorkspaceExternalProject {
  id: string
  code: string
  name: string
  client: string
  product?: string
  status: WorkspaceProjectStatus
  priority: WorkspacePriority
  description?: string
  startDate?: string
  dueDate?: string
  ownerId: string
  ownerName: string
  team: string[]
  createdAt: string
  updatedAt: string
  linkedFieldJobId?: string
}

export interface WorkspaceExternalTimeEntry {
  id: string
  projectId: string
  taskId?: string
  employeeId: string
  employeeName: string
  workDate: string
  hours: number
  note?: string
  createdAt: string
}

const nowIso = () => new Date().toISOString()

const formatWorkDate = (offsetDays = 0) => {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  return date.toISOString().split('T')[0]
}

const buildId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const buildProjectCode = (name: string) =>
  name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 4))
    .join('') || 'PROJ'

const roundHours = (value: number) => Math.round(value * 100) / 100

const isApiTimeEntryId = (id: string) => id.startsWith('api-time-')

const calculateProjectProgress = (projectId: string, tasks: WorkspaceTask[]) => {
  const projectTasks = tasks.filter((task) => task.projectId === projectId)
  if (projectTasks.length === 0) return 0

  const score = projectTasks.reduce((total, task) => {
    if (task.status === 'DONE') return total + 1
    if (task.status === 'IN_REVIEW') return total + 0.85
    if (task.status === 'IN_PROGRESS') return total + 0.6
    if (task.status === 'ON_HOLD') return total + 0.35
    return total + 0.1
  }, 0)

  return Math.min(100, Math.round((score / projectTasks.length) * 100))
}

const syncProjectProgress = (projects: WorkspaceProject[], tasks: WorkspaceTask[]) =>
  projects.map((project) => ({
    ...project,
    progress: calculateProjectProgress(project.id, tasks),
  }))

const buildSeedData = (user: WorkspaceUserProfile) => {
  const createdAt = nowIso()
  const teammates = [
    'Karthika S',
    'Rajeshwari S',
    'Vishnu Priyan Rangasamy',
    'Himabindhu RE',
  ]

  const sharedTeam = [user.fullName, ...teammates]

  const projects: WorkspaceProject[] = [
    {
      id: `seed-project-${user.id}-controlup`,
      code: 'CONTROLUP',
      name: 'ControlUp',
      client: 'Freshservice',
      product: 'Operations Rollout',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      description: 'Stabilise client workflows, automate escalations, and complete quarter-end backlog clean-up.',
      startDate: formatWorkDate(-18),
      dueDate: formatWorkDate(14),
      ownerId: user.id,
      ownerName: user.fullName,
      team: sharedTeam,
      source: 'LOCAL',
      progress: 0,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: `seed-project-${user.id}-tarshid`,
      code: 'TARSHID',
      name: 'Tarshid',
      client: 'Freshservice',
      product: 'Quarterly Reporting',
      status: 'IN_REVIEW',
      priority: 'MEDIUM',
      description: 'Prepare customer reporting pack, review survey gaps, and close open quarter-end tickets.',
      startDate: formatWorkDate(-26),
      dueDate: formatWorkDate(7),
      ownerId: user.id,
      ownerName: user.fullName,
      team: sharedTeam,
      source: 'LOCAL',
      progress: 0,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: `seed-project-${user.id}-damfs`,
      code: 'DAMFS',
      name: 'Daman Investments',
      client: 'Freshservice',
      product: 'Portal Optimisation',
      status: 'ON_HOLD',
      priority: 'MEDIUM',
      description: 'Align portal categories and company-specific configuration before the next customer review.',
      startDate: formatWorkDate(-35),
      dueDate: formatWorkDate(21),
      ownerId: 'member-vishnu',
      ownerName: 'Vishnu Priyan Rangasamy',
      team: sharedTeam,
      source: 'LOCAL',
      progress: 0,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: `seed-project-${user.id}-wellcare`,
      code: 'WCARE',
      name: 'Wellcare',
      client: 'Freshdesk Omni',
      product: 'Knowledge Base Refresh',
      status: 'PLANNING',
      priority: 'LOW',
      description: 'Restructure articles, align support macros, and document escalation ownership.',
      startDate: formatWorkDate(-10),
      dueDate: formatWorkDate(28),
      ownerId: 'member-rajeshwari',
      ownerName: 'Rajeshwari S',
      team: sharedTeam,
      source: 'LOCAL',
      progress: 0,
      createdAt,
      updatedAt: createdAt,
    },
  ]

  const tasks: WorkspaceTask[] = [
    {
      id: `seed-task-${user.id}-1`,
      projectId: projects[0].id,
      title: 'Client call follow-up',
      description: 'Capture the rollout blockers from the last client review and publish next actions.',
      status: 'DONE',
      priority: 'MEDIUM',
      assigneeId: user.id,
      assigneeName: user.fullName,
      creatorId: user.id,
      creatorName: user.fullName,
      dueDate: formatWorkDate(-1),
      estimateHours: 2,
      loggedHours: 1.5,
      tags: ['communication'],
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: `seed-task-${user.id}-2`,
      projectId: projects[0].id,
      title: 'Check query mappings',
      description: 'Validate project field mappings and compare them with the production response set.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assigneeId: user.id,
      assigneeName: user.fullName,
      creatorId: user.id,
      creatorName: user.fullName,
      dueDate: formatWorkDate(0),
      estimateHours: 5,
      loggedHours: 2.75,
      tags: ['support', 'analysis'],
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: `seed-task-${user.id}-3`,
      projectId: projects[0].id,
      title: 'Review and testing',
      description: 'Walk through the current fixes with QA and confirm no open regressions remain.',
      status: 'IN_REVIEW',
      priority: 'MEDIUM',
      assigneeId: 'member-karthika',
      assigneeName: 'Karthika S',
      creatorId: 'member-karthika',
      creatorName: 'Karthika S',
      dueDate: formatWorkDate(1),
      estimateHours: 4,
      loggedHours: 3.5,
      tags: ['qa'],
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: `seed-task-${user.id}-4`,
      projectId: projects[1].id,
      title: 'Quarterly reports',
      description: 'Prepare the final quarterly metrics pack and note the open comments for sign-off.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assigneeId: user.id,
      assigneeName: user.fullName,
      creatorId: user.id,
      creatorName: user.fullName,
      dueDate: formatWorkDate(0),
      estimateHours: 6,
      loggedHours: 3,
      tags: ['reporting'],
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: `seed-task-${user.id}-5`,
      projectId: projects[1].id,
      title: 'Survey issue',
      description: 'Close the remaining survey ticket after verifying the updated trigger conditions.',
      status: 'DONE',
      priority: 'LOW',
      assigneeId: user.id,
      assigneeName: user.fullName,
      creatorId: user.id,
      creatorName: user.fullName,
      dueDate: formatWorkDate(-2),
      estimateHours: 1,
      loggedHours: 1,
      tags: ['support'],
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: `seed-task-${user.id}-6`,
      projectId: projects[2].id,
      title: 'Portal configuration for all companies',
      description: 'Validate category visibility and company routing before the portal re-open.',
      status: 'ON_HOLD',
      priority: 'MEDIUM',
      assigneeId: user.id,
      assigneeName: user.fullName,
      creatorId: user.id,
      creatorName: user.fullName,
      dueDate: formatWorkDate(3),
      estimateHours: 8,
      loggedHours: 1.25,
      tags: ['configuration'],
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: `seed-task-${user.id}-7`,
      projectId: projects[3].id,
      title: 'Draft knowledge base outline',
      description: 'Outline the first pass of the article structure for the service team.',
      status: 'TODO',
      priority: 'LOW',
      assigneeId: user.id,
      assigneeName: user.fullName,
      creatorId: user.id,
      creatorName: user.fullName,
      dueDate: formatWorkDate(5),
      estimateHours: 3,
      loggedHours: 0,
      tags: ['documentation'],
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: `seed-task-${user.id}-8`,
      projectId: projects[3].id,
      title: 'Assign article owners',
      description: 'Confirm content owners and reviewers for each support flow.',
      status: 'TODO',
      priority: 'MEDIUM',
      assigneeId: 'member-himabindhu',
      assigneeName: 'Himabindhu RE',
      creatorId: 'member-himabindhu',
      creatorName: 'Himabindhu RE',
      dueDate: formatWorkDate(8),
      estimateHours: 2,
      loggedHours: 0,
      tags: ['coordination'],
      createdAt,
      updatedAt: createdAt,
    },
  ]

  const timeEntries: WorkspaceTimeEntry[] = [
    {
      id: `seed-time-${user.id}-1`,
      projectId: projects[0].id,
      taskId: `seed-task-${user.id}-2`,
      employeeId: user.id,
      employeeName: user.fullName,
      workDate: formatWorkDate(-2),
      hours: 2,
      note: 'Reviewed API responses and verified edge cases.',
      createdAt,
    },
    {
      id: `seed-time-${user.id}-2`,
      projectId: projects[1].id,
      taskId: `seed-task-${user.id}-4`,
      employeeId: user.id,
      employeeName: user.fullName,
      workDate: formatWorkDate(-1),
      hours: 3,
      note: 'Prepared first draft of the quarterly report summary.',
      createdAt,
    },
    {
      id: `seed-time-${user.id}-3`,
      projectId: projects[0].id,
      taskId: `seed-task-${user.id}-1`,
      employeeId: user.id,
      employeeName: user.fullName,
      workDate: formatWorkDate(0),
      hours: 1.5,
      note: 'Client sync and notes consolidation.',
      createdAt,
    },
  ]

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
    projects: syncProjectProgress(projects, tasks),
    tasks,
    timeEntries,
    attendanceRecords,
  }
}

interface EmployeeWorkspaceStore {
  seededUserIds: string[]
  projects: WorkspaceProject[]
  tasks: WorkspaceTask[]
  timeEntries: WorkspaceTimeEntry[]
  attendanceRecords: WorkspaceAttendanceRecord[]
  taskTimer: WorkspaceTaskTimer | null
  ensureEmployeeWorkspace: (user: WorkspaceUserProfile) => void
  syncExternalProjects: (projects: WorkspaceExternalProject[]) => void
  syncExternalTimeEntries: (employeeId: string, entries: WorkspaceExternalTimeEntry[]) => void
  saveProject: (draft: WorkspaceProjectDraft) => string
  saveTask: (draft: WorkspaceTaskDraft) => string
  deleteTask: (taskId: string) => void
  moveTask: (taskId: string, status: WorkspaceTaskStatus) => void
  logTime: (entry: WorkspaceTimeEntryDraft) => void
  punchIn: (employeeId: string, employeeName: string, note?: string) => void
  punchOut: (employeeId: string) => void
  getCurrentPunch: (employeeId: string) => WorkspaceAttendanceRecord | null
  startTaskTimer: (taskId: string, projectId: string, timeEntryId?: string) => void
  stopTaskTimer: () => void
  setTaskTimerNote: (note: string) => void
}

export const useEmployeeWorkspaceStore = create<EmployeeWorkspaceStore>()(
  persist(
    (set, get) => ({
      seededUserIds: [],
      projects: [],
      tasks: [],
      timeEntries: [],
      attendanceRecords: [],
      taskTimer: null,

      ensureEmployeeWorkspace: (user) => {
        const { seededUserIds } = get()
        if (seededUserIds.includes(user.id)) {
          return
        }

        const seedData = buildSeedData(user)
        set((state) => ({
          seededUserIds: [...state.seededUserIds, user.id],
          projects: [...state.projects, ...seedData.projects],
          tasks: [...state.tasks, ...seedData.tasks],
          timeEntries: [...seedData.timeEntries, ...state.timeEntries],
          attendanceRecords: [...seedData.attendanceRecords, ...state.attendanceRecords],
        }))
      },

      syncExternalProjects: (projects) => {
        set((state) => {
          const nextExternalProjects: WorkspaceProject[] = projects.map((project) => ({
            ...project,
            source: 'FIELD_JOB',
            team: Array.from(new Set(project.team.filter(Boolean))),
            progress: calculateProjectProgress(project.id, state.tasks),
          }))

          const nextProjects = [...nextExternalProjects, ...state.projects.filter((project) => project.source !== 'FIELD_JOB')]
          return {
            projects: syncProjectProgress(nextProjects, state.tasks),
          }
        })
      },

      syncExternalTimeEntries: (employeeId, entries) => {
        set((state) => {
          const nextExternalEntries: WorkspaceTimeEntry[] = entries.map((entry) => ({
            id: isApiTimeEntryId(entry.id) ? entry.id : `api-time-${entry.id}`,
            projectId: entry.projectId,
            taskId: entry.taskId || `backend-task-${entry.id}`,
            employeeId: entry.employeeId,
            employeeName: entry.employeeName,
            workDate: entry.workDate,
            hours: roundHours(entry.hours),
            note: entry.note,
            createdAt: entry.createdAt,
          }))

          const localEntries = state.timeEntries.filter(
            (entry) => !(entry.employeeId === employeeId && isApiTimeEntryId(entry.id)),
          )

          const nextTimeEntries = [...nextExternalEntries, ...localEntries].sort(
            (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
          )

          return {
            timeEntries: nextTimeEntries,
          }
        })
      },

      saveProject: (draft) => {
        const projectId = draft.id || buildId('project')
        const timestamp = nowIso()

        set((state) => {
          const existing = state.projects.find((project) => project.id === projectId)
          const nextProject: WorkspaceProject = {
            id: projectId,
            code: draft.code?.trim() || buildProjectCode(draft.name),
            name: draft.name.trim(),
            client: draft.client.trim(),
            product: draft.product?.trim(),
            status: draft.status,
            priority: draft.priority,
            description: draft.description?.trim(),
            startDate: draft.startDate,
            dueDate: draft.dueDate,
            ownerId: draft.ownerId,
            ownerName: draft.ownerName,
            team: Array.from(new Set(draft.team.filter(Boolean))),
            source: draft.source || existing?.source || 'LOCAL',
            linkedFieldJobId: draft.linkedFieldJobId ?? existing?.linkedFieldJobId,
            progress: existing?.progress || 0,
            createdAt: existing?.createdAt || timestamp,
            updatedAt: timestamp,
          }

          const nextProjects = existing
            ? state.projects.map((project) => (project.id === projectId ? nextProject : project))
            : [nextProject, ...state.projects]

          return {
            projects: syncProjectProgress(nextProjects, state.tasks),
          }
        })

        return projectId
      },

      saveTask: (draft) => {
        const taskId = draft.id || buildId('task')
        const timestamp = nowIso()

        set((state) => {
          const existing = state.tasks.find((task) => task.id === taskId)
          const nextTask: WorkspaceTask = {
            id: taskId,
            projectId: draft.projectId,
            title: draft.title.trim(),
            description: draft.description?.trim(),
            status: draft.status,
            priority: draft.priority,
            assigneeId: draft.assigneeId,
            assigneeName: draft.assigneeName,
            creatorId: draft.creatorId || existing?.creatorId || draft.assigneeId,
            creatorName: draft.creatorName || existing?.creatorName || draft.assigneeName,
            dueDate: draft.dueDate,
            estimateHours: draft.estimateHours,
            loggedHours: existing?.loggedHours || 0,
            tags: draft.tags || existing?.tags || [],
            createdAt: existing?.createdAt || timestamp,
            updatedAt: timestamp,
          }

          const nextTasks = existing
            ? state.tasks.map((task) => (task.id === taskId ? nextTask : task))
            : [nextTask, ...state.tasks]

          return {
            tasks: nextTasks,
            projects: syncProjectProgress(state.projects, nextTasks),
          }
        })

        return taskId
      },

      deleteTask: (taskId) => {
        set((state) => {
          const nextTasks = state.tasks.filter((task) => task.id !== taskId)
          return {
            tasks: nextTasks,
            timeEntries: state.timeEntries.filter((entry) => entry.taskId !== taskId),
            projects: syncProjectProgress(state.projects, nextTasks),
          }
        })
      },

      moveTask: (taskId, status) => {
        set((state) => {
          const nextTasks = state.tasks.map((task) =>
            task.id === taskId ? { ...task, status, updatedAt: nowIso() } : task,
          )

          return {
            tasks: nextTasks,
            projects: syncProjectProgress(state.projects, nextTasks),
          }
        })
      },

      logTime: (entry) => {
        set((state) => {
          const nextEntry: WorkspaceTimeEntry = {
            ...entry,
            id: buildId('time'),
            hours: roundHours(entry.hours),
            createdAt: nowIso(),
          }

          const nextTasks = state.tasks.map((task) => {
            if (task.id !== entry.taskId) {
              return task
            }

            return {
              ...task,
              loggedHours: roundHours(task.loggedHours + entry.hours),
              status: task.status === 'TODO' ? 'IN_PROGRESS' : task.status,
              updatedAt: nowIso(),
            }
          })

          return {
            timeEntries: [nextEntry, ...state.timeEntries],
            tasks: nextTasks,
            projects: syncProjectProgress(state.projects, nextTasks),
          }
        })
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

      startTaskTimer: (taskId, projectId, timeEntryId) => {
        set(() => ({
          taskTimer: {
            taskId,
            projectId,
            startedAt: Date.now(),
            timeEntryId,
          },
        }))
      },

      stopTaskTimer: () => {
        set(() => ({ taskTimer: null }))
      },

      setTaskTimerNote: (note) => {
        set((state) => {
          if (!state.taskTimer) return state
          return {
            taskTimer: {
              ...state.taskTimer,
              note,
            },
          }
        })
      },
    }),
    {
      name: 'everx_employee_workspace_store',
      partialize: (state) => ({
        seededUserIds: state.seededUserIds,
        projects: state.projects,
        tasks: state.tasks,
        timeEntries: state.timeEntries,
        attendanceRecords: state.attendanceRecords,
      }),
    },
  ),
)