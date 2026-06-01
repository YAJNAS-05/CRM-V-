import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface FinancialRatios {
  asOfDate: string;
  currentRatio: number;
  quickRatio: number;
  workingCapital: number;
  netProfitMargin: number;
  grossProfitMargin: number;
  returnOnAssets: number;
  returnOnEquity: number;
  receivablesTurnover: number;
  daysReceivablesOutstanding: number;
  payablesTurnover: number;
  daysPayablesOutstanding: number;
  debtToEquityRatio: number;
  debtToAssetsRatio: number;
  equityRatio: number;
}

const FinancialRatiosDashboard: React.FC = () => {
  const { data: ratios, isLoading } = useQuery({
    queryKey: ['financial-ratios'],
    queryFn: async () => {
      const response = await fetch('/api/finance/ratios');
      if (!response.ok) throw new Error('Failed to fetch ratios');
      return response.json() as Promise<FinancialRatios>;
    },
  });

  if (isLoading) {
    return <div className="p-6 text-center">Loading ratios...</div>;
  }

  if (!ratios) {
    return <div className="p-6 text-center text-gray-500">No data available</div>;
  }

  const getRatioColor = (ratio: number, type: 'good-high' | 'good-low'): string => {
    if (type === 'good-high') {
      if (ratio > 1.5) return 'text-green-600';
      if (ratio > 1.0) return 'text-blue-600';
      return 'text-red-600';
    } else {
      if (ratio < 0.5) return 'text-green-600';
      if (ratio < 1.0) return 'text-blue-600';
      return 'text-red-600';
    }
  };

  const RatioCard: React.FC<{
    title: string;
    value: number;
    unit?: string;
    benchmark?: string;
    type?: 'good-high' | 'good-low';
  }> = ({ title, value, unit = '', benchmark, type = 'good-high' }) => (
    <div className="border rounded p-4 bg-white">
      <p className="text-sm text-gray-600 font-medium">{title}</p>
      <p className={`text-2xl font-bold ${getRatioColor(value, type)}`}>
        {value.toFixed(2)} {unit}
      </p>
      {benchmark && <p className="text-xs text-gray-500 mt-1">Benchmark: {benchmark}</p>}
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Financial Ratios Dashboard</h2>
      <p className="text-sm text-gray-600 mb-6">As of {ratios.asOfDate}</p>

      {/* Liquidity Ratios */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-blue-700">Liquidity Ratios</h3>
        <div className="grid grid-cols-3 gap-4">
          <RatioCard
            title="Current Ratio"
            value={ratios.currentRatio}
            type="good-high"
            benchmark="> 1.5x"
          />
          <RatioCard
            title="Quick Ratio"
            value={ratios.quickRatio}
            type="good-high"
            benchmark="> 1.0x"
          />
          <RatioCard
            title="Working Capital"
            value={ratios.workingCapital}
            unit="USD"
          />
        </div>
      </div>

      {/* Profitability Ratios */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-green-700">Profitability Ratios</h3>
        <div className="grid grid-cols-4 gap-4">
          <RatioCard
            title="Net Profit Margin"
            value={ratios.netProfitMargin}
            unit="%"
            benchmark="> 10%"
          />
          <RatioCard
            title="Gross Profit Margin"
            value={ratios.grossProfitMargin}
            unit="%"
            benchmark="> 30%"
          />
          <RatioCard
            title="Return on Assets"
            value={ratios.returnOnAssets}
            unit="%"
            benchmark="> 5%"
          />
          <RatioCard
            title="Return on Equity"
            value={ratios.returnOnEquity}
            unit="%"
            benchmark="> 15%"
          />
        </div>
      </div>

      {/* Efficiency Ratios */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-purple-700">Efficiency Ratios</h3>
        <div className="grid grid-cols-4 gap-4">
          <RatioCard
            title="Receivables Turnover"
            value={ratios.receivablesTurnover}
            benchmark="Higher is better"
          />
          <RatioCard
            title="Days Receivables Outstanding"
            value={ratios.daysReceivablesOutstanding}
            unit="days"
            benchmark="< 45 days"
            type="good-low"
          />
          <RatioCard
            title="Payables Turnover"
            value={ratios.payablesTurnover}
            benchmark="Higher is better"
          />
          <RatioCard
            title="Days Payables Outstanding"
            value={ratios.daysPayablesOutstanding}
            unit="days"
            benchmark="> 30 days"
          />
        </div>
      </div>

      {/* Leverage Ratios */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-orange-700">Leverage Ratios</h3>
        <div className="grid grid-cols-3 gap-4">
          <RatioCard
            title="Debt-to-Equity Ratio"
            value={ratios.debtToEquityRatio}
            benchmark="< 1.0x"
            type="good-low"
          />
          <RatioCard
            title="Debt-to-Assets Ratio"
            value={ratios.debtToAssetsRatio}
            benchmark="< 0.5"
            type="good-low"
          />
          <RatioCard
            title="Equity Ratio"
            value={ratios.equityRatio}
            unit="%"
            benchmark="> 50%"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
        <p className="text-sm">
          <strong>Summary:</strong> These ratios provide insights into your company's financial health. 
          Liquidity ratios measure short-term solvency, profitability ratios show earnings efficiency, 
          efficiency ratios evaluate asset utilization, and leverage ratios indicate financial risk.
        </p>
      </div>
    </div>
  );
};

export default FinancialRatiosDashboard;
