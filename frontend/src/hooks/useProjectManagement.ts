import { useState, useEffect, useCallback } from 'react';
import * as pmService from '../services/projectManagement';
import type {
  Project,
  Task,
  Sprint,
  Epic,
  Milestone,
  TaskFilter,
  CreateTaskInput,
  UpdateTaskInput,
  CreateProjectInput,
  CreateSprintInput,
  CreateEpicInput,
  CreateMilestoneInput,
} from '../types/projectManagement';

// ============================================
// PROJECTS HOOK
// ============================================

export const useProjects = (filters?: { workspaceId?: string; portfolioId?: string; status?: string }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pmService.projectService.getAll(filters);
      setProjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
    } finally {
      setLoading(false);
    }
  }, [filters?.workspaceId, filters?.portfolioId, filters?.status]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, error, refetch: fetchProjects };
};

export const useProject = (id: string | null) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await pmService.projectService.getById(id);
        setProject(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch project'));
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const create = async (project: CreateProjectInput) => {
    const data = await pmService.projectService.create(project);
    setProject(data);
    return data;
  };

  const update = async (id: string, project: Partial<Project>) => {
    const data = await pmService.projectService.update(id, project);
    setProject(data);
    return data;
  };

  const remove = async () => {
    if (!id) return;
    await pmService.projectService.delete(id);
    setProject(null);
  };

  return { project, loading, error, create, update, remove };
};

// ============================================
// TASKS HOOK
// ============================================

export const useTasks = (projectId: string | null, filters?: TaskFilter) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await pmService.taskService.getAll(projectId, filters);
      setTasks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
    } finally {
      setLoading(false);
    }
  }, [projectId, JSON.stringify(filters)]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const create = async (task: CreateTaskInput) => {
    const data = await pmService.taskService.create(task);
    setTasks(prev => [data, ...prev]);
    return data;
  };

  const update = async (id: string, task: UpdateTaskInput) => {
    const data = await pmService.taskService.update(id, task);
    setTasks(prev => prev.map(t => t.id === id ? data : t));
    return data;
  };

  const remove = async (id: string) => {
    await pmService.taskService.delete(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const moveTask = async (taskId: string, newStatus: string, newOrder: number) => {
    const data = await pmService.taskService.moveTask(taskId, newStatus, newOrder);
    setTasks(prev => prev.map(t => t.id === taskId ? data : t));
    return data;
  };

  return { tasks, loading, error, refetch: fetchTasks, create, update, remove, moveTask };
};

export const useTask = (id: string | null) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchTask = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await pmService.taskService.getById(id);
        setTask(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch task'));
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const update = async (task: UpdateTaskInput) => {
    if (!id) return null;
    const data = await pmService.taskService.update(id, task);
    setTask(data);
    return data;
  };

  return { task, loading, error, update };
};

// ============================================
// BOARD VIEW HOOK
// ============================================

export const useTaskBoard = (projectId: string | null) => {
  const [columns, setColumns] = useState<{ id: string; name: string; status: string; order: number; tasks: Task[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBoard = useCallback(async () => {
    if (!projectId) {
      setColumns([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await pmService.taskService.getBoardColumns(projectId);
      setColumns(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch board'));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const moveTask = async (taskId: string, newStatus: string, newOrder: number) => {
    await pmService.taskService.moveTask(taskId, newStatus, newOrder);
    await fetchBoard();
  };

  return { columns, loading, error, refetch: fetchBoard, moveTask };
};

// ============================================
// SPRINTS HOOK
// ============================================

export const useSprints = (projectId: string | null) => {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSprints = useCallback(async () => {
    if (!projectId) {
      setSprints([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await pmService.sprintService.getByProject(projectId);
      setSprints(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch sprints'));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchSprints();
  }, [fetchSprints]);

  const create = async (sprint: CreateSprintInput) => {
    const data = await pmService.sprintService.create(sprint);
    setSprints(prev => [data, ...prev]);
    return data;
  };

  const update = async (id: string, sprint: Partial<Sprint>) => {
    const data = await pmService.sprintService.update(id, sprint);
    setSprints(prev => prev.map(s => s.id === id ? data : s));
    return data;
  };

  const startSprint = async (id: string) => {
    const data = await pmService.sprintService.startSprint(id);
    setSprints(prev => prev.map(s => s.id === id ? data : s));
    return data;
  };

  const completeSprint = async (id: string) => {
    const data = await pmService.sprintService.completeSprint(id);
    setSprints(prev => prev.map(s => s.id === id ? data : s));
    return data;
  };

  return { sprints, loading, error, refetch: fetchSprints, create, update, startSprint, completeSprint };
};

export const useActiveSprint = (projectId: string | null) => {
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const fetchActiveSprint = async () => {
      try {
        const data = await pmService.sprintService.getActive(projectId);
        setSprint(data);
      } catch {
        setSprint(null);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveSprint();
  }, [projectId]);

  return { sprint, loading };
};

// ============================================
// EPICS HOOK
// ============================================

export const useEpics = (projectId: string | null) => {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEpics = useCallback(async () => {
    if (!projectId) {
      setEpics([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await pmService.epicService.getByProject(projectId);
      setEpics(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch epics'));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchEpics();
  }, [fetchEpics]);

  const create = async (epic: CreateEpicInput) => {
    const data = await pmService.epicService.create(epic);
    setEpics(prev => [data, ...prev]);
    return data;
  };

  const update = async (id: string, epic: Partial<Epic>) => {
    const data = await pmService.epicService.update(id, epic);
    setEpics(prev => prev.map(e => e.id === id ? data : e));
    return data;
  };

  const remove = async (id: string) => {
    await pmService.epicService.delete(id);
    setEpics(prev => prev.filter(e => e.id !== id));
  };

  return { epics, loading, error, refetch: fetchEpics, create, update, remove };
};

// ============================================
// MILESTONES HOOK
// ============================================

export const useMilestones = (projectId: string | null) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMilestones = useCallback(async () => {
    if (!projectId) {
      setMilestones([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await pmService.milestoneService.getByProject(projectId);
      setMilestones(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch milestones'));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const create = async (milestone: CreateMilestoneInput) => {
    const data = await pmService.milestoneService.create(milestone);
    setMilestones(prev => [...prev, data].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()));
    return data;
  };

  const update = async (id: string, milestone: Partial<Milestone>) => {
    const data = await pmService.milestoneService.update(id, milestone);
    setMilestones(prev => prev.map(m => m.id === id ? data : m));
    return data;
  };

  const remove = async (id: string) => {
    await pmService.milestoneService.delete(id);
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  return { milestones, loading, error, refetch: fetchMilestones, create, update, remove };
};

// ============================================
// PROJECT MEMBERS HOOK
// ============================================

export const useProjectMembers = (projectId: string | null) => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const fetchMembers = async () => {
      try {
        const data = await pmService.projectService.getMembers(projectId);
        setMembers(data || []);
      } catch {
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [projectId]);

  const addMember = async (userId: string, role: string = 'MEMBER') => {
    if (!projectId) return;
    const data = await pmService.projectService.addMember(projectId, userId, role);
    setMembers(prev => [...prev, data]);
    return data;
  };

  const removeMember = async (userId: string) => {
    if (!projectId) return;
    await pmService.projectService.removeMember(projectId, userId);
    setMembers(prev => prev.filter(m => m.user_id !== userId));
  };

  const updateRole = async (userId: string, role: string) => {
    if (!projectId) return;
    const data = await pmService.projectService.updateMemberRole(projectId, userId, role);
    setMembers(prev => prev.map(m => m.user_id === userId ? data : m));
    return data;
  };

  return { members, loading, addMember, removeMember, updateRole };
};

// ============================================
// COMMENTS HOOK
// ============================================

export const useComments = (taskId: string | null) => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId) {
      setComments([]);
      setLoading(false);
      return;
    }

    const fetchComments = async () => {
      try {
        const data = await pmService.commentService.getByTask(taskId);
        setComments(data || []);
      } catch {
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [taskId]);

  const addComment = async (content: string, parentCommentId?: string) => {
    if (!taskId) return;
    const data = await pmService.commentService.create({ task_id: taskId, content, parent_comment_id: parentCommentId });
    setComments(prev => [...prev, data]);
    return data;
  };

  const editComment = async (id: string, content: string) => {
    const data = await pmService.commentService.update(id, content);
    setComments(prev => prev.map(c => c.id === id ? data : c));
    return data;
  };

  const deleteComment = async (id: string) => {
    await pmService.commentService.delete(id);
    setComments(prev => prev.filter(c => c.id !== id));
  };

  return { comments, loading, addComment, editComment, deleteComment };
};

// ============================================
// TIME LOGS HOOK
// ============================================

export const useTimeLogs = (taskId: string | null) => {
  const [timeLogs, setTimeLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId) {
      setTimeLogs([]);
      setLoading(false);
      return;
    }

    const fetchTimeLogs = async () => {
      try {
        const data = await pmService.timeLogService.getByTask(taskId);
        setTimeLogs(data || []);
      } catch {
        setTimeLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeLogs();
  }, [taskId]);

  const addTimeLog = async (log: { log_date: string; hours: number; description?: string; is_billable?: boolean }) => {
    if (!taskId) return;
    const data = await pmService.timeLogService.create({ task_id: taskId, ...log });
    setTimeLogs(prev => [data, ...prev]);
    return data;
  };

  const removeTimeLog = async (id: string) => {
    await pmService.timeLogService.delete(id);
    setTimeLogs(prev => prev.filter(l => l.id !== id));
  };

  return { timeLogs, loading, addTimeLog, removeTimeLog };
};

// ============================================
// DASHBOARD HOOK
// ============================================

export const useProjectDashboard = (projectId: string | null) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setStats(null);
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const data = await pmService.dashboardService.getProjectStats(projectId);
        setStats(data);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [projectId]);

  return { stats, loading };
};
