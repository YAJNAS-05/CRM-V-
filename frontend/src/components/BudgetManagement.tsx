import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

interface Budget {
  id: number;
  budgetCode: string;
  budgetName: string;
  budgetPeriod: string;
  totalAmount: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
  description?: string;
}

interface BudgetVariance {
  budgetId: number;
  budgetMonth: string;
  totalBudgeted: number;
  totalActual: number;
  variance: number;
  variancePercent: number;
}

const BudgetManagement: React.FC = () => {
  const [selectedBudget, setSelectedBudget] = useState<number | null>(null);
  const [budgetCode, setBudgetCode] = useState('');
  const [budgetName, setBudgetName] = useState('');
  const [period, setPeriod] = useState('');

  const { data: approvedBudgets } = useQuery({
    queryKey: ['budgets', 'approved'],
    queryFn: async () => {
      const response = await fetch('/api/finance/budgets/approved');
      if (!response.ok) throw new Error('Failed to fetch budgets');
      return response.json() as Promise<Budget[]>;
    },
  });

  const { data: budgetVariance } = useQuery({
    queryKey: ['budget-variance', selectedBudget],
    queryFn: async () => {
      if (!selectedBudget) return null;
      const currentMonth = new Date().toISOString().slice(0, 7);
      const response = await fetch(
        `/api/finance/budgets/${selectedBudget}/variance?budgetMonth=${currentMonth}`
      );
      if (!response.ok) throw new Error('Failed to fetch variance');
      return response.json() as Promise<BudgetVariance>;
    },
    enabled: !!selectedBudget,
  });

  const createBudgetMutation = useMutation({
    mutationFn: async (data: Partial<Budget>) => {
      const response = await fetch('/api/finance/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create budget');
      return response.json();
    },
  });

  const approveBudgetMutation = useMutation({
    mutationFn: async (budgetId: number) => {
      const response = await fetch(`/api/finance/budgets/${budgetId}/approve`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to approve budget');
      return response.json();
    },
  });

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    createBudgetMutation.mutate({
      budgetCode,
      budgetName,
      budgetPeriod: period,
      totalAmount: 0,
    });
    setBudgetCode('');
    setBudgetName('');
    setPeriod('');
  };

  const getVarianceColor = (variance: number): string => {
    if (variance > 10) return 'text-red-600'; // Over budget
    if (variance < -10) return 'text-green-600'; // Under budget
    return 'text-gray-600'; // Within tolerance
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Budget Management</h2>

      <div className="grid grid-cols-2 gap-6">
        {/* Create Budget Form */}
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-3">Create New Budget</h3>
          <form onSubmit={handleCreateBudget} className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Budget Code</label>
              <input
                type="text"
                value={budgetCode}
                onChange={(e) => setBudgetCode(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="e.g., BUD-2026-Q1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Budget Name</label>
              <input
                type="text"
                value={budgetName}
                onChange={(e) => setBudgetName(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="e.g., Operations Q1 2026"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Period</label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="e.g., 2026-Q1"
                required
              />
            </div>

            <button
              type="submit"
              disabled={createBudgetMutation.isPending}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              {createBudgetMutation.isPending ? 'Creating...' : 'Create Budget'}
            </button>
          </form>
        </div>

        {/* Budget Variance Report */}
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-3">Budget Variance</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Budget</label>
            <select
              value={selectedBudget || ''}
              onChange={(e) => setSelectedBudget(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full border p-2 rounded"
            >
              <option value="">-- Select --</option>
              {approvedBudgets?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.budgetName}
                </option>
              ))}
            </select>
          </div>

          {budgetVariance && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Budgeted:</span>
                <span className="font-semibold">${budgetVariance.totalBudgeted.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Actual:</span>
                <span className="font-semibold">${budgetVariance.totalActual.toFixed(2)}</span>
              </div>
              <div className={`flex justify-between ${getVarianceColor(budgetVariance.variancePercent)}`}>
                <span className="text-sm font-medium">Variance:</span>
                <span className="font-semibold">
                  ${budgetVariance.variance.toFixed(2)} ({budgetVariance.variancePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approved Budgets List */}
      <div className="mt-6">
        <h3 className="font-semibold mb-3">Approved Budgets</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Code</th>
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Period</th>
                <th className="border p-2 text-right">Amount</th>
                <th className="border p-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {approvedBudgets?.map((budget) => (
                <tr key={budget.id} className="hover:bg-gray-50">
                  <td className="border p-2">{budget.budgetCode}</td>
                  <td className="border p-2">{budget.budgetName}</td>
                  <td className="border p-2">{budget.budgetPeriod}</td>
                  <td className="border p-2 text-right">${budget.totalAmount.toFixed(2)}</td>
                  <td className="border p-2 text-center">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      {budget.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BudgetManagement;
