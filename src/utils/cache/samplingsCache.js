/**
 * Samplings Cache
 * Caches sampling list data with lazy loading and sub-functions.
 *
 * @module utils/cache/samplingsCache
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
import { listSamplings } from '../../api';

// ============================================================================
// Cache Instance
// ============================================================================
const STORAGE_KEY = 'tc_cache_samplings';
const cache = createCache('samplings', 5 * 60 * 1000); // 5 min TTL

// Load from localStorage on init
loadPersistedCache(cache, STORAGE_KEY, 'sampling_id');

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get samplings list (lazy loaded).
 * @param {boolean} force - Force refresh even if cache is valid
 * @returns {Promise<Array>} Samplings array
 */
export async function getSamplings(force = false) {
  if (!force && hasValidCache(cache)) {
    return cache.data;
  }

  if (cache.loading) {
    return cache.data;
  }

  setCacheLoading(cache, true);

  try {
    const response = await listSamplings();
    let data = response;

    if (response && typeof response.json === 'function') {
      data = await response.json();
    }
    if (data && data.data) {
      data = data.data;
    }
    if (data && data.samplings) {
      data = data.samplings;
    }

    updateCache(cache, data, 'sampling_id');
    persistCache(cache, STORAGE_KEY);

    return cache.data;
  } catch (error) {
    setCacheError(cache, error);
    console.error('[SamplingsCache] Failed to fetch samplings:', error);
    return cache.data;
  }
}

/**
 * Force refresh samplings cache.
 * @returns {Promise<Array>} Samplings array
 */
export async function refreshSamplings() {
  return getSamplings(true);
}

/**
 * Get cached samplings synchronously (no fetch).
 * @returns {Array} Cached samplings array
 */
export function getSamplingsSync() {
  return cache.data;
}

/**
 * Clear samplings cache.
 */
export function clearSamplingsCache() {
  clearCache(cache);
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get cache loading state.
 * @returns {boolean}
 */
export function isSamplingsLoading() {
  return cache.loading;
}

/**
 * Get cache error.
 * @returns {Error|null}
 */
export function getSamplingsError() {
  return cache.error;
}

// ============================================================================
// Sub-functions (Entity-specific)
// ============================================================================

/**
 * Get sampling by ID.
 * @param {string} id - Sampling ID
 * @returns {object|null} Sampling object
 */
export function getSamplingById(id) {
  return getFromCacheById(cache, id);
}

/**
 * Get samplings for dropdown options.
 * @param {object} config - Configuration
 * @param {function} config.filter - Optional filter function
 * @returns {Array} Options array [{ label, value, id, raw }]
 */
export function getSamplingOptions(config = {}) {
  return cacheToOptions(cache, {
    labelField: (s) => s.sample_type || s.type || s.sampling_id,
    valueField: 'sampling_id',
    ...config,
  });
}

/**
 * Get samplings by pond ID.
 * @param {string} pondId - Pond ID
 * @returns {Array} Filtered samplings
 */
export function getSamplingsByPond(pondId) {
  if (!pondId) return cache.data;
  return cache.data.filter((s) => s.pond_id === pondId);
}

/**
 * Get samplings by status.
 * @param {string} status - Status ('pending', 'completed', 'cancelled')
 * @returns {Array} Filtered samplings
 */
export function getSamplingsByStatus(status) {
  if (!status) return cache.data;
  const statusLower = status.toLowerCase();
  return cache.data.filter((s) =>
    (s.status || 'pending').toLowerCase() === statusLower
  );
}

/**
 * Get pending samplings.
 * @returns {Array} Pending samplings
 */
export function getPendingSamplings() {
  return getSamplingsByStatus('pending');
}

/**
 * Get completed samplings.
 * @returns {Array} Completed samplings
 */
export function getCompletedSamplings() {
  return getSamplingsByStatus('completed');
}

/**
 * Get samplings by type.
 * @param {string} type - Sampling type ('sample', 'buy', etc.)
 * @returns {Array} Filtered samplings
 */
export function getSamplingsByType(type) {
  if (!type) return cache.data;
  const typeLower = type.toLowerCase();
  return cache.data.filter((s) =>
    (s.type || s.sample_type || '').toLowerCase() === typeLower
  );
}

/**
 * Get samplings by fish species.
 * @param {string} species - Fish species/type
 * @returns {Array} Filtered samplings
 */
export function getSamplingsBySpecies(species) {
  if (!species) return cache.data;
  const speciesLower = species.toLowerCase();
  return cache.data.filter((s) =>
    s.fish_type?.toLowerCase().includes(speciesLower) ||
    s.species?.toLowerCase().includes(speciesLower)
  );
}

/**
 * Get samplings within date range.
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Array} Filtered samplings
 */
export function getSamplingsByDateRange(startDate, endDate) {
  const start = startDate ? new Date(startDate).getTime() : 0;
  const end = endDate ? new Date(endDate).getTime() : Infinity;

  return cache.data.filter((s) => {
    const date = new Date(s.sample_date || s.date || s.created_at).getTime();
    return date >= start && date <= end;
  });
}

/**
 * Get recent samplings (last N days).
 * @param {number} days - Number of days (default 7)
 * @returns {Array} Recent samplings
 */
export function getRecentSamplings(days = 7) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return cache.data.filter((s) => {
    const date = new Date(s.sample_date || s.date || s.created_at).getTime();
    return date >= cutoff;
  });
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
export function onSamplingsChange(event, callback) {
  return cache.events.on(event, callback);
}

// ============================================================================
// Export cache for advanced usage
// ============================================================================
export const samplingsCache = cache;

