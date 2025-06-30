/**
 * Custom error types for the gov-deals package
 */

/**
 * Base error class for all gov-deals errors
 */
export class GovDealsError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'GovDealsError';
    
    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Configuration error
 */
export class ConfigurationError extends GovDealsError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', details);
    this.name = 'ConfigurationError';
  }
}

/**
 * Authentication error for API requests
 */
export class AuthenticationError extends GovDealsError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'AUTHENTICATION_ERROR', details);
    this.name = 'AuthenticationError';
  }
}

/**
 * API request error
 */
export class ApiError extends GovDealsError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly response?: unknown,
    details?: Record<string, unknown>
  ) {
    super(message, 'API_ERROR', details);
    this.name = 'ApiError';
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends ApiError {
  constructor(
    message: string,
    public readonly retryAfter?: number,
    details?: Record<string, unknown>
  ) {
    super(message, 429, undefined, details);
    this.name = 'RateLimitError';
  }
}

/**
 * Validation error for data validation failures
 */
export class ValidationError extends GovDealsError {
  constructor(
    message: string,
    public readonly validationErrors?: unknown,
    details?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Network error for connection issues
 */
export class NetworkError extends GovDealsError {
  constructor(
    message: string,
    public readonly originalError?: Error,
    details?: Record<string, unknown>
  ) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends NetworkError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, undefined, details);
    this.name = 'TimeoutError';
  }
}

/**
 * Check if an error is a gov-deals error
 */
export function isGovDealsError(error: unknown): error is GovDealsError {
  return error instanceof GovDealsError;
}

/**
 * Check if an error is a rate limit error
 */
export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof NetworkError || error instanceof TimeoutError) {
    return true;
  }
  
  if (error instanceof ApiError) {
    // Retry on 5xx errors and specific 4xx errors
    const statusCode = error.statusCode;
    return statusCode ? statusCode >= 500 || statusCode === 429 || statusCode === 408 : false;
  }
  
  return false;
}