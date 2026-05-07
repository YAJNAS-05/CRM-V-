import React, { useEffect, useState } from 'react'
import { reportApi } from '../../api/financeApi'
import { PnLReport, ArAging, CashFlow } from '../../types/finance'
import { toast } from 'sonner'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import { format, startOfYear, endOfYear } from 'date-fns'

const ReportPage: React.FC = () => {
  const [pnlData, setPnlData] = useState<PnLReport | null>(null)
  const [arAging, setArAging] = useState<ArAging | null>(null)
  const [cashFlow, setCashFlow] = useState<CashFlow | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444']

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setIsLoading(true)
      const start = format(startOfYear(new Date()), 'yyyy-MM-dd')
      const end = format(endOfYear(new Date()), 'yyyy-MM-dd')
      
      const [pnlRes, arRes, cfRes] = await Promise.all([
        reportApi.getPnL(undefined, start, end),
        reportApi.getArAging(),
        reportApi.getCashFlow(start, end)
      ])

      setPnlData(pnlRes.data.data!)
      setArAging(arRes.data.data!)
      setCashFlow(cfRes.data.data!)
    } catch (error) {
      toast.error('Failed to load financial reports')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div className="p-8 text-center text-gray-500 font-medium">Generating reports...</div>

  // Transform AR Aging data for Pie Chart
  const agingPieData = arAging ? Object.keys(arAging).filter(key => key !== 'customer' && key !== 'total').map((key, index) => ({
    name: key === 'current' ? 'Current' : key.replace('days', '') + ' Days',
    value: Number(arAging[key as keyof ArAging])
  })) : []

  // Transform P&L data for simple Bar Chart
  const pnlChartData = pnlData ? [
    { name: 'Revenue', amount: pnlData.totalRevenue },
    { name: 'Cost', amount: pnlData.totalCost },
    { name: 'Profit', amount: pnlData.netProfit }
  ] : []

  // Build cash flow forecast: last 3-month average projected 6 months forward
  const forecastData = (() => {
    const entries = cashFlow?.entries || []
    if (entries.length === 0) return []
    const recentN = entries.slice(-3)
    const avgInflow = recentN.reduce((s, e) => s + (e.inflow || 0), 0) / recentN.length
    const avgOutflow = recentN.reduce((s, e) => s + (e.outflow || 0), 0) / recentN.length
    const lastDate = new Date(entries[entries.length - 1]?.date || new Date())
    type DataPoint = { date: string; inflow: number | null; outflow: number | null; net: number | null; forecastInflow: number | null; forecastOutflow: number | null; forecastNet: number | null }
    const actuals: DataPoint[] = entries.map(e => ({ date: e.date?.slice(0, 7) || e.date, inflow: e.inflow, outflow: e.outflow, net: e.net, forecastInflow: null, forecastOutflow: null, forecastNet: null }))
    const projections: DataPoint[] = []
    for (let i = 1; i <= 6; i++) {
      const d = new Date(lastDate)
      d.setMonth(d.getMonth() + i)
      projections.push({ date: d.toISOString().slice(0, 7), inflow: null, outflow: null, net: null, forecastInflow: Math.round(avgInflow), forecastOutflow: Math.round(avgOutflow), forecastNet: Math.round(avgInflow - avgOutflow) })
    }
    return [...actuals, ...projections]
  })()

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50/50 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Financial Intelligence</h1>
          <p className="text-gray-500 mt-2 font-medium">Real-time fiscal reporting for AU, US, and JP entities.</p>
        </div>
        <button 
          onClick={fetchReports}
          className="bg-white border-2 border-indigo-100 p-2 rounded-xl hover:bg-indigo-50 transition shadow-sm"
        >
          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Revenue (YTD)" value={pnlData?.totalRevenue || 0} color="text-indigo-600" />
        <StatCard title="Total Collected" value={cashFlow?.totalInflow || 0} color="text-green-600" />
        <StatCard title="Accounts Receivable" value={arAging?.totalOutstanding || 0} color="text-amber-600" />
        <StatCard title="Overdue Invoices" value={arAging?.totalOverdueCount || 0} isCurrency={false} color="text-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* P&L Bar Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 lg:col-span-1">
          <h3 className="text-xl font-bold mb-8 text-gray-800">Profit & Loss Overview</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pnlChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 500}} />
                <YAxis axisLine={false} tickLine={false} hide />
                <Tooltip 
                   cursor={{fill: '#f3f4f6'}}
                   contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {pnlChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AR Aging Pie Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 lg:col-span-1">
          <h3 className="text-xl font-bold mb-8 text-gray-800">AR Aging Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={agingPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {agingPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cash Flow Line Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 lg:col-span-1">
          <h3 className="text-xl font-bold mb-8 text-gray-800">Inflow Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashFlow?.entries || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip />
                <Line 
                    type="monotone" 
                    dataKey="inflow" 
                    stroke="#4f46e5" 
                    strokeWidth={4} 
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Revenue by Category</h3>
            <div className="space-y-4">
               {pnlData && Object.entries(pnlData.revenueByCategory).map(([cat, val], idx) => (
                  <div key={cat} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                     <span className="text-sm font-bold text-gray-600">{cat}</span>
                     <span className="font-mono font-black">${val.toLocaleString()}</span>
                  </div>
               ))}
            </div>
         </div>
         <div className="bg-indigo-900 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100 flex flex-col justify-between">
            <div>
               <h3 className="text-lg font-bold opacity-80 uppercase tracking-widest text-[10px]">Financial Health Tip</h3>
               <p className="mt-4 text-xl leading-relaxed font-medium">
                  "{arAging && arAging.totalOverdueCount > 0 ? 
                    `You have ${arAging.totalOverdueCount} overdue invoices. Improving collection follow-up could increase cash flow by $${arAging.totalOutstanding.toLocaleString()}.` : 
                    "Excellent fiscal health! All invoices are currently within terms."}"
               </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-indigo-300">
               <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
               <span className="text-xs font-bold">EVERX FISCAL ENGINE ACTIVE</span>
            </div>
         </div>
      </div>

      {/* Cash Flow Forecast */}
      {forecastData.length > 0 && (
        <div className="mt-8 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Cash Flow Forecast</h3>
              <p className="text-xs text-gray-400 mt-1">Actuals + 6-month forward projection (based on 3-month trailing average)</p>
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="inline-block w-6 h-0.5 bg-indigo-600"></span> Actual</span>
              <span className="flex items-center gap-1"><span className="inline-block w-6 border-t-2 border-dashed border-amber-500"></span> Forecast</span>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(val: number, name: string) => [`$${val.toLocaleString()}`, name]}
                />
                <Legend />
                <Line type="monotone" dataKey="inflow" name="Actual Inflow" stroke="#4f46e5" strokeWidth={2} dot={false} connectNulls={false} />
                <Line type="monotone" dataKey="outflow" name="Actual Outflow" stroke="#ef4444" strokeWidth={2} dot={false} connectNulls={false} />
                <Line type="monotone" dataKey="forecastInflow" name="Forecast Inflow" stroke="#a5b4fc" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls={false} />
                <Line type="monotone" dataKey="forecastOutflow" name="Forecast Outflow" stroke="#fca5a5" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls={false} />
                <Line type="monotone" dataKey="forecastNet" name="Forecast Net" stroke="#34d399" strokeWidth={2} strokeDasharray="4 4" dot={false} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Forecast summary */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            {(['forecastInflow','forecastOutflow','forecastNet'] as const).map(key => {
              const projected = forecastData.filter(d => d[key] !== null)
              const avg = projected.length > 0 ? projected.reduce((s, d) => s + (d[key] as number || 0), 0) / projected.length : 0
              const total = projected.reduce((s, d) => s + (d[key] as number || 0), 0)
              const label = key === 'forecastInflow' ? 'Inflow' : key === 'forecastOutflow' ? 'Outflow' : 'Net'
              return (
                <div key={key} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                  <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">{label} Forecast (6mo)</p>
                  <p className="text-lg font-black text-gray-800 mt-1">${total.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">avg ${Math.round(avg).toLocaleString()} / mo</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

const StatCard: React.FC<{ title: string, value: number, isCurrency?: boolean, color?: string }> = ({ title, value, isCurrency = true, color = "text-indigo-600" }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-indigo-200 transition group cursor-default">
    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">{title}</p>
    <div className={`text-3xl font-black ${color}`}>
      {isCurrency ? '$' : ''}{value.toLocaleString()}
    </div>
    <div className="mt-4 w-full h-1 bg-gray-50 rounded-full overflow-hidden">
       <div className={`h-full bg-current ${color} opacity-20 w-[65%]`}></div>
    </div>
  </div>
)

export default ReportPage
