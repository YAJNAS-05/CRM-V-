import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { leavePolicyApi } from '../../api/hrApi'
import { AccrualFrequency, LeavePolicy, LeaveType } from '../../types/hr'

const LEAVE_TYPES: LeaveType[] = ['ANNUAL', 'SICK', 'UNPAID', 'MATERNITY', 'PATERNITY', 'BEREAVEMENT']
const ACCRUAL_FREQUENCIES: AccrualFrequency[] = ['MONTHLY', 'QUARTERLY', 'YEARLY', 'NONE']

const defaultForm = {
  name: '',
  leaveType: 'ANNUAL' as LeaveType,
  annualEntitlement: '12',
  accrualFrequency: 'MONTHLY' as AccrualFrequency,
  carryForwardLimit: '',
  maxBalance: '',
  allowNegative: false,
  requiresApproval: true,
  minServiceDays: '',
  effectiveFrom: '',
  effectiveTo: '',
  isActive: true,
  description: '',
}

type LeavePolicyForm = typeof defaultForm

const LeavePoliciesPage: React.FC = () => {
  const [policies, setPolicies] = useState<LeavePolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<LeavePolicy | null>(null)
  const [formData, setFormData] = useState<LeavePolicyForm>(defaultForm)

  useEffect(() => {
    loadPolicies()
  }, [])

  const loadPolicies = async () => {
    try {
      setLoading(true)
      const response = await leavePolicyApi.getAll(0, 200)
      setPolicies(response.data.data?.content || [])
    } catch (error) {
      console.error('Failed to load leave policies', error)
      toast.error('Failed to load leave policies')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEditing(null)
    setFormData(defaultForm)
  }

  const startEdit = (policy: LeavePolicy) => {
    setEditing(policy)
    setFormData({
      name: policy.name,
      leaveType: policy.leaveType,
      annualEntitlement: String(policy.annualEntitlement ?? ''),
      accrualFrequency: policy.accrualFrequency || 'MONTHLY',
      carryForwardLimit: policy.carryForwardLimit != null ? String(policy.carryForwardLimit) : '',
      maxBalance: policy.maxBalance != null ? String(policy.maxBalance) : '',
      allowNegative: Boolean(policy.allowNegative),
      requiresApproval: policy.requiresApproval == null ? true : Boolean(policy.requiresApproval),
      minServiceDays: policy.minServiceDays != null ? String(policy.minServiceDays) : '',
      effectiveFrom: policy.effectiveFrom || '',
      effectiveTo: policy.effectiveTo || '',
      isActive: policy.isActive == null ? true : Boolean(policy.isActive),
      description: policy.description || '',
    })
  }

  const toNumber = (value: string) => (value.trim() === '' ? null : Number(value))

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Policy name is required')
      return
    }

    if (!formData.annualEntitlement) {
      toast.error('Annual entitlement is required')
      return
    }

    try {
      setSaving(true)
      const payload = {
        name: formData.name.trim(),
        leaveType: formData.leaveType,
        annualEntitlement: Number(formData.annualEntitlement),
        accrualFrequency: formData.accrualFrequency,
        carryForwardLimit: toNumber(formData.carryForwardLimit),
        maxBalance: toNumber(formData.maxBalance),
        allowNegative: formData.allowNegative,
        requiresApproval: formData.requiresApproval,
        minServiceDays: toNumber(formData.minServiceDays),
        effectiveFrom: formData.effectiveFrom || null,
        effectiveTo: formData.effectiveTo || null,
        isActive: formData.isActive,
        description: formData.description || null,
      }

      if (editing) {
        await leavePolicyApi.update(editing.id, payload)
        toast.success('Leave policy updated')
      } else {
        await leavePolicyApi.create(payload)
        toast.success('Leave policy created')
      }

      resetForm()
      loadPolicies()
    } catch (error) {
      console.error('Failed to save leave policy', error)
      toast.error('Failed to save leave policy')
    } finally {
      setSaving(false)
    }
  }

  const togglePolicy = async (policy: LeavePolicy) => {
    try {
      await leavePolicyApi.toggle(policy.id, !policy.isActive)
      toast.success('Policy updated')
      loadPolicies()
    } catch (error) {
      console.error('Failed to update policy', error)
      toast.error('Failed to update policy')
    }
  }

  const sortedPolicies = useMemo(
    () => [...policies].sort((a, b) => a.name.localeCompare(b.name)),
    [policies],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Policies</h1>
          <p className="text-sm text-gray-500">Define entitlements, accrual rules, and approvals.</p>
        </div>
        {editing && (
          <button
            type="button"
            onClick={resetForm}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel editing
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Policy Name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Leave Type *</label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={(event) => setFormData((prev) => ({ ...prev, leaveType: event.target.value as LeaveType }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {LEAVE_TYPES.map((type) => (
                <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Annual Entitlement *</label>
            <input
              type="number"
              step="0.5"
              name="annualEntitlement"
              value={formData.annualEntitlement}
              onChange={(event) => setFormData((prev) => ({ ...prev, annualEntitlement: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Accrual Frequency</label>
            <select
              name="accrualFrequency"
              value={formData.accrualFrequency}
              onChange={(event) => setFormData((prev) => ({ ...prev, accrualFrequency: event.target.value as AccrualFrequency }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {ACCRUAL_FREQUENCIES.map((freq) => (
                <option key={freq} value={freq}>{freq.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Carry Forward Limit</label>
            <input
              type="number"
              step="0.5"
              name="carryForwardLimit"
              value={formData.carryForwardLimit}
              onChange={(event) => setFormData((prev) => ({ ...prev, carryForwardLimit: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Balance</label>
            <input
              type="number"
              step="0.5"
              name="maxBalance"
              value={formData.maxBalance}
              onChange={(event) => setFormData((prev) => ({ ...prev, maxBalance: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Service Days</label>
            <input
              type="number"
              name="minServiceDays"
              value={formData.minServiceDays}
              onChange={(event) => setFormData((prev) => ({ ...prev, minServiceDays: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Effective From</label>
            <input
              type="date"
              name="effectiveFrom"
              value={formData.effectiveFrom}
              onChange={(event) => setFormData((prev) => ({ ...prev, effectiveFrom: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Effective To</label>
            <input
              type="date"
              name="effectiveTo"
              value={formData.effectiveTo}
              onChange={(event) => setFormData((prev) => ({ ...prev, effectiveTo: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={formData.requiresApproval}
              onChange={(event) => setFormData((prev) => ({ ...prev, requiresApproval: event.target.checked }))}
            />
            Requires approval
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={formData.allowNegative}
              onChange={(event) => setFormData((prev) => ({ ...prev, allowNegative: event.target.checked }))}
            />
            Allow negative balance
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(event) => setFormData((prev) => ({ ...prev, isActive: event.target.checked }))}
            />
            Active
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            rows={3}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : editing ? 'Save changes' : 'Create policy'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Existing policies</h2>
          <span className="text-xs text-gray-500">{policies.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="px-4 py-3">Policy</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Entitlement</th>
                <th className="px-4 py-3">Accrual</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto" />
                  </td>
                </tr>
              ) : sortedPolicies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
                    No leave policies yet.
                  </td>
                </tr>
              ) : (
                sortedPolicies.map((policy) => (
                  <tr key={policy.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{policy.name}</div>
                      <div className="text-xs text-gray-500">{policy.description || 'No description'}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{policy.leaveType.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-gray-600">{policy.annualEntitlement}</td>
                    <td className="px-4 py-3 text-gray-600">{policy.accrualFrequency || 'MONTHLY'}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => togglePolicy(policy)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${policy.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {policy.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => startEdit(policy)}
                        className="text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default LeavePoliciesPage
