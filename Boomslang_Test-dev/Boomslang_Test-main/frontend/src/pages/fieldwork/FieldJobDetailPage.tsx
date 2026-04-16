import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FieldJobApi } from '../../api/fieldJobApi';
import { FieldJobDto, FieldJobStatus } from '../../types/fieldwork';

/**
 * FieldJob Detail Page
 * Displays complete details of a specific field job
 */
const FieldJobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<FieldJobDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const response = await FieldJobApi.getFieldJobById(jobId!);
      setJob(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load field job details');
      console.error('Error loading job:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: FieldJobStatus) => {
    if (job) {
      const targetJobId = job.fieldJobId ?? (jobId ? parseInt(jobId, 10) : undefined);
      if (!targetJobId) {
        console.error('Cannot update status: field job id is missing');
        return;
      }

      try {
        await FieldJobApi.updateFieldJob(targetJobId, { ...job, jobStatus: newStatus });
        setJob({ ...job, jobStatus: newStatus });
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    }
  };

  if (loading) {
    return <div className="p-8">Loading field job...</div>;
  }

  if (error || !job) {
    return (
      <div className="p-8">
        <div className="text-red-600">{error || 'Field job not found'}</div>
        <button 
          onClick={() => navigate('/field-jobs')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Back to Field Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{job.jobNumber || `Field Job ${job.fieldJobId ?? ''}`}</h1>
        <button
          onClick={() => navigate('/field-jobs')}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          ← Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Job Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Description</label>
              <p className="text-gray-900">{job.internalNotes || job.clientBriefNotes || '-'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <select 
                  value={job.jobStatus}
                  onChange={(e) => handleStatusChange(e.target.value as FieldJobStatus)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Type</label>
                <p className="text-gray-900 mt-2">{job.jobType || '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Due Date</label>
                <p className="text-gray-900">{job.scheduledEndDate?.toString().split('T')[0] || '-'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Scheduled Date</label>
                <p className="text-gray-900">{job.scheduledStartDate?.toString().split('T')[0] || '-'}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Assigned Technician</label>
              <p className="text-gray-900">{job.primaryEngineerName || (job.primaryEngineerId ? `Engineer #${job.primaryEngineerId}` : 'Unassigned')}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Equipment SKU</label>
              <p className="text-gray-900">{job.linkedEquipmentSku || '-'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Priority</label>
              <p className="text-gray-900">{job.priority || '-'}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Additional Info</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Created</label>
              <p className="text-gray-900">{job.createdAt?.toString().split('T')[0] || '-'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Last Modified</label>
              <p className="text-gray-900">{job.updatedAt?.toString().split('T')[0] || '-'}</p>
            </div>

            <div className="pt-4 border-t">
              <a 
                href={`/field-jobs/${job.fieldJobId || jobId}/edit`}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block text-center"
              >
                Edit Job
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldJobDetailPage;
