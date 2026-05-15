export interface User {
  id: string
  email: string
  fullName: string
  phone: string
  role: string
  roles: string[]
  permissions: string[]
  officeLocation: string
  isActive: boolean
  lastLogin: string | null
  avatarUrl: string | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T | null
  errors: Record<string, string> | null
  timestamp: string
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  timestamp: number
}

export interface UserSettings {
  theme: 'light' | 'dark'
  language: 'en' | 'es' | 'fr' | 'de'
  timezone: string
  notificationsEnabled: boolean
  emailNotifications: boolean
  inAppNotifications: boolean
  autoRefresh: boolean
  itemsPerPage: number
}

// Generic pagination interface
export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  hasContent: boolean
  first: boolean
  last: boolean
}

// Export auth types
export type { CreateUserRequest, UpdateUserRequest } from './auth'

// Export CRM types (selective to avoid conflicts)
export type { Account, Contact, Lead, Deal, Quote, Activity } from './crm'

// Export ERP types (selective to avoid conflicts)
export type { Equipment, SparePart, PurchaseInvoice, InvoiceItem } from './erp'

// Export Finance types (selective to avoid conflicts)
export type { Payment, CurrencyRate, Invoice, InvoiceEntity, InvoiceStatus, InvoiceType } from './finance'
