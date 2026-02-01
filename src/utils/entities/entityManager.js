/**
 * Entity Data Manager
 * Centralized manager for all entity data with caching and real-time updates
 * Based on entity schemas from references/entities/
 *
 * @module utils/entities/entityManager
 */

import { storageManager, STORAGE_KEYS } from '../storage';
import {
    apiFetch,
  API_FISH,
  API_POND,
  API_ALERT,
  API_TASK,
  API_NOTIFICATION,
  API_CHAT,
  API_USER,
  API_SAMPLING
} from '../../api';

// ============================================================================
// Entity Manager Class
// ============================================================================

class EntityManager {
  constructor() {
    this.listeners = new Map();
    this.loading = new Map();
  }

  // ==========================================================================
  // Fish Farming Entities
  // ==========================================================================

  /**
   * Get farms list
   * @param {boolean} [forceRefresh=false] - Force refresh from API
   * @returns {Promise<Array>}
   */
  async getFarms(forceRefresh = false) {
    return this._getEntityList('farms', STORAGE_KEYS.FARMS_CACHE, API_FISH.FARMS, forceRefresh);
  }

  /**
   * Get farm by ID
   * @param {string} farmId - Farm ID
   * @returns {Promise<object>}
   */
  async getFarm(farmId) {
    return this._getEntity('farm', farmId, (id) => API_FISH.FARM_DETAIL(id));
  }

  /**
   * Get ponds list (uses primary /api/pond endpoint)
   * @param {boolean} [forceRefresh=false] - Force refresh from API
   * @returns {Promise<Array>}
   */
  async getPonds(forceRefresh = false) {
    return this._getEntityList('ponds', STORAGE_KEYS.PONDS_CACHE, API_POND.LIST, forceRefresh);
  }

  /**
   * Get pond by ID (uses primary /api/pond endpoint)
   * @param {string} pondId - Pond ID
   * @returns {Promise<object>}
   */
  async getPond(pondId) {
    return this._getEntity('pond', pondId, (id) => API_POND.DETAIL(id));
  }

  /**
   * Get species list
   * @param {boolean} [forceRefresh=false] - Force refresh from API
   * @returns {Promise<Array>}
   */
  async getSpecies(forceRefresh = false) {
    return this._getEntityList('species', STORAGE_KEYS.SPECIES_CACHE, API_FISH.SPECIES, forceRefresh);
  }

  /**
   * Get stocks list
   * @param {boolean} [forceRefresh=false] - Force refresh from API
   * @returns {Promise<Array>}
   */
  async getStocks(forceRefresh = false) {
    return this._getEntityList('stocks', STORAGE_KEYS.STOCKS_CACHE, API_FISH.STOCKS, forceRefresh);
  }

  /**
   * Get stock by ID
   * @param {string} stockId - Stock ID
   * @returns {Promise<object>}
   */
  async getStock(stockId) {
    return this._getEntity('stock', stockId, (id) => API_FISH.STOCK_DETAIL(id));
  }

  // ==========================================================================
  // Farming Activities
  // ==========================================================================

  /**
   * Get feedings list
   * @param {object} [params={}] - Query parameters
   * @param {boolean} [forceRefresh=false] - Force refresh from API
   * @returns {Promise<Array>}
   */
  async getFeedings(params = {}, forceRefresh = false) {
    return this._getEntityList('feedings', STORAGE_KEYS.FEEDINGS_CACHE, API_FISH.FEEDINGS, forceRefresh, params);
  }

  /**
   * Get samplings list (uses primary /api/sampling endpoint)
   * @param {object} [params={}] - Query parameters
   * @param {boolean} [forceRefresh=false] - Force refresh from API
   * @returns {Promise<Array>}
   */
  async getSamplings(params = {}, forceRefresh = false) {
    return this._getEntityList('samplings', STORAGE_KEYS.SAMPLINGS_CACHE, API_SAMPLING.LIST, forceRefresh, params);
  }

  /**
   * Get harvests list
   * @param {object} [params={}] - Query parameters
   * @param {boolean} [forceRefresh=false] - Force refresh from API
   * @returns {Promise<Array>}
   */
  async getHarvests(params = {}, forceRefresh = false) {
    return this._getEntityList('harvests', STORAGE_KEYS.HARVESTS_CACHE, API_FISH.HARVESTS, forceRefresh, params);
  }

  /**
   * Get mortalities list
   * @param {object} [params={}] - Query parameters
   * @param {boolean} [forceRefresh=false] - Force refresh from API
   * @returns {Promise<Array>}
   */
  async getMortalities(params = {}, forceRefresh = false) {
    return this._getEntityList('mortalities', STORAGE_KEYS.MORTALITIES_CACHE, API_FISH.MORTALITIES, forceRefresh, params);
  }

  /**
   * Get transfers list
   * @param {object} [params={}] - Query parameters
   * @param {boolean} [forceRefresh=false] - Force refresh from API
   * @returns {Promise<Array>}
   */
  async getTransfers(params = {}, forceRefresh = false) {
    return this._getEntityList('transfers', STORAGE_KEYS.TRANSFERS_CACHE, API_FISH.TRANSFERS, forceRefresh, params);
  }

  /**
   * Get treatments list
   * @param {object} [params={}] - Query parameters
   * @param {boolean} [forceRefresh=false] - Force refresh from API
   * @returns {Promise<Array>}
   */
  async getTreatments(params = {}, forceRefresh = false) {
    return this._getEntityList('treatments', STORAGE_KEYS.TREATMENTS_CACHE, API_FISH.TREATMENTS, forceRefresh, params);
  }

  /**
   * Get maintenance records list
   * @param {object} [params={}] - Query parameters
   * @param {boolean} [forceRefresh=false] - Force refresh from API
   * @returns {Promise<Array>}
   */
  async getMaintenance(params = {}, forceRefresh = false) {
    return this._getEntityList('maintenance', STORAGE_KEYS.MAINTENANCE_CACHE, API_FISH.MAINTENANCE, forceRefresh, params);
  }

  /**
   * Get purchases list
   * @param {object} [params={}] - Query parameters
   * @param {boolean} [forceRefresh=false] - Force refresh from API
   * @returns {Promise<Array>}
   */
  async getPurchases(params = {}, forceRefresh = false) {
    return this._getEntityList('purchases', STORAGE_KEYS.PURCHASES_CACHE, API_FISH.PURCHASES, forceRefresh, params);
  }

  // ==========================================================================
  // Media Service Entities
  // ==========================================================================

  /**
   * Get alerts list
   * @param {boolean} [forceRefresh=false] - Force refresh from API
   * @returns {Promise<Array>}
   */
  async getAlerts(forceRefresh = false) {
    return this._getEntityList('alerts', STORAGE_KEYS.ALERTS_CACHE, API_ALERT.LIST, forceRefresh);
  }

  /**
   * Get alert by ID
   * @param {string} alertId - Alert ID
   * @returns {Promise<object>}
   */
  async getAlert(alertId) {
    return this._getEntity('alert', alertId, (id) => API_ALERT.DETAIL(id));
  }

  /**
   * Get tasks list
   * @param {boolean} [forceRefresh=false] - Force refresh from API
   * @returns {Promise<Array>}
   */
  async getTasks(forceRefresh = false) {
    return this._getEntityList('tasks', STORAGE_KEYS.TASKS_CACHE, API_TASK.LIST, forceRefresh);
  }

  /**
   * Get task by ID
   * @param {string} taskId - Task ID
   * @returns {Promise<object>}
   */
  async getTask(taskId) {
    return this._getEntity('task', taskId, (id) => API_TASK.DETAIL(id));
  }

  /**
   * Get notifications list
   * @param {boolean} [forceRefresh=false] - Force refresh from API
   * @returns {Promise<Array>}
   */
  async getNotifications(forceRefresh = false) {
    return this._getEntityList('notifications', STORAGE_KEYS.NOTIFICATIONS_CACHE, API_NOTIFICATION.LIST, forceRefresh);
  }

  /**
   * Get conversations list
   * @param {boolean} [forceRefresh=false] - Force refresh from API
   * @returns {Promise<Array>}
   */
  async getConversations(forceRefresh = false) {
    return this._getEntityList('conversations', STORAGE_KEYS.CONVERSATIONS_CACHE, API_CHAT.CONVERSATIONS, forceRefresh);
  }

  /**
   * Get messages for a conversation
   * @param {string} conversationId - Conversation ID
   * @param {boolean} [forceRefresh=false] - Force refresh from API
   * @returns {Promise<Array>}
   */
  async getMessages(conversationId, forceRefresh = false) {
    const cacheKey = `${STORAGE_KEYS.MESSAGES_CACHE}_${conversationId}`;
    return this._getEntityList('messages', cacheKey, API_CHAT.CONVERSATION_MESSAGES(conversationId), forceRefresh);
  }

  // ==========================================================================
  // User Management Entities
  // ==========================================================================

  /**
   * Get users list
   * @param {boolean} [forceRefresh=false] - Force refresh from API
   * @returns {Promise<Array>}
   */
  async getUsers(forceRefresh = false) {
    return this._getEntityList('users', STORAGE_KEYS.USERS_CACHE, API_USER.LIST, forceRefresh);
  }

  /**
   * Get user by key
   * @param {string} userKey - User key
   * @returns {Promise<object>}
   */
  async getUser(userKey) {
    return this._getEntity('user', userKey, (id) => API_USER.DETAIL(id));
  }

  // ==========================================================================
  // Generic Entity Operations
  // ==========================================================================

  /**
   * Get entity list with caching
   * @private
   */
  async _getEntityList(entityType, cacheKey, apiEndpoint, forceRefresh = false, params = {}) {
    // Check cache first
    if (!forceRefresh && !storageManager.isCacheStale(cacheKey)) {
      const cached = storageManager.getCache(cacheKey);
      if (cached && cached.length > 0) {
        return cached;
      }
    }

    // Prevent duplicate requests
    if (this.loading.get(entityType)) {
      return new Promise((resolve) => {
        const unsubscribe = this.on(`${entityType}:loaded`, (data) => {
          unsubscribe();
          resolve(data);
        });
      });
    }

    // Fetch from API
    this.loading.set(entityType, true);
    this.emit(`${entityType}:loading`, true);

    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${apiEndpoint}?${queryString}` : apiEndpoint;
      const response = await apiFetch(url);

      // Extract array from response
      const data = this._extractArrayFromResponse(response, entityType);

      // Update cache
      storageManager.setCache(cacheKey, data);

      this.loading.set(entityType, false);
      this.emit(`${entityType}:loaded`, data);

      return data;
    } catch (error) {
      this.loading.set(entityType, false);
      this.emit(`${entityType}:error`, error);
      throw error;
    }
  }

  /**
   * Get single entity
   * @private
   */
  async _getEntity(entityType, entityId, apiEndpointFn) {
    try {
      const response = await apiFetch(apiEndpointFn(entityId));
      return response.data || response;
    } catch (error) {
      this.emit(`${entityType}:error`, error);
      throw error;
    }
  }

  /**
   * Extract array from API response
   * @private
   */
  _extractArrayFromResponse(response, entityType) {
    // Handle standard wrapper: { success: true, data: { items: [...] } }
    if (response.data) {
      // Try plural form first
      const pluralKey = entityType;
      if (response.data[pluralKey]) return response.data[pluralKey];

      // Try items
      if (response.data.items) return response.data.items;

      // Try data as array
      if (Array.isArray(response.data)) return response.data;
    }

    // Try direct array
    if (Array.isArray(response)) return response;

    // Default to empty array
    return [];
  }

  /**
   * Clear entity cache
   * @param {string} entityType - Entity type
   */
  clearEntityCache(entityType) {
    const cacheKey = STORAGE_KEYS[`${entityType.toUpperCase()}_CACHE`];
    if (cacheKey) {
      storageManager.clearCache(cacheKey);
      this.emit(`${entityType}:cleared`);
    }
  }

  /**
   * Clear all entity caches
   */
  clearAllCaches() {
    storageManager.clearAllCaches();
    this.emit('all:cleared');
  }

  // ==========================================================================
  // Event System
  // ==========================================================================

  /**
   * Subscribe to entity events
   * @param {string} event - Event name (e.g., 'farms:loaded', 'tasks:error')
   * @param {function} callback - Callback function
   * @returns {function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return () => {
      this.listeners.get(event).delete(callback);
    };
  }

  /**
   * Emit event
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
          console.error(`[EntityManager] Event listener error (${event}):`, error);
        }
      });
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const entityManager = new EntityManager();
export default entityManager;
