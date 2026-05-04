export enum InvoiceEntity {
  AUSTRALIA = 'AUSTRALIA',
  USA = 'USA',
  JAPAN = 'JAPAN'
}

export enum InvoiceType {
  PROFORMA = 'PROFORMA',
  TAX_INVOICE = 'TAX_INVOICE',
  CREDIT_NOTE = 'CREDIT_NOTE'
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  soId?: string;
  accountId: string;
  entity: InvoiceEntity;
  type: InvoiceType;
  status: InvoiceStatus;
  issueDate?: string;
  dueDate?: string;
  currency?: string;
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  paidAmount?: number;
  pdfUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceRequest {
  invoiceNumber: string;
  soId?: string;
  accountId: string;
  entity: InvoiceEntity;
  type: InvoiceType;
  issueDate?: string;
  dueDate?: string;
  currency?: string;
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  notes?: string;
}

export interface UpdateInvoiceRequest {
  status?: InvoiceStatus;
  issueDate?: string;
  dueDate?: string;
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  pdfUrl?: string;
  notes?: string;
}

export enum PaymentMethod {
  WIRE_TRANSFER = 'WIRE_TRANSFER',
  LC = 'LC',
  CREDIT_CARD = 'CREDIT_CARD',
  OTHER = 'OTHER'
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency?: string;
  paymentDate: string;
  method?: PaymentMethod;
  reference?: string;
  exchangeRate?: number;
  audEquivalent?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  invoiceId: string;
  amount: number;
  currency?: string;
  paymentDate: string;
  method?: PaymentMethod;
  reference?: string;
  exchangeRate?: number;
  audEquivalent?: number;
  notes?: string;
}

export interface CurrencyRate {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  fetchedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCurrencyRateRequest {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
}

export interface PnLReport {
  period: string
  revenue: number
  expenses: number
  netProfit: number
  grossMargin: number
  totalRevenue: number
  totalCost: number
  revenueByCategory: Record<string, number>
}

export interface ArAging {
  customer: string
  total: number
  current: number
  days30: number
  days60: number
  days90: number
  over90: number
  totalOutstanding: number
  totalOverdueCount: number
}

export interface CashFlow {
  date: string
  inflow: number
  outflow: number
  net: number
  totalInflow: number
  entries: CashFlow[]
}

export interface ThreeWayMatchException {
  id: string
  poId?: string | null
  invoiceId?: string | null
  receiptId?: string | null
  exceptionType: string
  varianceAmount?: number | string | null
  status: string
  periodEnd?: string | null
  notes?: string | null
  resolvedBy?: string | null
  resolvedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface ResolveMatchExceptionRequest {
  action?: string
  notes?: string
}
