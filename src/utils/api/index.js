/**
 * API Utilities - Main Export
 * Re-exports all API-related utilities for easy importing.
 *
 * @module utils/api
 *
 * @example
 * // Import specific functions
 * import { apiFetch, ApiError } from '../utils/api';
 *
 * // Or import all
 * import * as api from '../utils/api';
 */

// Client utilities
export {
  apiFetch,
  apiJsonFetch,
  safeJsonParse,
  buildApiUrl,
  extractResponseData,
  login,
  validateToken,
  refreshToken,
} from './client';

// Error classes and utilities
export {
  ApiError,
  NetworkError,
  CacheError,
  Result,
  trySafe,
  logError,
  getErrorMessage,
} from './errors';

// Re-export store if it exists
export * from './store';

