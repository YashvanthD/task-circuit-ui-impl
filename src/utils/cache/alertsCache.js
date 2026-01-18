/**
 * Alerts Cache
 * Caches system alerts with lazy loading.
 * Integrates with WebSocket for real-time updates via centralized wsManager.
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
import { WS_EVENTS, subscribeWS, isConnected, wsAlerts } from '../websocket';
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
let unsubscribeFns = []; // Store unsubscribe functions

/**
 * Subscribe to WebSocket alert events via centralized wsManager.
 * Note: wsManager should be initialized before calling this (via DataContext).
 */
export function subscribeToAlertWebSocket() {
  if (wsSubscribed) return;

  // Check if connected - if not, wait for connection
  if (!isConnected()) {
    console.log('[AlertsCache] WebSocket not connected, waiting...');
    return;
  }

  console.log('[AlertsCache] Subscribing to alert events via wsManager...');

  // New alert received
  unsubscribeFns.push(subscribeWS(WS_EVENTS.ALERT_NEW, (rawAlert) => {
    try {
      const alert = normalizeAlert(rawAlert);
      if (!alert || !alert.alert_id) {
        console.error('[AlertsCache] Invalid alert received:', rawAlert);
        return;
      }

      const id = String(alert.alert_id);

      if (cache.byId.has(id)) {
        cache.data = [alert, ...cache.data.filter((a) => String(a.alert_id) !== id)];
      } else {
        cache.data = [alert, ...cache.data];
      }

      cache.byId.clear();
      cache.data.forEach((a) => cache.byId.set(String(a.alert_id), a));
      cache.unacknowledgedCount = cache.data.filter((a) => !a.acknowledged).length;
      cache.events.emit('updated', [...cache.data]);
      cache.events.emit('new', alert);
      persistCache(cache, STORAGE_KEY);
      playNotificationSound();
    } catch (e) {
      console.error('[AlertsCache] Error handling ALERT_NEW:', e);
    }
  }));

  // Alert acknowledged
  unsubscribeFns.push(subscribeWS(WS_EVENTS.ALERT_ACKNOWLEDGED, (data) => {
    try {
      const alertId = data.alert_id || data.alertId || data.id;
      if (!alertId) return;

      const id = String(alertId);
      const index = cache.data.findIndex((a) => String(a.alert_id) === id);
      if (index !== -1 && !cache.data[index].acknowledged) {
        const updatedAlert = {
          ...cache.data[index],
          acknowledged: true,
          acknowledged_by: data.acknowledged_by || data.acknowledgedBy,
          acknowledged_at: data.acknowledged_at || data.acknowledgedAt || new Date().toISOString(),
        };
        cache.data = [
          ...cache.data.slice(0, index),
          updatedAlert,
          ...cache.data.slice(index + 1)
        ];
        cache.byId.set(id, updatedAlert);
        cache.unacknowledgedCount = Math.max(0, cache.data.filter((a) => !a.acknowledged).length);
        cache.events.emit('updated', [...cache.data]);
        persistCache(cache, STORAGE_KEY);
      }
    } catch (e) {
      console.error('[AlertsCache] Error handling ALERT_ACKNOWLEDGED:', e);
    }
  }));

  // All alerts acknowledged
  unsubscribeFns.push(subscribeWS(WS_EVENTS.ALERT_ACKNOWLEDGED_ALL, () => {
    try {
      const now = new Date().toISOString();
      cache.data = cache.data.map((a) => ({
        ...a,
        acknowledged: true,
        acknowledged_at: a.acknowledged_at || now,
      }));
      cache.byId.clear();
      cache.data.forEach((a) => cache.byId.set(String(a.alert_id), a));
      cache.unacknowledgedCount = 0;
      cache.events.emit('updated', [...cache.data]);
      cache.events.emit('countUpdated', 0);
      persistCache(cache, STORAGE_KEY);
    } catch (e) {
      console.error('[AlertsCache] Error handling ALERT_ACKNOWLEDGED_ALL:', e);
    }
  }));

  // Alert error from server
  unsubscribeFns.push(subscribeWS(WS_EVENTS.ALERT_ERROR, (error) => {
    console.error('[AlertsCache] WebSocket alert error:', error);
    cache.events.emit('error', error);
  }));

  // Alert deleted
  unsubscribeFns.push(subscribeWS(WS_EVENTS.ALERT_DELETED, (data) => {
    try {
      const alertId = data.alert_id || data.alertId || data.id;
      if (!alertId) return;

      const id = String(alertId);
      const index = cache.data.findIndex((a) => String(a.alert_id) === id);
      if (index !== -1) {
        const wasUnacknowledged = !cache.data[index].acknowledged;
        cache.data = [...cache.data.slice(0, index), ...cache.data.slice(index + 1)];
        cache.byId.delete(id);
        if (wasUnacknowledged) {
          cache.unacknowledgedCount = Math.max(0, cache.unacknowledgedCount - 1);
        }
        cache.events.emit('updated', [...cache.data]);
        persistCache(cache, STORAGE_KEY);
      }
    } catch (e) {
      console.error('[AlertsCache] Error handling ALERT_DELETED:', e);
    }
  }));

  // Unacknowledged count update from server
  unsubscribeFns.push(subscribeWS(WS_EVENTS.ALERT_COUNT, (data) => {
    try {
      const count = typeof data?.count === 'number' ? data.count : data;
      cache.unacknowledgedCount = Math.max(0, count);
      cache.events.emit('countUpdated', cache.unacknowledgedCount);
    } catch (e) {
      console.error('[AlertsCache] Error handling ALERT_COUNT:', e);
    }
  }));

  wsSubscribed = true;
  console.log('[AlertsCache] Subscribed to alert events');
}

/**
 * Unsubscribe from WebSocket events
 */
export function unsubscribeFromAlertWebSocket() {
  unsubscribeFns.forEach((unsub) => {
    if (typeof unsub === 'function') unsub();
  });
  unsubscribeFns = [];
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
  const index = cache.data.findIndex((a) => a.alert_id === id);
  const previousState = index !== -1 ? { ...cache.data[index] } : null;

  try {
    // Optimistic update with new array reference
    if (index !== -1 && !cache.data[index].acknowledged) {
      const updatedAlert = {
        ...cache.data[index],
        acknowledged: true,
        acknowledged_at: new Date().toISOString(),
      };
      cache.data = [
        ...cache.data.slice(0, index),
        updatedAlert,
        ...cache.data.slice(index + 1)
      ];
      cache.byId.set(String(id), updatedAlert);
      cache.unacknowledgedCount = Math.max(0, cache.data.filter((a) => !a.acknowledged).length);
      cache.events.emit('updated', [...cache.data]);
    }

    // Use WebSocket if connected, otherwise REST API
    if (isConnected()) {
      wsAlerts.acknowledge(id);
    } else {
      await apiAcknowledgeAlert(id);
    }

    return index !== -1 ? cache.data[index] : null;
  } catch (error) {
    console.error('[AlertsCache] Failed to acknowledge:', error);
    // Revert optimistic update on error
    if (previousState && index !== -1) {
      cache.data = [
        ...cache.data.slice(0, index),
        previousState,
        ...cache.data.slice(index + 1)
      ];
      cache.byId.set(String(id), previousState);
      cache.unacknowledgedCount = cache.data.filter((a) => !a.acknowledged).length;
      cache.events.emit('updated', [...cache.data]);
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
  const index = cache.data.findIndex((a) => a.alert_id === id);
  const removedItem = index !== -1 ? { ...cache.data[index] } : null;

  try {
    // Optimistic update with new array reference
    if (index !== -1) {
      const wasUnacknowledged = !cache.data[index].acknowledged;
      cache.data = [...cache.data.slice(0, index), ...cache.data.slice(index + 1)];
      cache.byId.delete(String(id));
      if (wasUnacknowledged) {
        cache.unacknowledgedCount = Math.max(0, cache.unacknowledgedCount - 1);
      }
      cache.events.emit('updated', [...cache.data]);
    }

    // Use WebSocket if connected, otherwise REST API
    if (isConnected()) {
      wsAlerts.dismiss(id);
    } else {
      await apiDeleteAlert(id);
    }

    return true;
  } catch (error) {
    console.error('[AlertsCache] Failed to dismiss:', error);
    // Revert optimistic update on error
    if (removedItem && index !== -1) {
      cache.data = [
        ...cache.data.slice(0, index),
        removedItem,
        ...cache.data.slice(index)
      ];
      cache.byId.set(String(id), removedItem);
      cache.unacknowledgedCount = cache.data.filter((a) => !a.acknowledged).length;
      cache.events.emit('updated', [...cache.data]);
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
 * Resolve an alert.
 * Marks alert as resolved and removes from active alerts display.
 * @param {string} id - Alert ID
 * @returns {Promise<object|null>} Updated alert
 */
export async function resolveAlert(id) {
  const index = cache.data.findIndex((a) => a.alert_id === id);
  const previousState = index !== -1 ? { ...cache.data[index] } : null;

  try {
    // Optimistic update - mark as resolved
    if (index !== -1) {
      const wasUnacknowledged = !cache.data[index].acknowledged;
      const updatedAlert = {
        ...cache.data[index],
        resolved: true,
        resolved_at: new Date().toISOString(),
        acknowledged: true, // Resolving also acknowledges
        acknowledged_at: cache.data[index].acknowledged_at || new Date().toISOString(),
      };
      cache.data = [
        ...cache.data.slice(0, index),
        updatedAlert,
        ...cache.data.slice(index + 1)
      ];
      cache.byId.set(String(id), updatedAlert);
      if (wasUnacknowledged) {
        cache.unacknowledgedCount = Math.max(0, cache.unacknowledgedCount - 1);
      }
      cache.events.emit('updated', [...cache.data]);
    }

    // Use dismiss via WebSocket/API since there's no specific resolve endpoint
    // The resolved state is tracked locally for UI purposes
    if (isConnected()) {
      wsAlerts.dismiss(id);
    } else {
      await apiDeleteAlert(id);
    }

    return index !== -1 ? cache.data[index] : null;
  } catch (error) {
    console.error('[AlertsCache] Failed to resolve:', error);
    // Revert optimistic update on error
    if (previousState && index !== -1) {
      cache.data = [
        ...cache.data.slice(0, index),
        previousState,
        ...cache.data.slice(index + 1)
      ];
      cache.byId.set(String(id), previousState);
      cache.unacknowledgedCount = cache.data.filter((a) => !a.acknowledged).length;
      cache.events.emit('updated', [...cache.data]);
    }
    showErrorAlert('Failed to resolve alert.', 'Alerts');
    throw error;
  }
}

/**
 * Acknowledge all alerts via WebSocket.
 * @returns {Promise<number>} Count of acknowledged alerts
 */
export async function acknowledgeAllAlerts() {
  const previousData = cache.data.map((a) => ({ ...a }));
  const previousCount = cache.unacknowledgedCount;

  try {
    // Optimistic update with new array reference
    const now = new Date().toISOString();
    cache.data = cache.data.map((a) => ({
      ...a,
      acknowledged: true,
      acknowledged_at: a.acknowledged ? a.acknowledged_at : now,
    }));
    cache.byId.clear();
    cache.data.forEach((a) => cache.byId.set(String(a.alert_id), a));
    cache.unacknowledgedCount = 0;
    cache.events.emit('updated', [...cache.data]);

    // Use WebSocket if connected
    if (isConnected()) {
      wsAlerts.acknowledgeAll();
    }

    return previousCount;
  } catch (error) {
    console.error('[AlertsCache] Failed to acknowledge all:', error);
    // Revert optimistic update on error
    cache.data = previousData;
    cache.byId.clear();
    cache.data.forEach((a) => cache.byId.set(String(a.alert_id), a));
    cache.unacknowledgedCount = previousCount;
    cache.events.emit('updated', [...cache.data]);
    showErrorAlert('Failed to acknowledge all alerts.', 'Alerts');
    throw error;
  }
}

/**
 * Request alert count from server via WebSocket.
 */
export function requestAlertCount() {
  if (isConnected()) {
    wsAlerts.getCount();
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

