import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { employeeApi, timesheetApi } from '../api/hrApi'
import { fieldworkApi } from '../api/fieldworkApi'
import useEmployeeWorkspace from './useEmployeeWorkspace'
import { useEmployeeWorkspaceStore } from '../store/employeeWorkspaceStore'
import { FieldJobStatus, JobPriority, type FieldJobDto } from '../types/fieldwork'
import type { Employee, Timesheet } from '../types/hr'

const getFieldJobProjectId = (fieldJobId: string | number) => `fieldjob-${fieldJobId}`



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
  const { user, workspaceUser, canAccessWorkspace } = useEmployeeWorkspace()

  const employeesQuery = useQuery({
    queryKey: ['employee-workspace', 'employees'],
    queryFn: async () => {
      const response = await employeeApi.getAll(0, 200)
      return response.data.data?.content || []
    },
    enabled: canAccessWorkspace && Boolean(user),
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
    enabled: canAccessWorkspace && Boolean(workspaceUser),
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

  return {
    currentEmployee,
    employeesQuery,
    fieldJobsQuery,
    relevantFieldJobs,
    timesheetsQuery,
  }
}

export default useEmployeeWorkspaceSync