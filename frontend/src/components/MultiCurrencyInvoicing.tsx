import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

interface MultiCurrencyInvoice {
  id: number;
  invoiceNumber: string;
  currency: string;
  amount: number;
  originalCurrency?: string;
  exchangeRate?: number;
  fxGainLoss?: number;
}

const MultiCurrencyInvoicing: React.FC = () => {
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [invoiceType, setInvoiceType] = useState<'AP' | 'AR'>('AP');

  const { data: invoices } = useQuery({
    queryKey: ['invoices', invoiceType, 'multicurrency'],
    queryFn: async () => {
      const response = await fetch(
        `/api/finance/${invoiceType === 'AP' ? 'ap' : 'ar'}/invoices`
      );
      if (!response.ok) throw new Error('Failed to fetch invoices');
      return response.json() as Promise<MultiCurrencyInvoice[]>;
    },
  });

  const { data: currencies } = useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      const response = await fetch('/api/finance/exchange-rates/currencies');
      if (!response.ok) throw new Error('Failed to fetch currencies');
      return response.json() as Promise<string[]>;
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async () => {
      const endpoint = invoiceType === 'AP' ? '/api/finance/ap/invoices' : '/api/finance/ar/invoices';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalAmount: parseFloat(amount),
          currency,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }),
      });
      if (!response.ok) throw new Error('Failed to create invoice');
      return response.json();
    },
  });

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    createInvoiceMutation.mutate();
    setAmount('');
  };

  const getStatusColor = (currency: string): string => {
    return currency !== 'USD' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50';
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Multi-Currency Invoicing</h2>

      <div className="grid grid-cols-3 gap-6">
        {/* Create Multi-Currency Invoice */}
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-3">Create Invoice</h3>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={invoiceType}
              onChange={(e) => setInvoiceType(e.target.value as 'AP' | 'AR')}
              className="w-full border p-2 rounded"
            >
              <option value="AP">Accounts Payable</option>
              <option value="AR">Accounts Receivable</option>
            </select>
          </div>

          <form onSubmit={handleCreateInvoice} className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full border p-2 rounded"
              >
                {currencies?.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Amount</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <button
              type="submit"
              disabled={createInvoiceMutation.isPending}
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
            >
              {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
            </button>
          </form>
        </div>

        {/* Invoice List */}
        <div className="col-span-2">
          <h3 className="font-semibold mb-3">Recent {invoiceType} Invoices</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {invoices?.map((invoice) => (
              <div
                key={invoice.id}
                className={`p-3 rounded border ${getStatusColor(invoice.currency)}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-gray-600">
                      {invoice.amount.toFixed(2)} {invoice.currency}
                    </p>
                  </div>
                  {invoice.fxGainLoss && (
                    <div className={invoice.fxGainLoss > 0 ? 'text-green-600' : 'text-red-600'}>
                      <p className="text-sm font-medium">FX: {invoice.fxGainLoss.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiCurrencyInvoicing;
