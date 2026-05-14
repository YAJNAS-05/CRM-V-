import React, { useState, useEffect } from 'react';
import { useTasks, useEpics, useSprints, useProjectMembers } from '../../hooks/useProjectManagement';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskPriority, TaskType } from '../../types/projectManagement';

interface TaskModalProps {
  projectId: string;
  task?: Task | null;
  defaultStatus?: string;
  onClose: () => void;
  onSave: (task: CreateTaskInput | UpdateTaskInput) => Promise<void>;
}

const taskTypes: { value: TaskType; label: string; icon: string }[] = [
  { value: 'TASK', label: 'Task', icon: '☐' },
  { value: 'BUG', label: 'Bug', icon: '🐛' },
  { value: 'STORY', label: 'Story', icon: '📖' },
  { value: 'EPIC', label: 'Epic', icon: '⚡' },
];

const priorities: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-500' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-500' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'LOW', label: 'Low', color: 'bg-green-500' },
  { value: 'NONE', label: 'None', color: 'bg-gray-500' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  projectId,
  task,
  defaultStatus = 'TODO',
  onClose,
  onSave,
}) => {
  const { epics } = useEpics(projectId);
  const { sprints } = useSprints(projectId);
  const { members } = useProjectMembers(projectId);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTaskInput>({
    project_id: projectId,
    title: '',
    description: '',
    task_type: 'TASK',
    priority: 'MEDIUM',
    status: defaultStatus,
    assignee_id: undefined,
    epic_id: undefined,
    sprint_id: undefined,
    start_date: undefined,
    due_date: undefined,
    time_estimate: undefined,
    story_points: undefined,
    tags: [],
    is_private: false,
  });

  useEffect(() => {
    if (task) {
      setFormData({
        project_id: projectId,
        title: task.title,
        description: task.description || '',
        task_type: task.task_type,
        priority: task.priority,
        status: task.status,
        assignee_id: task.assignee_id || undefined,
        epic_id: task.epic_id || undefined,
        sprint_id: task.sprint_id || undefined,
        start_date: task.start_date || undefined,
        due_date: task.due_date || undefined,
        time_estimate: task.time_estimate || undefined,
        story_points: task.story_points || undefined,
        tags: task.tags || [],
        is_private: task.is_private,
      });
    }
  }, [task, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateTaskInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? 'Edit Task' : 'Create Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a description..."
            />
          </div>

          {/* Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.task_type}
                onChange={(e) => handleChange('task_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {taskTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {priorities.map(p => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee & Sprint */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignee
              </label>
              <select
                value={formData.assignee_id || ''}
                onChange={(e) => handleChange('assignee_id', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.user?.full_name || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sprint
              </label>
              <select
                value={formData.sprint_id || ''}
                onChange={(e) => handleChange('sprint_id', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Sprint</option>
                {sprints.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Epic & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Epic
              </label>
              <select
                value={formData.epic_id || ''}
                onChange={(e) => handleChange('epic_id', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Epic</option>
                {epics.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date || ''}
                onChange={(e) => handleChange('start_date', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date || ''}
                onChange={(e) => handleChange('due_date', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Story Points & Estimate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Story Points
              </label>
              <input
                type="number"
                min="0"
                value={formData.story_points || ''}
                onChange={(e) => handleChange('story_points', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Estimate (hours)
              </label>
              <input
                type="number"
                min="0"
                value={formData.time_estimate || ''}
                onChange={(e) => handleChange('time_estimate', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Private */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_private"
              checked={formData.is_private}
              onChange={(e) => handleChange('is_private', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_private" className="text-sm text-gray-700">
              Make this task private (only visible to assignee and owner)
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
