import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { employeeApi, timesheetApi } from '../api/hrApi'
import { fieldworkApi } from '../api/fieldworkApi'
import useEmployeeWorkspace from './useEmployeeWorkspace'
import {
  useEmployeeWorkspaceStore,
  type WorkspaceExternalProject,
  type WorkspaceExternalTimeEntry,
  type WorkspacePriority,
  type WorkspaceProjectStatus,
} from '../store/employeeWorkspaceStore'
import { FieldJobStatus, JobPriority, type FieldJobDto } from '../types/fieldwork'
import type { Employee, Timesheet } from '../types/hr'

const getFieldJobProjectId = (fieldJobId: string | number) => `fieldjob-${fieldJobId}`

const normalizeProjectStatus = (status?: FieldJobStatus): WorkspaceProjectStatus => {
  switch (status) {
    case FieldJobStatus.IN_PROGRESS:
      return 'IN_PROGRESS'
    case FieldJobStatus.PENDING_SIGN_OFF:
      return 'IN_REVIEW'
    case FieldJobStatus.CANCELLED:
    case FieldJobStatus.REVERSED:
      return 'ON_HOLD'
    case FieldJobStatus.COMPLETED:
      return 'DONE'
    case FieldJobStatus.ENGINEER_ASSIGNED:
    case FieldJobStatus.SCHEDULED:
      return 'PLANNING'
    case FieldJobStatus.DRAFT:
    default:
      return 'PLANNING'
  }
}

const normalizePriority = (priority?: JobPriority): WorkspacePriority => {
  switch (priority) {
    case JobPriority.EMERGENCY:
    case JobPriority.CRITICAL:
      return 'CRITICAL'
    case JobPriority.URGENT:
      return 'HIGH'
    case JobPriority.ROUTINE:
    default:
      return 'MEDIUM'
  }
}

const matchesCurrentEmployee = (fieldJob: FieldJobDto, currentEmployee: Employee | null, userId: string, fullName: string) => {
  const normalizedName = fullName.trim().toLowerCase()
  const engineerId = fieldJob.primaryEngineerId ? String(fieldJob.primaryEngineerId) : ''
  const engineerName = (fieldJob.primaryEngineerName || '').trim().toLowerCase()
  const createdBy = (fieldJob.createdBy || '').trim()

  if (currentEmployee?.id && engineerId === currentEmployee.id) return true
  if (currentEmployee?.userId && engineerId === currentEmployee.userId) return true
  if (engineerId === userId) return true
  if (engineerName && engineerName === normalizedName) return true
  if (createdBy && createdBy === userId) return true
  return false
}

export const useEmployeeWorkspaceSync = () => {
  const { user, workspaceUser, isEmployee } = useEmployeeWorkspace()
  const projects = useEmployeeWorkspaceStore((state) => state.projects)
  const syncExternalProjects = useEmployeeWorkspaceStore((state) => state.syncExternalProjects)
  const syncExternalTimeEntries = useEmployeeWorkspaceStore((state) => state.syncExternalTimeEntries)

  const employeesQuery = useQuery({
    queryKey: ['employee-workspace', 'employees'],
    queryFn: async () => {
      const response = await employeeApi.getAll(0, 200)
      return response.data.data?.content || []
    },
    enabled: isEmployee && Boolean(user),
    staleTime: 5 * 60 * 1000,
  })

  const currentEmployee = useMemo(() => {
    if (!user || !employeesQuery.data) return null

    const normalizedEmail = user.email.trim().toLowerCase()
    const normalizedFullName = user.fullName.trim().toLowerCase()
    return (
      employeesQuery.data.find((employee) => employee.userId === user.id) ||
      employeesQuery.data.find((employee) => employee.email.trim().toLowerCase() === normalizedEmail) ||
      employeesQuery.data.find(
        (employee) => `${employee.firstName} ${employee.lastName}`.trim().toLowerCase() === normalizedFullName,
      ) ||
      null
    )
  }, [employeesQuery.data, user])

  const fieldJobsQuery = useQuery({
    queryKey: ['employee-workspace', 'field-jobs'],
    queryFn: () => fieldworkApi.getFieldJobs(0, 100),
    enabled: isEmployee && Boolean(workspaceUser),
    staleTime: 2 * 60 * 1000,
  })

  const relevantFieldJobs = useMemo(() => {
    if (!user || !workspaceUser) return []

    const jobs = fieldJobsQuery.data?.content || []
    return jobs.filter((fieldJob) => matchesCurrentEmployee(fieldJob, currentEmployee, user.id, workspaceUser.fullName))
  }, [currentEmployee, fieldJobsQuery.data?.content, user, workspaceUser])

  const timesheetsQuery = useQuery({
    queryKey: ['employee-workspace', 'timesheets', currentEmployee?.id],
    queryFn: async () => {
      if (!currentEmployee) return [] as Timesheet[]
      const response = await timesheetApi.getByEmployee(currentEmployee.id)
      return response.data.data || []
    },
    enabled: Boolean(currentEmployee?.id),
    staleTime: 60 * 1000,
  })

  useEffect(() => {
    if (!workspaceUser) {
      return
    }

    const externalProjects: WorkspaceExternalProject[] = relevantFieldJobs.map((fieldJob) => ({
      id: getFieldJobProjectId(String(fieldJob.fieldJobId ?? fieldJob.jobNumber)),
      code: fieldJob.jobNumber,
      name: `${fieldJob.clientOrSellerName} ${fieldJob.jobType.replace(/_/g, ' ')}`,
      client: fieldJob.clientOrSellerName,
      product: fieldJob.siteCity || fieldJob.siteCountry || undefined,
      status: normalizeProjectStatus(fieldJob.jobStatus),
      priority: normalizePriority(fieldJob.priority),
      description: fieldJob.internalNotes || fieldJob.clientBriefNotes || undefined,
      startDate: fieldJob.scheduledStartDate || undefined,
      dueDate: fieldJob.scheduledEndDate || undefined,
      ownerId: fieldJob.primaryEngineerId || fieldJob.createdBy || workspaceUser.id,
      ownerName: fieldJob.primaryEngineerName || workspaceUser.fullName,
      team: [workspaceUser.fullName, fieldJob.primaryEngineerName, fieldJob.secondaryEngineerName].filter(Boolean) as string[],
      createdAt: fieldJob.createdAt || new Date().toISOString(),
      updatedAt: fieldJob.updatedAt || fieldJob.createdAt || new Date().toISOString(),
      linkedFieldJobId: String(fieldJob.fieldJobId ?? fieldJob.jobNumber),
    }))

    syncExternalProjects(externalProjects)
  }, [relevantFieldJobs, syncExternalProjects, workspaceUser])

  useEffect(() => {
    if (!workspaceUser || !currentEmployee) {
      return
    }

    const localProjectLookup = new Map(
      projects
        .filter((project) => project.linkedFieldJobId)
        .map((project) => [project.linkedFieldJobId as string, project.id]),
    )

    const externalEntries: WorkspaceExternalTimeEntry[] = (timesheetsQuery.data || []).map((timesheet) => {
      const fieldJobId = timesheet.fieldJobId ? String(timesheet.fieldJobId) : null
      const projectId = fieldJobId
        ? localProjectLookup.get(fieldJobId) || getFieldJobProjectId(fieldJobId)
        : `timesheet-${timesheet.id}`

      return {
        id: timesheet.id,
        projectId,
        taskId: `backend-timesheet-${timesheet.id}`,
        employeeId: currentEmployee.id,
        employeeName: workspaceUser.fullName,
        workDate: timesheet.workDate,
        hours: timesheet.hoursWorked || 0,
        note: timesheet.notes || undefined,
        createdAt: timesheet.createdAt || timesheet.updatedAt || `${timesheet.workDate}T00:00:00.000Z`,
      }
    })

    syncExternalTimeEntries(currentEmployee.id, externalEntries)
  }, [currentEmployee, projects, syncExternalTimeEntries, timesheetsQuery.data, workspaceUser])

  return {
    currentEmployee,
    employeesQuery,
    fieldJobsQuery,
    relevantFieldJobs,
    timesheetsQuery,
  }
}

export default useEmployeeWorkspaceSync