import { useState, useEffect } from 'react'
import { warrantyApi } from '../../api/warrantyApi'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { Shield, Wrench, CheckCircle, AlertCircle, Clock, Plus, Edit2, Eye } from 'lucide-react'

interface WarrantyClaim {
  id: string
  claimNumber: string
  equipmentId: string
  equipmentName: string
  customerId: string
  customerName: string
  serialNumber: string
  warrantyType: 'MANUFACTURER' | 'EXTENDED' | 'SERVICE' | 'PARTS_ONLY' | 'LABOR_ONLY'
  issueDescription: string
  failureDate: string
  reportedDate: string
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REPAIR_IN_PROGRESS' | 'PARTS_ORDERED' | 'COMPLETED' | 'REJECTED' | 'VENDOR_SUBMITTED' | 'VENDOR_REIMBURSED'
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  assignedEngineerId?: string
  assignedEngineerName?: string
  laborCost?: number
  partsCost?: number
  totalClaimAmount?: number
  resolutionNotes?: string
  resolutionDate?: string
  isUnderWarranty: boolean
}

interface WarrantyDashboard {
  totalClaims: number
  pendingClaims: number
  approvedClaims: number
  completedClaims: number
  rejectedClaims: number
  totalClaimAmount: number
  approvedAmount: number
  pendingAmount: number
  vendorReimbursedAmount: number
  claimApprovalRate: number
}

export default function WarrantyManagementPage() {
  const [claims, setClaims] = useState<WarrantyClaim[]>([])
  const [dashboard, setDashboard] = useState<WarrantyDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedClaim, setSelectedClaim] = useState<WarrantyClaim | null>(null)

  useEffect(() => {
    loadData()
  }, [statusFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      const [claimsRes, dashboardRes] = await Promise.all([
        statusFilter 
          ? warrantyApi.getByStatus(statusFilter)
          : warrantyApi.getAll(),
        warrantyApi.getDashboard(),
      ])
      setClaims(claimsRes.data.data?.content || [])
      setDashboard(dashboardRes.data.data)
    } catch (error) {
      console.error('Failed to load warranty data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'APPROVED':
      case 'REPAIR_IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'UNDER_REVIEW':
        return 'bg-purple-100 text-purple-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'PARTS_ORDERED':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-red-600'
      case 'HIGH':
        return 'text-orange-600'
      case 'MEDIUM':
        return 'text-yellow-600'
      case 'LOW':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warranty Management</h1>
          <p className="text-sm text-gray-500">Track and manage warranty claims and repairs</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Plus className="w-4 h-4" />
          New Claim
        </button>
      </div>

      {/* Dashboard Stats */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Total Claims</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{dashboard.totalClaims}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-700">{dashboard.pendingClaims}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Wrench className="w-4 h-4" />
              <span className="text-sm">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{dashboard.approvedClaims}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Completed</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{dashboard.completedClaims}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <span className="text-sm">Total Value</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(dashboard.totalClaimAmount)}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <span className="text-sm">Approval Rate</span>
            </div>
            <p className="text-2xl font-bold text-indigo-700">{dashboard.claimApprovalRate.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REPAIR_IN_PROGRESS">Repair In Progress</option>
          <option value="PARTS_ORDERED">Parts Ordered</option>
          <option value="COMPLETED">Completed</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Claim #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {claims.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    No warranty claims found
                  </td>
                </tr>
              ) : (
                claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{claim.claimNumber}</p>
                      <p className="text-xs text-gray-500">{formatDate(claim.reportedDate)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{claim.equipmentName}</p>
                      <p className="text-xs text-gray-500">S/N: {claim.serialNumber}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{claim.customerName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600 truncate max-w-xs">{claim.issueDescription}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs text-gray-600">{claim.warrantyType.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium ${getPriorityColor(claim.priority)}`}>
                        {claim.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(claim.status)}`}>
                        {claim.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(claim.totalClaimAmount || 0)}
                      </p>
                      {claim.laborCost || claim.partsCost ? (
                        <p className="text-xs text-gray-500">
                          L: {formatCurrency(claim.laborCost || 0)} P: {formatCurrency(claim.partsCost || 0)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedClaim(claim)}
                          className="p-1 text-gray-400 hover:text-indigo-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Detail Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Warranty Claim Details</h2>
                <button
                  onClick={() => setSelectedClaim(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Claim Number</p>
                  <p className="font-medium">{selectedClaim.claimNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(selectedClaim.status)}`}>
                    {selectedClaim.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Equipment</p>
                  <p className="font-medium">{selectedClaim.equipmentName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Serial Number</p>
                  <p className="font-medium">{selectedClaim.serialNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="font-medium">{selectedClaim.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Warranty Type</p>
                  <p className="font-medium">{selectedClaim.warrantyType.replace('_', ' ')}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Issue Description</p>
                <p className="text-sm mt-1">{selectedClaim.issueDescription}</p>
              </div>
              {selectedClaim.resolutionNotes && (
                <div>
                  <p className="text-xs text-gray-500">Resolution Notes</p>
                  <p className="text-sm mt-1">{selectedClaim.resolutionNotes}</p>
                </div>
              )}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">Costs</p>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <p className="text-xs text-gray-400">Labor</p>
                    <p className="font-medium">{formatCurrency(selectedClaim.laborCost || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Parts</p>
                    <p className="font-medium">{formatCurrency(selectedClaim.partsCost || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="font-bold text-indigo-600">{formatCurrency(selectedClaim.totalClaimAmount || 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
