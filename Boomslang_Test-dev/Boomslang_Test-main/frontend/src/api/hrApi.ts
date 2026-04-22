import axiosInstance from './axiosInstance'
import { ApiResponse, Page } from '../types'
import {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  Position,
  CreatePositionRequest,
  UpdatePositionRequest,
  LeaveRequest,
  CreateLeaveRequest,
  UpdateLeaveRequest,
  Timesheet,
  CreateTimesheetRequest,
  UpdateTimesheetRequest,
  PayrollProfile,
  UpdatePayrollProfileRequest,
  PayrollRun,
  CreatePayrollRunRequest,
} from '../types/hr'

export const employeeApi = {
  getAll: (page = 0, size = 20) =>
    axiosInstance.get<ApiResponse<Page<Employee>>>(`/v1/hr/employees?page=${page}&size=${size}`),
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
  getAll: (page = 0, size = 20) =>
    axiosInstance.get<ApiResponse<Page<Department>>>(`/v1/hr/departments?page=${page}&size=${size}`),
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
  getAll: (page = 0, size = 20) =>
    axiosInstance.get<ApiResponse<Page<Position>>>(`/v1/hr/positions?page=${page}&size=${size}`),
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
  getAll: (page = 0, size = 20) =>
    axiosInstance.get<ApiResponse<Page<LeaveRequest>>>(`/v1/hr/leave-requests?page=${page}&size=${size}`),
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
}

export const timesheetApi = {
  getAll: (page = 0, size = 20) =>
    axiosInstance.get<ApiResponse<Page<Timesheet>>>(`/v1/hr/timesheets?page=${page}&size=${size}`),
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
  getRuns: (page = 0, size = 20) =>
    axiosInstance.get<ApiResponse<Page<PayrollRun>>>(`/v1/hr/payroll-runs?page=${page}&size=${size}`),
  approveRun: (id: string) =>
    axiosInstance.patch<ApiResponse<PayrollRun>>(`/v1/hr/payroll-runs/${id}/approve`),
  markPaid: (id: string) =>
    axiosInstance.patch<ApiResponse<PayrollRun>>(`/v1/hr/payroll-runs/${id}/pay`),
}
