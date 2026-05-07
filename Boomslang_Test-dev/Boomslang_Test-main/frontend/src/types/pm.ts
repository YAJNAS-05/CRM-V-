export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'IN_REVIEW' | 'DONE'
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface Project {
  id: string
  projectCode: string
  projectName: string
  ownerId: string
  description?: string
  status: ProjectStatus
  startDate?: string
  endDate?: string
  budget?: number
  currency?: string
  linkedFieldJobId?: string
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
