/**
 * Alerts Store
 * Manages alerts cache with API integration.
 *
 * @module utils/notifications/alertsStore
 */

import { STORAGE_KEYS, CACHE_TTL } from './constants';
import { notificationEvents, NOTIFICATION_EVENTS, createEventEmitter } from './events';
import { normalizeAlert } from './normalizers';
import { listAlerts, acknowledgeAlert, deleteAlert } from '../../api/notifications';
import { playNotificationSound } from './sound';

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
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(toStore));
  } catch (e) {
    // Ignore storage errors
  }
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ALERTS);
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
  localStorage.removeItem(STORAGE_KEYS.ALERTS);
  events.emit('updated', state.data);
}

// ============================================================================
// Actions
// ============================================================================

/**
 * Acknowledge alert
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

  // API call
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

/**
 * Delete alert
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

  // API call
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
  removeAlert,
  addAlert,
};

