/**
 * Alerts Store
 * Manages alerts cache with API and WebSocket integration.
 *
 * @module utils/notifications/alertsStore
 */

import { NOTIFICATION_STORAGE_KEYS, CACHE_TTL } from '../../constants';
import { notificationEvents, NOTIFICATION_EVENTS, createEventEmitter } from './events';
import { normalizeAlert } from './normalizers';
import { listAlerts, acknowledgeAlert, deleteAlert } from '../../api/notifications';
import { playNotificationSound } from './sound';
import { socketService, WS_EVENTS } from '../websocket';

// ============================================================================
// Store State
// ============================================================================

const state = {
  data: [],
  byId: new Map(),
  loading: false,
  error: null,
  lastFetch: null,
  activeCount: 0,
};

const events = createEventEmitter();

// ============================================================================
// Cache Helpers
// ============================================================================

function hasValidCache() {
  if (!state.lastFetch) return false;
  return Date.now() - state.lastFetch < CACHE_TTL.ALERTS;
}

function persistToStorage() {
  try {
    const toStore = {
      data: state.data,
      activeCount: state.activeCount,
      lastFetch: state.lastFetch,
    };
    localStorage.setItem(NOTIFICATION_STORAGE_KEYS.ALERTS, JSON.stringify(toStore));
  } catch (e) {
    // Ignore storage errors
  }
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEYS.ALERTS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.lastFetch && Date.now() - parsed.lastFetch < CACHE_TTL.ALERTS) {
        state.data = parsed.data || [];
        state.activeCount = Math.max(0, parsed.activeCount || 0);
        state.lastFetch = parsed.lastFetch;
        state.byId.clear();
        state.data.forEach((a) => state.byId.set(String(a.alert_id), a));
        return true;
      }
    }
  } catch (e) {
    // Ignore parse errors
  }
  return false;
}

function recalculateActiveCount() {
  state.activeCount = state.data.filter((a) => !a.acknowledged).length;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Get all alerts
 * @param {boolean} force - Force refresh from API
 * @param {object} params - Query params
 * @returns {Promise<Array>}
 */
export async function getAlerts(force = false, params = {}) {
  if (!force && hasValidCache()) {
    return state.data;
  }

  if (state.loading) {
    return state.data;
  }

  state.loading = true;
  state.error = null;

  try {
    const response = await listAlerts(params);
    const raw = response?.data?.alerts || [];

    const normalized = raw.map(normalizeAlert);

    state.data = normalized;
    state.byId.clear();
    normalized.forEach((a) => state.byId.set(String(a.alert_id), a));
    recalculateActiveCount();
    state.lastFetch = Date.now();
    state.loading = false;

    persistToStorage();
    events.emit('updated', state.data);
    notificationEvents.emit(NOTIFICATION_EVENTS.ALERTS_UPDATED, state.data);
    notificationEvents.emit(NOTIFICATION_EVENTS.ACTIVE_ALERTS_CHANGED, state.activeCount);

    return normalized;
  } catch (error) {
    state.error = error;
    state.loading = false;
    console.error('[AlertsStore] Failed to fetch:', error);
    return state.data;
  }
}

/**
 * Get alerts synchronously
 * @returns {Array}
 */
export function getAlertsSync() {
  return state.data;
}

/**
 * Get alert by ID
 * @param {string} alertId
 * @returns {object|null}
 */
export function getAlertById(alertId) {
  return state.byId.get(String(alertId)) || null;
}

/**
 * Get active (unacknowledged) alerts count
 * @returns {number}
 */
export function getActiveCount() {
  return Math.max(0, state.activeCount);
}

/**
 * Get active alerts
 * @returns {Array}
 */
export function getActiveAlerts() {
  return state.data.filter((a) => !a.acknowledged);
}

/**
 * Get alerts by severity
 * @param {string} severity
 * @returns {Array}
 */
export function getAlertsBySeverity(severity) {
  return state.data.filter((a) => a.severity === severity && !a.acknowledged);
}

/**
 * Get critical alerts
 * @returns {Array}
 */
export function getCriticalAlerts() {
  return state.data.filter((a) => (a.severity === 'critical' || a.severity === 'high') && !a.acknowledged);
}

/**
 * Check if loading
 * @returns {boolean}
 */
export function isLoading() {
  return state.loading;
}

/**
 * Subscribe to events
 * @param {string} event
 * @param {function} callback
 * @returns {function} Unsubscribe
 */
export function subscribe(event, callback) {
  return events.on(event, callback);
}

/**
 * Clear cache
 */
export function clearCache() {
  state.data = [];
  state.byId.clear();
  state.activeCount = 0;
  state.lastFetch = null;
  state.error = null;
  localStorage.removeItem(NOTIFICATION_STORAGE_KEYS.ALERTS);
  events.emit('updated', state.data);
}

// ============================================================================
// Actions
// ============================================================================

/**
 * Acknowledge alert
 * Uses WebSocket if connected, falls back to REST API
 * @param {string} alertId
 */
export async function acknowledge(alertId) {
  const alert = state.byId.get(String(alertId));
  if (!alert || alert.acknowledged) return;

  // Optimistic update
  alert.acknowledged = true;
  alert.acknowledged_at = new Date().toISOString();
  recalculateActiveCount();

  persistToStorage();
  events.emit('updated', state.data);
  notificationEvents.emit(NOTIFICATION_EVENTS.ALERT_ACKNOWLEDGED, alertId);
  notificationEvents.emit(NOTIFICATION_EVENTS.ACTIVE_ALERTS_CHANGED, state.activeCount);

  // Use WebSocket if connected, otherwise fall back to REST API
  if (socketService.isConnected()) {
    try {
      await socketService.acknowledgeAlert(alertId);
    } catch (error) {
      console.error('[AlertsStore] WebSocket acknowledge failed, trying API:', error);
      await acknowledgeAlert(alertId);
    }
  } else {
    try {
      await acknowledgeAlert(alertId);
    } catch (error) {
      console.error('[AlertsStore] Failed to acknowledge:', error);
      // Revert on error
      alert.acknowledged = false;
      alert.acknowledged_at = null;
      recalculateActiveCount();
      persistToStorage();
      events.emit('updated', state.data);
    }
  }
}

/**
 * Acknowledge all alerts
 * Uses WebSocket if connected, falls back to REST API
 */
export async function acknowledgeAll() {
  const activeIds = state.data.filter((a) => !a.acknowledged).map((a) => a.alert_id);
  if (activeIds.length === 0) return;

  // Optimistic update
  const now = new Date().toISOString();
  state.data.forEach((a) => {
    if (!a.acknowledged) {
      a.acknowledged = true;
      a.acknowledged_at = now;
    }
  });
  state.activeCount = 0;

  persistToStorage();
  events.emit('updated', state.data);
  notificationEvents.emit(NOTIFICATION_EVENTS.ACTIVE_ALERTS_CHANGED, 0);

  // Use WebSocket if connected
  if (socketService.isConnected()) {
    try {
      await socketService.acknowledgeAllAlerts();
    } catch (error) {
      console.error('[AlertsStore] WebSocket acknowledge all failed:', error);
      // Refresh from API on error
      await getAlerts(true);
    }
  }
}

/**
 * Delete/dismiss alert
 * Uses WebSocket if connected, falls back to REST API
 * @param {string} alertId
 */
export async function removeAlert(alertId) {
  const index = state.data.findIndex((a) => a.alert_id === alertId);
  if (index === -1) return;

  const removed = state.data[index];

  // Optimistic update
  state.data.splice(index, 1);
  state.byId.delete(String(alertId));
  recalculateActiveCount();

  persistToStorage();
  events.emit('updated', state.data);
  notificationEvents.emit(NOTIFICATION_EVENTS.ALERT_DELETED, alertId);
  notificationEvents.emit(NOTIFICATION_EVENTS.ACTIVE_ALERTS_CHANGED, state.activeCount);

  // Use WebSocket if connected, otherwise fall back to REST API
  if (socketService.isConnected()) {
    try {
      await socketService.dismissAlert(alertId);
    } catch (error) {
      console.error('[AlertsStore] WebSocket dismiss failed, trying API:', error);
      await deleteAlert(alertId);
    }
  } else {
    try {
      await deleteAlert(alertId);
    } catch (error) {
      console.error('[AlertsStore] Failed to delete:', error);
      // Restore on error
      state.data.splice(index, 0, removed);
      state.byId.set(String(alertId), removed);
      recalculateActiveCount();
      persistToStorage();
      events.emit('updated', state.data);
    }
  }
}

/**
 * Request alert count from server via WebSocket
 */
export function requestAlertCount() {
  if (socketService.isConnected()) {
    socketService.getAlertCount();
  }
}

/**
 * Add new alert (from WebSocket)
 * @param {object} alert
 */
export function addAlert(alert) {
  const normalized = normalizeAlert(alert);
  const id = String(normalized.alert_id);

  if (state.byId.has(id)) return;

  state.data.unshift(normalized);
  state.byId.set(id, normalized);
  recalculateActiveCount();

  persistToStorage();
  events.emit('updated', state.data);
  events.emit('new', normalized);
  notificationEvents.emit(NOTIFICATION_EVENTS.ALERT_NEW, normalized);
  notificationEvents.emit(NOTIFICATION_EVENTS.ACTIVE_ALERTS_CHANGED, state.activeCount);

  // Play notification sound for new alerts
  playNotificationSound();
}

// Initialize from storage
loadFromStorage();

// ============================================================================
// WebSocket Event Handlers
// ============================================================================

/**
 * Handle new alert from WebSocket
 * @param {object} data - Alert data from server
 */
function handleWebSocketNewAlert(data) {
  console.log('[AlertsStore] WebSocket new alert:', data);
  addAlert(data);
}

/**
 * Handle alert acknowledged from WebSocket (another device/tab)
 * @param {object} data - { alert_id }
 */
function handleWebSocketAlertAcknowledged(data) {
  console.log('[AlertsStore] WebSocket alert acknowledged:', data);
  const alert = state.byId.get(String(data.alert_id));
  if (alert && !alert.acknowledged) {
    alert.acknowledged = true;
    alert.acknowledged_at = new Date().toISOString();
    recalculateActiveCount();
    persistToStorage();
    events.emit('updated', state.data);
    notificationEvents.emit(NOTIFICATION_EVENTS.ACTIVE_ALERTS_CHANGED, state.activeCount);
  }
}

/**
 * Handle all alerts acknowledged from WebSocket
 * @param {object} data - { count }
 */
function handleWebSocketAcknowledgedAll(data) {
  console.log('[AlertsStore] WebSocket all alerts acknowledged:', data);
  const now = new Date().toISOString();
  state.data.forEach((a) => {
    if (!a.acknowledged) {
      a.acknowledged = true;
      a.acknowledged_at = now;
    }
  });
  state.activeCount = 0;
  persistToStorage();
  events.emit('updated', state.data);
  notificationEvents.emit(NOTIFICATION_EVENTS.ACTIVE_ALERTS_CHANGED, 0);
}

/**
 * Handle alert deleted from WebSocket
 * @param {object} data - { alert_id }
 */
function handleWebSocketAlertDeleted(data) {
  console.log('[AlertsStore] WebSocket alert deleted:', data);
  const id = String(data.alert_id);
  const index = state.data.findIndex((a) => String(a.alert_id) === id);
  if (index !== -1) {
    state.data.splice(index, 1);
    state.byId.delete(id);
    recalculateActiveCount();
    persistToStorage();
    events.emit('updated', state.data);
    notificationEvents.emit(NOTIFICATION_EVENTS.ALERT_DELETED, data.alert_id);
    notificationEvents.emit(NOTIFICATION_EVENTS.ACTIVE_ALERTS_CHANGED, state.activeCount);
  }
}

/**
 * Handle alert count update from WebSocket
 * @param {object} data - { count }
 */
function handleWebSocketCountUpdate(data) {
  console.log('[AlertsStore] WebSocket count update:', data);
  if (typeof data.count === 'number') {
    state.activeCount = Math.max(0, data.count);
    persistToStorage();
    notificationEvents.emit(NOTIFICATION_EVENTS.ACTIVE_ALERTS_CHANGED, state.activeCount);
  }
}

/**
 * Handle alert error from WebSocket
 * @param {object} data - { code, message }
 */
function handleWebSocketAlertError(data) {
  console.error('[AlertsStore] WebSocket alert error:', data);
  state.error = data;
  events.emit('error', data);
}

// Register WebSocket event listeners
socketService.on(WS_EVENTS.ALERT_NEW, handleWebSocketNewAlert);
socketService.on(WS_EVENTS.ALERT_ACKNOWLEDGED, handleWebSocketAlertAcknowledged);
socketService.on(WS_EVENTS.ALERT_ACKNOWLEDGED_ALL, handleWebSocketAcknowledgedAll);
socketService.on(WS_EVENTS.ALERT_DELETED, handleWebSocketAlertDeleted);
socketService.on(WS_EVENTS.ALERT_COUNT, handleWebSocketCountUpdate);
socketService.on(WS_EVENTS.ALERT_ERROR, handleWebSocketAlertError);

export default {
  getAlerts,
  getAlertsSync,
  getAlertById,
  getActiveCount,
  getActiveAlerts,
  getAlertsBySeverity,
  getCriticalAlerts,
  isLoading,
  subscribe,
  clearCache,
  acknowledge,
  acknowledgeAll,
  removeAlert,
  addAlert,
  requestAlertCount,
};

