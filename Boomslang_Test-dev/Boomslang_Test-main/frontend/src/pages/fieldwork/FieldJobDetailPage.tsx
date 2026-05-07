import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FieldJobApi } from '../../api/fieldJobApi';
import { FieldJobDto, FieldJobStatus } from '../../types/fieldwork';
import { employeeApi } from '../../api/hrApi';
import { Employee } from '../../types/hr';
import { toast } from 'sonner';

type TimeLog = {
  id: string
  technicianName: string
  date: string
  hoursWorked: number
  description: string
}

type PhotoEntry = {
  id: string
  url: string
  name: string
  takenAt: string
  location?: string
}

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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [showTimeLogForm, setShowTimeLogForm] = useState(false);
  const [timeLogForm, setTimeLogForm] = useState({ technicianName: '', date: '', hoursWorked: '', description: '' });
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setPhotos(prev => [...prev, {
        id: String(Date.now()) + Math.random(),
        url,
        name: file.name,
        takenAt: new Date().toLocaleString(),
        location: currentLocation || undefined,
      }]);
    });
    if (e.target) e.target.value = '';
    toast.success(`${files.length} photo(s) added`);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        setCurrentLocation(loc);
        setGpsLoading(false);
        toast.success('Location captured');
      },
      () => { toast.error('Unable to get location'); setGpsLoading(false); }
    );
  };

  useEffect(() => {
    if (jobId) {
      loadJob();
    }
    loadEmployees();
  }, [jobId]);

  const loadEmployees = async () => {
    try {
      const resp = await employeeApi.getAll(0, 300);
      const data = resp.data?.data;
      setEmployees(data?.content || []);
    } catch {
      // non-critical — silently fail
    }
  };

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
      const targetJobId = job.fieldJobId ?? jobId;
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

  const handleEngineerChange = async (engineerId: string) => {
    if (!job) return;
    const targetJobId = job.fieldJobId ?? jobId;
    if (!targetJobId) return;
    const employee = employees.find(e => e.id === engineerId);
    try {
      const updated = {
        ...job,
        primaryEngineerId: engineerId || undefined,
        primaryEngineerName: employee ? `${employee.firstName} ${employee.lastName}` : undefined,
      };
      await FieldJobApi.updateFieldJob(targetJobId, updated);
      setJob(updated);
    } catch (error) {
      console.error('Failed to assign engineer:', error);
    }
  };

  const handleAddTimeLog = () => {
    if (!timeLogForm.technicianName.trim()) { toast.error('Technician name is required'); return; }
    if (!timeLogForm.date) { toast.error('Date is required'); return; }
    const hours = parseFloat(timeLogForm.hoursWorked);
    if (isNaN(hours) || hours <= 0) { toast.error('Valid hours worked required'); return; }
    const newLog: TimeLog = {
      id: String(Date.now()),
      technicianName: timeLogForm.technicianName,
      date: timeLogForm.date,
      hoursWorked: hours,
      description: timeLogForm.description,
    };
    setTimeLogs(prev => [...prev, newLog]);
    setTimeLogForm({ technicianName: '', date: '', hoursWorked: '', description: '' });
    setShowTimeLogForm(false);
    toast.success('Time logged');
  };

  if (loading) {
    return <div className="p-8">Loading field job...</div>;
  }

  if (error || !job) {
    return (
      <div className="p-8">
        <div className="text-red-600">{error || 'Field job not found'}</div>
        <button 
          onClick={() => navigate('/erp/field-jobs')}
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
          onClick={() => navigate('/erp/field-jobs')}
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
              <select
                value={job.primaryEngineerId?.toString() || ''}
                onChange={(e) => handleEngineerChange(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">-- Unassigned --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}{emp.jobTitle ? ` (${emp.jobTitle})` : ''}
                  </option>
                ))}
              </select>
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
        <div className="space-y-6">
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
                href={`/erp/field-jobs/${job.fieldJobId || jobId}`}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block text-center"
              >
                Edit Job
              </a>
            </div>
          </div>
        </div>

          {/* Time Tracking */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h2 className="text-xl font-semibold">Time Tracking</h2>
              <button
                onClick={() => setShowTimeLogForm(true)}
                className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                + Log Time
              </button>
            </div>
            {timeLogs.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No time logged yet.</p>
            ) : (
              <div className="space-y-2">
                {timeLogs.map(log => (
                  <div key={log.id} className="border border-gray-200 rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{log.technicianName}</span>
                      <span className="text-gray-500">{log.hoursWorked}h</span>
                    </div>
                    <div className="text-gray-500 text-xs mt-1">{log.date}</div>
                    {log.description && <div className="text-gray-600 mt-1">{log.description}</div>}
                  </div>
                ))}
                <div className="border-t pt-2 text-sm font-semibold text-gray-700">
                  Total: {timeLogs.reduce((sum, l) => sum + l.hoursWorked, 0).toFixed(1)} hours
                </div>
              </div>
            )}
          </div>

          {/* Photos & Location (FW-05, FW-06) */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Photos &amp; Location</h2>

            {/* GPS */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <button onClick={handleGetLocation} disabled={gpsLoading}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {gpsLoading ? 'Locating…' : 'Get Location'}
                </button>
                {currentLocation && (
                  <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full font-mono">{currentLocation}</span>
                )}
              </div>
              {currentLocation && (
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentLocation)}`}
                  target="_blank" rel="noreferrer"
                  className="mt-1 text-xs text-blue-500 hover:underline">
                  View on map ↗
                </a>
              )}
            </div>

            {/* Photo upload */}
            <div className="mb-3">
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleCapture} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Add Photo
              </button>
            </div>

            {photos.length === 0 ? (
              <p className="text-gray-400 text-xs text-center py-4">No photos attached yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {photos.map(p => (
                  <div key={p.id} className="relative group">
                    <img src={p.url} alt={p.name} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-b-lg opacity-0 group-hover:opacity-100 transition">
                      <p className="truncate">{p.name}</p>
                      {p.location && <p className="truncate font-mono">{p.location}</p>}
                    </div>
                    <button onClick={() => setPhotos(prev => prev.filter(x => x.id !== p.id))}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log Time Modal */}
      {showTimeLogForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Log Technician Time</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Technician *</label>
                <input type="text" value={timeLogForm.technicianName}
                  onChange={e => setTimeLogForm(p => ({ ...p, technicianName: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="e.g. John Smith" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Date *</label>
                  <input type="date" value={timeLogForm.date}
                    onChange={e => setTimeLogForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Hours Worked *</label>
                  <input type="number" step="0.5" min="0.5" value={timeLogForm.hoursWorked}
                    onChange={e => setTimeLogForm(p => ({ ...p, hoursWorked: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <textarea rows={2} value={timeLogForm.description}
                  onChange={e => setTimeLogForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowTimeLogForm(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleAddTimeLog}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                Log Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldJobDetailPage;
