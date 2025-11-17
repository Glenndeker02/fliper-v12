/**
 * Error handling utilities for the SwimEase app
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  TIMEOUT = 'TIMEOUT',
  STORAGE = 'STORAGE',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  statusCode?: number;
  retryable: boolean;
  userMessage: string;
}

/**
 * Create a standardized error object
 */
export const createAppError = (
  type: ErrorType,
  message: string,
  originalError?: Error,
  statusCode?: number
): AppError => {
  return {
    type,
    message,
    originalError,
    statusCode,
    retryable: isRetryable(type, statusCode),
    userMessage: getUserFriendlyMessage(type, statusCode),
  };
};

/**
 * Determine if an error is retryable
 */
const isRetryable = (type: ErrorType, statusCode?: number): boolean => {
  if (type === ErrorType.NETWORK || type === ErrorType.TIMEOUT) {
    return true;
  }

  if (statusCode) {
    // Retry on server errors (5xx) but not on client errors (4xx)
    return statusCode >= 500 && statusCode < 600;
  }

  return false;
};

/**
 * Get user-friendly error message
 */
const getUserFriendlyMessage = (type: ErrorType, statusCode?: number): string => {
  switch (type) {
    case ErrorType.NETWORK:
      return 'Unable to connect to the internet. Please check your connection and try again.';

    case ErrorType.TIMEOUT:
      return 'The request took too long. Please try again.';

    case ErrorType.AUTHENTICATION:
      return 'Your session has expired. Please sign in again.';

    case ErrorType.AUTHORIZATION:
      return 'You don\'t have permission to access this resource.';

    case ErrorType.NOT_FOUND:
      return 'The requested resource was not found.';

    case ErrorType.VALIDATION:
      return 'Please check your input and try again.';

    case ErrorType.STORAGE:
      return 'Unable to access local storage. Please check your device storage.';

    case ErrorType.API:
      if (statusCode === 429) {
        return 'Too many requests. Please wait a moment and try again.';
      }
      if (statusCode && statusCode >= 500) {
        return 'Our servers are experiencing issues. Please try again later.';
      }
      return 'Something went wrong. Please try again.';

    case ErrorType.UNKNOWN:
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Parse error from various sources
 */
export const parseError = (error: unknown): AppError => {
  // Network error
  if (error instanceof TypeError && error.message.includes('Network request failed')) {
    return createAppError(ErrorType.NETWORK, 'Network request failed', error as Error);
  }

  // Fetch/Axios error
  if (typeof error === 'object' && error !== null) {
    const err = error as any;

    // Timeout
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      return createAppError(ErrorType.TIMEOUT, 'Request timeout', err);
    }

    // HTTP response error
    if (err.response) {
      const statusCode = err.response.status;
      let type = ErrorType.API;

      if (statusCode === 401) type = ErrorType.AUTHENTICATION;
      if (statusCode === 403) type = ErrorType.AUTHORIZATION;
      if (statusCode === 404) type = ErrorType.NOT_FOUND;
      if (statusCode === 422) type = ErrorType.VALIDATION;

      return createAppError(
        type,
        err.response.data?.message || err.message || 'Request failed',
        err,
        statusCode
      );
    }

    // Network error
    if (err.request && !err.response) {
      return createAppError(ErrorType.NETWORK, 'No response from server', err);
    }
  }

  // Generic error
  if (error instanceof Error) {
    return createAppError(ErrorType.UNKNOWN, error.message, error);
  }

  // Unknown error type
  return createAppError(ErrorType.UNKNOWN, String(error));
};

/**
 * Log error to console (and external service in production)
 */
export const logError = (error: AppError, context?: Record<string, any>) => {
  console.error('[Error]', {
    type: error.type,
    message: error.message,
    statusCode: error.statusCode,
    retryable: error.retryable,
    context,
    originalError: error.originalError,
  });

  // In production, send to error tracking service (e.g., Sentry)
  if (!__DEV__) {
    // Example: Sentry.captureException(error.originalError || error, { contexts: { app: context } });
  }
};

/**
 * Handle async operation with error handling
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  onError?: (error: AppError) => void
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    const appError = parseError(error);
    logError(appError);

    if (onError) {
      onError(appError);
    }

    return null;
  }
};

/**
 * Retry an async operation
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
  onRetry?: (attempt: number, error: AppError) => void
): Promise<T> => {
  let lastError: AppError | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = parseError(error);

      if (!lastError.retryable || attempt === maxRetries) {
        throw lastError;
      }

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw lastError || createAppError(ErrorType.UNKNOWN, 'Operation failed after retries');
};

/**
 * Validate response data
 */
export const validateResponse = <T>(
  data: unknown,
  validator: (data: unknown) => data is T
): T => {
  if (!validator(data)) {
    throw createAppError(
      ErrorType.VALIDATION,
      'Invalid response format',
      new Error('Response validation failed')
    );
  }
  return data;
};

/**
 * Create a timeout promise
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = 30000,
  errorMessage: string = 'Operation timed out'
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => {
        reject(createAppError(ErrorType.TIMEOUT, errorMessage));
      }, timeoutMs)
    ),
  ]);
};

/**
 * Check if user is online
 */
export const checkOnlineStatus = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Simple connectivity check
    fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
    })
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
};

/**
 * Safe JSON parse with error handling
 */
export const safeJsonParse = <T>(
  json: string,
  fallback: T
): T => {
  try {
    return JSON.parse(json);
  } catch (error) {
    logError(
      createAppError(ErrorType.VALIDATION, 'JSON parse failed', error as Error)
    );
    return fallback;
  }
};

/**
 * Safe storage operations
 */
export const safeStorageGet = async (
  storage: any,
  key: string
): Promise<string | null> => {
  try {
    return await storage.getItem(key);
  } catch (error) {
    logError(
      createAppError(ErrorType.STORAGE, 'Storage read failed', error as Error)
    );
    return null;
  }
};

export const safeStorageSet = async (
  storage: any,
  key: string,
  value: string
): Promise<boolean> => {
  try {
    await storage.setItem(key, value);
    return true;
  } catch (error) {
    logError(
      createAppError(ErrorType.STORAGE, 'Storage write failed', error as Error)
    );
    return false;
  }
};

export const safeStorageRemove = async (
  storage: any,
  key: string
): Promise<boolean> => {
  try {
    await storage.removeItem(key);
    return true;
  } catch (error) {
    logError(
      createAppError(ErrorType.STORAGE, 'Storage remove failed', error as Error)
    );
    return false;
  }
};
