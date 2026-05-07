import { useEffect, useRef } from 'react'

/**
 * Returns an AbortController that is automatically aborted when the
 * component unmounts, preventing setState calls on unmounted components
 * and cancelling in-flight requests.
 *
 * Usage:
 *   const { signal } = useAbortController()
 *   const response = await api.get('/path', { signal })
 */
export function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null)

  if (!controllerRef.current) {
    controllerRef.current = new AbortController()
  }

  useEffect(() => {
    return () => {
      controllerRef.current?.abort()
    }
  }, [])

  return { signal: controllerRef.current.signal }
}
