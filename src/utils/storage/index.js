/**
 * Storage Module Index
 * Export centralized storage utilities
 *
 * @module utils/storage
 */

import { storageManager, STORAGE_KEYS } from './storageManager';

export { storageManager, STORAGE_KEYS };

// Convenience re-exports for common operations
export const {
  // Auth methods
  setAccessToken,
  getAccessToken,
  setRefreshToken,
  getRefreshToken,
  isAccessTokenExpiring,
  clearAuth,

  // User methods
  setUser,
  getUser,
  updateUser,
  clearUser,

  // Cache methods
  setCache,
  getCache,
  isCacheStale,
  clearCache,
  clearAllCaches,

  // UI state methods
  setTheme,
  getTheme,
  setLocale,
  getLocale,

  // Core methods
  set,
  get,
  remove,
  clear,
  has,
  subscribe,
} = storageManager;
