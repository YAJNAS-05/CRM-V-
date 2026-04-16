/// <reference types="vite/client" />
import { ApiResponse } from '../types';
import {
  Invoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoiceStatus,
  InvoiceEntity,
  Payment,
  CreatePaymentRequest,
  CurrencyRate,
  CreateCurrencyRateRequest
} from '../types/finance';
import axiosInstance from './axiosInstance';

const api = axiosInstance;

// Invoice API
export const invoiceApi = {
  getAll: (page = 0, size = 20) =>
    api.get<ApiResponse<{ content: Invoice[] }>>(`/v1/finance/invoices?page=${page}&size=${size}`),
  
  getById: (id: string) =>
    api.get<ApiResponse<Invoice>>(`/v1/finance/invoices/${id}`),
  
  getByNumber: (invoiceNumber: string) =>
    api.get<ApiResponse<Invoice>>(`/v1/finance/invoices/number/${invoiceNumber}`),
  
  getByAccount: (accountId: string, page = 0, size = 20) =>
    api.get<ApiResponse<{ content: Invoice[] }>>(`/v1/finance/invoices/account/${accountId}?page=${page}&size=${size}`),
  
  getByStatus: (status: InvoiceStatus, page = 0, size = 20) =>
    api.get<ApiResponse<{ content: Invoice[] }>>(`/v1/finance/invoices/status/${status}?page=${page}&size=${size}`),
  
  getByEntity: (entity: InvoiceEntity, page = 0, size = 20) =>
    api.get<ApiResponse<{ content: Invoice[] }>>(`/v1/finance/invoices/entity/${entity}?page=${page}&size=${size}`),
  
  getOverdue: () =>
    api.get<ApiResponse<Invoice[]>>(`/v1/finance/invoices/overdue`),
  
  create: (data: CreateInvoiceRequest) =>
    api.post<ApiResponse<Invoice>>('/v1/finance/invoices', data),
  
  update: (id: string, data: UpdateInvoiceRequest) =>
    api.put<ApiResponse<Invoice>>(`/v1/finance/invoices/${id}`, data),
  
  updateStatus: (id: string, status: InvoiceStatus) =>
    api.patch<ApiResponse<Invoice>>(`/v1/finance/invoices/${id}/status?status=${status}`),
  
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/v1/finance/invoices/${id}`),
};

// Payment API
export const paymentApi = {
  getAll: (page = 0, size = 20) =>
    api.get<ApiResponse<{ content: Payment[] }>>(`/v1/finance/payments?page=${page}&size=${size}`),
  
  getById: (id: string) =>
    api.get<ApiResponse<Payment>>(`/v1/finance/payments/${id}`),
  
  getByInvoice: (invoiceId: string) =>
    api.get<ApiResponse<Payment[]>>(`/v1/finance/payments/invoice/${invoiceId}`),
  
  create: (data: CreatePaymentRequest) =>
    api.post<ApiResponse<Payment>>('/v1/finance/payments', data),
  
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/v1/finance/payments/${id}`),
};

// Currency Rate API
export const currencyRateApi = {
  getAll: () =>
    api.get<ApiResponse<CurrencyRate[]>>('/v1/finance/currency-rates'),
  
  getById: (id: string) =>
    api.get<ApiResponse<CurrencyRate>>(`/v1/finance/currency-rates/${id}`),
  
  getLatest: (baseCurrency: string, targetCurrency: string) =>
    api.get<ApiResponse<CurrencyRate>>(`/v1/finance/currency-rates/latest?baseCurrency=${baseCurrency}&targetCurrency=${targetCurrency}`),
  
  getByBaseCurrency: (baseCurrency: string) =>
    api.get<ApiResponse<CurrencyRate[]>>(`/v1/finance/currency-rates/base/${baseCurrency}`),
  
  convert: (amount: number, fromCurrency: string, toCurrency: string) =>
    api.get<ApiResponse<number>>(`/v1/finance/currency-rates/convert?amount=${amount}&fromCurrency=${fromCurrency}&toCurrency=${toCurrency}`),
  
  create: (data: CreateCurrencyRateRequest) =>
    api.post<ApiResponse<CurrencyRate>>('/v1/finance/currency-rates', data),
  
  update: (baseCurrency: string, targetCurrency: string, rate: number) =>
    api.put<ApiResponse<CurrencyRate>>(`/v1/finance/currency-rates?baseCurrency=${baseCurrency}&targetCurrency=${targetCurrency}&rate=${rate}`),
  
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/v1/finance/currency-rates/${id}`),
};

// Report API
export const reportApi = {
  getPnL: (entity?: InvoiceEntity, startDate?: string, endDate?: string) =>
    api.get<ApiResponse<any>>('/v1/finance/reports/p-l', { params: { entity, startDate, endDate } }),
  
  getArAging: () =>
    api.get<ApiResponse<any>>('/v1/finance/reports/ar-aging'),
  
  getCashFlow: (startDate: string, endDate: string) =>
    api.get<ApiResponse<any>>('/v1/finance/reports/cash-flow', { params: { startDate, endDate } }),
};

export default api;
