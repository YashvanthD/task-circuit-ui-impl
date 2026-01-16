/**
 * Utils - Main Export
 *
 * This is the main entry point for all utilities.
 * Provides backward compatibility while using the new organized structure.
 *
 * @module utils
 *
 * @example
 * // Import from specific modules (recommended)
 * import { apiFetch, ApiError } from './utils/api';
 * import { getAccessToken, is_admin } from './utils/auth';
 * import { formatDate, formatCurrency } from './utils/helpers';
 *
 * // Or import from main utils (backward compatible)
 * import { apiFetch, getAccessToken, formatDate } from './utils';
 */

// ============================================================================
// API Utilities
// ============================================================================
export {
  apiFetch,
  apiJsonFetch,
  safeJsonParse,
  buildApiUrl,
  extractResponseData,
  ApiError,
  NetworkError,
} from '../api';

// ============================================================================
// Auth Utilities
// ============================================================================
export {
  // Storage
  saveToLocalStorage,
  loadFromLocalStorage,
  removeFromLocalStorage,
  getRefreshToken,
  getAccessToken,
  getAccessTokenExpiry,
  saveAccessToken,
  setAccessTokenExpiry,
  isAccessTokenExpiringSoon,
  saveUserToLocalStorage,
  loadUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveTasksToLocalStorage,
  loadTasksFromLocalStorage,
  getTasksLastFetched,
  clearTasksFromLocalStorage,
  startAccessTokenManagement,
  clearAccessTokenManagement,
  startPeriodicAccessTokenRefresh,
  stopPeriodicAccessTokenRefresh,
  refreshAccessToken,
  validateAccessToken,
  parseJwt,
  processLoginResponse,
  handle401,
  // Permissions
  ROLE_LEVELS,
  extractUser,
  getUserRole,
  getUserRoles,
  is_admin,
  is_manager,
  hasRole,
  hasAnyRole,
  getPermissionLevel,
  normalizeUser,
} from './auth';

// ============================================================================
// Helper Utilities
// ============================================================================
export {
  // Formatters
  formatDate,
  formatDateOnly,
  formatTimeOnly,
  formatRelativeTime,
  formatNumber,
  formatPercent,
  formatCurrency,
  formatBytes,
  truncate,
  formatPhone,
  // Date
  getDefaultEndDate,
  getTimeLeft,
  isToday,
  isPast,
  isFuture,
  startOfDay,
  endOfDay,
  addDays,
  toISODateString,
  // Common
  TASK_STATUS,
  TASK_PRIORITY,
  getNextActionColor,
  getPriorityStyle,
  getPriorityLabel,
  getPriorityColor,
  getStatusLabel,
  isTaskOverdue,
  sortTasksByPriority,
} from './helpers';

// ============================================================================
// Resource Utilities
// ============================================================================
export { createResourceUtil } from './resources';

// ============================================================================
// Alert Manager - Global alerts from anywhere
// ============================================================================
export {
  showGlobalAlert,
  showErrorAlert,
  showSuccessAlert,
  showWarningAlert,
  showInfoAlert,
  showApiErrorAlert,
  AlertType,
} from './alertManager';

