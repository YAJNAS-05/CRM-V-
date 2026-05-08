export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED'
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR' | 'TEMPORARY'

export type LeaveStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
export type LeaveType = 'ANNUAL' | 'SICK' | 'UNPAID' | 'MATERNITY' | 'PATERNITY' | 'BEREAVEMENT'
export type AccrualFrequency = 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'NONE'

export type PayFrequency = 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY'
export type PayType = 'SALARY' | 'HOURLY'

export type PayrollRunStatus = 'DRAFT' | 'APPROVED' | 'PAID'
export type PayrollItemStatus = 'PENDING' | 'PAID'

export type TimesheetStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'

export type ReimbursementStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID'

export type WorkLocation = 'OFFICE' | 'REMOTE' | 'HYBRID'
export type LifecycleStage = 'PROBATION' | 'CONFIRMED' | 'PIP' | 'RESIGNED' | 'OFFBOARDED' | 'ALUMNI'

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
  // Extended profile
  dateOfBirth?: string | null
  gender?: string | null
  nationality?: string | null
  avatarUrl?: string | null
  probationEndDate?: string | null
  confirmationDate?: string | null
  workLocation?: WorkLocation | null
  lifecycleStage?: LifecycleStage | null
  // Emergency contact
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  emergencyContactRelation?: string | null
  // Address
  addressLine1?: string | null
  addressCity?: string | null
  addressState?: string | null
  addressCountry?: string | null
  addressPincode?: string | null
  // Denormalized display fields from backend joins
  jobTitle?: string | null
  department?: string | null
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
  // Extended profile
  dateOfBirth?: string | null
  gender?: string | null
  nationality?: string | null
  avatarUrl?: string | null
  probationEndDate?: string | null
  confirmationDate?: string | null
  workLocation?: WorkLocation | null
  lifecycleStage?: LifecycleStage | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  emergencyContactRelation?: string | null
  addressLine1?: string | null
  addressCity?: string | null
  addressState?: string | null
  addressCountry?: string | null
  addressPincode?: string | null
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
  // Extended profile
  dateOfBirth?: string | null
  gender?: string | null
  nationality?: string | null
  avatarUrl?: string | null
  probationEndDate?: string | null
  confirmationDate?: string | null
  workLocation?: WorkLocation | null
  lifecycleStage?: LifecycleStage | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  emergencyContactRelation?: string | null
  panNumber?: string | null
  aadhaarMasked?: string | null
  passportNumber?: string | null
  addressLine1?: string | null
  addressCity?: string | null
  addressState?: string | null
  addressCountry?: string | null
  addressPincode?: string | null
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

export interface LeavePolicy {
  id: string
  name: string
  leaveType: LeaveType
  annualEntitlement: number
  accrualFrequency?: AccrualFrequency | null
  carryForwardLimit?: number | null
  maxBalance?: number | null
  allowNegative?: boolean | null
  requiresApproval?: boolean | null
  minServiceDays?: number | null
  effectiveFrom?: string | null
  effectiveTo?: string | null
  isActive?: boolean | null
  description?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateLeavePolicyRequest {
  name: string
  leaveType: LeaveType
  annualEntitlement: number
  accrualFrequency?: AccrualFrequency | null
  carryForwardLimit?: number | null
  maxBalance?: number | null
  allowNegative?: boolean | null
  requiresApproval?: boolean | null
  minServiceDays?: number | null
  effectiveFrom?: string | null
  effectiveTo?: string | null
  isActive?: boolean | null
  description?: string | null
}

export interface UpdateLeavePolicyRequest {
  name?: string | null
  leaveType?: LeaveType | null
  annualEntitlement?: number | null
  accrualFrequency?: AccrualFrequency | null
  carryForwardLimit?: number | null
  maxBalance?: number | null
  allowNegative?: boolean | null
  requiresApproval?: boolean | null
  minServiceDays?: number | null
  effectiveFrom?: string | null
  effectiveTo?: string | null
  isActive?: boolean | null
  description?: string | null
}

export interface LeaveBalance {
  id: string
  employeeId: string
  leaveType: LeaveType
  availableDays: number
  usedDays: number
  pendingDays: number
  lastAccruedOn?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface AdjustLeaveBalanceRequest {
  employeeId: string
  leaveType: LeaveType
  deltaAvailable?: number | null
  deltaUsed?: number | null
  deltaPending?: number | null
  reason?: string | null
}

export interface SeedLeaveBalanceRequest {
  employeeId: string
}

export interface Holiday {
  id: string
  holidayDate: string
  name: string
  region?: string | null
  optional?: boolean | null
  description?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateHolidayRequest {
  holidayDate: string
  name: string
  region?: string | null
  optional?: boolean | null
  description?: string | null
}

export interface UpdateHolidayRequest {
  holidayDate?: string | null
  name?: string | null
  region?: string | null
  optional?: boolean | null
  description?: string | null
}

export interface Timesheet {
  id: string
  employeeId: string
  fieldJobId?: string | null
  workDate: string
  weekStartDate?: string | null
  hoursWorked?: number | null
  totalBillableHours?: number | null
  totalNonBillableHours?: number | null
  totalHours?: number | null
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

export interface TimeEntry {
  id: string
  employeeId: string
  taskId?: string | null
  projectId: string
  startTime?: string | null
  endTime?: string | null
  durationMinutes?: number | null
  workDate?: string | null
  description?: string | null
  billable?: boolean | null
  ratePerHour?: number | null
  timesheetId?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface StartTimerRequest {
  projectId: string
  taskId?: string | null
  description?: string | null
  billable?: boolean | null
  ratePerHour?: number | null
}

export interface WeeklyTimeEntries {
  weekStart: string
  weekEnd: string
  totalHours: number
  entries: TimeEntry[]
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

export interface ReimbursementRequest {
  id: string
  requestedBy: string
  requesterEmail?: string | null
  amount: number
  currency?: string | null
  category: string
  requestDate: string
  description?: string | null
  status: ReimbursementStatus
  approvedBy?: string | null
  approvedAt?: string | null
  paidBy?: string | null
  paidAt?: string | null
  paymentReference?: string | null
  notes?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateReimbursementRequest {
  requestedBy: string
  requesterEmail?: string | null
  amount: number
  currency?: string | null
  category: string
  requestDate: string
  description?: string | null
}

export interface UpdateReimbursementRequest {
  amount?: number | null
  currency?: string | null
  category?: string | null
  requestDate?: string | null
  description?: string | null
  status?: ReimbursementStatus | null
  notes?: string | null
}

export interface CreatePayrollRunRequest {
  periodStart: string
  periodEnd: string
  notes?: string | null
}

export interface HRDashboardMetrics {
  totalEmployees: number
  activeEmployees: number
  newHiresThisMonth: number
  attritionRate: number
  pendingLeaves: number
  approvedLeaves: number
  upcomingLeaves: number
  pendingTimesheets: number
  complianceRate: number
  openPositions: number
  trainingCompleted: number
  pendingReimbursements: number
  nextPayrollAmount: number
  daysToNextPayRun: number
  visasExpiring: number
  onboardingInProgress: number
}

// ---- Training ----
export type TrainingStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface Training {
  id: string
  title: string
  description?: string | null
  trainerName?: string | null
  startDate?: string | null
  endDate?: string | null
  maxParticipants?: number | null
  location?: string | null
  departmentId?: string | null
  status: TrainingStatus
  createdAt?: string
  updatedAt?: string
}

export interface CreateTrainingRequest {
  title: string
  description?: string | null
  trainerName?: string | null
  startDate?: string | null
  endDate?: string | null
  maxParticipants?: number | null
  location?: string | null
  departmentId?: string | null
}

export interface UpdateTrainingRequest {
  title?: string | null
  description?: string | null
  trainerName?: string | null
  startDate?: string | null
  endDate?: string | null
  maxParticipants?: number | null
  location?: string | null
  departmentId?: string | null
  status?: TrainingStatus | null
}

export interface TrainingEnrollment {
  id: string
  trainingId: string
  employeeId: string
  completedAt?: string | null
  score?: number | null
  notes?: string | null
  createdAt?: string
}

// ---- Payslip ----
export type PayslipStatus = 'GENERATED' | 'SENT' | 'ACKNOWLEDGED'

export interface Payslip {
  id: string
  employeeId: string
  payrollRunId?: string | null
  payPeriodStart: string
  payPeriodEnd: string
  grossPay?: number | null
  deductions?: number | null
  netPay?: number | null
  taxAmount?: number | null
  currency?: string | null
  status: PayslipStatus
  notes?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreatePayslipRequest {
  employeeId: string
  payrollRunId?: string | null
  payPeriodStart: string
  payPeriodEnd: string
  grossPay?: number | null
  deductions?: number | null
  netPay?: number | null
  taxAmount?: number | null
  currency?: string | null
  notes?: string | null
}

// ---- HR Document ----
export interface HrDocument {
  id: string
  employeeId: string
  documentType: string
  fileName: string
  fileUrl: string
  uploadedAt?: string | null
  isVerified?: boolean | null
  notes?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateHrDocumentRequest {
  employeeId: string
  documentType: string
  fileName: string
  fileUrl: string
  notes?: string | null
}

// ---- Offer Letter ----
export type OfferLetterStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'WITHDRAWN'

export interface OfferLetter {
  id: string
  positionId?: string | null
  candidateName: string
  candidateEmail: string
  offerDate?: string | null
  expiryDate?: string | null
  salary?: number | null
  currency?: string | null
  departmentId?: string | null
  notes?: string | null
  status: OfferLetterStatus
  createdAt?: string
  updatedAt?: string
}

export interface CreateOfferLetterRequest {
  positionId?: string | null
  candidateName: string
  candidateEmail: string
  offerDate?: string | null
  expiryDate?: string | null
  salary?: number | null
  currency?: string | null
  departmentId?: string | null
  notes?: string | null
}

export interface UpdateOfferLetterRequest {
  positionId?: string | null
  candidateName?: string | null
  candidateEmail?: string | null
  offerDate?: string | null
  expiryDate?: string | null
  salary?: number | null
  currency?: string | null
  departmentId?: string | null
  notes?: string | null
  status?: OfferLetterStatus | null
}

// ---- Appraisal (self-service view) ----
export interface AppraisalGoal {
  id: string
  title: string
  description?: string | null
  targetDate?: string | null
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED'
  progress: number
  parentGoalId?: string | null
  parentGoalTitle?: string | null
  ownerId?: string | null
  ownerName?: string | null
}

// ---- Candidate / Recruitment pipeline ----
export type CandidateStage = 'SOURCED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED'

export interface Candidate {
  id: string
  positionId?: string | null
  positionTitle?: string | null
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  linkedinUrl?: string | null
  resumeUrl?: string | null
  stage: CandidateStage
  source?: string | null
  notes?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateCandidateRequest {
  positionId?: string | null
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  linkedinUrl?: string | null
  resumeUrl?: string | null
  stage?: CandidateStage
  source?: string | null
  notes?: string | null
}

export interface InterviewScorecard {
  id: string
  candidateId: string
  interviewerId: string
  interviewDate: string
  overallRating: number // 1-5
  technicalScore?: number | null
  communicationScore?: number | null
  cultureFitScore?: number | null
  strengths?: string | null
  weaknesses?: string | null
  recommendation: 'STRONG_HIRE' | 'HIRE' | 'NEUTRAL' | 'NO_HIRE' | 'STRONG_NO_HIRE'
  notes?: string | null
  createdAt?: string
}

// ---- Attendance / Punch ----
export interface AttendancePunch {
  id: string
  employeeId: string
  punchIn: string
  punchOut?: string | null
  shiftId?: string | null
  workDate: string
  totalHours?: number | null
  notes?: string | null
  createdAt?: string
}

export interface ShiftAssignment {
  id: string
  employeeId: string
  shiftName: string
  shiftStart: string // "09:00"
  shiftEnd: string   // "18:00"
  effectiveFrom: string
  effectiveTo?: string | null
  daysOfWeek: string[] // ["MON","TUE","WED","THU","FRI"]
}

// ---- Onboarding Task ----
export type OnboardingTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE'

export interface OnboardingTask {
  id: string
  employeeId: string
  title: string
  description?: string | null
  category: string
  dueDate?: string | null
  status: OnboardingTaskStatus
  assignedTo?: string | null
  completedAt?: string | null
  createdAt?: string
}

// ---- Policy Acknowledgment ----
export interface PolicyAcknowledgment {
  id: string
  employeeId: string
  policyName: string
  policyVersion: string
  acknowledgedAt?: string | null
  required: boolean
  dueDate?: string | null
}

// ---- Exit / F&F ----
export interface ExitFnF {
  employeeId: string
  exitDate: string
  lastWorkingDay: string
  unpaidLeaves: number
  pendingReimbursements: number
  pendingReimbursementAmount: number
  gratuityAmount: number
  noticePeriodDays: number
  noticePeriodWaived: boolean
  recoveryDays: number
  recoveryAmount: number
  finalSettlementAmount: number
  currency: string
  notes?: string | null
}

// ---- Asset ----
export type AssetStatus = 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'RETIRED'

export interface Asset {
  id: string
  assetCode: string
  name: string
  category: string
  serialNumber?: string | null
  assignedToEmployeeId?: string | null
  assignedDate?: string | null
  returnDate?: string | null
  status: AssetStatus
  condition?: string | null
  purchaseDate?: string | null
  purchaseCost?: number | null
  currency?: string | null
  notes?: string | null
  createdAt?: string
  updatedAt?: string
}

// ---- Audit Log ----
export interface AuditLogEntry {
  id: string
  action: string
  module: string
  entityType: string
  entityId?: string | null
  performedBy: string
  performedAt: string
  details?: string | null
  ipAddress?: string | null
}

// ---- Task (Project management) ----
export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface Task {
  id: string
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  assigneeId?: string | null
  assigneeName?: string | null
  dueDate?: string | null
  projectId?: string | null
  sprintId?: string | null
  storyPoints?: number | null
  labels?: string[]
  createdAt?: string
  updatedAt?: string
}

// ---- OKR (Objectives and Key Results) ----
export type OkrStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'
export type KeyResultStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'AT_RISK' | 'COMPLETED' | 'MISSED'
export type OkrCategory = 'PROFESSIONAL' | 'PERSONAL' | 'TEAM' | 'COMPANY'

export interface KeyResult {
  id: string
  objectiveId: string
  title: string
  description?: string | null
  targetValue: number
  currentValue: number
  unit: string
  status: KeyResultStatus
  progress: number
  startDate?: string | null
  targetDate?: string | null
  confidenceLevel?: number | null
  weight: number
  createdAt?: string
  updatedAt?: string
}

export interface Objective {
  id: string
  employeeId: string
  employeeName?: string | null
  cycleId: string
  cycleName?: string | null
  title: string
  description?: string | null
  category: OkrCategory
  status: OkrStatus
  progress: number
  weight: number
  parentObjectiveId?: string | null
  parentObjectiveTitle?: string | null
  managerId?: string | null
  managerName?: string | null
  startDate?: string | null
  endDate?: string | null
  isPublic: boolean
  keyResults: KeyResult[]
  createdAt?: string
  updatedAt?: string
}

export interface OkrCycle {
  id: string
  name: string
  description?: string | null
  startDate: string
  endDate: string
  status: OkrStatus
  isDefault: boolean
  checkInFrequency: string
  maxObjectivesPerEmployee: number
  maxKeyResultsPerObjective: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateObjectiveRequest {
  employeeId: string
  cycleId: string
  title: string
  description?: string | null
  category: OkrCategory
  weight?: number
  parentObjectiveId?: string | null
  isPublic?: boolean
  startDate?: string | null
  endDate?: string | null
  keyResults?: CreateKeyResultRequest[]
}

export interface CreateKeyResultRequest {
  title: string
  description?: string | null
  targetValue: number
  unit: string
  startDate?: string | null
  targetDate?: string | null
  confidenceLevel?: number | null
  weight?: number
}

export interface UpdateKeyResultProgressRequest {
  currentValue: number
  confidenceLevel?: number | null
  notes?: string | null
}

export interface OkrDashboardDto {
  totalObjectives: number
  averageProgress: number
  completedObjectives: number
  atRiskObjectives: number
  onTrackObjectives: number
  behindObjectives: number
}
