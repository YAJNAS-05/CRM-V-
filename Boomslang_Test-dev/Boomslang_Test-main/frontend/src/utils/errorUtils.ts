/**
 * Extracts the most meaningful error message from an axios error or
 * any thrown value, falling back progressively through known shapes.
 */
export function getErrorMessage(err: unknown, fallback = 'An unexpected error occurred'): string {
  if (!err) return fallback
  if (typeof err === 'string') return err
  // Axios error response body
  const e = err as any
  if (e?.response?.data?.message) return e.response.data.message
  if (e?.response?.data?.error) return e.response.data.error
  if (e?.response?.data && typeof e.response.data === 'string') return e.response.data
  // Standard JS Error
  if (e?.message) return e.message
  return fallback
}
