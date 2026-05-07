import { useEffect, useRef } from 'react'
import axiosInstance from '../api/axiosInstance'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import logger from '../utils/logger'

/**
 * Polls the server for new notifications every `intervalMs` ms.
 *
 * The backend is expected to expose:
 *   GET /v1/notifications/unread
 *   Response: { data: { content: Array<{id, title, message, type, createdAt}> } }
 *
 * If the endpoint is unavailable the hook silently stops polling after
 * `MAX_FAILURES` consecutive 4xx/5xx errors, preventing console noise in
 * environments where the endpoint has not yet been deployed.
 */

const POLL_ENDPOINT = '/v1/notifications/unread'
const MAX_FAILURES = 3

interface ServerNotification {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  createdAt: string
}

export function useNotificationPolling(intervalMs = 30_000) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const addNotification = useNotificationStore(s => s.addNotification)
  const seenIds = useRef<Set<string>>(new Set())
  const failures = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      return
    }

    let cancelled = false

    async function poll() {
      if (cancelled || failures.current >= MAX_FAILURES) return

      try {
        const res = await axiosInstance.get<{ data: { content: ServerNotification[] } }>(POLL_ENDPOINT, {
          timeout: 8000,
        })
        failures.current = 0
        const items: ServerNotification[] = res.data?.data?.content ?? []

        for (const item of items) {
          if (seenIds.current.has(item.id)) continue
          seenIds.current.add(item.id)
          addNotification({
            type: item.type ?? 'info',
            title: item.title,
            message: item.message,
            dedupeKey: item.id,
            duration: 0, // persistent until dismissed
          })
        }
      } catch (err: unknown) {
        failures.current++
        if (failures.current >= MAX_FAILURES) {
          logger.warn('useNotificationPolling', `Stopped polling after ${MAX_FAILURES} failures`, err)
        }
      }

      if (!cancelled) {
        timerRef.current = setTimeout(poll, intervalMs)
      }
    }

    // Small initial delay to avoid blocking app startup
    timerRef.current = setTimeout(poll, 3000)

    return () => {
      cancelled = true
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [intervalMs, addNotification])
}

export default useNotificationPolling
