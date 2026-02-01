/**
 * API Module
 * Central export for all API modules.
 *
 * @module api
 */

// ============================================================================
// Client & Utilities
// ============================================================================
export {
  apiFetch,
  apiJsonFetch,
  safeJsonParse,
  buildApiUrl,
  extractResponseData,
  ApiError,
  NetworkError,
} from './client';

export { apiStore } from './store';

// ============================================================================
// API Constants
// ============================================================================
export {
  API_AUTH,
  API_USER,
  API_TASK,
  API_POND,
  API_POND_EVENT,
  API_FISH,
  API_SAMPLING,
  API_FEEDING,
  API_COMPANY,
  API_EXPENSE,
  API_TRANSACTION,
  API_DASHBOARD,
  API_ROLE,
  API_PERMISSION,
  API_AI,
  API_NOTIFICATION,
  API_ALERT,
  API_CHAT,
  API_PUBLIC,
  buildUrl,
} from './constants';

// ============================================================================
// API Modules
// ============================================================================
export { default as authApi, getAuthHeaders } from './auth';
export { default as userApi } from './user';
export { default as taskApi } from './task';
export { default as pondApi } from './pond';
export { default as fishApi } from './fish';
export { default as samplingApi } from './sampling';
export { default as companyApi } from './company';
export { default as notificationsApi } from './notifications';

// ============================================================================
// Named exports from API modules
// ============================================================================
export * from './auth';
export * from './user';
export * from './task';
export * from './pond';
export * from './fish';
export * from './sampling';
export * from './company';
export * from './notifications';

