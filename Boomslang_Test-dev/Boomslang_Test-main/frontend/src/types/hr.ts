export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED'
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR' | 'TEMPORARY'

export type LeaveStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
export type LeaveType = 'ANNUAL' | 'SICK' | 'UNPAID' | 'MATERNITY' | 'PATERNITY' | 'BEREAVEMENT'

export type PayFrequency = 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY'
export type PayType = 'SALARY' | 'HOURLY'

export type PayrollRunStatus = 'DRAFT' | 'APPROVED' | 'PAID'
export type PayrollItemStatus = 'PENDING' | 'PAID'

export type TimesheetStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'

export interface Employee {
  id: string
  userId?: string | null
  employeeCode: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  departmentId?: string | null
  positionId?: string | null
  managerId?: string | null
  employmentType: EmploymentType
  status?: EmployeeStatus | null
  hireDate?: string | null
  terminationDate?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateEmployeeRequest {
  userId?: string | null
  employeeCode: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  departmentId?: string | null
  positionId?: string | null
  managerId?: string | null
  employmentType: EmploymentType
  status?: EmployeeStatus | null
  hireDate?: string | null
  terminationDate?: string | null
}

export interface UpdateEmployeeRequest {
  userId?: string | null
  employeeCode?: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  phone?: string | null
  departmentId?: string | null
  positionId?: string | null
  managerId?: string | null
  employmentType?: EmploymentType | null
  status?: EmployeeStatus | null
  hireDate?: string | null
  terminationDate?: string | null
}

export interface Department {
  id: string
  code: string
  name: string
  parentDepartmentId?: string | null
  managerEmployeeId?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateDepartmentRequest {
  code: string
  name: string
  parentDepartmentId?: string | null
  managerEmployeeId?: string | null
}

export interface UpdateDepartmentRequest {
  code?: string | null
  name?: string | null
  parentDepartmentId?: string | null
  managerEmployeeId?: string | null
}

export interface Position {
  id: string
  title: string
  grade?: string | null
  minSalary?: number | null
  maxSalary?: number | null
  currency?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreatePositionRequest {
  title: string
  grade?: string | null
  minSalary?: number | null
  maxSalary?: number | null
  currency?: string | null
}

export interface UpdatePositionRequest {
  title?: string | null
  grade?: string | null
  minSalary?: number | null
  maxSalary?: number | null
  currency?: string | null
}

export interface LeaveRequest {
  id: string
  employeeId: string
  leaveType: LeaveType
  startDate: string
  endDate: string
  status: LeaveStatus
  approvedBy?: string | null
  approvedAt?: string | null
  notes?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateLeaveRequest {
  employeeId: string
  leaveType: LeaveType
  startDate: string
  endDate: string
  notes?: string | null
}

export interface UpdateLeaveRequest {
  leaveType?: LeaveType | null
  startDate?: string | null
  endDate?: string | null
  status?: LeaveStatus | null
  notes?: string | null
}

export interface Timesheet {
  id: string
  employeeId: string
  fieldJobId?: string | null
  workDate: string
  hoursWorked?: number | null
  status: TimesheetStatus
  approvedBy?: string | null
  approvedAt?: string | null
  notes?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateTimesheetRequest {
  employeeId: string
  fieldJobId?: string | null
  workDate: string
  hoursWorked?: number | null
  notes?: string | null
}

export interface UpdateTimesheetRequest {
  fieldJobId?: string | null
  workDate?: string | null
  hoursWorked?: number | null
  status?: TimesheetStatus | null
  notes?: string | null
}

export interface PayrollProfile {
  id: string
  employeeId: string
  payType?: PayType | null
  payFrequency?: PayFrequency | null
  salaryAmount?: number | null
  hourlyRate?: number | null
  currency?: string | null
  taxId?: string | null
  bankAccountMasked?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface UpdatePayrollProfileRequest {
  employeeId: string
  payType?: PayType | null
  payFrequency?: PayFrequency | null
  salaryAmount?: number | null
  hourlyRate?: number | null
  currency?: string | null
  taxId?: string | null
  bankAccountMasked?: string | null
}

export interface PayrollItem {
  id: string
  payrollRunId: string
  employeeId: string
  grossPay?: number | null
  deductions?: number | null
  netPay?: number | null
  currency?: string | null
  status?: PayrollItemStatus | null
  paidDate?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface PayrollRun {
  id: string
  periodStart: string
  periodEnd: string
  status: PayrollRunStatus
  runDate?: string | null
  notes?: string | null
  items?: PayrollItem[]
  createdAt?: string
  updatedAt?: string
}

export interface CreatePayrollRunRequest {
  periodStart: string
  periodEnd: string
  notes?: string | null
}
