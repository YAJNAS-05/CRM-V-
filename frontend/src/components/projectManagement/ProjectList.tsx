import React, { useState } from 'react';
import { useProjects } from '../../hooks/useProjectManagement';
import type { Project } from '../../types/projectManagement';

interface ProjectListProps {
  onSelectProject?: (project: Project) => void;
  onCreateProject?: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ onSelectProject, onCreateProject }) => {
  const { projects, loading, error, refetch } = useProjects({ status: 'ACTIVE' });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState('');

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase()) ||
    p.description?.toLowerCase().includes(filter.toLowerCase())
  );

  const getStatusColor = (status: string | null | undefined) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProjectIcon = (icon: string | null | undefined) => {
    if (!icon) return '📁';
    return icon;
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
        <p className="text-red-600">Error loading projects: {error.message}</p>
        <button onClick={refetch} className="mt-2 text-sm text-red-600 hover:underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search projects..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
            >
              ▦
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
            >
              ☰
            </button>
          </div>
          {onCreateProject && (
            <button
              onClick={onCreateProject}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + New Project
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid/List */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No projects found</p>
          {onCreateProject && (
            <button
              onClick={onCreateProject}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create your first project
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject?.(project)}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: project.color || '#e5e7eb' }}
                  >
                    {getProjectIcon(project.icon)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>
              {project.description && (
                <p className="mt-3 text-sm text-gray-600 line-clamp-2">{project.description}</p>
              )}
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>{project.project_type}</span>
                <span>{project.visibility}</span>
              </div>
              {project.tags && project.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {project.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Visibility</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr
                  key={project.id}
                  onClick={() => onSelectProject?.(project)}
                  className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-lg"
                        style={{ backgroundColor: project.color || '#e5e7eb' }}
                      >
                        {getProjectIcon(project.icon)}
                      </div>
                      <span className="font-medium text-gray-900">{project.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{project.project_type}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{project.visibility}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(project.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
