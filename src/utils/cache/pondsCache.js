/**
 * Ponds Cache
 * Caches pond list data with lazy loading and sub-functions.
 *
 * @module utils/cache/pondsCache
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
import { listPonds } from '../../api';

// ============================================================================
// Cache Instance
// ============================================================================
const STORAGE_KEY = 'tc_cache_ponds';
const cache = createCache('ponds', 5 * 60 * 1000); // 5 min TTL

// Load from localStorage on init
loadPersistedCache(cache, STORAGE_KEY, 'pond_id');

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get ponds list (lazy loaded).
 * @param {boolean} force - Force refresh even if cache is valid
 * @returns {Promise<Array>} Ponds array
 */
export async function getPonds(force = false) {
  if (!force && hasValidCache(cache)) {
    return cache.data;
  }

  if (cache.loading) {
    return cache.data;
  }

  setCacheLoading(cache, true);

  try {
    const response = await listPonds();
    let data = response;

    if (response && typeof response.json === 'function') {
      data = await response.json();
    }
    if (data && data.data) {
      data = data.data;
    }
    if (data && data.ponds) {
      data = data.ponds;
    }

    updateCache(cache, data, 'pond_id');
    persistCache(cache, STORAGE_KEY);

    return cache.data;
  } catch (error) {
    setCacheError(cache, error);
    console.error('[PondsCache] Failed to fetch ponds:', error);
    return cache.data;
  }
}

/**
 * Force refresh ponds cache.
 * @returns {Promise<Array>} Ponds array
 */
export async function refreshPonds() {
  return getPonds(true);
}

/**
 * Get cached ponds synchronously (no fetch).
 * @returns {Array} Cached ponds array
 */
export function getPondsSync() {
  return cache.data;
}

/**
 * Clear ponds cache.
 */
export function clearPondsCache() {
  clearCache(cache);
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get cache loading state.
 * @returns {boolean}
 */
export function isPondsLoading() {
  return cache.loading;
}

/**
 * Get cache error.
 * @returns {Error|null}
 */
export function getPondsError() {
  return cache.error;
}

// ============================================================================
// Sub-functions (Entity-specific)
// ============================================================================

/**
 * Get pond by ID.
 * @param {string} id - Pond ID
 * @returns {object|null} Pond object
 */
export function getPondById(id) {
  return getFromCacheById(cache, id);
}

/**
 * Get pond by name.
 * @param {string} name - Pond name
 * @returns {object|null} Pond object
 */
export function getPondByName(name) {
  if (!name) return null;
  return cache.data.find(
    (p) => p.name?.toLowerCase() === name.toLowerCase()
  ) || null;
}

/**
 * Get ponds for dropdown options.
 * @param {object} config - Configuration
 * @param {function} config.filter - Optional filter function
 * @returns {Array} Options array [{ label, value, id, raw }]
 */
export function getPondOptions(config = {}) {
  return cacheToOptions(cache, {
    labelField: (p) => p.name || p.pond_name || p.pond_id,
    valueField: 'pond_id',
    ...config,
  });
}

/**
 * Get ponds by status.
 * @param {string} status - Status ('active', 'inactive', 'maintenance', etc.)
 * @returns {Array} Filtered ponds
 */
export function getPondsByStatus(status) {
  if (!status) return cache.data;
  const statusLower = status.toLowerCase();
  return cache.data.filter((p) =>
    (p.status || 'active').toLowerCase() === statusLower
  );
}

/**
 * Get active ponds only.
 * @returns {Array} Active ponds
 */
export function getActivePonds() {
  return getPondsByStatus('active');
}

/**
 * Get ponds by location.
 * @param {string} location - Location string
 * @returns {Array} Filtered ponds
 */
export function getPondsByLocation(location) {
  if (!location) return cache.data;
  const locLower = location.toLowerCase();
  return cache.data.filter((p) =>
    p.location?.toLowerCase().includes(locLower)
  );
}

/**
 * Get ponds by fish type.
 * @param {string} fishType - Fish type/species
 * @returns {Array} Filtered ponds
 */
export function getPondsByFishType(fishType) {
  if (!fishType) return cache.data;
  const typeLower = fishType.toLowerCase();
  return cache.data.filter((p) =>
    p.fish_type?.toLowerCase().includes(typeLower) ||
    p.species?.toLowerCase().includes(typeLower)
  );
}

/**
 * Get pond name by ID.
 * @param {string} id - Pond ID
 * @returns {string} Pond name or ID if not found
 */
export function getPondName(id) {
  const pond = getPondById(id);
  return pond?.name || pond?.pond_name || id || 'Unknown Pond';
}

/**
 * Get total fish count across all ponds.
 * @returns {number} Total fish count
 */
export function getTotalPondFishCount() {
  return cache.data.reduce((sum, p) => sum + (p.fish_count || 0), 0);
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
export function onPondsChange(event, callback) {
  return cache.events.on(event, callback);
}

// ============================================================================
// Export cache for advanced usage
// ============================================================================
export const pondsCache = cache;

