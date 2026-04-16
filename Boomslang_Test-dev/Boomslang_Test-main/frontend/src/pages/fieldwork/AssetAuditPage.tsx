import React, { useEffect, useState } from 'react';
import { AssetAuditApi } from '../../api/assetAuditApi';
import { AssetAudit } from '../../types/erp';

/**
 * Asset Audit Page
 * Tracks and manages asset audits
 */
const AssetAuditPage: React.FC = () => {
  const [audits, setAudits] = useState<AssetAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  useEffect(() => {
    loadAudits();
  }, [selectedStatus]);

  const loadAudits = async () => {
    try {
      setLoading(true);
      const response = await AssetAuditApi.getAllAudits();
      let filtered = response.data;
      
      if (selectedStatus !== 'ALL') {
        filtered = filtered.filter(audit => audit.status === selectedStatus);
      }
      
      setAudits(filtered);
    } catch (error) {
      console.error('Failed to load audits:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading asset audits...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Asset Audits</h1>
        <a 
          href="/audits/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Audit
        </a>
      </div>

      <div className="mb-6">
        <select 
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="ALL">All Audits</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="text-3xl font-bold text-blue-600">{audits.length}</div>
          <div className="text-gray-600 text-sm">Total Audits</div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="text-3xl font-bold text-green-600">
            {audits.filter(a => a.status === 'COMPLETED').length}
          </div>
          <div className="text-gray-600 text-sm">Completed</div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="text-3xl font-bold text-orange-600">
            {audits.filter(a => a.status === 'SCHEDULED' || a.status === 'IN_PROGRESS').length}
          </div>
          <div className="text-gray-600 text-sm">Pending</div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Audit ID</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Equipment</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Start Date</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">End Date</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Findings</th>
            </tr>
          </thead>
          <tbody>
            {audits.map(audit => (
              <tr key={audit.id || `${audit.assetId}-${audit.auditDate}`} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3 text-blue-600 font-medium">{audit.id || '-'}</td>
                <td className="px-6 py-3">{audit.assetId}</td>
                <td className="px-6 py-3">{audit.auditDate?.toString().split('T')[0]}</td>
                <td className="px-6 py-3">{audit.completionDate?.toString().split('T')[0] || '-'}</td>
                <td className="px-6 py-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    audit.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    audit.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {audit.status}
                  </span>
                </td>
                <td className="px-6 py-3">{audit.findings || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {audits.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No audits found.
        </div>
      )}
    </div>
  );
};

export default AssetAuditPage;
