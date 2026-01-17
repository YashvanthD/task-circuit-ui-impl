/**
 * Alerts Cache
 * Caches system alerts with lazy loading.
 * Integrates with WebSocket for real-time updates.
 *
 * @module utils/cache/alertsCache
 */

import {
  createCache,
  hasValidCache,
  updateCache,
  setCacheLoading,
  setCacheError,
  clearCache,
  getFromCacheById,
  persistCache,
  loadPersistedCache,
} from './baseCache';
import {
  listAlerts,
  acknowledgeAlert as apiAcknowledgeAlert,
  deleteAlert as apiDeleteAlert,
} from '../../api/notifications';
import { socketService, WS_EVENTS } from '../websocket';
import { showErrorAlert } from '../alertManager';

// ============================================================================
// Cache Instance
// ============================================================================
const STORAGE_KEY = 'tc_cache_alerts';
const cache = createCache('alerts', 2 * 60 * 1000); // 2 min TTL

// Add unacknowledged count to cache
cache.unacknowledgedCount = 0;

// Load from localStorage on init
loadPersistedCache(cache, STORAGE_KEY, 'alert_id');

// ============================================================================
// WebSocket Integration
// ============================================================================

let wsSubscribed = false;

let wsConnectionFailed = false;

/**
 * Subscribe to WebSocket alert events
 * Also connects to WebSocket if not already connected
 */
export function subscribeToAlertWebSocket() {
  if (wsSubscribed) return;

  // Don't try to connect if previous connection failed
  if (wsConnectionFailed) {
    wsSubscribed = true;
    return;
  }

  // Connect to WebSocket if not already connected
  if (!socketService.isConnected()) {
    socketService.connect()
      .then((connected) => {
        if (!connected) {
          wsConnectionFailed = true;
        }
      })
      .catch(() => {
        wsConnectionFailed = true;
      });
  }

  // New alert received
  socketService.on(WS_EVENTS.ALERT_NEW, (alert) => {
    // Add to beginning of cache
    cache.data.unshift(alert);
    cache.byId.set(String(alert.alert_id), alert);
    if (!alert.acknowledged) {
      cache.unacknowledgedCount++;
    }
    cache.events.emit('updated', cache.data);
    cache.events.emit('new', alert);
    persistCache(cache, STORAGE_KEY);
  });

  // Alert acknowledged
  socketService.on(WS_EVENTS.ALERT_ACKNOWLEDGED, ({ alert_id, acknowledged_by, acknowledged_at }) => {
    const index = cache.data.findIndex((a) => a.alert_id === alert_id);
    if (index !== -1 && !cache.data[index].acknowledged) {
      cache.data[index] = {
        ...cache.data[index],
        acknowledged: true,
        acknowledged_by,
        acknowledged_at,
      };
      cache.byId.set(String(alert_id), cache.data[index]);
      cache.unacknowledgedCount = Math.max(0, cache.unacknowledgedCount - 1);
      cache.events.emit('updated', cache.data);
      persistCache(cache, STORAGE_KEY);
    }
  });

  // Alert deleted
  socketService.on(WS_EVENTS.ALERT_DELETED, ({ alert_id }) => {
    const index = cache.data.findIndex((a) => a.alert_id === alert_id);
    if (index !== -1) {
      const wasUnacknowledged = !cache.data[index].acknowledged;
      cache.data.splice(index, 1);
      cache.byId.delete(String(alert_id));
      if (wasUnacknowledged) {
        cache.unacknowledgedCount = Math.max(0, cache.unacknowledgedCount - 1);
      }
      cache.events.emit('updated', cache.data);
      persistCache(cache, STORAGE_KEY);
    }
  });

  // Unacknowledged count update from server
  socketService.on(WS_EVENTS.ALERT_COUNT, ({ count }) => {
    cache.unacknowledgedCount = count;
    cache.events.emit('countUpdated', count);
  });

  wsSubscribed = true;
}

/**
 * Unsubscribe from WebSocket events
 */
export function unsubscribeFromAlertWebSocket() {
  wsSubscribed = false;
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get alerts list (lazy loaded).
 * @param {boolean} force - Force refresh even if cache is valid
 * @param {object} params - Filter params { unacknowledged, severity, type, limit, skip }
 * @returns {Promise<Array>} Alerts array
 */
export async function getAlerts(force = false, params = {}) {
  if (!force && hasValidCache(cache) && !params.unacknowledged && !params.severity && !params.type) {
    return cache.data;
  }

  if (cache.loading) {
    return cache.data;
  }

  setCacheLoading(cache, true);

  try {
    const response = await listAlerts(params);
    const data = response?.data?.alerts || [];

    // Only update full cache if no filters
    if (!params.unacknowledged && !params.severity && !params.type) {
      updateCache(cache, data, 'alert_id');
      cache.unacknowledgedCount = data.filter((a) => !a.acknowledged).length;
      persistCache(cache, STORAGE_KEY);
    }

    setCacheLoading(cache, false);
    return data;
  } catch (error) {
    setCacheError(cache, error);
    console.error('[AlertsCache] Failed to fetch:', error);
    // Don't show alert for background fetch failures
    setCacheLoading(cache, false);
    return cache.data;
  }
}

/**
 * Force refresh alerts cache.
 * @returns {Promise<Array>} Alerts array
 */
export async function refreshAlerts() {
  return getAlerts(true);
}

/**
 * Get cached alerts synchronously (no fetch).
 * @returns {Array} Cached alerts array
 */
export function getAlertsSync() {
  return cache.data;
}

/**
 * Clear alerts cache.
 */
export function clearAlertsCache() {
  clearCache(cache);
  cache.unacknowledgedCount = 0;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get cache loading state.
 * @returns {boolean}
 */
export function isAlertsLoading() {
  return cache.loading;
}

/**
 * Get cache error.
 * @returns {Error|null}
 */
export function getAlertsError() {
  return cache.error;
}

/**
 * Get unacknowledged count.
 * @returns {number}
 */
export function getUnacknowledgedAlertCount() {
  return cache.unacknowledgedCount;
}

// ============================================================================
// Sub-functions
// ============================================================================

/**
 * Get alert by ID.
 * @param {string} id - Alert ID
 * @returns {object|null} Alert object
 */
export function getAlertById(id) {
  return getFromCacheById(cache, id);
}

/**
 * Get unacknowledged alerts.
 * @returns {Array} Unacknowledged alerts
 */
export function getUnacknowledgedAlerts() {
  return cache.data.filter((a) => !a.acknowledged);
}

/**
 * Get alerts by type.
 * @param {string} type - Alert type (info, warning, critical, success, error)
 * @returns {Array} Filtered alerts
 */
export function getAlertsByType(type) {
  if (!type) return cache.data;
  return cache.data.filter((a) => a.type === type);
}

/**
 * Get alerts by severity.
 * @param {string} severity - Severity (low, medium, high, critical)
 * @returns {Array} Filtered alerts
 */
export function getAlertsBySeverity(severity) {
  if (!severity) return cache.data;
  return cache.data.filter((a) => a.severity === severity);
}

/**
 * Get alerts by source.
 * @param {string} source - Source (system, pond, task, expense)
 * @returns {Array} Filtered alerts
 */
export function getAlertsBySource(source) {
  if (!source) return cache.data;
  return cache.data.filter((a) => a.source === source);
}

/**
 * Get critical alerts (severity: high or critical, unacknowledged).
 * @returns {Array} Critical alerts
 */
export function getCriticalAlerts() {
  return cache.data.filter(
    (a) => ['high', 'critical'].includes(a.severity) && !a.acknowledged
  );
}

/**
 * Get recent alerts (last N).
 * @param {number} limit - Number of alerts (default 5)
 * @returns {Array} Recent alerts
 */
export function getRecentAlerts(limit = 5) {
  return cache.data
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
}

/**
 * Get alerts for a specific entity.
 * @param {string} sourceId - Source entity ID
 * @returns {Array} Alerts for the entity
 */
export function getAlertsForEntity(sourceId) {
  if (!sourceId) return [];
  return cache.data.filter((a) => a.source_id === sourceId);
}

// ============================================================================
// Action Functions (with cache update)
// ============================================================================

/**
 * Acknowledge an alert.
 * @param {string} id - Alert ID
 * @returns {Promise<object|null>} Updated alert
 */
export async function acknowledgeAlert(id) {
  try {
    const result = await apiAcknowledgeAlert(id);

    // Update cache
    const index = cache.data.findIndex((a) => a.alert_id === id);
    if (index !== -1) {
      cache.data[index] = {
        ...cache.data[index],
        acknowledged: true,
        acknowledged_at: new Date().toISOString(),
      };
      cache.byId.set(String(id), cache.data[index]);
      cache.unacknowledgedCount = cache.data.filter((a) => !a.acknowledged).length;
      cache.events.emit('updated', cache.data);
      persistCache(cache, STORAGE_KEY);
    }

    return result;
  } catch (error) {
    console.error('[AlertsCache] Failed to acknowledge:', error);
    showErrorAlert('Failed to acknowledge alert.', 'Alerts');
    throw error;
  }
}

/**
 * Delete alert (admin only).
 * @param {string} id - Alert ID
 * @returns {Promise<boolean>} Success
 */
export async function deleteAlert(id) {
  try {
    const result = await apiDeleteAlert(id);

    // Update cache
    const index = cache.data.findIndex((a) => a.alert_id === id);
    if (index !== -1) {
      cache.data.splice(index, 1);
      cache.byId.delete(String(id));
      cache.unacknowledgedCount = cache.data.filter((a) => !a.acknowledged).length;
      cache.events.emit('updated', cache.data);
      persistCache(cache, STORAGE_KEY);
    }

    return result;
  } catch (error) {
    console.error('[AlertsCache] Failed to delete:', error);
    showErrorAlert('Failed to delete alert.', 'Alerts');
    throw error;
  }
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
export function onAlertsChange(event, callback) {
  return cache.events.on(event, callback);
}

// ============================================================================
// Export cache for advanced usage
// ============================================================================
export const alertsCache = cache;

