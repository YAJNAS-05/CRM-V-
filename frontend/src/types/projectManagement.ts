// ============================================
// PROJECT MANAGEMENT TYPES
// ============================================

export type TaskType = 'TASK' | 'BUG' | 'STORY' | 'EPIC' | 'MILESTONE' | 'SUBTASK';
export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
export type ProjectType = 'KANBAN' | 'SCRUM' | 'WATERFALL' | 'CUSTOM';
export type ProjectVisibility = 'PUBLIC' | 'PRIVATE' | 'INTERNAL';
export type ProjectStatus = 'ACTIVE' | 'ON_HOLD' | 'ARCHIVED' | 'COMPLETED';
export type ProjectMemberRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' | 'GUEST';
export type SprintStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type EpicStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';
export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF'; // Finish-to-Start, Start-to-Start, Finish-to-Finish, Start-to-Finish

// Workspaces
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  owner_id: string | null;
  settings: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

// Portfolios
export interface Portfolio {
  id: string;
  workspace_id: string | null;
  name: string;
  description: string | null;
  color: string | null;
  owner_id: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

// Projects
export interface Project {
  id: string;
  workspace_id: string | null;
  portfolio_id: string | null;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  category: string | null;
  project_type: ProjectType;
  visibility: ProjectVisibility;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  owner_id: string | null;
  settings: ProjectSettings;
  metadata: Record<string, any>;
  tags: string[];
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  is_deleted: boolean;
  version: number;
}

export interface ProjectSettings {
  columns?: string[];
  defaultStatuses?: string[];
  allowSubtasks?: boolean;
  requireStoryPoints?: boolean;
  timeTrackingEnabled?: boolean;
}

// Project Members
export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectMemberRole;
  joined_at: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

// Project Templates
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string | null;
  project_type: ProjectType;
  structure: Record<string, any>;
  is_shared: boolean;
  created_by: string | null;
  created_at: string;
  is_deleted: boolean;
}

// Milestones
export interface Milestone {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  due_date: string;
  status: MilestoneStatus;
  progress: number;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

// Epics
export interface Epic {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  color: string | null;
  start_date: string | null;
  end_date: string | null;
  status: EpicStatus;
  progress: number;
  owner_id: string | null;
  milestone_id: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

// Sprints
export interface Sprint {
  id: string;
  project_id: string;
  name: string;
  goal: string | null;
  start_date: string;
  end_date: string;
  status: SprintStatus;
  velocity: number | null;
  capacity: number | null;
  retrospective_notes: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

// Tasks
export interface Task {
  id: string;
  project_id: string;
  task_number: string;
  parent_task_id: string | null;
  epic_id: string | null;
  sprint_id: string | null;
  milestone_id: string | null;
  title: string;
  description: string | null;
  task_type: TaskType;
  priority: TaskPriority;
  status: string;
  status_order: number;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  time_estimate: number | null;
  time_spent: number;
  assignee_id: string | null;
  story_points: number | null;
  is_recurring: boolean;
  recurring_pattern: string | null;
  cover_image: string | null;
  is_private: boolean;
  metadata: Record<string, any>;
  tags: string[];
  created_at: string;
  updated_at: string;
  created_by: string | null;
  is_deleted: boolean;
  version: number;
  
  // Relations
  assignee?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  epic?: Epic;
  sprint?: Sprint;
  subtasks?: Task[];
  watchers?: { user_id: string }[];
}

// Task Dependencies
export interface TaskDependency {
  id: string;
  blocking_task_id: string;
  blocked_task_id: string;
  dependency_type: DependencyType;
  created_at: string;
  blocking_task?: Task;
  blocked_task?: Task;
}

// Task Watchers
export interface TaskWatcher {
  id: string;
  task_id: string;
  user_id: string;
  created_at: string;
}

// Time Logs
export interface TimeLog {
  id: string;
  task_id: string;
  user_id: string;
  log_date: string;
  hours: number;
  description: string | null;
  is_billable: boolean;
  is_approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
  };
}

// Custom Fields
export interface CustomField {
  id: string;
  project_id: string;
  name: string;
  field_type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'person' | 'url';
  field_options: string[];
  is_required: boolean;
  display_order: number;
  created_at: string;
}

export interface TaskCustomField {
  id: string;
  task_id: string;
  field_id: string;
  field_value: string | null;
  custom_field?: CustomField;
}

// Attachments
export interface Attachment {
  id: string;
  task_id: string | null;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  created_at: string;
}

// Comments
export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  replies?: Comment[];
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface CreateTaskInput {
  project_id: string;
  title: string;
  description?: string;
  task_type?: TaskType;
  priority?: TaskPriority;
  status?: string;
  assignee_id?: string;
  epic_id?: string;
  sprint_id?: string;
  milestone_id?: string;
  parent_task_id?: string;
  start_date?: string;
  due_date?: string;
  time_estimate?: number;
  story_points?: number;
  tags?: string[];
  is_private?: boolean;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  task_type?: TaskType;
  priority?: TaskPriority;
  status?: string;
  status_order?: number;
  assignee_id?: string;
  epic_id?: string;
  sprint_id?: string;
  milestone_id?: string;
  start_date?: string;
  due_date?: string;
  time_estimate?: number;
  time_spent?: number;
  story_points?: number;
  is_recurring?: boolean;
  recurring_pattern?: string;
  cover_image?: string;
  is_private?: boolean;
  tags?: string[];
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  category?: string;
  project_type?: ProjectType;
  visibility?: ProjectVisibility;
  workspace_id?: string;
  portfolio_id?: string;
  start_date?: string;
  end_date?: string;
  tags?: string[];
}

export interface CreateSprintInput {
  project_id: string;
  name: string;
  goal?: string;
  start_date: string;
  end_date: string;
}

export interface CreateEpicInput {
  project_id: string;
  name: string;
  description?: string;
  color?: string;
  start_date?: string;
  end_date?: string;
  milestone_id?: string;
}

export interface CreateMilestoneInput {
  project_id: string;
  name: string;
  description?: string;
  due_date: string;
}

export interface TimeLogInput {
  task_id: string;
  log_date: string;
  hours: number;
  description?: string;
  is_billable?: boolean;
}

export interface CommentInput {
  task_id: string;
  content: string;
  parent_comment_id?: string;
}

// ============================================
// VIEW TYPES
// ============================================

export interface TaskBoardColumn {
  id: string;
  name: string;
  status: string;
  order: number;
  tasks: Task[];
}

export interface TaskFilter {
  status?: string[];
  priority?: TaskPriority[];
  assignee_id?: string[];
  epic_id?: string;
  sprint_id?: string;
  milestone_id?: string;
  task_type?: TaskType[];
  tags?: string[];
  search?: string;
  due_date_from?: string;
  due_date_to?: string;
}

export interface TaskSort {
  field: 'due_date' | 'priority' | 'status' | 'created_at' | 'updated_at';
  direction: 'asc' | 'desc';
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface ProjectDashboard {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  tasksByStatus: { status: string; count: number }[];
  tasksByPriority: { priority: string; count: number }[];
  velocity?: number;
  burndownData?: { date: string; remaining: number; ideal: number }[];
}

export interface SprintDashboard {
  sprint: Sprint;
  totalPoints: number;
  completedPoints: number;
  remainingPoints: number;
  velocity: number;
  burndown: { date: string; remaining: number; completed: number }[];
  tasksByStatus: { status: string; count: number }[];
}
