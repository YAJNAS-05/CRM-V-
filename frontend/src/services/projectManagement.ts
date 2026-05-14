import { supabase } from '../lib/supabase';
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
} from '../types/projectManagement';

// ============================================
// WORKSPACES
// ============================================

export const workspaceService = {
  async getAll() {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(workspace: Partial<Workspace>) {
    const { data, error } = await supabase
      .from('workspaces')
      .insert(workspace)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, workspace: Partial<Workspace>) {
    const { data, error } = await supabase
      .from('workspaces')
      .update(workspace)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('workspaces')
      .update({ is_deleted: true })
      .eq('id', id);
    if (error) throw error;
  },
};

// ============================================
// PORTFOLIOS
// ============================================

export const portfolioService = {
  async getAll(workspaceId?: string) {
    let query = supabase.from('portfolios').select('*').order('name');
    if (workspaceId) query = query.eq('workspace_id', workspaceId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(portfolio: Partial<Portfolio>) {
    const { data, error } = await supabase
      .from('portfolios')
      .insert(portfolio)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, portfolio: Partial<Portfolio>) {
    const { data, error } = await supabase
      .from('portfolios')
      .update(portfolio)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('portfolios')
      .update({ is_deleted: true })
      .eq('id', id);
    if (error) throw error;
  },
};

// ============================================
// PROJECTS
// ============================================

export const projectService = {
  async getAll(filters?: { workspaceId?: string; portfolioId?: string; status?: string }) {
    let query = supabase.from('projects').select('*').order('name');
    if (filters?.workspaceId) query = query.eq('workspace_id', filters.workspaceId);
    if (filters?.portfolioId) query = query.eq('portfolio_id', filters.portfolioId);
    if (filters?.status) query = query.eq('status', filters.status);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(project: CreateProjectInput) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, project: Partial<Project>) {
    const { data, error } = await supabase
      .from('projects')
      .update(project)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('projects')
      .update({ is_deleted: true })
      .eq('id', id);
    if (error) throw error;
  },

  async archive(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .update({ is_archived: true })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getMembers(projectId: string) {
    const { data, error } = await supabase
      .from('project_members')
      .select('*, user:app_users(id, full_name, email, avatar_url)')
      .eq('project_id', projectId);
    if (error) throw error;
    return data;
  },

  async addMember(projectId: string, userId: string, role: string = 'MEMBER') {
    const { data, error } = await supabase
      .from('project_members')
      .insert({ project_id: projectId, user_id: userId, role })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async removeMember(projectId: string, userId: string) {
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  async updateMemberRole(projectId: string, userId: string, role: string) {
    const { data, error } = await supabase
      .from('project_members')
      .update({ role })
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ============================================
// TASKS
// ============================================

export const taskService = {
  async getAll(projectId: string, filters?: TaskFilter) {
    let query = supabase
      .from('tasks')
      .select('*, assignee:app_users(id, full_name, avatar_url), epic:epics(id, name, color), sprint:sprints(id, name)')
      .eq('project_id', projectId)
      .eq('is_deleted', false);

    if (filters?.status?.length) query = query.in('status', filters.status);
    if (filters?.priority?.length) query = query.in('priority', filters.priority);
    if (filters?.assignee_id?.length) query = query.in('assignee_id', filters.assignee_id);
    if (filters?.epic_id) query = query.eq('epic_id', filters.epic_id);
    if (filters?.sprint_id) query = query.eq('sprint_id', filters.sprint_id);
    if (filters?.milestone_id) query = query.eq('milestone_id', filters.milestone_id);
    if (filters?.task_type?.length) query = query.in('task_type', filters.task_type);
    if (filters?.search) query = query.ilike('title', `%${filters.search}%`);
    if (filters?.due_date_from) query = query.gte('due_date', filters.due_date_from);
    if (filters?.due_date_to) query = query.lte('due_date', filters.due_date_to);

    query = query.order('status_order', { ascending: true }).order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, assignee:app_users(id, full_name, avatar_url), epic:epics(id, name, color), sprint:sprints(id, name), parent_task:tasks(id, task_number, title)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(task: CreateTaskInput) {
    // Generate task number first
    const { data: taskNum } = await supabase.rpc('generate_task_number', { project_id_param: task.project_id });
    
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...task, task_number: taskNum || `TASK-${Date.now()}` })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, task: UpdateTaskInput) {
    const { data, error } = await supabase
      .from('tasks')
      .update(task)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('tasks')
      .update({ is_deleted: true })
      .eq('id', id);
    if (error) throw error;
  },

  async getSubtasks(parentTaskId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, assignee:app_users(id, full_name, avatar_url)')
      .eq('parent_task_id', parentTaskId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getBoardColumns(projectId: string): Promise<TaskBoardColumn[]> {
    const tasks = await this.getAll(projectId);
    
    // Group by status
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
    const { data, error } = await supabase
      .from('tasks')
      .update({ status: newStatus, status_order: newOrder })
      .eq('id', taskId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async assignTask(taskId: string, assigneeId: string | null) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ assignee_id: assigneeId })
      .eq('id', taskId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getMyTasks(userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, project:projects(id, name, color), assignee:app_users(id, full_name, avatar_url)')
      .eq('assignee_id', userId)
      .eq('is_deleted', false)
      .order('due_date', { ascending: true });
    if (error) throw error;
    return data;
  },
};

// ============================================
// TASK DEPENDENCIES
// ============================================

export const taskDependencyService = {
  async getByTask(taskId: string) {
    const { data, error } = await supabase
      .from('task_dependencies')
      .select('*, blocking_task:tasks(id, task_number, title), blocked_task:tasks(id, task_number, title)')
      .or(`blocking_task_id.eq.${taskId},blocked_task_id.eq.${taskId}`);
    if (error) throw error;
    return data;
  },

  async create(dependency: { blocking_task_id: string; blocked_task_id: string; dependency_type?: string }) {
    const { data, error } = await supabase
      .from('task_dependencies')
      .insert(dependency)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('task_dependencies').delete().eq('id', id);
    if (error) throw error;
  },
};

// ============================================
// TASK WATCHERS
// ============================================

export const taskWatcherService = {
  async getWatchers(taskId: string) {
    const { data, error } = await supabase
      .from('task_watchers')
      .select('*, user:app_users(id, full_name, avatar_url)')
      .eq('task_id', taskId);
    if (error) throw error;
    return data;
  },

  async watch(taskId: string, userId: string) {
    const { data, error } = await supabase
      .from('task_watchers')
      .insert({ task_id: taskId, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async unwatch(taskId: string, userId: string) {
    const { error } = await supabase
      .from('task_watchers')
      .delete()
      .eq('task_id', taskId)
      .eq('user_id', userId);
    if (error) throw error;
  },
};

// ============================================
// SPRINTS
// ============================================

export const sprintService = {
  async getByProject(projectId: string) {
    const { data, error } = await supabase
      .from('sprints')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_deleted', false)
      .order('start_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('sprints')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getActive(projectId: string) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('sprints')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'ACTIVE')
      .lte('start_date', today)
      .gte('end_date', today)
      .single();
    if (error) throw error;
    return data;
  },

  async create(sprint: CreateSprintInput) {
    const { data, error } = await supabase
      .from('sprints')
      .insert(sprint)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, sprint: Partial<Sprint>) {
    const { data, error } = await supabase
      .from('sprints')
      .update(sprint)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async startSprint(id: string) {
    const { data, error } = await supabase
      .from('sprints')
      .update({ status: 'ACTIVE' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async completeSprint(id: string) {
    const { data, error } = await supabase
      .from('sprints')
      .update({ status: 'COMPLETED' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('sprints')
      .update({ is_deleted: true })
      .eq('id', id);
    if (error) throw error;
  },
};

// ============================================
// EPICS
// ============================================

export const epicService = {
  async getByProject(projectId: string) {
    const { data, error } = await supabase
      .from('epics')
      .select('*, owner:app_users(id, full_name)')
      .eq('project_id', projectId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('epics')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(epic: CreateEpicInput) {
    const { data, error } = await supabase
      .from('epics')
      .insert(epic)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, epic: Partial<Epic>) {
    const { data, error } = await supabase
      .from('epics')
      .update(epic)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('epics')
      .update({ is_deleted: true })
      .eq('id', id);
    if (error) throw error;
  },
};

// ============================================
// MILESTONES
// ============================================

export const milestoneService = {
  async getByProject(projectId: string) {
    const { data, error } = await supabase
      .from('milestones')
      .select('*, owner:app_users(id, full_name)')
      .eq('project_id', projectId)
      .eq('is_deleted', false)
      .order('due_date', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(milestone: CreateMilestoneInput) {
    const { data, error } = await supabase
      .from('milestones')
      .insert(milestone)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, milestone: Partial<Milestone>) {
    const { data, error } = await supabase
      .from('milestones')
      .update(milestone)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('milestones')
      .update({ is_deleted: true })
      .eq('id', id);
    if (error) throw error;
  },
};

// ============================================
// TIME LOGS
// ============================================

export const timeLogService = {
  async getByTask(taskId: string) {
    const { data, error } = await supabase
      .from('task_time_logs')
      .select('*, user:app_users(id, full_name)')
      .eq('task_id', taskId)
      .order('log_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByUser(userId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('task_time_logs')
      .select('*, task:tasks(id, task_number, title), user:app_users(id, full_name)')
      .eq('user_id', userId);
    
    if (startDate) query = query.gte('log_date', startDate);
    if (endDate) query = query.lte('log_date', endDate);
    
    const { data, error } = await query.order('log_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(timeLog: TimeLogInput) {
    const { data, error } = await supabase
      .from('task_time_logs')
      .insert(timeLog)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, timeLog: Partial<TimeLog>) {
    const { data, error } = await supabase
      .from('task_time_logs')
      .update(timeLog)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('task_time_logs').delete().eq('id', id);
    if (error) throw error;
  },

  async approve(id: string, approvedBy: string) {
    const { data, error } = await supabase
      .from('task_time_logs')
      .update({ is_approved: true, approved_by: approvedBy, approved_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ============================================
// COMMENTS
// ============================================

export const commentService = {
  async getByTask(taskId: string) {
    const { data, error } = await supabase
      .from('project_comments')
      .select('*, user:app_users(id, full_name, avatar_url)')
      .eq('task_id', taskId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async create(comment: CommentInput) {
    const { data, error } = await supabase
      .from('project_comments')
      .insert(comment)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, content: string) {
    const { data, error } = await supabase
      .from('project_comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('project_comments')
      .update({ is_deleted: true })
      .eq('id', id);
    if (error) throw error;
  },
};

// ============================================
// ATTACHMENTS
// ============================================

export const attachmentService = {
  async getByTask(taskId: string) {
    const { data, error } = await supabase
      .from('project_attachments')
      .select('*, uploaded_by_user:app_users(id, full_name)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async upload(taskId: string, file: File, userId: string) {
    const filePath = `tasks/${taskId}/${Date.now()}_${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;

    const { data, error } = await supabase
      .from('project_attachments')
      .insert({
        task_id: taskId,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: userId,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { data, error: fetchError } = await supabase
      .from('project_attachments')
      .select('file_path')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    await supabase.storage.from('attachments').remove([data.file_path]);
    
    const { error } = await supabase.from('project_attachments').delete().eq('id', id);
    if (error) throw error;
  },

  getPublicUrl(filePath: string) {
    const { data } = supabase.storage.from('attachments').getPublicUrl(filePath);
    return data.publicUrl;
  },
};

// ============================================
// CUSTOM FIELDS
// ============================================

export const customFieldService = {
  async getByProject(projectId: string) {
    const { data, error } = await supabase
      .from('custom_fields')
      .select('*')
      .eq('project_id', projectId)
      .order('display_order');
    if (error) throw error;
    return data;
  },

  async create(field: Partial<CustomField>) {
    const { data, error } = await supabase
      .from('custom_fields')
      .insert(field)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, field: Partial<CustomField>) {
    const { data, error } = await supabase
      .from('custom_fields')
      .update(field)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('custom_fields').delete().eq('id', id);
    if (error) throw error;
  },

  async getTaskValues(taskId: string) {
    const { data, error } = await supabase
      .from('task_custom_fields')
      .select('*, custom_field:custom_fields(*)')
      .eq('task_id', taskId);
    if (error) throw error;
    return data;
  },

  async setTaskValue(taskId: string, fieldId: string, value: string) {
    const { data, error } = await supabase
      .from('task_custom_fields')
      .upsert({ task_id: taskId, field_id: fieldId, field_value: value })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ============================================
// DASHBOARD
// ============================================

export const dashboardService = {
  async getProjectStats(projectId: string) {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('status, priority, due_date, completed_at')
      .eq('project_id', projectId)
      .eq('is_deleted', false);
    
    if (error) throw error;

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'DONE').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'DONE').length;

    const byStatus = Object.entries(
      tasks.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([status, count]) => ({ status, count }));

    const byPriority = Object.entries(
      tasks.reduce((acc, t) => {
        acc[t.priority] = (acc[t.priority] || 0) + 1;
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
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('status, story_points')
      .eq('sprint_id', sprintId)
      .eq('is_deleted', false);
    
    if (error) throw error;

    const totalPoints = tasks.reduce((sum, t) => sum + (t.story_points || 0), 0);
    const completedPoints = tasks
      .filter(t => t.status === 'DONE')
      .reduce((sum, t) => sum + (t.story_points || 0), 0);

    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'DONE').length,
      totalPoints,
      completedPoints,
      remainingPoints: totalPoints - completedPoints,
    };
  },
};
