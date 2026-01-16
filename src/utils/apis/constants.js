/**
 * API Constants
 * Centralized API endpoint paths.
 *
 * NOTE: These are path fragments (relative URLs).
 * Use with apiFetch() which adds BASE_URL automatically.
 *
 * @module utils/apis/constants
 */

// ============================================================================
// Authentication Endpoints
// ============================================================================
export const API_AUTH = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REFRESH_TOKEN: '/auth/token',
  VALIDATE_TOKEN: '/auth/validate',
  SIGNUP: '/auth/signup',
  ME: '/auth/me',
  PERMISSIONS: '/auth/permissions',
  REGISTER_COMPANY: '/api/auth/register-company',
};

// ============================================================================
// User Endpoints
// ============================================================================
export const API_USER = {
  BASE: '/user',
  ME: '/user/me',
  DASHBOARD: '/user/dashboard',
  LIST: '/auth/account/users',
  ADD: '/user/add',
  UPDATE: (userId) => `/user/${userId}`,
  DELETE: (userId) => `/user/${userId}`,
  PROFILE: '/api/user/profile',
  BY_KEY: '/api/users/userKey',
  PASSWORD: '/user/password',
  MOBILE: '/user/mobile',
  EMAIL: '/user/email',
  USERNAME: '/user/username',
};

// ============================================================================
// Task Endpoints
// ============================================================================
export const API_TASK = {
  BASE: '/tasks',
  LIST: '/tasks/',
  CREATE: '/tasks/',
  DETAIL: (taskId) => `/tasks/${taskId}`,
  UPDATE: (taskId) => `/tasks/${taskId}`,
  DELETE: (taskId) => `/tasks/${taskId}`,
};

// ============================================================================
// Pond Endpoints
// ============================================================================
export const API_POND = {
  BASE: '/pond',
  LIST: '/pond/',
  ADD: '/pond/add',
  CREATE: '/pond/',
  DETAIL: (pondId) => `/pond/${pondId}`,
  UPDATE: (pondId) => `/pond/${pondId}`,
  DELETE: (pondId) => `/pond/${pondId}`,
  DAILY_UPDATE: (pondId) => `/pond/${pondId}/daily`,
};

// ============================================================================
// Fish Endpoints
// ============================================================================
export const API_FISH = {
  BASE: '/fish',
  LIST: '/fish/',
  CREATE: '/fish/',
  DETAIL: (fishId) => `/fish/${fishId}`,
  UPDATE: (fishId) => `/fish/${fishId}`,
  DELETE: (fishId) => `/fish/${fishId}`,
};

// ============================================================================
// Sampling Endpoints
// ============================================================================
export const API_SAMPLING = {
  BASE: '/sampling',
  LIST: '/sampling/',
  CREATE: '/sampling/',
  DETAIL: (samplingId) => `/sampling/${samplingId}`,
  UPDATE: (samplingId) => `/sampling/${samplingId}`,
  DELETE: (samplingId) => `/sampling/${samplingId}`,
};

// ============================================================================
// Company Endpoints
// ============================================================================
export const API_COMPANY = {
  REGISTER: '/company/register',
  DETAILS: '/company/',
  UPDATE: '/company/',
};

// ============================================================================
// Expense Endpoints
// ============================================================================
export const API_EXPENSE = {
  BASE: '/expense',
  LIST: '/expense/',
  CREATE: '/expense/',
  CATEGORIES: '/expense/categories',
  TYPES: '/expense/types',
  BY_TYPE: (typeId) => `/expense/type/${typeId}`,
};

// ============================================================================
// Report Endpoints
// ============================================================================
export const API_REPORT = {
  BASE: '/report',
  LIST: '/report/',
  GENERATE: '/report/generate',
  DOWNLOAD: (reportId) => `/report/${reportId}/download`,
};

// ============================================================================
// Water Test Endpoints
// ============================================================================
export const API_WATER_TEST = {
  BASE: '/water-test',
  LIST: '/water-test/',
  CREATE: '/water-test/',
  DETAIL: (testId) => `/water-test/${testId}`,
};

// ============================================================================
// AI / Chat Endpoints
// ============================================================================
export const API_AI = {
  CHAT: '/ai/chat',
  QUERY: '/ai/query',
  SUGGESTIONS: '/ai/suggestions',
};

// ============================================================================
// Legacy exports for backward compatibility
// ============================================================================
export const AUTH_REGISTER_COMPANY = API_AUTH.REGISTER_COMPANY;
export const AUTH_LOGIN = API_AUTH.LOGIN;
export const AUTH_LOGOUT = API_AUTH.LOGOUT;
export const AUTH_REFRESH_TOKEN = API_AUTH.REFRESH_TOKEN;
export const AUTH_VALIDATE_TOKEN = API_AUTH.VALIDATE_TOKEN;
export const AUTH_ME = API_AUTH.ME;
export const AUTH_PERMISSIONS = API_AUTH.PERMISSIONS;
export const PATH_USER_LIST = API_USER.LIST;
export const PATH_USER_PROFILE = API_USER.PROFILE;
export const USER_BY_USER_KEY = API_USER.BY_KEY;
