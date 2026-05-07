/**
 * Centralised application logger.
 *
 * Replace scattered `console.error(...)` / `console.warn(...)` calls with
 * `logger.error(...)` / `logger.warn(...)` so that log records can be
 * captured, filtered and — in production — forwarded to an observability
 * platform (Sentry, Datadog, etc.) by swapping the `forwardToRemote` body.
 *
 * Usage:
 *   import logger from '../utils/logger'
 *   logger.error('UserService', 'Failed to load user', err)
 *   logger.warn('FinanceApi', 'Retrying request', { attempt: 2 })
 *   logger.info('App', 'Mounted')
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  context: string
  message: string
  data?: unknown
  timestamp: string
}

const isDev = import.meta.env.DEV

/** In-memory ring buffer (last 200 entries) for dev tools / diagnostics */
const _buffer: LogEntry[] = []
const BUFFER_MAX = 200

function record(entry: LogEntry) {
  if (_buffer.length >= BUFFER_MAX) _buffer.shift()
  _buffer.push(entry)
}

/** Override this in production to forward to Sentry / Datadog / custom API */
function forwardToRemote(_entry: LogEntry) {
  // Example Sentry integration:
  // if (entry.level === 'error') Sentry.captureException(entry.data ?? new Error(entry.message), { extra: entry })
}

function emit(level: LogLevel, context: string, message: string, data?: unknown) {
  const entry: LogEntry = { level, context, message, data, timestamp: new Date().toISOString() }
  record(entry)

  if (isDev) {
    const tag = `[${context}]`
    switch (level) {
      case 'debug': console.debug(tag, message, ...(data !== undefined ? [data] : [])); break
      case 'info':  console.info(tag, message,  ...(data !== undefined ? [data] : [])); break
      case 'warn':  console.warn(tag, message,  ...(data !== undefined ? [data] : [])); break
      case 'error': console.error(tag, message, ...(data !== undefined ? [data] : [])); break
    }
  } else if (level === 'error' || level === 'warn') {
    forwardToRemote(entry)
  }
}

const logger = {
  debug: (context: string, message: string, data?: unknown) => emit('debug', context, message, data),
  info:  (context: string, message: string, data?: unknown) => emit('info',  context, message, data),
  warn:  (context: string, message: string, data?: unknown) => emit('warn',  context, message, data),
  error: (context: string, message: string, data?: unknown) => emit('error', context, message, data),
  /** Returns a copy of the in-memory log buffer (useful for support/debug panels) */
  getBuffer: (): Readonly<LogEntry[]> => [..._buffer],
  /** Clears the in-memory buffer */
  clearBuffer: () => { _buffer.length = 0 },
}

export type { LogEntry, LogLevel }
export default logger
