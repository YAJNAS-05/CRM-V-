import React, { useState } from 'react';
import { useTaskBoard } from '../../hooks/useProjectManagement';
import type { Task, Project } from '../../types/projectManagement';

interface ProjectBoardProps {
  project: Project;
  onTaskClick?: (task: Task) => void;
  onCreateTask?: (status: string) => void;
}

const priorityColors: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700 border-red-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  LOW: 'bg-green-100 text-green-700 border-green-200',
  NONE: 'bg-gray-100 text-gray-700 border-gray-200',
};

const taskTypeIcons: Record<string, string> = {
  TASK: '☐',
  BUG: '🐛',
  STORY: '📖',
  EPIC: '⚡',
  SUBTASK: '↳',
};

export const ProjectBoard: React.FC<ProjectBoardProps> = ({ project, onTaskClick, onCreateTask }) => {
  const { columns, loading, error, moveTask, refetch } = useTaskBoard(project.id);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedTask && draggedTask.status !== columnId) {
      const targetColumn = columns.find(c => c.status === columnId);
      const newOrder = targetColumn ? targetColumn.tasks.length : 0;
      await moveTask(draggedTask.id, columnId, newOrder);
    }
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading board: {error.message}</p>
        <button onClick={refetch} className="mt-2 text-sm text-red-600 hover:underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-x-auto">
      <div className="flex gap-4 min-h-full pb-4" style={{ minWidth: `${columns.length * 300}px` }}>
        {columns.map((column) => (
          <div
            key={column.id}
            className={`flex-shrink-0 w-[300px] bg-gray-100 rounded-lg flex flex-col ${
              dragOverColumn === column.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">{column.name}</h3>
                <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                  {column.tasks.length}
                </span>
              </div>
            </div>

            {/* Tasks */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {column.tasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onTaskClick?.(task)}
                  className={`bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-all ${
                    draggedTask?.id === task.id ? 'opacity-50' : ''
                  }`}
                >
                  {/* Task Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{taskTypeIcons[task.task_type] || '☐'}</span>
                      <span className="text-xs text-gray-500">{task.task_number}</span>
                    </div>
                    {task.story_points && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                        {task.story_points} pts
                      </span>
                    )}
                  </div>

                  {/* Task Title */}
                  <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                    {task.title}
                  </h4>

                  {/* Task Meta */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded border ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {task.due_date && (
                        <span className={`text-xs ${
                          new Date(task.due_date) < new Date() ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      {task.assignee && (
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                          {task.assignee.full_name?.[0] || '?'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {task.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                      {task.tags.length > 2 && (
                        <span className="text-xs text-gray-500">+{task.tags.length - 2}</span>
                      )}
                    </div>
                  )}

                  {/* Subtasks indicator */}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      {task.subtasks.filter((s: any) => s.status === 'DONE').length}/{task.subtasks.length} subtasks
                    </div>
                  )}
                </div>
              ))}

              {/* Add Task Button */}
              {onCreateTask && (
                <button
                  onClick={() => onCreateTask(column.id)}
                  className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <span>+</span>
                  <span className="text-sm">Add Task</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectBoard;
