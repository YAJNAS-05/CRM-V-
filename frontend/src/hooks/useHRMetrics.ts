import { useCallback, useEffect, useState } from 'react'
import { dashboardApi } from '../api/dashboardApi'
import { HRDashboardMetrics } from '../types/hr'

const defaultMetrics: HRDashboardMetrics = {
  totalEmployees: 0,
  activeEmployees: 0,
  newHiresThisMonth: 0,
  attritionRate: 0,
  pendingLeaves: 0,
  approvedLeaves: 0,
  upcomingLeaves: 0,
  pendingTimesheets: 0,
  complianceRate: 0,
  openPositions: 0,
  trainingCompleted: 0,
  pendingReimbursements: 0,
  nextPayrollAmount: 0,
  daysToNextPayRun: 0,
  visasExpiring: 0,
  onboardingInProgress: 0,
}

export const useHRMetrics = () => {
  const [metrics, setMetrics] = useState<HRDashboardMetrics>(defaultMetrics)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await dashboardApi.getHRMetrics()
      const data = response.data?.data
      const normalizedEntries = Object.entries(data ?? {}) as Array<[
        keyof HRDashboardMetrics,
        number | null | undefined,
      ]>
      const normalized = normalizedEntries.reduce<Partial<HRDashboardMetrics>>((acc, [key, value]) => {
        acc[key] = value ?? 0
        return acc
      }, {})
      setMetrics({ ...defaultMetrics, ...normalized })
    } catch (err) {
      console.error('Failed to load HR metrics', err)
      setError('Failed to load HR metrics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMetrics()
  }, [loadMetrics])

  return { metrics, loading, error, refresh: loadMetrics }
}
