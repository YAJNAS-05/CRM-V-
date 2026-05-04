import React from 'react'
import { Asset, AssetStatus } from '../../types/hr'

const STATUS_COLORS: Record<AssetStatus, string> = {
  AVAILABLE: 'bg-slate-100 text-slate-600',
  ASSIGNED: 'bg-emerald-50 text-emerald-700',
  MAINTENANCE: 'bg-amber-50 text-amber-700',
  RETIRED: 'bg-red-50 text-red-600',
}

const CATEGORY_ICONS: Record<string, string> = {
  Laptop: '💻',
  Phone: '📱',
  Monitor: '🖥️',
  Keyboard: '⌨️',
  Mouse: '🖱️',
  Headset: '🎧',
  Other: '📦',
}

const MY_ASSETS: Asset[] = [
  {
    id: '1',
    assetCode: 'LT-2024-0045',
    name: 'MacBook Pro 14" (M3)',
    category: 'Laptop',
    serialNumber: 'FVHXYZ123456',
    assignedToEmployeeId: 'me',
    assignedDate: '2024-02-15',
    status: 'ASSIGNED',
    condition: 'Good',
    purchaseDate: '2024-01-10',
    purchaseCost: 3899,
    currency: 'AUD',
  },
  {
    id: '2',
    assetCode: 'PH-2023-0012',
    name: 'iPhone 14 Pro',
    category: 'Phone',
    serialNumber: 'C38XYZ789012',
    assignedToEmployeeId: 'me',
    assignedDate: '2023-08-01',
    status: 'ASSIGNED',
    condition: 'Good',
    purchaseDate: '2023-07-20',
    purchaseCost: 1799,
    currency: 'AUD',
  },
  {
    id: '3',
    assetCode: 'MN-2024-0007',
    name: 'Dell UltraSharp 27" 4K',
    category: 'Monitor',
    serialNumber: 'CN0XYZ345678',
    assignedToEmployeeId: 'me',
    assignedDate: '2024-03-01',
    status: 'ASSIGNED',
    condition: 'Excellent',
    purchaseDate: '2024-02-25',
    purchaseCost: 950,
    currency: 'AUD',
  },
  {
    id: '4',
    assetCode: 'HS-2022-0019',
    name: 'Sony WH-1000XM5',
    category: 'Headset',
    serialNumber: 'SN0XYZ112233',
    assignedToEmployeeId: 'me',
    assignedDate: '2022-12-10',
    status: 'ASSIGNED',
    condition: 'Fair',
    purchaseDate: '2022-11-28',
    purchaseCost: 429,
    currency: 'AUD',
  },
]

const MyAssetsPage: React.FC = () => {
  const totalValue = MY_ASSETS.reduce((sum, a) => sum + (a.purchaseCost || 0), 0)

  return (
    <div className="space-y-6">
      <div className="shell-card p-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Self Service</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">My Assets</h1>
        <p className="text-sm text-slate-600 mt-1">Equipment and assets assigned to you by the organisation.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="shell-card p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{MY_ASSETS.length}</p>
          <p className="text-xs text-slate-500 mt-1">Total Assets</p>
        </div>
        <div className="shell-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{MY_ASSETS.filter((a) => a.status === 'ASSIGNED').length}</p>
          <p className="text-xs text-slate-500 mt-1">Currently Assigned</p>
        </div>
        <div className="shell-card p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">
            {new Set(MY_ASSETS.map((a) => a.category)).size}
          </p>
          <p className="text-xs text-slate-500 mt-1">Categories</p>
        </div>
        <div className="shell-card p-4 text-center">
          <p className="text-lg font-bold text-slate-900">
            {new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(totalValue)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Total Value</p>
        </div>
      </div>

      {/* Asset grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {MY_ASSETS.map((asset) => (
          <div key={asset.id} className="shell-card p-5 flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-3xl">
              {CATEGORY_ICONS[asset.category] || CATEGORY_ICONS.Other}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900 truncate">{asset.name}</p>
                  <p className="text-xs text-slate-500">{asset.assetCode}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[asset.status]}`}>
                  {asset.status}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {[
                  { label: 'Category', value: asset.category },
                  { label: 'Condition', value: asset.condition || '—' },
                  { label: 'Serial No.', value: asset.serialNumber || '—' },
                  { label: 'Assigned', value: asset.assignedDate || '—' },
                  ...(asset.purchaseCost
                    ? [{ label: 'Value', value: new Intl.NumberFormat('en-AU', { style: 'currency', currency: asset.currency || 'AUD', maximumFractionDigits: 0 }).format(asset.purchaseCost) }]
                    : []),
                ].map((row) => (
                  <div key={row.label}>
                    <span className="text-slate-400">{row.label}: </span>
                    <span className="text-slate-700 font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="shell-card p-4 bg-blue-50 border-blue-100">
        <p className="text-sm font-semibold text-blue-800">Asset Issues?</p>
        <p className="text-xs text-blue-700 mt-1">
          If any listed asset is damaged, lost, or needs replacement, please raise a request via the IT helpdesk or contact your HR Business Partner.
        </p>
      </div>
    </div>
  )
}

export default MyAssetsPage
