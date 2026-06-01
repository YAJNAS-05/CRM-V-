import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { coaApi } from '../../api/financeApi';

interface CoaAccount {
  id: number;
  code: string;
  name: string;
  accountType: string;
  normalBalance: string;
}

const CoaList: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['coa-list'],
    queryFn: coaApi.fetchList,
    initialData: [],
  });

  if (isLoading) return <div>Loading accounts...</div>;
  if (error) return <div>Error loading accounts</div>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Accounts List</h2>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Code</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Normal Balance</th>
          </tr>
        </thead>
        <tbody>
          {data && (data as CoaAccount[]).map((acc) => (
            <tr key={acc.id}>
              <td className="p-2 border">{acc.code}</td>
              <td className="p-2 border">{acc.name}</td>
              <td className="p-2 border">{acc.accountType}</td>
              <td className="p-2 border">{acc.normalBalance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CoaList;
