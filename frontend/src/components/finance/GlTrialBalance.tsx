import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { coaApi } from '../../api/financeApi';

const GlTrialBalance: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const { data, isLoading, error } = useQuery({
    queryKey: ['trial-balance', today],
    queryFn: () => fetch(`/api/finance/gl/trial-balance?asOfDate=${today}`).then(r => r.json()),
    initialData: [],
  });

  if (isLoading) return <div>Loading trial balance...</div>;
  if (error) return <div>Error loading trial balance</div>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Trial Balance</h2>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Account Code</th>
            <th className="p-2 border">Account Name</th>
            <th className="p-2 border">Debit Balance</th>
            <th className="p-2 border">Credit Balance</th>
          </tr>
        </thead>
        <tbody>
          {data && (data as any[]).map((row: any, idx: number) => (
            <tr key={idx}>
              <td className="p-2 border">{row[0]}</td>
              <td className="p-2 border">{row[1]}</td>
              <td className="p-2 border text-right">{row[2]}</td>
              <td className="p-2 border text-right">{row[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GlTrialBalance;
