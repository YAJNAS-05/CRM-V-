import React, { useEffect, useState } from 'react'
import { currencyRateApi } from '../../api/financeApi'
import { CurrencyRate } from '../../types/finance'
import { toast } from 'sonner'

const extractList = <T,>(payload: unknown): T[] => {
  if (!payload || typeof payload !== 'object') return []
  const wrapped = payload as { data?: unknown }
  const data = wrapped.data ?? payload
  return Array.isArray(data) ? (data as T[]) : []
}

const CurrencyRatePage: React.FC = () => {
  const [rates, setRates] = useState<CurrencyRate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRate, setSelectedRate] = useState<CurrencyRate | null>(null)
  const [newRateValue, setNewRateValue] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState({ baseCurrency: '', targetCurrency: '', rate: '' })
  // Converter state
  const [convAmount, setConvAmount] = useState('1')
  const [convFrom, setConvFrom] = useState('')
  const [convTo, setConvTo] = useState('')
  const [convResult, setConvResult] = useState<string | null>(null)

  useEffect(() => {
    fetchRates()
  }, [])

  const fetchRates = async () => {
    try {
      setIsLoading(true)
      const response = await currencyRateApi.getAll()
      setRates(extractList<CurrencyRate>(response.data))
    } catch (error) {
      toast.error('Failed to load currency rates')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRate) return
    try {
      await currencyRateApi.update(selectedRate.baseCurrency, selectedRate.targetCurrency, parseFloat(newRateValue))
      toast.success('Rate updated successfully')
      setShowUpdateModal(false)
      fetchRates()
    } catch (error) {
      toast.error('Failed to update rate')
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await currencyRateApi.create({
        baseCurrency: createForm.baseCurrency.toUpperCase(),
        targetCurrency: createForm.targetCurrency.toUpperCase(),
        rate: parseFloat(createForm.rate),
      })
      toast.success('Rate created successfully')
      setShowCreateModal(false)
      setCreateForm({ baseCurrency: '', targetCurrency: '', rate: '' })
      fetchRates()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create rate')
    }
  }

  const handleDelete = async (rate: CurrencyRate) => {
    if (!window.confirm(`Delete rate ${rate.baseCurrency} → ${rate.targetCurrency}?`)) return
    try {
      setDeletingId(rate.id)
      await currencyRateApi.delete(rate.id)
      toast.success('Rate deleted')
      setRates((prev) => prev.filter((r) => r.id !== rate.id))
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete rate')
    } finally {
      setDeletingId(null)
    }
  }

  const handleConvert = () => {
    const amount = parseFloat(convAmount)
    if (isNaN(amount) || !convFrom || !convTo) {
      setConvResult(null)
      return
    }
    if (convFrom === convTo) {
      setConvResult(`${amount.toFixed(4)} ${convTo}`)
      return
    }
    const direct = rates.find(r => r.baseCurrency === convFrom && r.targetCurrency === convTo)
    if (direct) {
      setConvResult(`${(amount * direct.rate).toFixed(4)} ${convTo}`)
      return
    }
    const inverse = rates.find(r => r.baseCurrency === convTo && r.targetCurrency === convFrom)
    if (inverse) {
      setConvResult(`${(amount / inverse.rate).toFixed(4)} ${convTo}`)
      return
    }
    setConvResult(null)
  }

  const allCurrencies = Array.from(new Set(rates.flatMap(r => [r.baseCurrency, r.targetCurrency]))).sort()

  if (isLoading && rates.length === 0) return <div className="p-8 text-center">Loading rates...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Currency Exchange</h1>
          <p className="text-gray-500 mt-1">Rates are used for AUD equivalent calculations across the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-sm text-indigo-700">
            <strong>Service Status:</strong> Daily sync active (Phase 5)
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition shadow-sm"
          >
            + Add Rate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rates.length === 0 ? (
          <div className="col-span-full py-10 text-center text-gray-500">No rates configured in database.</div>
        ) : (
          rates.map(rate => (
            <div key={rate.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">{rate.baseCurrency}</span>
                    <span className="text-gray-300">&rarr;</span>
                    <span className="text-xl font-bold">{rate.targetCurrency}</span>
                 </div>
                 <div className="flex gap-1">
                   <button 
                     onClick={() => {
                       setSelectedRate(rate)
                       setNewRateValue(rate.rate.toString())
                       setShowUpdateModal(true)
                     }}
                     className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition"
                   >
                     Adjust
                   </button>
                   <button
                     onClick={() => handleDelete(rate)}
                     disabled={deletingId === rate.id}
                     className="text-xs font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded transition disabled:opacity-40"
                   >
                     {deletingId === rate.id ? '...' : 'Delete'}
                   </button>
                 </div>
              </div>
              <div className="text-4xl font-mono font-black text-gray-900 mb-4">
                 {rate.rate.toFixed(4)}
              </div>
              <div className="flex justify-between items-end border-t pt-4">
                 <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black">Last Fetched</p>
                    <p className="text-xs text-gray-600">{new Date(rate.fetchedAt).toLocaleString()}</p>
                 </div>
                 <div className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-bold">
                    ACTIVE
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-10 bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-base">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Currency Converter
        </h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              value={convAmount}
              onChange={(e) => setConvAmount(e.target.value)}
              className="w-32 border-2 border-gray-200 rounded-xl px-3 py-2 font-mono font-bold focus:border-indigo-400 outline-none"
              placeholder="1.00"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">From</label>
            <select
              value={convFrom}
              onChange={(e) => setConvFrom(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-3 py-2 font-mono font-bold focus:border-indigo-400 outline-none"
            >
              <option value="">Select</option>
              {allCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="text-2xl font-bold text-gray-300 mb-1">&rarr;</div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">To</label>
            <select
              value={convTo}
              onChange={(e) => setConvTo(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-3 py-2 font-mono font-bold focus:border-indigo-400 outline-none"
            >
              <option value="">Select</option>
              {allCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button
            onClick={handleConvert}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-sm"
          >
            Convert
          </button>
          {convResult !== null && (
            <div className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl">
              <span className="text-xs font-semibold text-indigo-400 uppercase">Result</span>
              <p className="text-xl font-mono font-black text-indigo-700">{convResult}</p>
            </div>
          )}
          {convResult === null && convFrom && convTo && convFrom !== convTo && (
            <p className="text-sm text-orange-600 font-medium">No rate configured for {convFrom} → {convTo}</p>
          )}
        </div>
      </div>

      <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-dashed border-gray-300">
         <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Multi-Currency Strategy
         </h3>
         <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            All monetary values in the system are stored in their native currency (as issued). 
            Reports and dashboards use these exchange rates to provide a consolidated view in <strong>AUD (Australian Dollars)</strong>. 
            Automated background jobs refresh these values daily at 1 AM.
         </p>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-2">Add Currency Rate</h2>
            <p className="text-sm text-gray-500 mb-6">Create a new exchange rate pair.</p>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Base Currency</label>
                  <input type="text" maxLength={3} required value={createForm.baseCurrency}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, baseCurrency: e.target.value }))}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 font-mono font-bold uppercase focus:border-indigo-500 outline-none"
                    placeholder="USD" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Currency</label>
                  <input type="text" maxLength={3} required value={createForm.targetCurrency}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, targetCurrency: e.target.value }))}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 font-mono font-bold uppercase focus:border-indigo-500 outline-none"
                    placeholder="AUD" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rate</label>
                <input type="number" step="0.0001" required value={createForm.rate}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, rate: e.target.value }))}
                  className="w-full border-2 border-indigo-100 rounded-xl px-4 py-3 text-xl font-mono font-bold focus:border-indigo-500 outline-none transition"
                  placeholder="0.0000" autoFocus />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 border rounded-xl hover:bg-gray-50 font-bold text-gray-600 transition">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 transition">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-2">Manual Adjust</h2>
            <p className="text-sm text-gray-500 mb-6 font-medium">Set manual rate for {selectedRate?.baseCurrency} &rarr; {selectedRate?.targetCurrency}</p>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="relative">
                <input 
                  type="number" step="0.0001" required
                  value={newRateValue}
                  onChange={(e) => setNewRateValue(e.target.value)}
                  className="w-full border-2 border-indigo-100 rounded-xl px-4 py-3 text-2xl font-mono font-bold focus:border-indigo-500 outline-none transition"
                  placeholder="0.0000"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowUpdateModal(false)} className="flex-1 px-4 py-3 border rounded-xl hover:bg-gray-50 font-bold text-gray-600 transition">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 transition">Save Rate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CurrencyRatePage
