import api from '../api/axiosInstance';
import { employeeApi } from '../api/hrApi';
import type { Employee } from '../types/hr';
import type {
  Project,
  Task,
  Sprint,
  Epic,
  Milestone,
  ProjectMember,
  TimeLog,
  Comment,
  Attachment,
  TaskDependency,
  CustomField,
  Workspace,
  Portfolio,
  CreateTaskInput,
  UpdateTaskInput,
  CreateProjectInput,
  CreateSprintInput,
  CreateEpicInput,
  CreateMilestoneInput,
  TimeLogInput,
  CommentInput,
  TaskFilter,
  TaskBoardColumn,
  ProjectSettings,
} from '../types/projectManagement';

type ProjectDTO = {
  id: string;
  workspaceId?: string | null;
  portfolioId?: string | null;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  category?: string | null;
  projectType?: string | null;
  visibility?: string | null;
  status?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  ownerId?: string | null;
  settings?: string | null;
  metadata?: string | null;
  tags?: string[] | null;
  isArchived?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  createdBy?: string | null;
};

type TaskDTO = {
  id: string;
  projectId: string;
  taskNumber: string;
  parentTaskId?: string | null;
  epicId?: string | null;
  sprintId?: string | null;
  milestoneId?: string | null;
  title: string;
  description?: string | null;
  taskType?: string | null;
  priority?: string | null;
  status?: string | null;
  statusOrder?: number | null;
  startDate?: string | null;
  dueDate?: string | null;
  completedAt?: string | null;
  timeEstimate?: number | null;
  timeSpent?: number | null;
  assigneeId?: string | null;
  assigneeName?: string | null;
  storyPoints?: number | null;
  isRecurring?: boolean | null;
  recurringPattern?: string | null;
  coverImage?: string | null;
  isPrivate?: boolean | null;
  metadata?: string | null;
  tags?: string[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  createdBy?: string | null;
};

type SprintDTO = {
  id: string;
  projectId: string;
  name: string;
  goal?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
  velocity?: number | string | null;
  capacity?: number | string | null;
  retrospectiveNotes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type EpicDTO = {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  color?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
  progress?: number | null;
  ownerId?: string | null;
  milestoneId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type MilestoneDTO = {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  dueDate?: string | null;
  status?: string | null;
  progress?: number | null;
  ownerId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const parseJson = <T>(value: string | null | undefined, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const parseRecord = <T extends Record<string, any>>(value: string | null | undefined, fallback: T): T => {
  const parsed = parseJson<unknown>(value, fallback);
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed as T;
  }
  return fallback;
};

const ensureArray = <T>(value: T[] | null | undefined): T[] => (Array.isArray(value) ? value : []);

const mapProjectDto = (dto: ProjectDTO): Project => ({
  id: dto.id,
  workspace_id: dto.workspaceId ?? null,
  portfolio_id: dto.portfolioId ?? null,
  name: dto.name,
  description: dto.description ?? null,
  icon: dto.icon ?? null,
  color: dto.color ?? null,
  category: dto.category ?? null,
  project_type: (dto.projectType as Project['project_type']) || 'KANBAN',
  visibility: (dto.visibility as Project['visibility']) || 'PRIVATE',
  status: (dto.status as Project['status']) || 'ACTIVE',
  start_date: dto.startDate ?? null,
  end_date: dto.endDate ?? null,
  owner_id: dto.ownerId ?? null,
  settings: parseRecord<ProjectSettings>(dto.settings, {}),
  metadata: parseRecord<Record<string, any>>(dto.metadata, {}),
  tags: ensureArray(dto.tags),
  is_archived: dto.isArchived ?? false,
  created_at: dto.createdAt ?? new Date().toISOString(),
  updated_at: dto.updatedAt ?? new Date().toISOString(),
  created_by: dto.createdBy ?? null,
  is_deleted: false,
  version: 0,
});

const mapTaskDto = (dto: TaskDTO): Task => ({
  id: dto.id,
  project_id: dto.projectId,
  task_number: dto.taskNumber,
  parent_task_id: dto.parentTaskId ?? null,
  epic_id: dto.epicId ?? null,
  sprint_id: dto.sprintId ?? null,
  milestone_id: dto.milestoneId ?? null,
  title: dto.title,
  description: dto.description ?? null,
  task_type: (dto.taskType as Task['task_type']) || 'TASK',
  priority: (dto.priority as Task['priority']) || 'MEDIUM',
  status: dto.status || 'TODO',
  status_order: dto.statusOrder ?? 0,
  start_date: dto.startDate ?? null,
  due_date: dto.dueDate ?? null,
  completed_at: dto.completedAt ?? null,
  time_estimate: dto.timeEstimate ?? null,
  time_spent: dto.timeSpent ?? 0,
  assignee_id: dto.assigneeId ?? null,
  story_points: dto.storyPoints ?? null,
  is_recurring: dto.isRecurring ?? false,
  recurring_pattern: dto.recurringPattern ?? null,
  cover_image: dto.coverImage ?? null,
  is_private: dto.isPrivate ?? false,
  metadata: parseRecord<Record<string, any>>(dto.metadata, {}),
  tags: ensureArray(dto.tags),
  created_at: dto.createdAt ?? new Date().toISOString(),
  updated_at: dto.updatedAt ?? new Date().toISOString(),
  created_by: dto.createdBy ?? null,
  is_deleted: false,
  version: 0,
  assignee: dto.assigneeId
    ? {
        id: dto.assigneeId,
        full_name: dto.assigneeName || '',
        avatar_url: null,
      }
    : undefined,
});

const mapSprintDto = (dto: SprintDTO): Sprint => ({
  id: dto.id,
  project_id: dto.projectId,
  name: dto.name,
  goal: dto.goal ?? null,
  start_date: dto.startDate ?? '',
  end_date: dto.endDate ?? '',
  status: (dto.status as Sprint['status']) || 'PLANNING',
  velocity: dto.velocity != null ? Number(dto.velocity) : null,
  capacity: dto.capacity != null ? Number(dto.capacity) : null,
  retrospective_notes: dto.retrospectiveNotes ?? null,
  created_at: dto.createdAt ?? new Date().toISOString(),
  updated_at: dto.updatedAt ?? new Date().toISOString(),
  is_deleted: false,
});

const mapEpicDto = (dto: EpicDTO): Epic => ({
  id: dto.id,
  project_id: dto.projectId,
  name: dto.name,
  description: dto.description ?? null,
  color: dto.color ?? null,
  start_date: dto.startDate ?? null,
  end_date: dto.endDate ?? null,
  status: (dto.status as Epic['status']) || 'OPEN',
  progress: dto.progress ?? 0,
  owner_id: dto.ownerId ?? null,
  milestone_id: dto.milestoneId ?? null,
  created_at: dto.createdAt ?? new Date().toISOString(),
  updated_at: dto.updatedAt ?? new Date().toISOString(),
  is_deleted: false,
});

const mapMilestoneDto = (dto: MilestoneDTO): Milestone => ({
  id: dto.id,
  project_id: dto.projectId,
  name: dto.name,
  description: dto.description ?? null,
  due_date: dto.dueDate ?? '',
  status: (dto.status as Milestone['status']) || 'PENDING',
  progress: dto.progress ?? 0,
  owner_id: dto.ownerId ?? null,
  created_at: dto.createdAt ?? new Date().toISOString(),
  updated_at: dto.updatedAt ?? new Date().toISOString(),
  is_deleted: false,
});

const mapCreateProjectInput = (project: CreateProjectInput) => ({
  name: project.name,
  description: project.description ?? null,
  icon: project.icon ?? null,
  color: project.color ?? null,
  category: project.category ?? null,
  projectType: project.project_type,
  visibility: project.visibility,
  workspaceId: project.workspace_id ?? undefined,
  portfolioId: project.portfolio_id ?? undefined,
  startDate: project.start_date ?? undefined,
  endDate: project.end_date ?? undefined,
  tags: project.tags ?? [],
});

const mapUpdateProjectInput = (project: Partial<Project>) => ({
  name: project.name,
  description: project.description,
  icon: project.icon,
  color: project.color,
  category: project.category,
  projectType: project.project_type,
  visibility: project.visibility,
  status: project.status,
  startDate: project.start_date ?? undefined,
  endDate: project.end_date ?? undefined,
  tags: project.tags,
  isArchived: project.is_archived,
});

const mapCreateTaskInput = (task: CreateTaskInput) => ({
  projectId: task.project_id,
  title: task.title,
  description: task.description ?? null,
  taskType: task.task_type,
  priority: task.priority,
  status: task.status,
  assigneeId: task.assignee_id ?? undefined,
  epicId: task.epic_id ?? undefined,
  sprintId: task.sprint_id ?? undefined,
  milestoneId: task.milestone_id ?? undefined,
  parentTaskId: task.parent_task_id ?? undefined,
  startDate: task.start_date ?? undefined,
  dueDate: task.due_date ?? undefined,
  timeEstimate: task.time_estimate ?? undefined,
  storyPoints: task.story_points ?? undefined,
  tags: task.tags ?? [],
  isPrivate: task.is_private ?? undefined,
});

const mapUpdateTaskInput = (task: UpdateTaskInput) => ({
  title: task.title,
  description: task.description,
  taskType: task.task_type,
  priority: task.priority,
  status: task.status,
  statusOrder: task.status_order,
  assigneeId: task.assignee_id ?? undefined,
  epicId: task.epic_id ?? undefined,
  sprintId: task.sprint_id ?? undefined,
  milestoneId: task.milestone_id ?? undefined,
  startDate: task.start_date ?? undefined,
  dueDate: task.due_date ?? undefined,
  timeEstimate: task.time_estimate ?? undefined,
  timeSpent: task.time_spent ?? undefined,
  storyPoints: task.story_points ?? undefined,
  isRecurring: task.is_recurring ?? undefined,
  recurringPattern: task.recurring_pattern ?? undefined,
  coverImage: task.cover_image ?? undefined,
  isPrivate: task.is_private ?? undefined,
  tags: task.tags,
});

const mapCreateSprintInput = (sprint: CreateSprintInput) => ({
  projectId: sprint.project_id,
  name: sprint.name,
  goal: sprint.goal ?? null,
  startDate: sprint.start_date,
  endDate: sprint.end_date,
});

const mapUpdateSprintInput = (sprint: Partial<Sprint>) => ({
  name: sprint.name,
  goal: sprint.goal ?? null,
  startDate: sprint.start_date,
  endDate: sprint.end_date,
  status: sprint.status,
  velocity: sprint.velocity ?? undefined,
  capacity: sprint.capacity ?? undefined,
  retrospectiveNotes: sprint.retrospective_notes ?? undefined,
});

const mapCreateEpicInput = (epic: CreateEpicInput) => ({
  projectId: epic.project_id,
  name: epic.name,
  description: epic.description ?? null,
  color: epic.color ?? null,
  startDate: epic.start_date ?? undefined,
  endDate: epic.end_date ?? undefined,
  milestoneId: epic.milestone_id ?? undefined,
});

const mapUpdateEpicInput = (epic: Partial<Epic>) => ({
  name: epic.name,
  description: epic.description ?? null,
  color: epic.color ?? null,
  startDate: epic.start_date ?? undefined,
  endDate: epic.end_date ?? undefined,
  status: epic.status,
  progress: epic.progress ?? undefined,
  milestoneId: epic.milestone_id ?? undefined,
});

const mapCreateMilestoneInput = (milestone: CreateMilestoneInput) => ({
  projectId: milestone.project_id,
  name: milestone.name,
  description: milestone.description ?? null,
  dueDate: milestone.due_date,
});

const mapUpdateMilestoneInput = (milestone: Partial<Milestone>) => ({
  name: milestone.name,
  description: milestone.description ?? null,
  dueDate: milestone.due_date ?? undefined,
  status: milestone.status,
  progress: milestone.progress ?? undefined,
});

const toProjectMember = (projectId: string, employee: Employee): ProjectMember => {
  const fullName = `${employee.firstName} ${employee.lastName}`.trim();
  const userId = employee.userId ?? employee.id;

  return {
    id: employee.id,
    project_id: projectId,
    user_id: userId,
    role: 'MEMBER',
    joined_at: employee.createdAt || new Date().toISOString(),
    user: {
      id: userId,
      full_name: fullName || employee.email,
      email: employee.email,
      avatar_url: employee.avatarUrl ?? null,
    },
  };
};

const applyTaskFilters = (tasks: Task[], filters?: TaskFilter) => {
  if (!filters) return tasks;

  return tasks.filter(task => {
    if (filters.status?.length && !filters.status.includes(task.status)) return false;
    if (filters.priority?.length && !filters.priority.includes(task.priority)) return false;
    if (filters.assignee_id?.length && (!task.assignee_id || !filters.assignee_id.includes(task.assignee_id))) {
      return false;
    }
    if (filters.epic_id && task.epic_id !== filters.epic_id) return false;
    if (filters.sprint_id && task.sprint_id !== filters.sprint_id) return false;
    if (filters.milestone_id && task.milestone_id !== filters.milestone_id) return false;
    if (filters.task_type?.length && !filters.task_type.includes(task.task_type)) return false;
    if (filters.tags?.length && !filters.tags.every(tag => task.tags.includes(tag))) return false;
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false;

    if (filters.due_date_from) {
      if (!task.due_date) return false;
      if (new Date(task.due_date).getTime() < new Date(filters.due_date_from).getTime()) return false;
    }

    if (filters.due_date_to) {
      if (!task.due_date) return false;
      if (new Date(task.due_date).getTime() > new Date(filters.due_date_to).getTime()) return false;
    }

    return true;
  });
};

const notImplemented = (feature: string): never => {
  throw new Error(`${feature} is not available in the backend API yet.`);
};

// ============================================
// WORKSPACES
// ============================================

export const workspaceService = {
  async getAll() {
    return notImplemented('Workspaces');
  },

  async getById(_id: string) {
    return notImplemented('Workspaces');
  },

  async create(_workspace: Partial<Workspace>) {
    return notImplemented('Workspaces');
  },

  async update(_id: string, _workspace: Partial<Workspace>) {
    return notImplemented('Workspaces');
  },

  async delete(_id: string) {
    return notImplemented('Workspaces');
  },
};

// ============================================
// PORTFOLIOS
// ============================================

export const portfolioService = {
  async getAll(_workspaceId?: string) {
    return notImplemented('Portfolios');
  },

  async getById(_id: string) {
    return notImplemented('Portfolios');
  },

  async create(_portfolio: Partial<Portfolio>) {
    return notImplemented('Portfolios');
  },

  async update(_id: string, _portfolio: Partial<Portfolio>) {
    return notImplemented('Portfolios');
  },

  async delete(_id: string) {
    return notImplemented('Portfolios');
  },
};

// ============================================
// PROJECTS
// ============================================

export const projectService = {
  async getAll(filters?: { workspaceId?: string; portfolioId?: string; status?: string }) {
    let response;

    if (filters?.workspaceId) {
      response = await api.get<ProjectDTO[]>(`/pm/projects/workspace/${filters.workspaceId}`);
    } else if (filters?.portfolioId) {
      response = await api.get<ProjectDTO[]>(`/pm/projects/portfolio/${filters.portfolioId}`);
    } else {
      response = await api.get<ProjectDTO[]>('/pm/projects');
    }

    let projects = response.data.map(mapProjectDto);

    if (filters?.status) {
      projects = projects.filter(project => project.status === filters.status);
    }

    return projects;
  },

  async getById(id: string) {
    const response = await api.get<ProjectDTO>(`/pm/projects/${id}`);
    return mapProjectDto(response.data);
  },

  async create(project: CreateProjectInput) {
    const response = await api.post<ProjectDTO>('/pm/projects', mapCreateProjectInput(project));
    return mapProjectDto(response.data);
  },

  async update(id: string, project: Partial<Project>) {
    const response = await api.put<ProjectDTO>(`/pm/projects/${id}`, mapUpdateProjectInput(project));
    return mapProjectDto(response.data);
  },

  async delete(id: string) {
    await api.delete(`/pm/projects/${id}`);
  },

  async archive(id: string) {
    const response = await api.post<ProjectDTO>(`/pm/projects/${id}/archive`);
    return mapProjectDto(response.data);
  },

  async getMembers(projectId: string) {
    const response = await employeeApi.getAll(0, 200);
    const employees = response.data?.data?.content ?? [];
    return employees.map(employee => toProjectMember(projectId, employee));
  },

  async addMember(_projectId: string, _userId: string, _role: string = 'MEMBER') {
    return notImplemented('Project members');
  },

  async removeMember(_projectId: string, _userId: string) {
    return notImplemented('Project members');
  },

  async updateMemberRole(_projectId: string, _userId: string, _role: string) {
    return notImplemented('Project members');
  },
};

// ============================================
// TASKS
// ============================================

export const taskService = {
  async getAll(projectId: string, filters?: TaskFilter) {
    const response = await api.get<TaskDTO[]>(`/pm/tasks/project/${projectId}`);
    const tasks = response.data.map(mapTaskDto);
    const filtered = applyTaskFilters(tasks, filters);

    return filtered.sort((a, b) => {
      if (a.status_order !== b.status_order) return a.status_order - b.status_order;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  },

  async getById(id: string) {
    const response = await api.get<TaskDTO>(`/pm/tasks/${id}`);
    return mapTaskDto(response.data);
  },

  async create(task: CreateTaskInput) {
    const response = await api.post<TaskDTO>('/pm/tasks', mapCreateTaskInput(task));
    return mapTaskDto(response.data);
  },

  async update(id: string, task: UpdateTaskInput) {
    const response = await api.put<TaskDTO>(`/pm/tasks/${id}`, mapUpdateTaskInput(task));
    return mapTaskDto(response.data);
  },

  async delete(id: string) {
    await api.delete(`/pm/tasks/${id}`);
  },

  async getSubtasks(parentTaskId: string) {
    const response = await api.get<TaskDTO[]>(`/pm/tasks/subtasks/${parentTaskId}`);
    return response.data.map(mapTaskDto);
  },

  async getBySprint(sprintId: string) {
    const response = await api.get<TaskDTO[]>(`/pm/tasks/sprint/${sprintId}`);
    return response.data.map(mapTaskDto);
  },

  async getBoardColumns(projectId: string): Promise<TaskBoardColumn[]> {
    const tasks = await this.getAll(projectId);
    const columnsMap = new Map<string, TaskBoardColumn>();

    tasks.forEach(task => {
      if (!columnsMap.has(task.status)) {
        columnsMap.set(task.status, {
          id: task.status,
          name: task.status,
          status: task.status,
          order: task.status_order,
          tasks: [],
        });
      }
      columnsMap.get(task.status)!.tasks.push(task);
    });

    return Array.from(columnsMap.values()).sort((a, b) => a.order - b.order);
  },

  async moveTask(taskId: string, newStatus: string, newOrder: number) {
    const response = await api.put<TaskDTO>(`/pm/tasks/${taskId}/move`, {
      status: newStatus,
      statusOrder: newOrder,
    });
    return mapTaskDto(response.data);
  },

  async assignTask(taskId: string, assigneeId: string | null) {
    const response = await api.put<TaskDTO>(`/pm/tasks/${taskId}`, {
      assigneeId,
    });
    return mapTaskDto(response.data);
  },

  async getMyTasks(userId: string) {
    const response = await api.get<TaskDTO[]>(`/pm/tasks/assignee/${userId}`);
    return response.data.map(mapTaskDto);
  },
};

// ============================================
// TASK DEPENDENCIES
// ============================================

export const taskDependencyService = {
  async getByTask(_taskId: string): Promise<TaskDependency[]> {
    return notImplemented('Task dependencies');
  },

  async create(_dependency: { blocking_task_id: string; blocked_task_id: string; dependency_type?: string }) {
    return notImplemented('Task dependencies');
  },

  async delete(_id: string) {
    return notImplemented('Task dependencies');
  },
};

// ============================================
// SPRINTS
// ============================================

export const sprintService = {
  async getByProject(projectId: string) {
    const response = await api.get<SprintDTO[]>(`/pm/sprints/project/${projectId}`);
    return response.data.map(mapSprintDto);
  },

  async getById(id: string) {
    const response = await api.get<SprintDTO>(`/pm/sprints/${id}`);
    return mapSprintDto(response.data);
  },

  async getActive(projectId: string) {
    const response = await api.get<SprintDTO>(`/pm/sprints/project/${projectId}/active`);
    return mapSprintDto(response.data);
  },

  async create(sprint: CreateSprintInput) {
    const response = await api.post<SprintDTO>('/pm/sprints', mapCreateSprintInput(sprint));
    return mapSprintDto(response.data);
  },

  async update(id: string, sprint: Partial<Sprint>) {
    const response = await api.put<SprintDTO>(`/pm/sprints/${id}`, mapUpdateSprintInput(sprint));
    return mapSprintDto(response.data);
  },

  async delete(id: string) {
    await api.delete(`/pm/sprints/${id}`);
  },

  async startSprint(id: string) {
    const response = await api.post<SprintDTO>(`/pm/sprints/${id}/start`);
    return mapSprintDto(response.data);
  },

  async completeSprint(id: string) {
    const response = await api.post<SprintDTO>(`/pm/sprints/${id}/complete`);
    return mapSprintDto(response.data);
  },
};

// ============================================
// EPICS
// ============================================

export const epicService = {
  async getByProject(projectId: string) {
    const response = await api.get<EpicDTO[]>(`/pm/epics/project/${projectId}`);
    return response.data.map(mapEpicDto);
  },

  async getById(id: string) {
    const response = await api.get<EpicDTO>(`/pm/epics/${id}`);
    return mapEpicDto(response.data);
  },

  async create(epic: CreateEpicInput) {
    const response = await api.post<EpicDTO>('/pm/epics', mapCreateEpicInput(epic));
    return mapEpicDto(response.data);
  },

  async update(id: string, epic: Partial<Epic>) {
    const response = await api.put<EpicDTO>(`/pm/epics/${id}`, mapUpdateEpicInput(epic));
    return mapEpicDto(response.data);
  },

  async delete(id: string) {
    await api.delete(`/pm/epics/${id}`);
  },
};

// ============================================
// MILESTONES
// ============================================

export const milestoneService = {
  async getByProject(projectId: string) {
    const response = await api.get<MilestoneDTO[]>(`/pm/milestones/project/${projectId}`);
    return response.data.map(mapMilestoneDto);
  },

  async getById(id: string) {
    const response = await api.get<MilestoneDTO>(`/pm/milestones/${id}`);
    return mapMilestoneDto(response.data);
  },

  async create(milestone: CreateMilestoneInput) {
    const response = await api.post<MilestoneDTO>('/pm/milestones', mapCreateMilestoneInput(milestone));
    return mapMilestoneDto(response.data);
  },

  async update(id: string, milestone: Partial<Milestone>) {
    const response = await api.put<MilestoneDTO>(`/pm/milestones/${id}`, mapUpdateMilestoneInput(milestone));
    return mapMilestoneDto(response.data);
  },

  async delete(id: string) {
    await api.delete(`/pm/milestones/${id}`);
  },
};

// ============================================
// TIME LOGS
// ============================================

export const timeLogService = {
  async getByTask(_taskId: string): Promise<TimeLog[]> {
    return notImplemented('Time logs');
  },

  async create(_log: TimeLogInput) {
    return notImplemented('Time logs');
  },

  async update(_id: string, _log: Partial<TimeLog>) {
    return notImplemented('Time logs');
  },

  async delete(_id: string) {
    return notImplemented('Time logs');
  },
};

// ============================================
// COMMENTS
// ============================================

export const commentService = {
  async getByTask(_taskId: string): Promise<Comment[]> {
    return notImplemented('Task comments');
  },

  async create(_comment: CommentInput) {
    return notImplemented('Task comments');
  },

  async update(_id: string, _content: string) {
    return notImplemented('Task comments');
  },

  async delete(_id: string) {
    return notImplemented('Task comments');
  },
};

// ============================================
// ATTACHMENTS
// ============================================

export const attachmentService = {
  async getByTask(_taskId: string): Promise<Attachment[]> {
    return notImplemented('Task attachments');
  },

  async create(_attachment: Partial<Attachment>) {
    return notImplemented('Task attachments');
  },

  async delete(_id: string) {
    return notImplemented('Task attachments');
  },
};

// ============================================
// CUSTOM FIELDS
// ============================================

export const customFieldService = {
  async getByProject(_projectId: string): Promise<CustomField[]> {
    return notImplemented('Custom fields');
  },

  async create(_field: Partial<CustomField>) {
    return notImplemented('Custom fields');
  },

  async update(_id: string, _field: Partial<CustomField>) {
    return notImplemented('Custom fields');
  },

  async delete(_id: string) {
    return notImplemented('Custom fields');
  },

  async getTaskValues(_taskId: string) {
    return notImplemented('Custom fields');
  },

  async setTaskValue(_taskId: string, _fieldId: string, _value: string) {
    return notImplemented('Custom fields');
  },
};

// ============================================
// DASHBOARD
// ============================================

export const dashboardService = {
  async getProjectStats(projectId: string) {
    const tasks = await taskService.getAll(projectId);
    const completedStatuses = new Set(['DONE', 'COMPLETED']);
    const inProgressStatuses = new Set(['IN_PROGRESS']);

    const total = tasks.length;
    const completed = tasks.filter(task => completedStatuses.has(task.status)).length;
    const inProgress = tasks.filter(task => inProgressStatuses.has(task.status)).length;
    const overdue = tasks.filter(task => {
      if (!task.due_date) return false;
      if (completedStatuses.has(task.status)) return false;
      return new Date(task.due_date) < new Date();
    }).length;

    const byStatus = Object.entries(
      tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([status, count]) => ({ status, count }));

    const byPriority = Object.entries(
      tasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([priority, count]) => ({ priority, count }));

    return {
      totalTasks: total,
      completedTasks: completed,
      inProgressTasks: inProgress,
      overdueTasks: overdue,
      tasksByStatus: byStatus,
      tasksByPriority: byPriority,
    };
  },

  async getSprintStats(sprintId: string) {
    const tasks = await taskService.getBySprint(sprintId);
    const totalPoints = tasks.reduce((sum, task) => sum + (task.story_points || 0), 0);
    const completedPoints = tasks
      .filter(task => task.status === 'DONE')
      .reduce((sum, task) => sum + (task.story_points || 0), 0);

    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(task => task.status === 'DONE').length,
      totalPoints,
      completedPoints,
      remainingPoints: totalPoints - completedPoints,
    };
  },
};
