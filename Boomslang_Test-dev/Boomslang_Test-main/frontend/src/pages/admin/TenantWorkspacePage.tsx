import React, { useState } from 'react'
import { toast } from 'sonner'

type Workspace = {
  id: string
  name: string
  slug: string
  plan: 'Starter' | 'Professional' | 'Enterprise'
  region: string
  status: 'active' | 'suspended' | 'trial'
  users: number
  createdAt: string
}

const DEMO_WORKSPACES: Workspace[] = [
  { id: 'ws-001', name: 'EverX Australia', slug: 'everx-au', plan: 'Enterprise', region: 'ap-southeast-2', status: 'active', users: 142, createdAt: '2023-01-15' },
  { id: 'ws-002', name: 'EverX United States', slug: 'everx-us', plan: 'Enterprise', region: 'us-east-1', status: 'active', users: 98, createdAt: '2023-03-10' },
  { id: 'ws-003', name: 'EverX Japan', slug: 'everx-jp', plan: 'Professional', region: 'ap-northeast-1', status: 'active', users: 35, createdAt: '2023-07-01' },
  { id: 'ws-004', name: 'ACME Corp (Trial)', slug: 'acme-trial', plan: 'Starter', region: 'us-west-2', status: 'trial', users: 5, createdAt: '2024-11-01' },
]

const STATUS_BADGE: Record<Workspace['status'], string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  suspended: 'bg-red-50 text-red-700 border-red-200',
  trial: 'bg-amber-50 text-amber-700 border-amber-200',
}

const PLAN_BADGE: Record<Workspace['plan'], string> = {
  Starter: 'bg-gray-50 text-gray-600 border-gray-200',
  Professional: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Enterprise: 'bg-purple-50 text-purple-700 border-purple-200',
}

const TenantWorkspacePage: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(DEMO_WORKSPACES)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', plan: 'Professional' as Workspace['plan'], region: 'us-east-1' })

  const filtered = workspaces.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.slug.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = () => {
    if (!form.name.trim() || !form.slug.trim()) { toast.error('Name and slug are required'); return }
    if (workspaces.some(w => w.slug === form.slug)) { toast.error('Slug already taken'); return }
    const ws: Workspace = { id: 'ws-' + Date.now(), name: form.name, slug: form.slug, plan: form.plan, region: form.region, status: 'trial', users: 0, createdAt: new Date().toISOString().slice(0, 10) }
    setWorkspaces(prev => [...prev, ws])
    setShowForm(false)
    setForm({ name: '', slug: '', plan: 'Professional', region: 'us-east-1' })
    toast.success(`Workspace "${ws.name}" created`)
  }

  const handleSuspend = (id: string) => {
    setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, status: w.status === 'active' ? 'suspended' : 'active' } : w))
    const ws = workspaces.find(w => w.id === id)
    toast.success(`Workspace ${ws?.status === 'active' ? 'suspended' : 'reactivated'}`)
  }

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900">Tenant / Workspace Management</h1>
            <p className="text-gray-500 mt-2">Manage all workspaces and tenant configurations.</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-sm">
            + New Workspace
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Workspaces', val: workspaces.length, color: 'text-indigo-600' },
            { label: 'Active Users', val: workspaces.reduce((s, w) => s + w.users, 0), color: 'text-green-600' },
            { label: 'Trial Tenants', val: workspaces.filter(w => w.status === 'trial').length, color: 'text-amber-600' },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{label}</p>
              <p className={`text-3xl font-black mt-1 ${color}`}>{val.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <input type="text" placeholder="Search workspaces…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full mb-4 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Workspace', 'Slug', 'Plan', 'Region', 'Users', 'Status', 'Created', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(ws => (
                <tr key={ws.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-semibold text-gray-800">{ws.name}</td>
                  <td className="px-4 py-3 font-mono text-gray-500 text-xs">{ws.slug}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PLAN_BADGE[ws.plan]}`}>{ws.plan}</span></td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{ws.region}</td>
                  <td className="px-4 py-3 text-gray-700">{ws.users}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${STATUS_BADGE[ws.status]}`}>{ws.status}</span></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{ws.createdAt}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleSuspend(ws.id)}
                      className={`text-xs px-3 py-1 rounded-lg border font-medium ${ws.status === 'active' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                      {ws.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No workspaces found.</p>}
        </div>

        {/* New Workspace Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-full max-w-md">
              <h2 className="text-lg font-bold text-gray-900 mb-4">New Workspace</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Workspace Name *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="ACME Corp" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Slug (unique identifier) *</label>
                  <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" placeholder="acme-corp" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Plan</label>
                    <select value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value as Workspace['plan'] }))}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm">
                      <option value="Starter">Starter</option>
                      <option value="Professional">Professional</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Region</label>
                    <select value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm">
                      <option value="us-east-1">US East</option>
                      <option value="us-west-2">US West</option>
                      <option value="eu-west-1">EU West</option>
                      <option value="ap-southeast-2">AP Southeast (AU)</option>
                      <option value="ap-northeast-1">AP Northeast (JP)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                <button onClick={handleCreate} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold">Create</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TenantWorkspacePage
