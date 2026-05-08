export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'IN_REVIEW' | 'DONE'
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface Project {
  id: string
  projectCode: string
  projectName: string
  name: string // Added for compatibility
  ownerId: string
  description?: string
  status: ProjectStatus
  startDate?: string
  endDate?: string
  budget?: number
  currency?: string
  linkedFieldJobId?: string
  progress?: number // Added for compatibility
  memberCount?: number // Added for compatibility
  createdAt: string
  updatedAt: string
}

export interface CreateProjectRequest {
  projectCode?: string
  projectName: string
  ownerId?: string
  description?: string
  status?: string
  startDate?: string
  endDate?: string
  budget?: number
  currency?: string
  linkedFieldJobId?: string
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {}

export interface ProjectMember {
  id: string
  projectId: string
  employeeId: string
  role: string
  name?: string // Added for compatibility
  email?: string // Added for compatibility
  createdAt: string
}

export interface AddProjectMemberRequest {
  employeeId: string
  role: string
}

export interface ProjectCost {
  id: string
  projectId: string
  description: string
  amount: number
  currency: string
  costDate: string
  createdAt: string
}

export interface CreateProjectCostRequest {
  description: string
  amount: number
  currency: string
  costDate: string
}

export interface ProjectDetail {
  project: Project
  members: ProjectMember[]
  tasks: any[] // We'll use Task from hr types for now
  costs: ProjectCost[]
  totalLaborHours: number
  actualCost: number
  profitability: number
  profitMargin: number
}

// Task types for PM module
export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId?: string
  assigneeName?: string
  projectId?: string
  projectName?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}
