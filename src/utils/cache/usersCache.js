/**
 * Users Cache
 * Caches user list data with lazy loading and sub-functions.
 *
 * @module utils/cache/usersCache
 */

import {
  createCache,
  isCacheStale,
  hasValidCache,
  updateCache,
  setCacheLoading,
  setCacheError,
  clearCache,
  getFromCacheById,
  cacheToOptions,
  persistCache,
  loadPersistedCache,
} from './baseCache';
import { listUsers } from '../../api';

// ============================================================================
// Cache Instance
// ============================================================================
const STORAGE_KEY = 'tc_cache_users';
const cache = createCache('users', 5 * 60 * 1000); // 5 min TTL

// Load from localStorage on init
loadPersistedCache(cache, STORAGE_KEY, 'user_key');

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get users list (lazy loaded).
 * @param {boolean} force - Force refresh even if cache is valid
 * @returns {Promise<Array>} Users array
 */
export async function getUsers(force = false) {
  // Return cached data if valid and not forced
  if (!force && hasValidCache(cache)) {
    return cache.data;
  }

  // Return cached data if already loading (prevent duplicate requests)
  if (cache.loading) {
    return cache.data;
  }

  setCacheLoading(cache, true);

  try {
    const response = await listUsers();
    let data = response;

    // Handle response shapes
    if (response && typeof response.json === 'function') {
      data = await response.json();
    }
    if (data && data.data) {
      data = data.data;
    }
    if (data && data.users) {
      data = data.users;
    }

    updateCache(cache, data, 'user_key');
    persistCache(cache, STORAGE_KEY);

    return cache.data;
  } catch (error) {
    setCacheError(cache, error);
    console.error('[UsersCache] Failed to fetch users:', error);
    return cache.data; // Return stale data on error
  }
}

/**
 * Force refresh users cache.
 * @returns {Promise<Array>} Users array
 */
export async function refreshUsers() {
  return getUsers(true);
}

/**
 * Get cached users synchronously (no fetch).
 * @returns {Array} Cached users array
 */
export function getUsersSync() {
  return cache.data;
}

/**
 * Clear users cache.
 */
export function clearUsersCache() {
  clearCache(cache);
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get cache loading state.
 * @returns {boolean}
 */
export function isUsersLoading() {
  return cache.loading;
}

/**
 * Get cache error.
 * @returns {Error|null}
 */
export function getUsersError() {
  return cache.error;
}

// ============================================================================
// Sub-functions (Entity-specific)
// ============================================================================

/**
 * Get user by ID.
 * @param {string} id - User ID (user_key)
 * @returns {object|null} User object
 */
export function getUserById(id) {
  return getFromCacheById(cache, id);
}

/**
 * Get user by username.
 * @param {string} username - Username
 * @returns {object|null} User object
 */
export function getUserByUsername(username) {
  if (!username) return null;
  return cache.data.find(
    (u) => u.username?.toLowerCase() === username.toLowerCase()
  ) || null;
}

/**
 * Get user by email.
 * @param {string} email - Email
 * @returns {object|null} User object
 */
export function getUserByEmail(email) {
  if (!email) return null;
  return cache.data.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  ) || null;
}

/**
 * Get users for dropdown options.
 * @param {object} config - Configuration
 * @param {function} config.filter - Optional filter function
 * @returns {Array} Options array [{ label, value, id, raw }]
 */
export function getUserOptions(config = {}) {
  return cacheToOptions(cache, {
    labelField: (u) => u.display_name || u.username || u.email || u.user_key,
    valueField: 'user_key',
    ...config,
  });
}

/**
 * Get users by role.
 * @param {string} role - Role name
 * @returns {Array} Filtered users
 */
export function getUsersByRole(role) {
  if (!role) return cache.data;
  const roleLower = role.toLowerCase();
  return cache.data.filter((u) => {
    const roles = u.roles || (u.role ? [u.role] : []);
    return roles.some((r) => String(r).toLowerCase().includes(roleLower));
  });
}

/**
 * Get active users only.
 * @returns {Array} Active users
 */
export function getActiveUsers() {
  return cache.data.filter((u) => u.active !== false);
}

/**
 * Get users by account key.
 * @param {string} accountKey - Account key
 * @returns {Array} Filtered users
 */
export function getUsersByAccount(accountKey) {
  if (!accountKey) return cache.data;
  return cache.data.filter((u) => u.account_key === accountKey);
}

// ============================================================================
// Events
// ============================================================================

/**
 * Subscribe to cache events.
 * @param {string} event - Event name ('updated', 'loading', 'error', 'cleared')
 * @param {function} callback - Callback function
 * @returns {function} Unsubscribe function
 */
export function onUsersChange(event, callback) {
  return cache.events.on(event, callback);
}

// ============================================================================
// Export cache for advanced usage
// ============================================================================
export const usersCache = cache;

