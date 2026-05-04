import axiosInstance from './axiosInstance'
import { ApiResponse, Page } from '../types'
import {
  Employee,
  EmployeeStatus,
  EmploymentType,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  Position,
  CreatePositionRequest,
  UpdatePositionRequest,
  LeaveRequest,
  LeaveStatus,
  LeaveType,
  CreateLeaveRequest,
  UpdateLeaveRequest,
  LeavePolicy,
  CreateLeavePolicyRequest,
  UpdateLeavePolicyRequest,
  LeaveBalance,
  AdjustLeaveBalanceRequest,
  SeedLeaveBalanceRequest,
  Holiday,
  CreateHolidayRequest,
  UpdateHolidayRequest,
  Timesheet,
  TimesheetStatus,
  CreateTimesheetRequest,
  UpdateTimesheetRequest,
  PayrollProfile,
  UpdatePayrollProfileRequest,
  PayrollRun,
  PayrollRunStatus,
  CreatePayrollRunRequest,
  ReimbursementRequest,
  ReimbursementStatus,
  CreateReimbursementRequest,
  UpdateReimbursementRequest,
  Training,
  TrainingStatus,
  CreateTrainingRequest,
  UpdateTrainingRequest,
  TrainingEnrollment,
  Payslip,
  CreatePayslipRequest,
  HrDocument,
  CreateHrDocumentRequest,
  OfferLetter,
  OfferLetterStatus,
  CreateOfferLetterRequest,
  UpdateOfferLetterRequest,
  TimeEntry,
  StartTimerRequest,
  WeeklyTimeEntries,
} from '../types/hr'

const buildQueryString = (
  page: number,
  size: number,
  params?: Record<string, string | number | boolean | undefined | null>,
) => {
  const searchParams = new URLSearchParams()
  searchParams.set('page', String(page))
  searchParams.set('size', String(size))

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  return searchParams.toString()
}

export const employeeApi = {
  getAll: (
    page = 0,
    size = 20,
    params?: {
      search?: string
      status?: EmployeeStatus
      employmentType?: EmploymentType
      departmentId?: string
      positionId?: string
      sort?: string
    },
  ) =>
    axiosInstance.get<ApiResponse<Page<Employee>>>(
      `/v1/hr/employees?${buildQueryString(page, size, params)}`,
    ),
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Employee>>(`/v1/hr/employees/${id}`),
  create: (data: CreateEmployeeRequest) =>
    axiosInstance.post<ApiResponse<Employee>>('/v1/hr/employees', data),
  update: (id: string, data: UpdateEmployeeRequest) =>
    axiosInstance.put<ApiResponse<Employee>>(`/v1/hr/employees/${id}`, data),
  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/v1/hr/employees/${id}`),
}

export const departmentApi = {
  getAll: (
    page = 0,
    size = 20,
    params?: {
      search?: string
      sort?: string
    },
  ) =>
    axiosInstance.get<ApiResponse<Page<Department>>>(
      `/v1/hr/departments?${buildQueryString(page, size, params)}`,
    ),
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Department>>(`/v1/hr/departments/${id}`),
  create: (data: CreateDepartmentRequest) =>
    axiosInstance.post<ApiResponse<Department>>('/v1/hr/departments', data),
  update: (id: string, data: UpdateDepartmentRequest) =>
    axiosInstance.put<ApiResponse<Department>>(`/v1/hr/departments/${id}`, data),
  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/v1/hr/departments/${id}`),
}

export const positionApi = {
  getAll: (
    page = 0,
    size = 20,
    params?: {
      search?: string
      sort?: string
    },
  ) =>
    axiosInstance.get<ApiResponse<Page<Position>>>(
      `/v1/hr/positions?${buildQueryString(page, size, params)}`,
    ),
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Position>>(`/v1/hr/positions/${id}`),
  create: (data: CreatePositionRequest) =>
    axiosInstance.post<ApiResponse<Position>>('/v1/hr/positions', data),
  update: (id: string, data: UpdatePositionRequest) =>
    axiosInstance.put<ApiResponse<Position>>(`/v1/hr/positions/${id}`, data),
  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/v1/hr/positions/${id}`),
}

export const leaveRequestApi = {
  getAll: (
    page = 0,
    size = 20,
    params?: {
      search?: string
      status?: LeaveStatus
      leaveType?: LeaveType
      employeeId?: string
      startDate?: string
      endDate?: string
      sort?: string
    },
  ) =>
    axiosInstance.get<ApiResponse<Page<LeaveRequest>>>(
      `/v1/hr/leave-requests?${buildQueryString(page, size, params)}`,
    ),
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<LeaveRequest>>(`/v1/hr/leave-requests/${id}`),
  getByEmployee: (employeeId: string) =>
    axiosInstance.get<ApiResponse<LeaveRequest[]>>(`/v1/hr/leave-requests/employee/${employeeId}`),
  create: (data: CreateLeaveRequest) =>
    axiosInstance.post<ApiResponse<LeaveRequest>>('/v1/hr/leave-requests', data),
  update: (id: string, data: UpdateLeaveRequest) =>
    axiosInstance.put<ApiResponse<LeaveRequest>>(`/v1/hr/leave-requests/${id}`, data),
  approve: (id: string, approvedBy: string) =>
    axiosInstance.patch<ApiResponse<LeaveRequest>>(`/v1/hr/leave-requests/${id}/approve?approvedBy=${approvedBy}`),
  cancel: (id: string) =>
    axiosInstance.patch<ApiResponse<LeaveRequest>>(`/v1/hr/leave-requests/${id}/cancel`),
}

export const leavePolicyApi = {
  getAll: (page = 0, size = 20) =>
    axiosInstance.get<ApiResponse<Page<LeavePolicy>>>(`/v1/hr/leave-policies?${buildQueryString(page, size)}`),
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<LeavePolicy>>(`/v1/hr/leave-policies/${id}`),
  create: (data: CreateLeavePolicyRequest) =>
    axiosInstance.post<ApiResponse<LeavePolicy>>('/v1/hr/leave-policies', data),
  update: (id: string, data: UpdateLeavePolicyRequest) =>
    axiosInstance.put<ApiResponse<LeavePolicy>>(`/v1/hr/leave-policies/${id}`, data),
  toggle: (id: string, active: boolean) =>
    axiosInstance.patch<ApiResponse<LeavePolicy>>(`/v1/hr/leave-policies/${id}/active?active=${active}`),
}

export const leaveBalanceApi = {
  getByEmployee: (employeeId: string) =>
    axiosInstance.get<ApiResponse<LeaveBalance[]>>(`/v1/hr/leave-balances/employee/${employeeId}`),
  seed: (data: SeedLeaveBalanceRequest) =>
    axiosInstance.post<ApiResponse<LeaveBalance[]>>('/v1/hr/leave-balances/seed', data),
  adjust: (data: AdjustLeaveBalanceRequest) =>
    axiosInstance.put<ApiResponse<LeaveBalance>>('/v1/hr/leave-balances/adjust', data),
}

export const holidayApi = {
  getAll: (
    page = 0,
    size = 20,
    params?: {
      region?: string
      startDate?: string
      endDate?: string
    },
  ) =>
    axiosInstance.get<ApiResponse<Page<Holiday>>>(
      `/v1/hr/holidays?${buildQueryString(page, size, params)}`,
    ),
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Holiday>>(`/v1/hr/holidays/${id}`),
  create: (data: CreateHolidayRequest) =>
    axiosInstance.post<ApiResponse<Holiday>>('/v1/hr/holidays', data),
  update: (id: string, data: UpdateHolidayRequest) =>
    axiosInstance.put<ApiResponse<Holiday>>(`/v1/hr/holidays/${id}`, data),
}

export const timesheetApi = {
  getAll: (
    page = 0,
    size = 20,
    params?: {
      employeeId?: string
      status?: TimesheetStatus
      startDate?: string
      endDate?: string
      sort?: string
    },
  ) =>
    axiosInstance.get<ApiResponse<Page<Timesheet>>>(
      `/v1/hr/timesheets?${buildQueryString(page, size, params)}`,
    ),
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Timesheet>>(`/v1/hr/timesheets/${id}`),
  getByEmployee: (employeeId: string) =>
    axiosInstance.get<ApiResponse<Timesheet[]>>(`/v1/hr/timesheets/employee/${employeeId}`),
  create: (data: CreateTimesheetRequest) =>
    axiosInstance.post<ApiResponse<Timesheet>>('/v1/hr/timesheets', data),
  update: (id: string, data: UpdateTimesheetRequest) =>
    axiosInstance.put<ApiResponse<Timesheet>>(`/v1/hr/timesheets/${id}`, data),
  submit: (id: string) =>
    axiosInstance.patch<ApiResponse<Timesheet>>(`/v1/hr/timesheets/${id}/submit`),
  approve: (id: string, approvedBy: string) =>
    axiosInstance.patch<ApiResponse<Timesheet>>(`/v1/hr/timesheets/${id}/approve?approvedBy=${approvedBy}`),
  reject: (id: string, notes?: string) => {
    const params = notes ? `?notes=${encodeURIComponent(notes)}` : ''
    return axiosInstance.patch<ApiResponse<Timesheet>>(`/v1/hr/timesheets/${id}/reject${params}`)
  },
}

export const timeEntryApi = {
  start: (data: StartTimerRequest) =>
    axiosInstance.post<ApiResponse<TimeEntry>>('/v1/hr/time-entries/start', data),
  stop: (timeEntryId: string) =>
    axiosInstance.post<ApiResponse<TimeEntry>>(`/v1/hr/time-entries/${timeEntryId}/stop`),
  getWeekly: (weekStart: string) =>
    axiosInstance.get<ApiResponse<WeeklyTimeEntries>>(
      `/v1/hr/time-entries/employee/weekly?weekStart=${weekStart}`,
    ),
  getProject: (projectId: string) =>
    axiosInstance.get<ApiResponse<TimeEntry[]>>(`/v1/hr/time-entries/project/${projectId}`),
}

export const payrollApi = {
  upsertProfile: (data: UpdatePayrollProfileRequest) =>
    axiosInstance.put<ApiResponse<PayrollProfile>>('/v1/hr/payroll-profiles', data),
  getProfile: (employeeId: string) =>
    axiosInstance.get<ApiResponse<PayrollProfile>>(`/v1/hr/payroll-profiles/${employeeId}`),
  createRun: (data: CreatePayrollRunRequest) =>
    axiosInstance.post<ApiResponse<PayrollRun>>('/v1/hr/payroll-runs', data),
  getRun: (id: string) =>
    axiosInstance.get<ApiResponse<PayrollRun>>(`/v1/hr/payroll-runs/${id}`),
  getRuns: (
    page = 0,
    size = 20,
    params?: {
      status?: PayrollRunStatus
      startDate?: string
      endDate?: string
      sort?: string
    },
  ) =>
    axiosInstance.get<ApiResponse<Page<PayrollRun>>>(
      `/v1/hr/payroll-runs?${buildQueryString(page, size, params)}`,
    ),
  approveRun: (id: string) =>
    axiosInstance.patch<ApiResponse<PayrollRun>>(`/v1/hr/payroll-runs/${id}/approve`),
  markPaid: (id: string) =>
    axiosInstance.patch<ApiResponse<PayrollRun>>(`/v1/hr/payroll-runs/${id}/pay`),
}

export const reimbursementApi = {
  create: (data: CreateReimbursementRequest) =>
    axiosInstance.post<ApiResponse<ReimbursementRequest>>('/v1/hr/reimbursements', data),
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<ReimbursementRequest>>(`/v1/hr/reimbursements/${id}`),
  getAll: (
    page = 0,
    size = 20,
    params?: {
      search?: string
      status?: ReimbursementStatus
      requestedBy?: string
      startDate?: string
      endDate?: string
      sort?: string
    },
  ) =>
    axiosInstance.get<ApiResponse<Page<ReimbursementRequest>>>(
      `/v1/hr/reimbursements?${buildQueryString(page, size, params)}`,
    ),
  update: (id: string, data: UpdateReimbursementRequest) =>
    axiosInstance.put<ApiResponse<ReimbursementRequest>>(`/v1/hr/reimbursements/${id}`, data),
  approve: (id: string, approvedBy: string) =>
    axiosInstance.patch<ApiResponse<ReimbursementRequest>>(`/v1/hr/reimbursements/${id}/approve?approvedBy=${approvedBy}`),
}

export const trainingApi = {
  getAll: (
    page = 0,
    size = 20,
    params?: {
      search?: string
      status?: TrainingStatus
      departmentId?: string
      sort?: string
    },
  ) =>
    axiosInstance.get<ApiResponse<Page<Training>>>(
      `/v1/hr/trainings?${buildQueryString(page, size, params)}`,
    ),
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Training>>(`/v1/hr/trainings/${id}`),
  create: (data: CreateTrainingRequest) =>
    axiosInstance.post<ApiResponse<Training>>('/v1/hr/trainings', data),
  update: (id: string, data: UpdateTrainingRequest) =>
    axiosInstance.put<ApiResponse<Training>>(`/v1/hr/trainings/${id}`, data),
  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/v1/hr/trainings/${id}`),
  enroll: (id: string, employeeId: string) =>
    axiosInstance.post<ApiResponse<TrainingEnrollment>>(`/v1/hr/trainings/${id}/enroll?employeeId=${employeeId}`),
  getEnrollments: (id: string) =>
    axiosInstance.get<ApiResponse<TrainingEnrollment[]>>(`/v1/hr/trainings/${id}/enrollments`),
  getEmployeeEnrollments: (employeeId: string) =>
    axiosInstance.get<ApiResponse<TrainingEnrollment[]>>(`/v1/hr/trainings/employee/${employeeId}/enrollments`),
}

export const payslipApi = {
  getAll: (
    page = 0,
    size = 20,
    params?: {
      employeeId?: string
      payrollRunId?: string
      sort?: string
    },
  ) =>
    axiosInstance.get<ApiResponse<Page<Payslip>>>(
      `/v1/hr/payslips?${buildQueryString(page, size, params)}`,
    ),
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Payslip>>(`/v1/hr/payslips/${id}`),
  getByEmployee: (employeeId: string) =>
    axiosInstance.get<ApiResponse<Payslip[]>>(`/v1/hr/payslips/employee/${employeeId}`),
  create: (data: CreatePayslipRequest) =>
    axiosInstance.post<ApiResponse<Payslip>>('/v1/hr/payslips', data),
  acknowledge: (id: string) =>
    axiosInstance.patch<ApiResponse<Payslip>>(`/v1/hr/payslips/${id}/acknowledge`),
}

export const documentApi = {
  getAll: (
    page = 0,
    size = 20,
    params?: {
      employeeId?: string
      documentType?: string
      sort?: string
    },
  ) =>
    axiosInstance.get<ApiResponse<Page<HrDocument>>>(
      `/v1/hr/documents?${buildQueryString(page, size, params)}`,
    ),
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<HrDocument>>(`/v1/hr/documents/${id}`),
  getByEmployee: (employeeId: string) =>
    axiosInstance.get<ApiResponse<HrDocument[]>>(`/v1/hr/documents/employee/${employeeId}`),
  create: (data: CreateHrDocumentRequest) =>
    axiosInstance.post<ApiResponse<HrDocument>>('/v1/hr/documents', data),
  verify: (id: string) =>
    axiosInstance.patch<ApiResponse<HrDocument>>(`/v1/hr/documents/${id}/verify`),
  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/v1/hr/documents/${id}`),
}

export const offerLetterApi = {
  getAll: (
    page = 0,
    size = 20,
    params?: {
      search?: string
      status?: OfferLetterStatus
      sort?: string
    },
  ) =>
    axiosInstance.get<ApiResponse<Page<OfferLetter>>>(
      `/v1/hr/offer-letters?${buildQueryString(page, size, params)}`,
    ),
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<OfferLetter>>(`/v1/hr/offer-letters/${id}`),
  create: (data: CreateOfferLetterRequest) =>
    axiosInstance.post<ApiResponse<OfferLetter>>('/v1/hr/offer-letters', data),
  update: (id: string, data: UpdateOfferLetterRequest) =>
    axiosInstance.put<ApiResponse<OfferLetter>>(`/v1/hr/offer-letters/${id}`, data),
  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/v1/hr/offer-letters/${id}`),
}
