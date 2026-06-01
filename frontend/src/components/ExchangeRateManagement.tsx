import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

interface ExchangeRate {
  id: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  rateDate: string;
  source: string;
}

interface ConversionResponse {
  fromCurrency: string;
  toCurrency: string;
  originalAmount: number;
  convertedAmount: number;
  conversionDate: string;
}

const ExchangeRateManagement: React.FC = () => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [rate, setRate] = useState('1.0');
  const [rateDate, setRateDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: latestRate } = useQuery({
    queryKey: ['exchangeRate', fromCurrency, toCurrency],
    queryFn: async () => {
      const response = await fetch(
        `/api/finance/exchange-rates/latest?fromCurrency=${fromCurrency}&toCurrency=${toCurrency}`
      );
      if (!response.ok) throw new Error('Failed to fetch rate');
      return response.json() as Promise<ExchangeRate>;
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

  const createRateMutation = useMutation({
    mutationFn: async (data: { rate: string }) => {
      const response = await fetch('/api/finance/exchange-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromCurrency,
          toCurrency,
          rate: parseFloat(data.rate),
          rateDate,
          source: 'MANUAL',
        }),
      });
      if (!response.ok) throw new Error('Failed to create rate');
      return response.json();
    },
  });

  const handleCreateRate = (e: React.FormEvent) => {
    e.preventDefault();
    createRateMutation.mutate({ rate });
    setRate('1.0');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Exchange Rate Management</h2>

      <div className="grid grid-cols-2 gap-6">
        {/* Exchange Rate Form */}
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-3">Add Exchange Rate</h3>
          <form onSubmit={handleCreateRate} className="space-y-3">
            <div>
              <label className="block text-sm font-medium">From Currency</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
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
              <label className="block text-sm font-medium">To Currency</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
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
              <label className="block text-sm font-medium">Rate</label>
              <input
                type="number"
                step="0.0001"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Rate Date</label>
              <input
                type="date"
                value={rateDate}
                onChange={(e) => setRateDate(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            <button
              type="submit"
              disabled={createRateMutation.isPending}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              {createRateMutation.isPending ? 'Creating...' : 'Create Rate'}
            </button>
          </form>
        </div>

        {/* Latest Rate Display */}
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-3">Latest Rate</h3>
          {latestRate ? (
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">From:</span>
                <p className="font-semibold">{latestRate.fromCurrency}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">To:</span>
                <p className="font-semibold">{latestRate.toCurrency}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Rate:</span>
                <p className="font-semibold text-lg">{latestRate.rate.toFixed(6)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Date:</span>
                <p className="font-semibold">{latestRate.rateDate}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No rate found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExchangeRateManagement;
