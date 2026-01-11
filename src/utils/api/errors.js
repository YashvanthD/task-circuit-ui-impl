/**
 * API Error Classes
 * Centralized error handling utilities for the application.
 *
 * @module utils/api/errors
 */

/**
 * Custom API Error class for HTTP errors.
 * @extends Error
 */
export class ApiError extends Error {
  /**
   * @param {number} status - HTTP status code
   * @param {string} message - Error message
   * @param {object} data - Additional error data from response
   */
  constructor(status, message, data = null) {
    super(message || `API Error: ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isApiError = true;
  }

  /**
   * Create ApiError from a fetch Response
   * @param {Response} response - Fetch response object
   * @param {object} body - Parsed response body
   * @returns {ApiError}
   */
  static fromResponse(response, body = null) {
    const message = body?.error || body?.message || `Request failed with status ${response.status}`;
    return new ApiError(response.status, message, body);
  }

  /** Check if error is an authentication error (401) */
  isUnauthorized() { return this.status === 401; }

  /** Check if error is a forbidden error (403) */
  isForbidden() { return this.status === 403; }

  /** Check if error is a not found error (404) */
  isNotFound() { return this.status === 404; }

  /** Check if error is a validation error (400/422) */
  isValidationError() { return this.status === 400 || this.status === 422; }

  /** Check if error is a server error (5xx) */
  isServerError() { return this.status >= 500 && this.status < 600; }
}

/**
 * Custom Network Error for connection failures.
 * @extends Error
 */
export class NetworkError extends Error {
  constructor(message = 'Network connection failed', originalError = null) {
    super(message);
    this.name = 'NetworkError';
    this.isNetworkError = true;
    this.originalError = originalError;
  }
}

/**
 * Custom Cache Error for cache-related failures.
 * @extends Error
 */
export class CacheError extends Error {
  constructor(message = 'Cache operation failed', originalError = null) {
    super(message);
    this.name = 'CacheError';
    this.isCacheError = true;
    this.originalError = originalError;
  }
}

/**
 * Log error with consistent formatting.
 * @param {string} context - Where the error occurred
 * @param {Error} error - The error object
 * @param {object} extra - Additional context data
 */
export function logError(context, error, extra = {}) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [${context}]`, error.message || error, {
    name: error.name,
    status: error.status,
    ...extra,
  });
}

/**
 * Get user-friendly error message from any error type.
 * @param {Error|ApiError|string} error
 * @returns {string}
 */
export function getErrorMessage(error) {
  if (!error) return 'An unknown error occurred';
  if (typeof error === 'string') return error;

  if (error.isApiError) {
    if (error.isUnauthorized()) return 'Please log in to continue';
    if (error.isForbidden()) return 'You do not have permission for this action';
    if (error.isNotFound()) return 'The requested resource was not found';
    if (error.isValidationError()) return error.data?.message || 'Please check your input';
    if (error.isServerError()) return 'Server error. Please try again later';
  }

  if (error.isNetworkError) {
    return 'Network connection failed. Please check your internet connection';
  }

  return error.message || 'An unexpected error occurred';
}

/**
 * Result wrapper for operations that can fail.
 * Provides a consistent pattern for handling success/failure.
 * @template T
 * @template E
 */
export class Result {
  constructor(success, value, error = null) {
    this.success = success;
    this.value = value;
    this.error = error;
  }

  static ok(value) { return new Result(true, value, null); }
  static err(error) { return new Result(false, null, error); }
  isOk() { return this.success; }
  isErr() { return !this.success; }
  unwrapOr(defaultValue) { return this.success ? this.value : defaultValue; }

  map(fn) {
    if (!this.success) return this;
    try {
      return Result.ok(fn(this.value));
    } catch (e) {
      return Result.err(e);
    }
  }
}

/**
 * Safely execute an async function and return a Result.
 * @template T
 * @param {function(): Promise<T>} fn - Async function to execute
 * @returns {Promise<Result<T, Error>>}
 */
export async function trySafe(fn) {
  try {
    const value = await fn();
    return Result.ok(value);
  } catch (error) {
    return Result.err(error);
  }
}

