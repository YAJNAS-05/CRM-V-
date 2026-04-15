/// <reference types="vite/client" />
import axios from 'axios';
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
import { useAuthStore } from '../store/authStore';

const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Invoice API
export const invoiceApi = {
  getAll: (page = 0, size = 20) =>
    api.get<ApiResponse<{ content: Invoice[] }>>(`/finance/invoices?page=${page}&size=${size}`),
  
  getById: (id: string) =>
    api.get<ApiResponse<Invoice>>(`/finance/invoices/${id}`),
  
  getByNumber: (invoiceNumber: string) =>
    api.get<ApiResponse<Invoice>>(`/finance/invoices/number/${invoiceNumber}`),
  
  getByAccount: (accountId: string, page = 0, size = 20) =>
    api.get<ApiResponse<{ content: Invoice[] }>>(`/finance/invoices/account/${accountId}?page=${page}&size=${size}`),
  
  getByStatus: (status: InvoiceStatus, page = 0, size = 20) =>
    api.get<ApiResponse<{ content: Invoice[] }>>(`/finance/invoices/status/${status}?page=${page}&size=${size}`),
  
  getByEntity: (entity: InvoiceEntity, page = 0, size = 20) =>
    api.get<ApiResponse<{ content: Invoice[] }>>(`/finance/invoices/entity/${entity}?page=${page}&size=${size}`),
  
  getOverdue: () =>
    api.get<ApiResponse<Invoice[]>>(`/finance/invoices/overdue`),
  
  create: (data: CreateInvoiceRequest) =>
    api.post<ApiResponse<Invoice>>('/finance/invoices', data),
  
  update: (id: string, data: UpdateInvoiceRequest) =>
    api.put<ApiResponse<Invoice>>(`/finance/invoices/${id}`, data),
  
  updateStatus: (id: string, status: InvoiceStatus) =>
    api.patch<ApiResponse<Invoice>>(`/finance/invoices/${id}/status?status=${status}`),
  
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/finance/invoices/${id}`),
};

// Payment API
export const paymentApi = {
  getAll: (page = 0, size = 20) =>
    api.get<ApiResponse<{ content: Payment[] }>>(`/finance/payments?page=${page}&size=${size}`),
  
  getById: (id: string) =>
    api.get<ApiResponse<Payment>>(`/finance/payments/${id}`),
  
  getByInvoice: (invoiceId: string) =>
    api.get<ApiResponse<Payment[]>>(`/finance/payments/invoice/${invoiceId}`),
  
  create: (data: CreatePaymentRequest) =>
    api.post<ApiResponse<Payment>>('/finance/payments', data),
  
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/finance/payments/${id}`),
};

// Currency Rate API
export const currencyRateApi = {
  getAll: () =>
    api.get<ApiResponse<CurrencyRate[]>>('/finance/currency-rates'),
  
  getById: (id: string) =>
    api.get<ApiResponse<CurrencyRate>>(`/finance/currency-rates/${id}`),
  
  getLatest: (baseCurrency: string, targetCurrency: string) =>
    api.get<ApiResponse<CurrencyRate>>(`/finance/currency-rates/latest?baseCurrency=${baseCurrency}&targetCurrency=${targetCurrency}`),
  
  getByBaseCurrency: (baseCurrency: string) =>
    api.get<ApiResponse<CurrencyRate[]>>(`/finance/currency-rates/base/${baseCurrency}`),
  
  convert: (amount: number, fromCurrency: string, toCurrency: string) =>
    api.get<ApiResponse<number>>(`/finance/currency-rates/convert?amount=${amount}&fromCurrency=${fromCurrency}&toCurrency=${toCurrency}`),
  
  create: (data: CreateCurrencyRateRequest) =>
    api.post<ApiResponse<CurrencyRate>>('/finance/currency-rates', data),
  
  update: (baseCurrency: string, targetCurrency: string, rate: number) =>
    api.put<ApiResponse<CurrencyRate>>(`/finance/currency-rates?baseCurrency=${baseCurrency}&targetCurrency=${targetCurrency}&rate=${rate}`),
  
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/finance/currency-rates/${id}`),
};

// Report API
export const reportApi = {
  getPnL: (entity?: InvoiceEntity, startDate?: string, endDate?: string) =>
    api.get<ApiResponse<any>>('/finance/reports/p-l', { params: { entity, startDate, endDate } }),
  
  getArAging: () =>
    api.get<ApiResponse<any>>('/finance/reports/ar-aging'),
  
  getCashFlow: (startDate: string, endDate: string) =>
    api.get<ApiResponse<any>>('/finance/reports/cash-flow', { params: { startDate, endDate } }),
};

export default api;
