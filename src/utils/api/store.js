/**
 * API Store - Caching and State Management
 * Provides caching utilities for API responses with TTL and optimistic updates.
 *
 * @module utils/api/store
 */

import { saveToLocalStorage, loadFromLocalStorage, removeFromLocalStorage } from '../auth/storage';

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const TS_SUFFIX = '_last_fetched';

function tsKeyFor(cacheKey) {
  return `${cacheKey}${TS_SUFFIX}`;
}

/**
 * Get all activity timestamps from localStorage.
 * @returns {object} Map of cacheKey -> timestamp
 */
export function getActivityTimestamps() {
  try {
    const out = {};
    if (typeof window !== 'undefined' && window.localStorage) {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.endsWith(TS_SUFFIX)) {
          const cacheKey = key.slice(0, -TS_SUFFIX.length);
          const raw = loadFromLocalStorage(key);
          out[cacheKey] = typeof raw === 'number' ? raw : parseInt(raw, 10) || null;
        }
      }
    }
    return out;
  } catch (e) {
    const candidates = ['ponds', 'fish', 'tasks', 'user', 'settings'];
    const out = {};
    for (const k of candidates) {
      const t = loadFromLocalStorage(tsKeyFor(k));
      if (t) out[k] = typeof t === 'number' ? t : parseInt(t, 10) || null;
    }
    return out;
  }
}

/**
 * Clear all activity timestamps from localStorage.
 */
export function clearActivityTimestamps() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const keys = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.endsWith(TS_SUFFIX)) keys.push(key);
      }
      for (const k of keys) removeFromLocalStorage(k);
      return;
    }
  } catch (e) {
    // ignore
  }
  const candidates = ['ponds', 'fish', 'tasks', 'user', 'settings'];
  for (const k of candidates) removeFromLocalStorage(tsKeyFor(k));
}

/**
 * Read data from cache.
 * @param {string} cacheKey - Cache key
 * @returns {*} Cached data or null
 */
export function readCache(cacheKey) {
  const v = loadFromLocalStorage(cacheKey);
  return v === null ? null : v;
}

/**
 * Write data to cache with timestamp.
 * @param {string} cacheKey - Cache key
 * @param {*} data - Data to cache
 */
export function writeCache(cacheKey, data) {
  saveToLocalStorage(cacheKey, data);
  saveToLocalStorage(tsKeyFor(cacheKey), Date.now());
}

/**
 * Clear a specific cache entry.
 * @param {string} cacheKey - Cache key
 */
export function clearCache(cacheKey) {
  removeFromLocalStorage(cacheKey);
  removeFromLocalStorage(tsKeyFor(cacheKey));
}

/**
 * Read cache timestamp.
 * @param {string} cacheKey - Cache key
 * @returns {number|null} Timestamp or null
 */
export function readCacheTimestamp(cacheKey) {
  const raw = loadFromLocalStorage(tsKeyFor(cacheKey));
  if (!raw) return null;
  return typeof raw === 'number' ? raw : parseInt(raw, 10) || null;
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch (e) {
    return null;
  }
}

/**
 * Fetch-on-demand helper with caching.
 * @param {string} cacheKey - Cache key
 * @param {function} fetchFn - Function that returns a fetch Response
 * @param {object} options - Options { fetchApi, ttl, requireNonEmpty }
 * @returns {Promise<{source: string, data: *}>}
 */
export async function fetchOrCache(cacheKey, fetchFn, { fetchApi = false, ttl = DEFAULT_TTL_MS, requireNonEmpty = true } = {}) {
  const cached = readCache(cacheKey);
  const ts = readCacheTimestamp(cacheKey);
  const now = Date.now();

  const hasCached = cached !== null && (!requireNonEmpty || (Array.isArray(cached) ? cached.length > 0 : true));
  const fresh = ts && (now - ts) < ttl;

  if (!fetchApi && hasCached && fresh) {
    return { source: 'cache', data: cached };
  }

  try {
    const res = await fetchFn();
    if (!res || !res.ok) {
      if (hasCached) return { source: 'cache', data: cached, error: res ? await safeJson(res) : new Error('No response') };
      const body = res ? await safeJson(res) : {};
      throw new Error(body.error || `Failed to fetch (status ${res && res.status})`);
    }
    const data = await safeJson(res);
    writeCache(cacheKey, data);
    return { source: 'api', data };
  } catch (err) {
    if (hasCached) return { source: 'cache', data: cached, error: err };
    throw err;
  }
}

/**
 * Perform a mutation with optimistic updates and cache sync.
 * @param {string} cacheKey - Cache key
 * @param {function} mutateFn - Function that performs the mutation
 * @param {function} updateCacheFn - Function to update cache: (existingCache, apiResult) => newCache
 * @param {object} options - Options { fetchApi }
 * @returns {Promise<{source: string, data: *}>}
 */
export async function mutateAndSync(cacheKey, mutateFn, updateCacheFn, { fetchApi = true } = {}) {
  const cached = readCache(cacheKey) || null;

  // Optimistic local update
  const optimistic = updateCacheFn(cached, null);
  writeCache(cacheKey, optimistic);

  if (!fetchApi) {
    return { source: 'local', data: optimistic };
  }

  try {
    const res = await mutateFn();
    if (!res || !res.ok) {
      writeCache(cacheKey, cached); // Revert
      const body = res ? await safeJson(res) : {};
      throw new Error(body && body.error ? body.error : `Mutation failed (status ${res && res.status})`);
    }
    const result = await safeJson(res);
    const finalCache = updateCacheFn(cached, result);
    writeCache(cacheKey, finalCache);
    return { source: 'api', data: result, cache: finalCache };
  } catch (err) {
    writeCache(cacheKey, cached); // Revert
    throw err;
  }
}

export const apiStore = {
  fetchOrCache,
  mutateAndSync,
  readCache,
  writeCache,
  clearCache,
  readCacheTimestamp,
  getActivityTimestamps,
  clearActivityTimestamps,
};

