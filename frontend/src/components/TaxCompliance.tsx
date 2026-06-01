import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

interface TaxConfig {
  id: number;
  taxCode: string;
  taxName: string;
  jurisdiction: string;
  taxRate: number;
  taxType: string;
  status: string;
}

interface TaxCalculation {
  id: number;
  taxConfig: TaxConfig;
  taxableBase: number;
  taxAmount: number;
  payableAmount: number;
  status: string;
}

interface TaxSummary {
  periodStart: string;
  periodEnd: string;
  totalTaxableBase: number;
  totalTaxAmount: number;
  totalPayable: number;
  calculations: TaxCalculation[];
}

const TaxCompliance: React.FC = () => {
  const [taxCode, setTaxCode] = useState('');
  const [taxName, setTaxName] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [rate, setRate] = useState('');
  const [taxType, setTaxType] = useState('INDIRECT');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: summary } = useQuery({
    queryKey: ['tax-summary', startDate, endDate],
    queryFn: async () => {
      if (!startDate || !endDate) return null;
      const response = await fetch(
        `/api/finance/tax/summary?periodStart=${startDate}&periodEnd=${endDate}`
      );
      if (!response.ok) throw new Error('Failed to fetch tax summary');
      return response.json() as Promise<TaxSummary>;
    },
    enabled: !!startDate && !!endDate,
  });

  const createConfigMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/finance/tax/configuration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxCode,
          taxName,
          jurisdiction,
          taxRate: parseFloat(rate),
          taxType,
          applicableToAccountCode: taxType === 'INDIRECT' ? '2200' : '2300',
        }),
      });
      if (!response.ok) throw new Error('Failed to create tax config');
      return response.json();
    },
  });

  const handleCreateConfig = (e: React.FormEvent) => {
    e.preventDefault();
    createConfigMutation.mutate();
    setTaxCode('');
    setTaxName('');
    setJurisdiction('');
    setRate('');
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case 'CALCULATED':
        return 'bg-yellow-100 text-yellow-700';
      case 'FILED':
        return 'bg-blue-100 text-blue-700';
      case 'PAID':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Tax Compliance & Reporting</h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <p className="text-sm text-gray-600">Taxable Base</p>
          <p className="text-2xl font-bold text-blue-600">
            {summary ? formatCurrency(summary.totalTaxableBase) : '-'}
          </p>
        </div>
        <div className="bg-orange-50 p-4 rounded border border-orange-200">
          <p className="text-sm text-gray-600">Total Tax Amount</p>
          <p className="text-2xl font-bold text-orange-600">
            {summary ? formatCurrency(summary.totalTaxAmount) : '-'}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded border border-green-200">
          <p className="text-sm text-gray-600">Total Payable</p>
          <p className="text-2xl font-bold text-green-600">
            {summary ? formatCurrency(summary.totalPayable) : '-'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Tax Configuration */}
        <div className="border rounded p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Create Tax Configuration</h3>
          
          <form onSubmit={handleCreateConfig} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Tax Code</label>
              <input
                type="text"
                value={taxCode}
                onChange={(e) => setTaxCode(e.target.value)}
                placeholder="VAT, GST, etc."
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tax Name</label>
              <input
                type="text"
                value={taxName}
                onChange={(e) => setTaxName(e.target.value)}
                placeholder="Value Added Tax"
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Jurisdiction</label>
              <input
                type="text"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                placeholder="US, UK, CA"
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="10.00"
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tax Type</label>
              <select
                value={taxType}
                onChange={(e) => setTaxType(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="DIRECT">Direct (Income Tax)</option>
                <option value="INDIRECT">Indirect (VAT/GST)</option>
                <option value="PAYROLL">Payroll</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={createConfigMutation.isPending}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              {createConfigMutation.isPending ? 'Creating...' : 'Create Configuration'}
            </button>
          </form>
        </div>

        {/* Tax Period Summary */}
        <div className="border rounded p-6">
          <h3 className="text-lg font-semibold mb-4">Tax Period Summary</h3>
          
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>

          {summary && (
            <div className="space-y-2 bg-blue-50 p-3 rounded">
              <p className="text-xs text-gray-600">
                <strong>Period:</strong> {summary.periodStart} to {summary.periodEnd}
              </p>
              <p className="text-xs">
                <strong>Total Calculations:</strong> {summary.calculations.length}
              </p>
              <p className="text-xs">
                <strong>Effective Rate:</strong>{' '}
                {summary.totalTaxableBase > 0
                  ? ((summary.totalTaxAmount / summary.totalTaxableBase) * 100).toFixed(2)
                  : 0}
                %
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tax Calculations */}
      {summary && summary.calculations.length > 0 && (
        <div className="border rounded p-6">
          <h3 className="text-lg font-semibold mb-4">Tax Calculations</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-3 py-2 text-left">Tax Code</th>
                  <th className="px-3 py-2 text-left">Rate</th>
                  <th className="px-3 py-2 text-right">Taxable Base</th>
                  <th className="px-3 py-2 text-right">Tax Amount</th>
                  <th className="px-3 py-2 text-right">Payable</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {summary.calculations.map((calc) => (
                  <tr key={calc.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium">{calc.taxConfig.taxCode}</td>
                    <td className="px-3 py-2">{calc.taxConfig.taxRate}%</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(calc.taxableBase)}</td>
                    <td className="px-3 py-2 text-right font-medium">
                      {formatCurrency(calc.taxAmount)}
                    </td>
                    <td className="px-3 py-2 text-right font-medium">
                      {formatCurrency(calc.payableAmount)}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${getStatusBadgeColor(
                          calc.status
                        )}`}
                      >
                        {calc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
        <p className="text-sm">
          <strong>Tax Compliance:</strong> Configure tax rules for multiple jurisdictions and tax types. 
          Track tax calculations, accruals, and payments. Generate compliance reports and GL postings.
        </p>
      </div>
    </div>
  );
};

export default TaxCompliance;
