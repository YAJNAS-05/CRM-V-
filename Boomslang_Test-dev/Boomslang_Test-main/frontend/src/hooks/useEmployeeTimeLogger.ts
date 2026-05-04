import { useQueryClient } from '@tanstack/react-query'
import { timesheetApi } from '../api/hrApi'
import useEmployeeWorkspace from './useEmployeeWorkspace'
import useEmployeeWorkspaceSync from './useEmployeeWorkspaceSync'
import { useEmployeeWorkspaceStore, type WorkspaceProject } from '../store/employeeWorkspaceStore'

export interface EmployeeTimeLogInput {
  project: WorkspaceProject
  taskId?: string
  workDate: string
  hours: number
  note?: string
}

export interface EmployeeTimeLogResult {
  localLogged: boolean
  apiSynced: boolean
  backendUnavailable: boolean
  error?: unknown
}

export const useEmployeeTimeLogger = () => {
  const { workspaceUser } = useEmployeeWorkspace()
  const { currentEmployee } = useEmployeeWorkspaceSync()
  const logTime = useEmployeeWorkspaceStore((state) => state.logTime)
  const queryClient = useQueryClient()

  const logEmployeeTime = async ({ project, taskId, workDate, hours, note }: EmployeeTimeLogInput): Promise<EmployeeTimeLogResult> => {
    if (!workspaceUser) {
      return {
        localLogged: false,
        apiSynced: false,
        backendUnavailable: true,
        error: new Error('Employee session unavailable'),
      }
    }

    const result: EmployeeTimeLogResult = {
      localLogged: false,
      apiSynced: false,
      backendUnavailable: false,
    }

    if (taskId) {
      logTime({
        projectId: project.id,
        taskId,
        employeeId: workspaceUser.id,
        employeeName: workspaceUser.fullName,
        workDate,
        hours,
        note,
      })
      result.localLogged = true
    }

    if (!project.linkedFieldJobId) {
      return result
    }

    if (!currentEmployee?.id) {
      return {
        ...result,
        backendUnavailable: true,
      }
    }

    try {
      await timesheetApi.create({
        employeeId: currentEmployee.id,
        fieldJobId: project.linkedFieldJobId,
        workDate,
        hoursWorked: hours,
        notes: note?.trim() || undefined,
      })

      await queryClient.invalidateQueries({
        queryKey: ['employee-workspace', 'timesheets', currentEmployee.id],
      })

      return {
        ...result,
        apiSynced: true,
      }
    } catch (error) {
      return {
        ...result,
        error,
      }
    }
  }

  return {
    currentEmployee,
    logEmployeeTime,
  }
}

export default useEmployeeTimeLogger