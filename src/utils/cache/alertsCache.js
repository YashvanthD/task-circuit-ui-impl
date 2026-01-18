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
import { playNotificationSound } from '../notifications/sound';

/**
 * Get alert ID from various formats
 * Server may send: alertId, alert_id, or id
 */
function getAlertId(alert) {
  return alert.alert_id || alert.alertId || alert.id || null;
}

/**
 * Normalize an alert object to ensure consistent field names
 */
function normalizeAlert(alert) {
  if (!alert) return null;

  const id = getAlertId(alert);

  return {
    alert_id: id,
    title: alert.title || '',
    message: alert.message || alert.body || '',
    type: alert.type || alert.alert_type || 'warning',
    severity: alert.severity || 'medium',
    source: alert.source || 'system',
    source_id: alert.source_id || alert.sourceId || null,
    acknowledged: !!alert.acknowledged,
    acknowledged_by: alert.acknowledged_by || alert.acknowledgedBy || null,
    acknowledged_at: alert.acknowledged_at || alert.acknowledgedAt || null,
    auto_dismiss: !!alert.auto_dismiss,
    dismiss_after_minutes: alert.dismiss_after_minutes || null,
    created_at: alert.created_at || alert.createdAt || new Date().toISOString(),
    user_key: alert.user_key || alert.userKey || null,
    account_key: alert.account_key || alert.accountKey || null,
  };
}

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
 * Note: Connection should be established before calling this (via DataContext)
 */
export function subscribeToAlertWebSocket() {
  if (wsSubscribed) return;

  // Don't try to subscribe if previous attempt failed
  if (wsConnectionFailed) {
    wsSubscribed = true;
    return;
  }

  // Check if connected - if not, wait for connection
  if (!socketService.isConnected()) {
    console.log('[AlertsCache] WebSocket not connected, waiting...');
    // Don't connect here - DataContext handles connection
    return;
  }

  // New alert received
  socketService.on(WS_EVENTS.ALERT_NEW, (rawAlert) => {
    try {
      // Normalize the alert to ensure consistent field names
      const alert = normalizeAlert(rawAlert);
      if (!alert || !alert.alert_id) {
        console.error('[AlertsCache] Invalid alert received:', rawAlert);
        return;
      }

      const id = String(alert.alert_id);

      // Check if we already have this alert
      if (cache.byId.has(id)) {
        // Update existing and move to front
        cache.data = [
          alert,
          ...cache.data.filter((a) => String(a.alert_id) !== id),
        ];
      } else {
        // Add to beginning of cache
        cache.data.unshift(alert);
      }

      // Rebuild id map
      cache.byId.clear();
      cache.data.forEach((a) => cache.byId.set(String(a.alert_id), a));

      // Recompute unacknowledged count
      cache.unacknowledgedCount = cache.data.filter((a) => !a.acknowledged).length;

      cache.events.emit('updated', cache.data);
      cache.events.emit('new', alert);
      persistCache(cache, STORAGE_KEY);

      // Play notification sound for new alerts
      playNotificationSound();
    } catch (e) {
      console.error('[AlertsCache] Error handling ALERT_NEW:', e);
    }
  });

  // Alert acknowledged
  socketService.on(WS_EVENTS.ALERT_ACKNOWLEDGED, (data) => {
    try {
      // Handle various ID formats from server
      const alertId = data.alert_id || data.alertId || data.id;
      if (!alertId) {
        console.error('[AlertsCache] Invalid alert_id in ALERT_ACKNOWLEDGED:', data);
        return;
      }

      const id = String(alertId);
      const index = cache.data.findIndex((a) => String(a.alert_id) === id);
      if (index !== -1 && !cache.data[index].acknowledged) {
        cache.data[index] = {
          ...cache.data[index],
          acknowledged: true,
          acknowledged_by: data.acknowledged_by || data.acknowledgedBy,
          acknowledged_at: data.acknowledged_at || data.acknowledgedAt || new Date().toISOString(),
        };
        cache.byId.set(id, cache.data[index]);
        cache.unacknowledgedCount = Math.max(0, cache.data.filter((a) => !a.acknowledged).length);
        cache.events.emit('updated', cache.data);
        persistCache(cache, STORAGE_KEY);
      }
    } catch (e) {
      console.error('[AlertsCache] Error handling ALERT_ACKNOWLEDGED:', e);
    }
  });

  // All alerts acknowledged
  socketService.on(WS_EVENTS.ALERT_ACKNOWLEDGED_ALL, () => {
    const now = new Date().toISOString();
    cache.data = cache.data.map((a) => ({
      ...a,
      acknowledged: true,
      acknowledged_at: a.acknowledged_at || now,
    }));
    cache.byId.clear();
    cache.data.forEach((a) => cache.byId.set(String(a.alert_id), a));
    cache.unacknowledgedCount = 0;
    cache.events.emit('updated', cache.data);
    cache.events.emit('countUpdated', 0);
    persistCache(cache, STORAGE_KEY);
  });

  // Alert error from server
  socketService.on(WS_EVENTS.ALERT_ERROR, (error) => {
    console.error('[AlertsCache] WebSocket alert error:', error);
    cache.events.emit('error', error);
  });

  // Alert deleted
  socketService.on(WS_EVENTS.ALERT_DELETED, (data) => {
    try {
      // Handle various ID formats from server
      const alertId = data.alert_id || data.alertId || data.id;
      if (!alertId) {
        console.error('[AlertsCache] Invalid alert_id in ALERT_DELETED:', data);
        return;
      }

      const id = String(alertId);
      const index = cache.data.findIndex((a) => String(a.alert_id) === id);
      if (index !== -1) {
        const wasUnacknowledged = !cache.data[index].acknowledged;
        cache.data.splice(index, 1);
        cache.byId.delete(id);
        if (wasUnacknowledged) {
          cache.unacknowledgedCount = Math.max(0, cache.unacknowledgedCount - 1);
        }
        cache.events.emit('updated', cache.data);
        persistCache(cache, STORAGE_KEY);
      }
    } catch (e) {
      console.error('[AlertsCache] Error handling ALERT_DELETED:', e);
    }
  });

  // Unacknowledged count update from server
  socketService.on(WS_EVENTS.ALERT_COUNT, (data) => {
    try {
      const count = typeof data.count === 'number' ? data.count : data;
      cache.unacknowledgedCount = Math.max(0, count);
      cache.events.emit('countUpdated', cache.unacknowledgedCount);
    } catch (e) {
      console.error('[AlertsCache] Error handling ALERT_COUNT:', e);
    }
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
 * Uses WebSocket if connected, falls back to REST API.
 * @param {string} id - Alert ID
 * @returns {Promise<object|null>} Updated alert
 */
export async function acknowledgeAlert(id) {
  // Store for rollback
  const index = cache.data.findIndex((a) => a.alert_id === id);
  const previousState = index !== -1 ? { ...cache.data[index] } : null;

  try {
    // Optimistic update
    if (index !== -1 && !cache.data[index].acknowledged) {
      cache.data[index] = {
        ...cache.data[index],
        acknowledged: true,
        acknowledged_at: new Date().toISOString(),
      };
      cache.byId.set(String(id), cache.data[index]);
      cache.unacknowledgedCount = Math.max(0, cache.data.filter((a) => !a.acknowledged).length);
      cache.events.emit('updated', cache.data);
    }

    // Use WebSocket if connected, otherwise REST API
    if (socketService.isConnected()) {
      await socketService.acknowledgeAlert(id);
    } else {
      await apiAcknowledgeAlert(id);
    }

    return cache.data[index];
  } catch (error) {
    console.error('[AlertsCache] Failed to acknowledge:', error);
    // Revert optimistic update on error
    if (previousState && index !== -1) {
      cache.data[index] = previousState;
      cache.byId.set(String(id), previousState);
      cache.unacknowledgedCount = cache.data.filter((a) => !a.acknowledged).length;
      cache.events.emit('updated', cache.data);
    }
    showErrorAlert('Failed to acknowledge alert.', 'Alerts');
    throw error;
  }
}

/**
 * Dismiss/delete alert via WebSocket.
 * Uses WebSocket if connected, falls back to REST API.
 * @param {string} id - Alert ID
 * @returns {Promise<boolean>} Success
 */
export async function dismissAlert(id) {
  // Store for rollback
  const index = cache.data.findIndex((a) => a.alert_id === id);
  const removedItem = index !== -1 ? { ...cache.data[index] } : null;

  try {
    // Optimistic update
    if (index !== -1) {
      const wasUnacknowledged = !cache.data[index].acknowledged;
      cache.data.splice(index, 1);
      cache.byId.delete(String(id));
      if (wasUnacknowledged) {
        cache.unacknowledgedCount = Math.max(0, cache.unacknowledgedCount - 1);
      }
      cache.events.emit('updated', cache.data);
    }

    // Use WebSocket if connected, otherwise REST API
    if (socketService.isConnected()) {
      await socketService.dismissAlert(id);
    } else {
      await apiDeleteAlert(id);
    }

    return true;
  } catch (error) {
    console.error('[AlertsCache] Failed to dismiss:', error);
    // Revert optimistic update on error
    if (removedItem) {
      cache.data.splice(index, 0, removedItem);
      cache.byId.set(String(id), removedItem);
      cache.unacknowledgedCount = cache.data.filter((a) => !a.acknowledged).length;
      cache.events.emit('updated', cache.data);
    }
    showErrorAlert('Failed to dismiss alert.', 'Alerts');
    throw error;
  }
}

/**
 * Delete alert (admin only) - alias for dismissAlert for backward compatibility.
 * @param {string} id - Alert ID
 * @returns {Promise<boolean>} Success
 */
export async function deleteAlert(id) {
  return dismissAlert(id);
}

/**
 * Acknowledge all alerts via WebSocket.
 * @returns {Promise<number>} Count of acknowledged alerts
 */
export async function acknowledgeAllAlerts() {
  // Store for rollback
  const previousData = cache.data.map((a) => ({ ...a }));
  const previousCount = cache.unacknowledgedCount;

  try {
    // Optimistic update
    const now = new Date().toISOString();
    cache.data = cache.data.map((a) => ({
      ...a,
      acknowledged: true,
      acknowledged_at: a.acknowledged ? a.acknowledged_at : now,
    }));
    cache.data.forEach((a) => cache.byId.set(String(a.alert_id), a));
    cache.unacknowledgedCount = 0;
    cache.events.emit('updated', cache.data);

    // Use WebSocket if connected
    if (socketService.isConnected()) {
      await socketService.acknowledgeAllAlerts();
    }

    return previousCount;
  } catch (error) {
    console.error('[AlertsCache] Failed to acknowledge all:', error);
    // Revert optimistic update on error
    cache.data = previousData;
    cache.byId.clear();
    cache.data.forEach((a) => cache.byId.set(String(a.alert_id), a));
    cache.unacknowledgedCount = previousCount;
    cache.events.emit('updated', cache.data);
    showErrorAlert('Failed to acknowledge all alerts.', 'Alerts');
    throw error;
  }
}

/**
 * Request alert count from server via WebSocket.
 */
export function requestAlertCount() {
  if (socketService.isConnected()) {
    socketService.getAlertCount();
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

