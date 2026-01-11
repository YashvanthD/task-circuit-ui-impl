/**
 * Authentication Utilities - Main Export
 * Re-exports all auth-related utilities.
 *
 * @module utils/auth
 */

// Storage utilities
export {
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
} from './storage';

// Permission utilities
export {
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
} from './permissions';

