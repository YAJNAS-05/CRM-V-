import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

interface BankAccount {
  id: number;
  accountNumber: string;
  accountName: string;
  bankName: string;
  glAccountBalance: number;
  bankStatementBalance: number;
  reconciliationDifference: number;
  lastReconciliationDate: string;
}

interface BankStatement {
  id: number;
  statementDate: string;
  closingBalance: number;
  transactionCount: number;
  status: string;
}

interface BankStatementLine {
  id: number;
  transactionDate: string;
  reference: string;
  description: string;
  amount: number;
  transactionType: 'DEBIT' | 'CREDIT';
  matchStatus: string;
}

const BankReconciliation: React.FC = () => {
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [selectedStatement, setSelectedStatement] = useState<number | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');

  const { data: accounts } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: async () => {
      const response = await fetch('/api/finance/bank-accounts');
      if (!response.ok) throw new Error('Failed to fetch accounts');
      return response.json() as Promise<BankAccount[]>;
    },
  });

  const { data: selectedAccountData } = useQuery({
    queryKey: ['bank-account', selectedAccount],
    queryFn: async () => {
      if (!selectedAccount) return null;
      const response = await fetch(`/api/finance/bank-accounts/${selectedAccount}`);
      if (!response.ok) throw new Error('Failed to fetch account');
      return response.json() as Promise<BankAccount>;
    },
    enabled: !!selectedAccount,
  });

  const createAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/finance/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountNumber,
          accountName,
          bankName,
          currency: 'USD',
          status: 'ACTIVE',
        }),
      });
      if (!response.ok) throw new Error('Failed to create account');
      return response.json();
    },
  });

  const reconcileMutation = useMutation({
    mutationFn: async (statementId: number) => {
      const response = await fetch(`/api/finance/bank-reconciliation/${statementId}/reconcile`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to reconcile');
      return response.json();
    },
  });

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    createAccountMutation.mutate();
    setAccountNumber('');
    setAccountName('');
    setBankName('');
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'RECONCILED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'EXCEPTION':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Bank Reconciliation</h2>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Create Bank Account */}
        <div className="border rounded p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Add Bank Account</h3>
          
          <form onSubmit={handleCreateAccount} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Account Name</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <button
              type="submit"
              disabled={createAccountMutation.isPending}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              {createAccountMutation.isPending ? 'Creating...' : 'Add Account'}
            </button>
          </form>
        </div>

        {/* Bank Accounts List */}
        <div className="border rounded p-6">
          <h3 className="text-lg font-semibold mb-4">Bank Accounts</h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {accounts?.map((account) => (
              <div
                key={account.id}
                onClick={() => setSelectedAccount(account.id)}
                className={`p-3 rounded border cursor-pointer transition ${
                  selectedAccount === account.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <p className="font-medium">{account.accountNumber}</p>
                <p className="text-sm text-gray-600">{account.accountName}</p>
                <div className="text-xs mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-gray-500">GL Balance</p>
                    <p className="font-semibold text-blue-600">
                      {formatCurrency(account.glAccountBalance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Difference</p>
                    <p className={`font-semibold ${
                      account.reconciliationDifference === 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {formatCurrency(account.reconciliationDifference)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Account Detail and Reconciliation */}
      {selectedAccountData && (
        <div className="border rounded p-6 bg-blue-50">
          <h3 className="text-lg font-semibold mb-4">
            {selectedAccountData.accountName} - Reconciliation
          </h3>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded border">
              <p className="text-sm text-gray-600">GL Balance</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(selectedAccountData.glAccountBalance)}
              </p>
            </div>
            <div className="bg-white p-4 rounded border">
              <p className="text-sm text-gray-600">Bank Balance</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(selectedAccountData.bankStatementBalance)}
              </p>
            </div>
            <div className={`p-4 rounded border ${
              selectedAccountData.reconciliationDifference === 0
                ? 'bg-green-50'
                : 'bg-red-50'
            }`}>
              <p className="text-sm text-gray-600">Difference</p>
              <p className={`text-2xl font-bold ${
                selectedAccountData.reconciliationDifference === 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {formatCurrency(selectedAccountData.reconciliationDifference)}
              </p>
            </div>
          </div>

          {selectedAccountData.lastReconciliationDate && (
            <p className="text-sm text-gray-600 mb-4">
              Last reconciled: {new Date(selectedAccountData.lastReconciliationDate).toLocaleDateString()}
            </p>
          )}

          <div className="bg-blue-100 border-l-4 border-blue-600 p-4 rounded">
            <p className="text-sm">
              <strong>Bank Reconciliation:</strong> Automatic matching algorithm compares bank statement 
              transactions with GL entries. Exact matches by amount and date, fuzzy matches within 5-day window.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankReconciliation;
