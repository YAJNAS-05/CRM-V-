import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  errors?: string[];
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Filter parameters
export interface FilterParams {
  search?: string;
  status?: string;
  category?: string;
  [key: string]: any;
}

// CRUD Service Class
export class CRUDService<T> {
  private api: AxiosInstance;
  private endpoint: string;

  constructor(baseURL: string, endpoint: string, authToken?: string) {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
    });
    this.endpoint = endpoint;
  }

  // Create operation
  async create(data: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.post(
        this.endpoint,
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Read operations
  async getAll(
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<ApiResponse<T[]>> {
    try {
      const params = new URLSearchParams();
      
      if (pagination) {
        Object.entries(pagination).forEach(([key, value]) => {
          if (value !== undefined) params.append(key, String(value));
        });
      }
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') params.append(key, String(value));
        });
      }

      const response: AxiosResponse<ApiResponse<T[]>> = await this.api.get(
        `${this.endpoint}?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getById(id: string | number): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.get(
        `${this.endpoint}/${id}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Update operation
  async update(id: string | number, data: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.put(
        `${this.endpoint}/${id}`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Partial update (PATCH)
  async patch(id: string | number, data: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.patch(
        `${this.endpoint}/${id}`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Delete operation
  async delete(id: string | number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await this.api.delete(
        `${this.endpoint}/${id}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Bulk operations
  async bulkCreate(data: Partial<T>[]): Promise<ApiResponse<T[]>> {
    try {
      const response: AxiosResponse<ApiResponse<T[]>> = await this.api.post(
        `${this.endpoint}/bulk`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async bulkUpdate(updates: { id: string | number; data: Partial<T> }[]): Promise<ApiResponse<T[]>> {
    try {
      const response: AxiosResponse<ApiResponse<T[]>> = await this.api.put(
        `${this.endpoint}/bulk`,
        updates
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async bulkDelete(ids: (string | number)[]): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await this.api.delete(
        `${this.endpoint}/bulk`,
        { data: { ids } }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Custom query method
  async customQuery(query: string, variables?: any): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.post(
        `${this.endpoint}/query`,
        { query, variables }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Error handling
  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.statusText || 'Server error';
      const errors = error.response.data?.errors;
      return new Error(errors?.join(', ') || message);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error - no response received');
    } else {
      // Something else happened
      return new Error(error.message || 'Unknown error occurred');
    }
  }
}

// Pre-configured service instances for different modules
export class IntegrationCRUDService {
  private static getBaseURL(): string {
    return process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
  }

  private static getAuthToken(): string | undefined {
    return localStorage.getItem('authToken') || undefined;
  }

  // Integration module services
  static integrations = new CRUDService<any>(
    this.getBaseURL(),
    '/integrations',
    this.getAuthToken()
  );

  static webhooks = new CRUDService<any>(
    this.getBaseURL(),
    '/integrations/webhooks',
    this.getAuthToken()
  );

  static logs = new CRUDService<any>(
    this.getBaseURL(),
    '/integrations/logs',
    this.getAuthToken()
  );

  static analytics = new CRUDService<any>(
    this.getBaseURL(),
    '/integrations/analytics',
    this.getAuthToken()
  );

  static audit = new CRUDService<any>(
    this.getBaseURL(),
    '/integrations/audit',
    this.getAuthToken()
  );

  static backup = new CRUDService<any>(
    this.getBaseURL(),
    '/integrations/backup',
    this.getAuthToken()
  );

  static documentation = new CRUDService<any>(
    this.getBaseURL(),
    '/integrations/documentation',
    this.getAuthToken()
  );

  static security = new CRUDService<any>(
    this.getBaseURL(),
    '/integrations/security',
    this.getAuthToken()
  );

  static troubleshooting = new CRUDService<any>(
    this.getBaseURL(),
    '/integrations/troubleshooting',
    this.getAuthToken()
  );

  // CRM module services
  static leads = new CRUDService<any>(
    this.getBaseURL(),
    '/crm/leads',
    this.getAuthToken()
  );

  static contacts = new CRUDService<any>(
    this.getBaseURL(),
    '/crm/contacts',
    this.getAuthToken()
  );

  static accounts = new CRUDService<any>(
    this.getBaseURL(),
    '/crm/accounts',
    this.getAuthToken()
  );

  static deals = new CRUDService<any>(
    this.getBaseURL(),
    '/crm/deals',
    this.getAuthToken()
  );

  // ERP module services
  static inventory = new CRUDService<any>(
    this.getBaseURL(),
    '/erp/inventory',
    this.getAuthToken()
  );

  static purchaseOrders = new CRUDService<any>(
    this.getBaseURL(),
    '/erp/purchase-orders',
    this.getAuthToken()
  );

  static salesOrders = new CRUDService<any>(
    this.getBaseURL(),
    '/erp/sales-orders',
    this.getAuthToken()
  );

  // Finance module services
  static invoices = new CRUDService<any>(
    this.getBaseURL(),
    '/finance/invoices',
    this.getAuthToken()
  );

  static payments = new CRUDService<any>(
    this.getBaseURL(),
    '/finance/payments',
    this.getAuthToken()
  );

  static expenses = new CRUDService<any>(
    this.getBaseURL(),
    '/finance/expenses',
    this.getAuthToken()
  );

  // Security module services
  static users = new CRUDService<any>(
    this.getBaseURL(),
    '/security/users',
    this.getAuthToken()
  );

  static roles = new CRUDService<any>(
    this.getBaseURL(),
    '/security/roles',
    this.getAuthToken()
  );

  static permissions = new CRUDService<any>(
    this.getBaseURL(),
    '/security/permissions',
    this.getAuthToken()
  );

  // Analytics module services
  static reports = new CRUDService<any>(
    this.getBaseURL(),
    '/analytics/reports',
    this.getAuthToken()
  );

  static dashboards = new CRUDService<any>(
    this.getBaseURL(),
    '/analytics/dashboards',
    this.getAuthToken()
  );

  static metrics = new CRUDService<any>(
    this.getBaseURL(),
    '/analytics/metrics',
    this.getAuthToken()
  );

  // Performance module services
  static monitoring = new CRUDService<any>(
    this.getBaseURL(),
    '/performance/monitoring',
    this.getAuthToken()
  );

  static alerts = new CRUDService<any>(
    this.getBaseURL(),
    '/performance/alerts',
    this.getAuthToken()
  );

  static benchmarks = new CRUDService<any>(
    this.getBaseURL(),
    '/performance/benchmarks',
    this.getAuthToken()
  );
}

// Export default service for backward compatibility
export default IntegrationCRUDService;
