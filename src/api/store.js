/**
 * API Store
 * Simple caching layer for API responses with localStorage persistence.
 *
 * @module api/store
 */

const CACHE_PREFIX = 'tc_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Read cache from localStorage.
 * @param {string} key - Cache key
 * @returns {any|null} Cached data or null
 */
function readCache(key) {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const { data, expiry } = JSON.parse(raw);
    if (expiry && Date.now() > expiry) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
}

/**
 * Write cache to localStorage.
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} [ttl] - Time to live in ms
 */
function writeCache(key, data, ttl = DEFAULT_TTL) {
  try {
    const expiry = ttl ? Date.now() + ttl : null;
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify({ data, expiry }));
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Clear cache for a key.
 * @param {string} key - Cache key
 */
function clearCache(key) {
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch (e) {
    // Ignore errors
  }
}

/**
 * Fetch from API or return cached data.
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Function to fetch data from API
 * @param {object} [options] - Options
 * @param {boolean} [options.fetchApi=true] - Whether to fetch from API if cache is stale
 * @param {number} [options.ttl] - Time to live in ms
 * @param {boolean} [options.requireNonEmpty=false] - Require non-empty data
 * @returns {Promise<{source: string, data: any}>}
 */
async function fetchOrCache(key, fetchFn, options = {}) {
  const { fetchApi = true, ttl = DEFAULT_TTL, requireNonEmpty = false } = options;

  // Try cache first
  const cached = readCache(key);
  const cacheValid = cached !== null && (!requireNonEmpty || (Array.isArray(cached) ? cached.length > 0 : true));

  if (cacheValid && !fetchApi) {
    return { source: 'cache', data: cached };
  }

  if (fetchApi) {
    try {
      const response = await fetchFn();
      let data = response;

      // Handle Response objects
      if (response && typeof response.json === 'function') {
        data = await response.json();
      }

      // Extract data from common response shapes
      if (data && data.data !== undefined) {
        data = data.data;
      }

      writeCache(key, data, ttl);
      return { source: 'api', data };
    } catch (error) {
      console.error(`[apiStore] Fetch error for ${key}:`, error);
      // Fall back to cache on error
      if (cached !== null) {
        return { source: 'cache', data: cached };
      }
      throw error;
    }
  }

  return { source: 'cache', data: cached };
}

/**
 * Mutate data and sync cache.
 * @param {string} key - Cache key
 * @param {Function} mutateFn - Function to perform mutation (API call)
 * @param {Function} updateFn - Function to update cache with result
 * @returns {Promise<any>} Result from mutation
 */
async function mutateAndSync(key, mutateFn, updateFn) {
  const result = await mutateFn();

  let data = result;
  // Handle Response objects
  if (result && typeof result.json === 'function') {
    data = await result.json();
  }

  // Extract data from common response shapes
  if (data && data.data !== undefined) {
    data = data.data;
  }

  // Update cache
  const cached = readCache(key) || [];
  const updated = updateFn(cached, data);
  if (updated !== undefined) {
    writeCache(key, updated);
  }

  return data;
}

export const apiStore = {
  readCache,
  writeCache,
  clearCache,
  fetchOrCache,
  mutateAndSync,
};

export default apiStore;

