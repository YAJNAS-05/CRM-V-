import React, { useEffect, useState } from 'react';
import { WarrantyApi } from '../../api/warrantyApi';
import { Warranty } from '../../types/erp';

/**
 * Warranty Management Page
 * Displays and manages all warranty records
 */
const WarrantyManagementPage: React.FC = () => {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED'>('ALL');

  useEffect(() => {
    loadWarranties();
  }, [filter]);

  const loadWarranties = async () => {
    try {
      setLoading(true);
      const response = await WarrantyApi.getAllWarranties();
      let filtered = response;
      
      const today = new Date();
      if (filter === 'ACTIVE') {
        filtered = filtered.filter((w: Warranty) => new Date(w.expiryDate || w.endDate) > today);
      } else if (filter === 'EXPIRED') {
        filtered = filtered.filter((w: Warranty) => new Date(w.expiryDate || w.endDate) <= today);
      }
      
      setWarranties(filtered);
    } catch (error) {
      console.error('Failed to load warranties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading warranties...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Warranty Management</h1>
        <a 
          href="/warranties/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Warranty
        </a>
      </div>

      <div className="mb-6">
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="ALL">All Warranties</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Warranty ID</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Equipment SKU</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Serial Number</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Start Date</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Expiry Date</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Type</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {warranties.map((warranty: Warranty) => {
              const isExpired = warranty.expiryDate ? new Date(warranty.expiryDate) <= new Date() : false;
              return (
                <tr key={warranty.warrantyId || warranty.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3 text-blue-600 font-medium">{warranty.warrantyId || warranty.id}</td>
                  <td className="px-6 py-3">{warranty.equipmentSku}</td>
                  <td className="px-6 py-3">{warranty.serialNumber}</td>
                  <td className="px-6 py-3">{warranty.startDate?.toString().split('T')[0]}</td>
                  <td className="px-6 py-3">{warranty.expiryDate?.toString().split('T')[0] || warranty.endDate?.toString().split('T')[0]}</td>
                  <td className="px-6 py-3">{warranty.warrantyType || warranty.type}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {isExpired ? 'Expired' : 'Active'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {warranties.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No warranties found.
        </div>
      )}
    </div>
  );
};

export default WarrantyManagementPage;
