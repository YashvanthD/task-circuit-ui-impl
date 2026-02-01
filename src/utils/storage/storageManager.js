/**
 * Centralized Storage Manager
 * Single source of truth for all application storage operations
 * Handles localStorage, sessionStorage, and in-memory caching
 *
 * @module utils/storage/storageManager
 */

// ============================================================================
// Storage Keys Constants
// ============================================================================

export const STORAGE_KEYS = {
  // Authentication
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  ACCESS_TOKEN_EXPIRY: 'access_token_expiry',

  // User Data
  USER: 'user',
  USER_PROFILE: 'user_profile',
  USER_SETTINGS: 'user_settings',
  USER_PERMISSIONS: 'user_permissions',

  // Company Data
  COMPANY: 'company',
  COMPANY_PROFILE: 'company_profile',

  // Entity Caches - Fish Farming
  FARMS_CACHE: 'farms_cache',
  FARMS_LAST_FETCH: 'farms_last_fetched',
  PONDS_CACHE: 'ponds_cache',
  PONDS_LAST_FETCH: 'ponds_last_fetched',
  SPECIES_CACHE: 'species_cache',
  SPECIES_LAST_FETCH: 'species_last_fetched',
  STOCKS_CACHE: 'stocks_cache',
  STOCKS_LAST_FETCH: 'stocks_last_fetched',

  // Entity Caches - Farming Activities
  FEEDINGS_CACHE: 'feedings_cache',
  FEEDINGS_LAST_FETCH: 'feedings_last_fetched',
  SAMPLINGS_CACHE: 'samplings_cache',
  SAMPLINGS_LAST_FETCH: 'samplings_last_fetched',
  HARVESTS_CACHE: 'harvests_cache',
  HARVESTS_LAST_FETCH: 'harvests_last_fetched',
  MORTALITIES_CACHE: 'mortalities_cache',
  MORTALITIES_LAST_FETCH: 'mortalities_last_fetched',
  TRANSFERS_CACHE: 'transfers_cache',
  TRANSFERS_LAST_FETCH: 'transfers_last_fetched',
  TREATMENTS_CACHE: 'treatments_cache',
  TREATMENTS_LAST_FETCH: 'treatments_last_fetched',
  MAINTENANCE_CACHE: 'maintenance_cache',
  MAINTENANCE_LAST_FETCH: 'maintenance_last_fetched',
  PURCHASES_CACHE: 'purchases_cache',
  PURCHASES_LAST_FETCH: 'purchases_last_fetched',

  // Entity Caches - Media Service
  ALERTS_CACHE: 'alerts_cache',
  ALERTS_LAST_FETCH: 'alerts_last_fetched',
  TASKS_CACHE: 'tasks_cache',
  TASKS_LAST_FETCH: 'tasks_last_fetched',
  NOTIFICATIONS_CACHE: 'notifications_cache',
  NOTIFICATIONS_LAST_FETCH: 'notifications_last_fetched',
  CONVERSATIONS_CACHE: 'conversations_cache',
  CONVERSATIONS_LAST_FETCH: 'conversations_last_fetched',
  MESSAGES_CACHE: 'messages_cache',
  MESSAGES_LAST_FETCH: 'messages_last_fetched',

  // Entity Caches - User Management
  USERS_CACHE: 'users_cache',
  USERS_LAST_FETCH: 'users_last_fetched',

  // Legacy Cache Keys (for backward compatibility)
  FISH_CACHE: 'fish_cache',
  FISH_LAST_FETCH: 'fish_last_fetched',

  // UI State
  THEME: 'theme',
  LOCALE: 'locale',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  LAST_ROUTE: 'last_route',
};

// ============================================================================
// Storage Manager Class
// ============================================================================

class StorageManager {
  constructor() {
    this.memoryCache = new Map();
    this.listeners = new Map();
  }

  // ==========================================================================
  // Core Storage Operations
  // ==========================================================================

  /**
   * Set item in storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @param {boolean} [persistent=true] - Use localStorage (true) or sessionStorage (false)
   */
  set(key, value, persistent = true) {
    const storage = persistent ? localStorage : sessionStorage;
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    try {
      storage.setItem(key, stringValue);
      this.memoryCache.set(key, value);
      this.emit('change', { key, value, action: 'set' });
    } catch (error) {
      console.error(`[StorageManager] Failed to set ${key}:`, error);
    }
  }

  /**
   * Get item from storage
   * @param {string} key - Storage key
   * @param {any} [defaultValue=null] - Default value if not found
   * @param {boolean} [persistent=true] - Check localStorage (true) or sessionStorage (false)
   * @returns {any}
   */
  get(key, defaultValue = null, persistent = true) {
    // Check memory cache first
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    // Check persistent storage
    const storage = persistent ? localStorage : sessionStorage;
    const value = storage.getItem(key);

    if (!value) return defaultValue;

    try {
      const parsed = JSON.parse(value);
      this.memoryCache.set(key, parsed);
      return parsed;
    } catch {
      // Return as string if JSON parse fails
      this.memoryCache.set(key, value);
      return value;
    }
  }

  /**
   * Remove item from storage
   * @param {string} key - Storage key
   * @param {boolean} [persistent=true] - Remove from localStorage (true) or sessionStorage (false)
   */
  remove(key, persistent = true) {
    const storage = persistent ? localStorage : sessionStorage;

    storage.removeItem(key);
    this.memoryCache.delete(key);
    this.emit('change', { key, action: 'remove' });
  }

  /**
   * Clear all storage
   * @param {boolean} [persistent=true] - Clear localStorage (true) or sessionStorage (false)
   */
  clear(persistent = true) {
    const storage = persistent ? localStorage : sessionStorage;

    storage.clear();
    this.memoryCache.clear();
    this.emit('change', { action: 'clear' });
  }

  /**
   * Check if key exists in storage
   * @param {string} key - Storage key
   * @param {boolean} [persistent=true] - Check localStorage (true) or sessionStorage (false)
   * @returns {boolean}
   */
  has(key, persistent = true) {
    if (this.memoryCache.has(key)) return true;
    const storage = persistent ? localStorage : sessionStorage;
    return storage.getItem(key) !== null;
  }

  // ==========================================================================
  // Authentication Methods
  // ==========================================================================

  /**
   * Set access token
   * @param {string} token - Access token
   * @param {number} expiresIn - Expiry in seconds
   */
  setAccessToken(token, expiresIn) {
    this.set(STORAGE_KEYS.ACCESS_TOKEN, token);
    const expiry = Date.now() + (expiresIn * 1000);
    this.set(STORAGE_KEYS.ACCESS_TOKEN_EXPIRY, expiry);
  }

  /**
   * Get access token
   * @returns {string|null}
   */
  getAccessToken() {
    return this.get(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Set refresh token
   * @param {string} token - Refresh token
   */
  setRefreshToken(token) {
    this.set(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  /**
   * Get refresh token
   * @returns {string|null}
   */
  getRefreshToken() {
    return this.get(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Check if access token is expired or expiring soon
   * @param {number} [bufferMs=120000] - Buffer time in ms (default 2 minutes)
   * @returns {boolean}
   */
  isAccessTokenExpiring(bufferMs = 120000) {
    const expiry = this.get(STORAGE_KEYS.ACCESS_TOKEN_EXPIRY);
    if (!expiry) return true;
    return Date.now() > (expiry - bufferMs);
  }

  /**
   * Clear all auth tokens
   */
  clearAuth() {
    this.remove(STORAGE_KEYS.ACCESS_TOKEN);
    this.remove(STORAGE_KEYS.REFRESH_TOKEN);
    this.remove(STORAGE_KEYS.ACCESS_TOKEN_EXPIRY);
  }

  // ==========================================================================
  // User Data Methods
  // ==========================================================================

  /**
   * Set user data
   * @param {object} user - User object
   */
  setUser(user) {
    this.set(STORAGE_KEYS.USER, user);
  }

  /**
   * Get user data
   * @returns {object|null}
   */
  getUser() {
    return this.get(STORAGE_KEYS.USER);
  }

  /**
   * Update user field
   * @param {string} field - Field name
   * @param {any} value - New value
   */
  updateUser(field, value) {
    const user = this.getUser() || {};
    user[field] = value;
    this.setUser(user);
  }

  /**
   * Clear user data
   */
  clearUser() {
    this.remove(STORAGE_KEYS.USER);
    this.remove(STORAGE_KEYS.USER_PROFILE);
    this.remove(STORAGE_KEYS.USER_SETTINGS);
    this.remove(STORAGE_KEYS.USER_PERMISSIONS);
  }

  // ==========================================================================
  // Cache Methods
  // ==========================================================================

  /**
   * Set cache data with timestamp
   * @param {string} cacheKey - Cache key
   * @param {any} data - Data to cache
   */
  setCache(cacheKey, data) {
    this.set(cacheKey, data);
    this.set(`${cacheKey}_last_fetch`, Date.now());
  }

  /**
   * Get cache data
   * @param {string} cacheKey - Cache key
   * @returns {any}
   */
  getCache(cacheKey) {
    return this.get(cacheKey, []);
  }

  /**
   * Check if cache is stale
   * @param {string} cacheKey - Cache key
   * @param {number} [ttl=300000] - Time to live in ms (default 5 minutes)
   * @returns {boolean}
   */
  isCacheStale(cacheKey, ttl = 300000) {
    const lastFetch = this.get(`${cacheKey}_last_fetch`);
    if (!lastFetch) return true;
    return Date.now() - lastFetch > ttl;
  }

  /**
   * Clear specific cache
   * @param {string} cacheKey - Cache key
   */
  clearCache(cacheKey) {
    this.remove(cacheKey);
    this.remove(`${cacheKey}_last_fetch`);
  }

  /**
   * Clear all caches
   */
  clearAllCaches() {
    Object.keys(STORAGE_KEYS).forEach(key => {
      if (key.endsWith('_CACHE') || key.endsWith('_LAST_FETCH')) {
        this.remove(STORAGE_KEYS[key]);
      }
    });
  }

  // ==========================================================================
  // UI State Methods
  // ==========================================================================

  /**
   * Set theme
   * @param {string} theme - Theme name
   */
  setTheme(theme) {
    this.set(STORAGE_KEYS.THEME, theme);
  }

  /**
   * Get theme
   * @returns {string}
   */
  getTheme() {
    return this.get(STORAGE_KEYS.THEME, 'light');
  }

  /**
   * Set locale
   * @param {string} locale - Locale code
   */
  setLocale(locale) {
    this.set(STORAGE_KEYS.LOCALE, locale);
  }

  /**
   * Get locale
   * @returns {string}
   */
  getLocale() {
    return this.get(STORAGE_KEYS.LOCALE, 'en');
  }

  // ==========================================================================
  // Event System
  // ==========================================================================

  /**
   * Subscribe to storage changes
   * @param {function} callback - Callback function
   * @returns {function} Unsubscribe function
   */
  subscribe(callback) {
    const id = Date.now() + Math.random();
    if (!this.listeners.has('change')) {
      this.listeners.set('change', new Map());
    }
    this.listeners.get('change').set(id, callback);

    return () => {
      this.listeners.get('change').delete(id);
    };
  }

  /**
   * Emit event to listeners
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('[StorageManager] Listener error:', error);
        }
      });
    }
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Export all storage data
   * @returns {object}
   */
  export() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = this.get(key);
    }
    return data;
  }

  /**
   * Import storage data
   * @param {object} data - Data to import
   */
  import(data) {
    Object.entries(data).forEach(([key, value]) => {
      this.set(key, value);
    });
  }

  /**
   * Get storage size estimate
   * @returns {number} Size in bytes
   */
  getSize() {
    let size = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      size += key.length + (value?.length || 0);
    }
    return size;
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const storageManager = new StorageManager();
export default storageManager;
