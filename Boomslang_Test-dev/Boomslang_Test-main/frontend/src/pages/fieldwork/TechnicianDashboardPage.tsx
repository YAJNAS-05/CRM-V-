import React, { useEffect, useState } from 'react';
import { FieldJobApi } from '../../api/fieldJobApi';
import { FieldJob } from '../../types/erp';

/**
 * Technician Dashboard Page
 * Personal dashboard for field technicians showing assigned jobs
 */
const TechnicianDashboardPage: React.FC = () => {
  const [jobs, setJobs] = useState<FieldJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    today: 0,
    inProgress: 0,
    completed: 0,
    pending: 0,
  });

  useEffect(() => {
    loadTechnicianJobs();
  }, []);

  const loadTechnicianJobs = async () => {
    try {
      setLoading(true);
      const response = await FieldJobApi.getAllFieldJobs();
      const jobsData = (response || []) as FieldJob[];
      
      // Filter today's jobs and calculate stats
      const today = new Date().toDateString();
      const todayJobs = (jobsData || []).filter((job: FieldJob) => 
        job.scheduledDate && new Date(job.scheduledDate).toDateString() === today
      );
      
      setJobs(jobsData);
      
      setStats({
        today: todayJobs.length,
        inProgress: (jobsData || []).filter((j: FieldJob) => j.jobStatus === 'IN_PROGRESS').length,
        completed: (jobsData || []).filter((j: FieldJob) => j.jobStatus === 'COMPLETED').length,
        pending: (jobsData || []).filter((j: FieldJob) => j.jobStatus === 'SCHEDULED').length,
      });
    } catch (error) {
      console.error('Failed to load technician jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Technician Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 border-l-4 border-blue-600 shadow-md rounded-lg p-6">
          <div className="text-3xl font-bold text-blue-600">{stats.today}</div>
          <div className="text-gray-600 text-sm">Jobs Today</div>
        </div>

        <div className="bg-orange-50 border-l-4 border-orange-600 shadow-md rounded-lg p-6">
          <div className="text-3xl font-bold text-orange-600">{stats.inProgress}</div>
          <div className="text-gray-600 text-sm">In Progress</div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-600 shadow-md rounded-lg p-6">
          <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-gray-600 text-sm">Pending</div>
        </div>

        <div className="bg-green-50 border-l-4 border-green-600 shadow-md rounded-lg p-6">
          <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-gray-600 text-sm">Completed</div>
        </div>
      </div>

      {/* Active Jobs */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Jobs</h2>
        
        <div className="space-y-4">
          {jobs
            .filter(job => job.status === 'IN_PROGRESS' || job.status === 'SCHEDULED')
            .slice(0, 5)
            .map(job => (
              <div 
                key={job.fieldJobId} 
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{job.fieldJobId}</h3>
                    <p className="text-sm text-gray-600 mt-1">{job.jobDescription}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      Equipment: {job.equipmentSku}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {job.status}
                    </span>
                    <div className="text-sm text-gray-600 mt-2">
                      Due: {job.dueDate?.toString().split('T')[0]}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {jobs.filter(j => j.status === 'IN_PROGRESS' || j.status === 'SCHEDULED').length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No active jobs assigned.
          </div>
        )}
      </div>

      {/* Recent Completions */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Completions</h2>
        
        <div className="space-y-2">
          {jobs
            .filter(job => job.status === 'COMPLETED')
            .slice(0, 5)
            .map(job => (
              <div key={job.fieldJobId} className="flex justify-between items-center p-3 border-b">
                <span className="text-gray-900">{job.fieldJobId}</span>
                <span className="text-sm text-gray-500">{job.lastModified?.toString().split('T')[0]}</span>
              </div>
            ))}
        </div>

        {jobs.filter(j => j.status === 'COMPLETED').length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No completed jobs yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianDashboardPage;
