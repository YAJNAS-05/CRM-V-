import React from 'react';
import { useQuery } from '@tanstack/react-query';

const ArAgingReport: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ar-aging'],
    queryFn: () => fetch('/api/finance/ar/aging').then(r => r.json()),
    initialData: [],
  });

  if (isLoading) return <div>Loading AR aging report...</div>;
  if (error) return <div>Error loading report</div>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">AR Aging Report</h2>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Invoice #</th>
            <th className="p-2 border">Customer</th>
            <th className="p-2 border">Amount</th>
            <th className="p-2 border">Due Date</th>
            <th className="p-2 border">Days Overdue</th>
            <th className="p-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {data && (data as any[]).map((invoice: any) => {
            const daysOverdue = Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
            return (
              <tr key={invoice.id}>
                <td className="p-2 border">{invoice.invoiceNumber}</td>
                <td className="p-2 border">{invoice.customer?.name}</td>
                <td className="p-2 border text-right">${invoice.totalAmount}</td>
                <td className="p-2 border">{invoice.dueDate}</td>
                <td className="p-2 border text-center">{daysOverdue > 0 ? daysOverdue : 0}</td>
                <td className="p-2 border">{invoice.status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ArAgingReport;
