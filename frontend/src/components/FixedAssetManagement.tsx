import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

interface FixedAsset {
  id: number;
  assetCode: string;
  assetName: string;
  category: string;
  acquisitionCost: number;
  accumulatedDepreciation: number;
  bookValue: number;
  status: 'ACTIVE' | 'DISPOSED' | 'RETIRED';
}

interface FixedAssetRegister {
  totalAssets: number;
  totalGrossCost: number;
  totalAccumulatedDepreciation: number;
  totalNetBookValue: number;
  assets: FixedAsset[];
}

const FixedAssetManagement: React.FC = () => {
  const [assetCode, setAssetCode] = useState('');
  const [assetName, setAssetName] = useState('');
  const [cost, setCost] = useState('');
  const [method, setMethod] = useState('STRAIGHT_LINE');
  const [lifeYears, setLifeYears] = useState('');

  const { data: register, isLoading } = useQuery({
    queryKey: ['fixed-assets', 'register'],
    queryFn: async () => {
      const response = await fetch('/api/finance/fixed-assets/register');
      if (!response.ok) throw new Error('Failed to fetch register');
      return response.json() as Promise<FixedAssetRegister>;
    },
  });

  const createAssetMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/finance/fixed-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetCode,
          assetName,
          acquisitionCost: parseFloat(cost),
          depreciationMethod: method,
          usefulLifeYears: parseInt(lifeYears),
          salvageValue: 0,
        }),
      });
      if (!response.ok) throw new Error('Failed to create asset');
      return response.json();
    },
  });

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    createAssetMutation.mutate();
    setAssetCode('');
    setAssetName('');
    setCost('');
    setLifeYears('');
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-50 border-green-200';
      case 'DISPOSED':
        return 'bg-red-50 border-red-200';
      case 'RETIRED':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-white';
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading assets...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Fixed Assets Management</h2>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <p className="text-sm text-gray-600">Total Assets</p>
          <p className="text-2xl font-bold text-blue-600">{register?.totalAssets}</p>
        </div>
        <div className="bg-green-50 p-4 rounded border border-green-200">
          <p className="text-sm text-gray-600">Gross Cost</p>
          <p className="text-lg font-bold text-green-600">
            {formatCurrency(register?.totalGrossCost || 0)}
          </p>
        </div>
        <div className="bg-orange-50 p-4 rounded border border-orange-200">
          <p className="text-sm text-gray-600">Accumulated Depreciation</p>
          <p className="text-lg font-bold text-orange-600">
            {formatCurrency(register?.totalAccumulatedDepreciation || 0)}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded border border-purple-200">
          <p className="text-sm text-gray-600">Net Book Value</p>
          <p className="text-lg font-bold text-purple-600">
            {formatCurrency(register?.totalNetBookValue || 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Asset Creation Form */}
        <div className="border rounded p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Add New Asset</h3>
          
          <form onSubmit={handleCreateAsset} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Asset Code</label>
              <input
                type="text"
                value={assetCode}
                onChange={(e) => setAssetCode(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Asset Name</label>
              <input
                type="text"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cost</label>
              <input
                type="number"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Depreciation Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="STRAIGHT_LINE">Straight Line</option>
                <option value="DECLINING_BALANCE">Declining Balance</option>
                <option value="SUM_OF_YEARS_DIGITS">Sum of Years Digits</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Useful Life (Years)</label>
              <input
                type="number"
                value={lifeYears}
                onChange={(e) => setLifeYears(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <button
              type="submit"
              disabled={createAssetMutation.isPending}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              {createAssetMutation.isPending ? 'Creating...' : 'Add Asset'}
            </button>
          </form>
        </div>

        {/* Asset List */}
        <div className="border rounded p-6">
          <h3 className="text-lg font-semibold mb-4">Asset Register</h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {register?.assets.map((asset) => (
              <div
                key={asset.id}
                className={`p-3 rounded border ${getStatusColor(asset.status)}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{asset.assetCode}</p>
                    <p className="text-sm text-gray-600">{asset.assetName}</p>
                    <p className="text-xs text-gray-500 mt-1">{asset.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Cost: {formatCurrency(asset.acquisitionCost)}
                    </p>
                    <p className="text-sm text-orange-600">
                      Depr: {formatCurrency(asset.accumulatedDepreciation)}
                    </p>
                    <p className="text-sm font-semibold text-purple-600">
                      NBV: {formatCurrency(asset.bookValue)}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    asset.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    asset.status === 'DISPOSED' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {asset.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
        <p className="text-sm">
          <strong>Fixed Assets Module:</strong> Track and manage all company fixed assets with automated 
          depreciation calculation using three methods (straight-line, declining balance, sum of years digits). 
          Monthly depreciation is automatically posted to the General Ledger.
        </p>
      </div>
    </div>
  );
};

export default FixedAssetManagement;
