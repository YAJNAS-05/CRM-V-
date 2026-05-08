import { useState } from 'react';

// Validation utilities and schemas for form data

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  email?: boolean;
  url?: boolean;
  custom?: (value: any) => string | null;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

export class FormValidator {
  /**
   * Validate a single field against a rule
   */
  static validateField(value: any, rule: ValidationRule): string | null {
    // Required validation
    if (rule.required && (value === null || value === undefined || value === '')) {
      return 'This field is required';
    }

    // Skip other validations if field is empty and not required
    if (!rule.required && (value === null || value === undefined || value === '')) {
      return null;
    }

    // String validations
    if (typeof value === 'string') {
      // Min length
      if (rule.minLength && value.length < rule.minLength) {
        return `Minimum length is ${rule.minLength} characters`;
      }

      // Max length
      if (rule.maxLength && value.length > rule.maxLength) {
        return `Maximum length is ${rule.maxLength} characters`;
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value)) {
        return 'Invalid format';
      }

      // Email validation
      if (rule.email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          return 'Invalid email address';
        }
      }

      // URL validation
      if (rule.url) {
        try {
          new URL(value);
        } catch {
          return 'Invalid URL';
        }
      }
    }

    // Number validations
    if (typeof value === 'number') {
      // Min value
      if (rule.min !== undefined && value < rule.min) {
        return `Minimum value is ${rule.min}`;
      }

      // Max value
      if (rule.max !== undefined && value > rule.max) {
        return `Maximum value is ${rule.max}`;
      }
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }

  /**
   * Validate an entire object against a schema
   */
  static validate(data: any, schema: ValidationSchema): ValidationResult {
    const errors: { [key: string]: string } = {};

    for (const [field, rule] of Object.entries(schema)) {
      const error = this.validateField(data[field], rule);
      if (error) {
        errors[field] = error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate a single field from an object
   */
  static validateFieldFromObject(data: any, field: string, schema: ValidationSchema): string | null {
    const rule = schema[field];
    if (!rule) {
      return null;
    }

    return this.validateField(data[field], rule);
  }
}

// Predefined validation schemas
export const ValidationSchemas = {
  // Integration validation schema
  integration: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\s\-_]+$/
    },
    description: {
      required: false,
      maxLength: 500
    },
    provider: {
      required: true,
      minLength: 2,
      maxLength: 100
    },
    baseUrl: {
      required: false,
      url: true
    },
    category: {
      required: true,
      custom: (value: string) => {
        const validCategories = ['CRM', 'ERP', 'FINANCE', 'HR', 'MARKETING', 'ANALYTICS', 'COMMUNICATION', 'SECURITY', 'OTHER'];
        if (!validCategories.includes(value)) {
          return 'Invalid category';
        }
        return null;
      }
    },
    type: {
      required: true,
      custom: (value: string) => {
        const validTypes = ['API_REST', 'API_GRAPHQL', 'DATABASE', 'WEBHOOK', 'MESSAGE_QUEUE'];
        if (!validTypes.includes(value)) {
          return 'Invalid integration type';
        }
        return null;
      }
    },
    authenticationType: {
      required: true,
      custom: (value: string) => {
        const validAuthTypes = ['API_KEY', 'OAUTH2', 'BEARER_TOKEN', 'BASIC_AUTH'];
        if (!validAuthTypes.includes(value)) {
          return 'Invalid authentication type';
        }
        return null;
      }
    }
  },

  // Webhook validation schema
  webhook: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\s\-_]+$/
    },
    url: {
      required: true,
      url: true
    },
    events: {
      required: true,
      custom: (value: string[]) => {
        if (!Array.isArray(value) || value.length === 0) {
          return 'At least one event must be selected';
        }
        return null;
      }
    },
    secret: {
      required: false,
      minLength: 8,
      maxLength: 100
    },
    retryPolicy: {
      required: true,
      custom: (value: any) => {
        if (!value || typeof value !== 'object') {
          return 'Retry policy is required';
        }
        if (typeof value.maxAttempts !== 'number' || value.maxAttempts < 1 || value.maxAttempts > 10) {
          return 'Max attempts must be between 1 and 10';
        }
        if (!['LINEAR', 'EXPONENTIAL', 'FIXED'].includes(value.backoffStrategy)) {
          return 'Invalid backoff strategy';
        }
        return null;
      }
    }
  },

  // User validation schema
  user: {
    firstName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/
    },
    lastName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/
    },
    email: {
      required: true,
      email: true
    },
    role: {
      required: true,
      custom: (value: string) => {
        const validRoles = ['ADMIN', 'MANAGER', 'USER', 'VIEWER'];
        if (!validRoles.includes(value)) {
          return 'Invalid role';
        }
        return null;
      }
    }
  },

  // Configuration validation schema
  configuration: {
    timeout: {
      required: true,
      min: 1000,
      max: 300000
    },
    retryPolicy: {
      required: true,
      custom: (value: any) => {
        if (!value || typeof value !== 'object') {
          return 'Retry policy is required';
        }
        if (typeof value.maxAttempts !== 'number' || value.maxAttempts < 1 || value.maxAttempts > 10) {
          return 'Max attempts must be between 1 and 10';
        }
        if (!['LINEAR', 'EXPONENTIAL', 'FIXED'].includes(value.backoffStrategy)) {
          return 'Invalid backoff strategy';
        }
        return null;
      }
    },
    rateLimit: {
      required: true,
      custom: (value: any) => {
        if (!value || typeof value !== 'object') {
          return 'Rate limit configuration is required';
        }
        if (typeof value.requestsPerSecond !== 'number' || value.requestsPerSecond < 1) {
          return 'Requests per second must be at least 1';
        }
        return null;
      }
    }
  }
};

// Custom validation functions
export const CustomValidators = {
  // Validate API key format
  apiKey: (value: string) => {
    const apiKeyPattern = /^[a-zA-Z0-9\-_]{16,}$/;
    if (!apiKeyPattern.test(value)) {
      return 'API key must be at least 16 characters long and contain only letters, numbers, hyphens, and underscores';
    }
    return null;
  },

  // Validate OAuth configuration
  oauthConfig: (config: any) => {
    if (!config.clientId || !config.clientSecret) {
      return 'Client ID and Client Secret are required for OAuth';
    }
    if (!config.scope || config.scope.length === 0) {
      return 'At least one scope must be specified';
    }
    return null;
  },

  // Validate database connection string
  connectionString: (value: string) => {
    const dbPatterns = {
      postgres: /^postgres:\/\/.+/,
      mysql: /^mysql:\/\/.+/,
      mongodb: /^mongodb:\/\/.+/,
      sqlite: /^sqlite:.+/
    };

    const isValid = Object.values(dbPatterns).some(pattern => pattern.test(value));
    if (!isValid) {
      return 'Invalid database connection string format';
    }
    return null;
  },

  // Validate webhook events
  webhookEvents: (events: string[]) => {
    const validEvents = [
      'user.created', 'user.updated', 'user.deleted',
      'deal.created', 'deal.won', 'deal.lost',
      'lead.created', 'lead.assigned',
      'task.completed', 'task.created',
      'project.milestone', 'budget.exceeded',
      'support.ticket.created', 'support.ticket.resolved',
      'opportunity.stage.changed', 'customer.churn.risk',
      'page.view', 'user.login', 'feature.usage'
    ];

    const invalidEvents = events.filter(event => !validEvents.includes(event));
    if (invalidEvents.length > 0) {
      return `Invalid events: ${invalidEvents.join(', ')}`;
    }
    return null;
  },

  // Validate port number
  port: (value: number) => {
    if (value < 1 || value > 65535) {
      return 'Port must be between 1 and 65535';
    }
    return null;
  },

  // Validate IP address
  ipAddress: (value: string) => {
    const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Pattern = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    if (!ipv4Pattern.test(value) && !ipv6Pattern.test(value)) {
      return 'Invalid IP address format';
    }
    return null;
  },

  // Validate JSON string
  jsonString: (value: string) => {
    try {
      JSON.parse(value);
      return null;
    } catch {
      return 'Invalid JSON format';
    }
  },

  // Validate date range
  dateRange: (startDate: Date, endDate: Date) => {
    if (startDate >= endDate) {
      return 'End date must be after start date';
    }
    return null;
  }
};

// React hook for form validation
export interface UseFormValidationReturn<T> {
  values: T;
  errors: { [key in keyof T]?: string };
  touched: { [key in keyof T]?: boolean };
  isValid: boolean;
  isDirty: boolean;
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  validateField: (field: keyof T) => void;
  validateAll: () => boolean;
  reset: () => void;
  resetField: (field: keyof T) => void;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  schema: ValidationSchema
): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<{ [key in keyof T]?: string }>({});
  const [touched, setTouched] = useState<{ [key in keyof T]?: boolean }>({});

  const setValue = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate field on change
    const error = FormValidator.validateFieldFromObject(values, field as string, schema);
    setErrors(prev => ({ ...prev, [field]: error || undefined }));
  };

  const setValuesHandler = (newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
  };

  const validateField = (field: keyof T) => {
    const error = FormValidator.validateFieldFromObject(values, field as string, schema);
    setErrors(prev => ({ ...prev, [field]: error || undefined }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateAll = () => {
    const result = FormValidator.validate(values, schema);
    setErrors(result.errors);
    setTouched(
      Object.keys(schema).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
    return result.isValid;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  const resetField = (field: keyof T) => {
    setValues(prev => ({ ...prev, [field]: initialValues[field] }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setTouched(prev => ({ ...prev, [field]: false }));
  };

  const isValid = Object.keys(errors).every(key => !errors[key as keyof T]);
  const isDirty = Object.keys(touched).some(key => touched[key as keyof T]);

  return {
    values,
    errors,
    touched,
    isValid,
    isDirty,
    setValue,
    setValues: setValuesHandler,
    validateField,
    validateAll,
    reset,
    resetField
  };
}

export default FormValidator;
