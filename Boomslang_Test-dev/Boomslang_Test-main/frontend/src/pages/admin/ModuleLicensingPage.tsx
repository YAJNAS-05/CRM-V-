import React, { useState } from 'react'
import { toast } from 'sonner'

type LicenseStatus = 'active' | 'inactive' | 'trial' | 'expired'

type Module = {
  id: string
  name: string
  description: string
  category: string
  status: LicenseStatus
  seats: number | 'unlimited'
  usedSeats: number
  expiresAt: string | null
  version: string
}

const STATUS_BADGE: Record<LicenseStatus, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  inactive: 'bg-gray-100 text-gray-500 border-gray-200',
  trial: 'bg-amber-50 text-amber-700 border-amber-200',
  expired: 'bg-red-50 text-red-700 border-red-200',
}

const INITIAL_MODULES: Module[] = [
  { id: 'crm', name: 'CRM', description: 'Customer relationship management — leads, contacts, deals, activities.', category: 'Core', status: 'active', seats: 'unlimited', usedSeats: 78, expiresAt: null, version: '3.2.1' },
  { id: 'erp', name: 'ERP', description: 'Enterprise resource planning — inventory, purchase orders, field work.', category: 'Core', status: 'active', seats: 'unlimited', usedSeats: 45, expiresAt: null, version: '2.8.0' },
  { id: 'finance', name: 'Finance', description: 'Invoicing, A/R, A/P, P&L, cash flow, budgeting.', category: 'Core', status: 'active', seats: 'unlimited', usedSeats: 22, expiresAt: null, version: '2.1.4' },
  { id: 'hr', name: 'Human Resources', description: 'Employee management, payroll, leave, performance, benefits.', category: 'Core', status: 'active', seats: 'unlimited', usedSeats: 142, expiresAt: null, version: '1.9.3' },
  { id: 'reports', name: 'Enterprise Reporting', description: 'Custom report builder, scheduled reports, Jasper integration.', category: 'Analytics', status: 'active', seats: 25, usedSeats: 12, expiresAt: '2025-12-31', version: '1.5.0' },
  { id: 'ai', name: 'AI Insights', description: 'AI-powered analytics, forecasting, and recommendation engine.', category: 'Analytics', status: 'trial', seats: 10, usedSeats: 3, expiresAt: '2025-01-15', version: '0.9.0' },
  { id: 'fieldwork', name: 'Field Work', description: 'GPS tracking, photo capture, technician dispatch, warranty management.', category: 'Operations', status: 'active', seats: 50, usedSeats: 28, expiresAt: '2025-12-31', version: '2.3.1' },
  { id: 'ecommerce', name: 'E-Commerce', description: 'Online storefront, product catalog, order management.', category: 'Sales', status: 'inactive', seats: 0, usedSeats: 0, expiresAt: null, version: '1.0.0' },
  { id: 'compliance', name: 'Compliance Suite', description: 'Regulatory compliance, audit trails, GDPR/SOC2 tooling.', category: 'Governance', status: 'expired', seats: 15, usedSeats: 0, expiresAt: '2024-09-30', version: '1.2.0' },
]

const ModuleLicensingPage: React.FC = () => {
  const [modules, setModules] = useState<Module[]>(INITIAL_MODULES)
  const [selected, setSelected] = useState<Module | null>(null)
  const [seatEdit, setSeatEdit] = useState('')

  const handleToggle = (id: string) => {
    setModules(prev => prev.map(m => {
      if (m.id !== id) return m
      const next: LicenseStatus = m.status === 'active' ? 'inactive' : 'active'
      toast.success(`${m.name} ${next === 'active' ? 'enabled' : 'disabled'}`)
      return { ...m, status: next }
    }))
  }

  const handleSaveSeats = () => {
    if (!selected) return
    const n = parseInt(seatEdit)
    if (isNaN(n) || n < 0) { toast.error('Invalid seat count'); return }
    setModules(prev => prev.map(m => m.id === selected.id ? { ...m, seats: n } : m))
    toast.success(`Seats updated to ${n}`)
    setSelected(null)
  }

  const grouped = modules.reduce<Record<string, Module[]>>((acc, m) => {
    acc[m.category] = acc[m.category] || []
    acc[m.category].push(m)
    return acc
  }, {})

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900">Module Licensing</h1>
          <p className="text-gray-500 mt-2">Enable, disable, and manage seat licenses for each platform module.</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Modules', val: modules.filter(m => m.status === 'active').length, color: 'text-green-600' },
            { label: 'Trial', val: modules.filter(m => m.status === 'trial').length, color: 'text-amber-600' },
            { label: 'Inactive', val: modules.filter(m => m.status === 'inactive').length, color: 'text-gray-500' },
            { label: 'Expired', val: modules.filter(m => m.status === 'expired').length, color: 'text-red-600' },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{label}</p>
              <p className={`text-2xl font-black mt-1 ${color}`}>{val}</p>
            </div>
          ))}
        </div>

        {/* Module cards by category */}
        {Object.entries(grouped).map(([category, mods]) => (
          <div key={category} className="mb-8">
            <h2 className="text-sm font-black uppercase text-gray-400 tracking-widest mb-3">{category}</h2>
            <div className="space-y-3">
              {mods.map(m => (
                <div key={m.id} className={`bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-4 transition ${m.status === 'active' ? 'border-gray-100' : 'border-gray-100 opacity-70'}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{m.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${STATUS_BADGE[m.status]}`}>{m.status}</span>
                      <span className="text-xs text-gray-400 font-mono">v{m.version}</span>
                    </div>
                    <p className="text-sm text-gray-500">{m.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>Seats: <strong className="text-gray-600">{m.seats === 'unlimited' ? '∞' : m.seats}</strong></span>
                      <span>Used: <strong className="text-gray-600">{m.usedSeats}</strong></span>
                      {m.expiresAt && <span>Expires: <strong className={new Date(m.expiresAt) < new Date() ? 'text-red-600' : 'text-gray-600'}>{m.expiresAt}</strong></span>}
                    </div>
                    {typeof m.seats === 'number' && m.seats > 0 && (
                      <div className="mt-2 w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (m.usedSeats / m.seats) * 100)}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {m.seats !== 'unlimited' && (
                      <button onClick={() => { setSelected(m); setSeatEdit(String(m.seats)) }}
                        className="text-xs px-3 py-1 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium">
                        Edit Seats
                      </button>
                    )}
                    <button onClick={() => handleToggle(m.id)}
                      className={`text-xs px-3 py-1 rounded-lg border font-medium ${m.status === 'active' || m.status === 'trial' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                      {m.status === 'active' || m.status === 'trial' ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Edit seats modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-full max-w-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Edit Seats — {selected.name}</h2>
              <p className="text-sm text-gray-500 mb-4">Currently using {selected.usedSeats} seats.</p>
              <div>
                <label className="text-sm font-medium text-gray-700">Total Licensed Seats</label>
                <input type="number" min={selected.usedSeats} value={seatEdit} onChange={e => setSeatEdit(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                {parseInt(seatEdit) < selected.usedSeats && (
                  <p className="text-xs text-red-500 mt-1">Cannot be less than currently used seats ({selected.usedSeats})</p>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-5">
                <button onClick={() => setSelected(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                <button onClick={handleSaveSeats} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModuleLicensingPage
