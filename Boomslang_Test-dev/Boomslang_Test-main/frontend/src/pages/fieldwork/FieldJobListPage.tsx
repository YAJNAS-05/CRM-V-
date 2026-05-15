import React, { useEffect, useState } from 'react';
import { FieldJobApi } from '../../api/fieldJobApi';
import { FieldJob } from '../../types/erp';

/**
 * FieldJob List Page
 * Displays all field jobs with filtering and sorting options
 */
const FieldJobListPage: React.FC = () => {
  const [jobs, setJobs] = useState<FieldJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadJobs();
  }, [filter]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await FieldJobApi.getAllFieldJobs();
      let filtered = (response || []) as any[];
      
      if (filter !== 'ALL') {
        filtered = filtered.filter((job: any) => job.status === filter || job.jobStatus === filter);
      }
      
      if (searchTerm) {
        filtered = filtered.filter((job: any) => 
          (job.fieldJobId?.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
          (job.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (job.jobDescription?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      setJobs(filtered);
    } catch (error) {
      console.error('Failed to load field jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this field job?')) {
      try {
        await FieldJobApi.deleteFieldJob(jobId);
        setJobs(jobs.filter(j => j.fieldJobId !== jobId));
      } catch (error) {
        console.error('Failed to delete field job:', error);
      }
    }
  };

  if (loading) {
    return <div className="p-8">Loading field jobs...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Field Jobs</h1>
        <a 
          href="/field-jobs/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Field Job
        </a>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        />
        
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="ALL">All Status</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Job ID</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Description</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Due Date</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Technician</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job.fieldJobId} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3 text-blue-600 font-medium">{job.fieldJobId}</td>
                <td className="px-6 py-3">{job.jobDescription}</td>
                <td className="px-6 py-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-3">{job.dueDate?.toString().split('T')[0]}</td>
                <td className="px-6 py-3">{job.assignedTechnicianId || '-'}</td>
                <td className="px-6 py-3">
                  <a 
                    href={`/field-jobs/${job.fieldJobId}`}
                    className="text-blue-600 hover:text-blue-800 mr-4"
                  >
                    View
                  </a>
                  <a 
                    href={`/field-jobs/${job.fieldJobId}/edit`}
                    className="text-green-600 hover:text-green-800 mr-4"
                  >
                    Edit
                  </a>
                  <button
                    onClick={() => handleDelete(String(job.fieldJobId || job.id))}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No field jobs found.
        </div>
      )}
    </div>
  );
};

export default FieldJobListPage;
