/**
 * Fish Cache
 * Caches fish list data with lazy loading and sub-functions.
 *
 * @module utils/cache/fishCache
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
import { listFish } from '../../api';

// ============================================================================
// Cache Instance
// ============================================================================
const STORAGE_KEY = 'tc_cache_fish';
const cache = createCache('fish', 5 * 60 * 1000); // 5 min TTL

// Load from localStorage on init
loadPersistedCache(cache, STORAGE_KEY, 'fish_id');

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get fish list (lazy loaded).
 * @param {boolean} force - Force refresh even if cache is valid
 * @returns {Promise<Array>} Fish array
 */
export async function getFish(force = false) {
  if (!force && hasValidCache(cache)) {
    return cache.data;
  }

  if (cache.loading) {
    return cache.data;
  }

  setCacheLoading(cache, true);

  try {
    const response = await listFish();
    let data = response;

    if (response && typeof response.json === 'function') {
      data = await response.json();
    }
    if (data && data.data) {
      data = data.data;
    }
    if (data && data.fish) {
      data = data.fish;
    }

    updateCache(cache, data, 'fish_id');
    persistCache(cache, STORAGE_KEY);

    return cache.data;
  } catch (error) {
    setCacheError(cache, error);
    console.error('[FishCache] Failed to fetch fish:', error);
    return cache.data;
  }
}

/**
 * Force refresh fish cache.
 * @returns {Promise<Array>} Fish array
 */
export async function refreshFish() {
  return getFish(true);
}

/**
 * Get cached fish synchronously (no fetch).
 * @returns {Array} Cached fish array
 */
export function getFishSync() {
  return cache.data;
}

/**
 * Clear fish cache.
 */
export function clearFishCache() {
  clearCache(cache);
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get cache loading state.
 * @returns {boolean}
 */
export function isFishLoading() {
  return cache.loading;
}

/**
 * Get cache error.
 * @returns {Error|null}
 */
export function getFishError() {
  return cache.error;
}

// ============================================================================
// Sub-functions (Entity-specific)
// ============================================================================

/**
 * Get fish by ID.
 * @param {string} id - Fish ID
 * @returns {object|null} Fish object
 */
export function getFishById(id) {
  return getFromCacheById(cache, id);
}

/**
 * Get fish by common name.
 * @param {string} name - Common name
 * @returns {object|null} Fish object
 */
export function getFishByName(name) {
  if (!name) return null;
  return cache.data.find(
    (f) => f.common_name?.toLowerCase() === name.toLowerCase() ||
           f.name?.toLowerCase() === name.toLowerCase()
  ) || null;
}

/**
 * Get fish by scientific name.
 * @param {string} scientificName - Scientific name
 * @returns {object|null} Fish object
 */
export function getFishByScientificName(scientificName) {
  if (!scientificName) return null;
  return cache.data.find(
    (f) => f.scientific_name?.toLowerCase() === scientificName.toLowerCase()
  ) || null;
}

/**
 * Get fish for dropdown options.
 * @param {object} config - Configuration
 * @param {function} config.filter - Optional filter function
 * @returns {Array} Options array [{ label, value, id, raw }]
 */
export function getFishOptions(config = {}) {
  return cacheToOptions(cache, {
    labelField: (f) => f.common_name || f.name || f.scientific_name || f.fish_id,
    valueField: 'fish_id',
    ...config,
  });
}

/**
 * Get fish by pond ID.
 * @param {string} pondId - Pond ID
 * @returns {Array} Filtered fish
 */
export function getFishByPond(pondId) {
  if (!pondId) return cache.data;
  return cache.data.filter((f) => {
    const ponds = f.ponds || (f.pond_id ? [f.pond_id] : []);
    return ponds.includes(pondId);
  });
}

/**
 * Get fish by status.
 * @param {string} status - Status ('active', 'inactive', 'harvested', 'sold')
 * @returns {Array} Filtered fish
 */
export function getFishByStatus(status) {
  if (!status) return cache.data;
  const statusLower = status.toLowerCase();
  return cache.data.filter((f) =>
    (f.status || 'active').toLowerCase() === statusLower
  );
}

/**
 * Get active fish only.
 * @returns {Array} Active fish
 */
export function getActiveFish() {
  return getFishByStatus('active');
}

/**
 * Get fish name by ID.
 * @param {string} id - Fish ID
 * @returns {string} Fish name or ID if not found
 */
export function getFishName(id) {
  const fish = getFishById(id);
  return fish?.common_name || fish?.name || fish?.scientific_name || id || 'Unknown Fish';
}

/**
 * Get total fish count across all species.
 * @returns {number} Total fish count
 */
export function getTotalFishCount() {
  return cache.data.reduce((sum, f) => sum + (f.count || f.total_count || 0), 0);
}

/**
 * Get unique species list.
 * @returns {Array} Array of unique species names
 */
export function getSpeciesList() {
  const species = new Set();
  cache.data.forEach((f) => {
    if (f.common_name) species.add(f.common_name);
    if (f.scientific_name) species.add(f.scientific_name);
  });
  return Array.from(species);
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
export function onFishChange(event, callback) {
  return cache.events.on(event, callback);
}

// ============================================================================
// Export cache for advanced usage
// ============================================================================
export const fishCache = cache;

