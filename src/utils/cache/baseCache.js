/**
 * Base Cache Utilities
 * Shared helpers for entity caches.
 *
 * @module utils/cache/baseCache
 */

// ============================================================================
// Event Emitter for Cache Changes
// ============================================================================
export class CacheEventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error('[CacheEvent] Listener error:', e);
        }
      });
    }
  }
}

// ============================================================================
// Cache Factory
// ============================================================================

/**
 * Create a cache object with standard structure.
 * @param {string} name - Cache name for logging
 * @param {number} ttl - Time to live in ms (default 5 minutes)
 * @returns {object} Cache object
 */
export function createCache(name, ttl = 5 * 60 * 1000) {
  return {
    name,
    data: [],
    byId: new Map(),
    lastFetch: null,
    loading: false,
    error: null,
    ttl,
    events: new CacheEventEmitter(),
  };
}

/**
 * Check if cache is stale (needs refresh).
 * @param {object} cache - Cache object
 * @returns {boolean}
 */
export function isCacheStale(cache) {
  if (!cache.lastFetch) return true;
  if (!cache.data || cache.data.length === 0) return true;
  return Date.now() - cache.lastFetch > cache.ttl;
}

/**
 * Check if cache has valid data.
 * @param {object} cache - Cache object
 * @returns {boolean}
 */
export function hasValidCache(cache) {
  return cache.data && cache.data.length > 0 && !isCacheStale(cache);
}

/**
 * Update cache with new data.
 * @param {object} cache - Cache object
 * @param {Array} data - New data array
 * @param {string} idField - Field name for ID (default 'id')
 */
export function updateCache(cache, data, idField = 'id') {
  cache.data = Array.isArray(data) ? data : [];
  cache.lastFetch = Date.now();
  cache.loading = false;
  cache.error = null;

  // Build ID map for quick lookups
  cache.byId.clear();
  cache.data.forEach((item) => {
    const id = item[idField] || item.id || item._id;
    if (id) {
      cache.byId.set(String(id), item);
    }
  });

  cache.events.emit('updated', cache.data);
}

/**
 * Set cache loading state.
 * @param {object} cache - Cache object
 * @param {boolean} loading - Loading state
 */
export function setCacheLoading(cache, loading) {
  cache.loading = loading;
  cache.events.emit('loading', loading);
}

/**
 * Set cache error state.
 * @param {object} cache - Cache object
 * @param {Error|string} error - Error
 */
export function setCacheError(cache, error) {
  cache.error = error;
  cache.loading = false;
  cache.events.emit('error', error);
}

/**
 * Clear cache data.
 * @param {object} cache - Cache object
 */
export function clearCache(cache) {
  cache.data = [];
  cache.byId.clear();
  cache.lastFetch = null;
  cache.loading = false;
  cache.error = null;
  cache.events.emit('cleared');
}

/**
 * Get item from cache by ID.
 * @param {object} cache - Cache object
 * @param {string|number} id - Item ID
 * @returns {object|null}
 */
export function getFromCacheById(cache, id) {
  return cache.byId.get(String(id)) || null;
}

/**
 * Convert cache data to dropdown options.
 * @param {object} cache - Cache object
 * @param {object} config - Configuration
 * @param {string} config.labelField - Field for label (or function)
 * @param {string} config.valueField - Field for value (default 'id')
 * @param {function} config.filter - Optional filter function
 * @returns {Array} Options array [{ label, value, raw }]
 */
export function cacheToOptions(cache, config = {}) {
  const {
    labelField = 'name',
    valueField = 'id',
    filter = null,
  } = config;

  let items = cache.data || [];

  if (filter && typeof filter === 'function') {
    items = items.filter(filter);
  }

  return items.map((item) => {
    const label = typeof labelField === 'function'
      ? labelField(item)
      : item[labelField] || item.name || item.title || item.label || String(item[valueField]);

    const value = item[valueField] || item.id || item._id;

    return {
      label,
      value,
      id: value, // Alias for compatibility
      raw: item,
    };
  });
}

/**
 * Save cache to localStorage.
 * @param {object} cache - Cache object
 * @param {string} key - Storage key
 */
export function persistCache(cache, key) {
  try {
    const toSave = {
      data: cache.data,
      lastFetch: cache.lastFetch,
    };
    localStorage.setItem(key, JSON.stringify(toSave));
  } catch (e) {
    console.warn(`[${cache.name}] Failed to persist cache:`, e);
  }
}

/**
 * Load cache from localStorage.
 * @param {object} cache - Cache object
 * @param {string} key - Storage key
 * @param {string} idField - Field name for ID
 */
export function loadPersistedCache(cache, key, idField = 'id') {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.data && Array.isArray(parsed.data)) {
        cache.data = parsed.data;
        cache.lastFetch = parsed.lastFetch || null;

        // Rebuild ID map
        cache.byId.clear();
        cache.data.forEach((item) => {
          const id = item[idField] || item.id || item._id;
          if (id) {
            cache.byId.set(String(id), item);
          }
        });
      }
    }
  } catch (e) {
    console.warn(`[${cache.name}] Failed to load persisted cache:`, e);
  }
}

