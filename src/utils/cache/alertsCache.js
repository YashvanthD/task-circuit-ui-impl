/**
 * Alerts Cache Singleton
 * Single source of truth for system alerts.
 * Ensures no duplicates and proper state management.
 *
 * @module utils/cache/alertsCache
 */

import Alert from '../../models/Alert';
import { listAlerts as apiListAlerts } from '../../api/notifications';
import { WS_EVENTS, subscribeWS, wsAlerts } from '../websocket';
import { playAlertSound } from '../notifications/sound';

// ============================================================================
// Singleton AlertsCache Class
// ============================================================================

class AlertsCache {
  static instance = null;

  constructor() {
    if (AlertsCache.instance) {
      return AlertsCache.instance;
    }

    // Internal state
    this._alerts = new Map(); // Use Map for O(1) lookups and no duplicates
    this._loading = false;
    this._error = null;
    this._wsInitialized = false;
    this._listeners = new Map();

    AlertsCache.instance = this;
  }

  static getInstance() {
    if (!AlertsCache.instance) {
      AlertsCache.instance = new AlertsCache();
    }
    return AlertsCache.instance;
  }

  // ==========================================================================
  // Event System
  // ==========================================================================

  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this._listeners.has(event)) {
      this._listeners.get(event).delete(callback);
    }
  }

  _emit(event, data) {
    if (this._listeners.has(event)) {
      this._listeners.get(event).forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error('[AlertsCache] Event error:', e);
        }
      });
    }
  }

  _notifyChange() {
    const alertsArray = this.getAlertsSync();
    this._emit('updated', alertsArray);
    this._emit('change', alertsArray);
  }

  // ==========================================================================
  // Core Alert Management
  // ==========================================================================

  /**
   * Add or update an alert. Prevents duplicates using Map.
   */
  _upsertAlert(alertData) {
    const alert = alertData instanceof Alert ? alertData : new Alert(alertData);
    const alertId = alert.alert_id;

    if (!alertId) {
      console.warn('[AlertsCache] Cannot add alert without alert_id:', alertData);
      return null;
    }

    // Check if already exists and is resolved - don't re-add
    const existing = this._alerts.get(alertId);
    if (existing && existing.isResolved()) {
      return existing;
    }

    this._alerts.set(alertId, alert);
    return alert;
  }

  /**
   * Remove an alert by ID.
   */
  _removeAlert(alertId) {
    if (!alertId) return false;
    const existed = this._alerts.has(alertId);
    this._alerts.delete(alertId);
    return existed;
  }

  /**
   * Clear all alerts.
   */
  _clearAlerts() {
    this._alerts.clear();
  }

  // ==========================================================================
  // Public API
  // ==========================================================================

  /**
   * Fetch alerts from API.
   */
  async getAlerts() {
    this._loading = true;
    this._emit('loading', true);

    try {
      const response = await apiListAlerts();
      const data = response?.data?.alerts || response?.data || [];

      // Clear and re-populate to ensure no stale data
      this._clearAlerts();

      // Filter out resolved and deleted alerts, then add
      data.forEach(item => {
        if (item.status !== 'resolved' && item.status !== 'deleted') {
          this._upsertAlert(item);
        }
      });

      this._loading = false;
      this._error = null;
      this._emit('loading', false);
      this._notifyChange();
      return this.getAlertsSync();
    } catch (error) {
      this._error = error;
      this._loading = false;
      this._emit('loading', false);
      this._emit('error', error);
      return this.getAlertsSync();
    }
  }

  /**
   * Get all active alerts synchronously (non-resolved).
   */
  getAlertsSync() {
    return Array.from(this._alerts.values()).filter(a => !a.isResolved());
  }

  /**
   * Get all alerts including resolved.
   */
  getAllAlertsSync() {
    return Array.from(this._alerts.values());
  }

  /**
   * Get alert by ID.
   */
  getAlertById(id) {
    return this._alerts.get(id) || null;
  }

  /**
   * Check if loading.
   */
  isLoading() {
    return this._loading;
  }

  /**
   * Get error.
   */
  getError() {
    return this._error;
  }

  /**
   * Resolve alert(s).
   */
  async resolveAlert(ids) {
    const alertIds = Array.isArray(ids) ? ids : [ids];

    try {
      for (const id of alertIds) {
        const alert = this._alerts.get(id);
        if (alert) {
          alert.status = 'resolved';
          alert.resolved_at = new Date().toISOString();
        }
        this._removeAlert(id);
        wsAlerts.resolve(id);
      }
      this._notifyChange();
      return true;
    } catch (error) {
      console.error('[AlertsCache] Resolve failed:', error);
      await this.getAlerts();
      return false;
    }
  }

  /**
   * Delete alert(s).
   */
  async deleteAlert(ids) {
    const alertIds = Array.isArray(ids) ? ids : [ids];

    try {
      for (const id of alertIds) {
        this._removeAlert(id);
        wsAlerts.delete(id);
      }
      this._notifyChange();
      return true;
    } catch (error) {
      console.error('[AlertsCache] Delete failed:', error);
      await this.getAlerts();
      return false;
    }
  }

  /**
   * Acknowledge alert.
   */
  async acknowledgeAlert(id) {
    const alert = this._alerts.get(id);
    if (alert) {
      alert.acknowledge('current_user');
      this._notifyChange();
    }
    return alert;
  }

  /**
   * Acknowledge all alerts.
   */
  async acknowledgeAllAlerts() {
    this._alerts.forEach(a => a.acknowledge('current_user'));
    this._notifyChange();
  }

  /**
   * Get unacknowledged alert count.
   */
  getUnacknowledgedCount() {
    return this.getAlertsSync().filter(a => a.isUnacknowledged()).length;
  }

  /**
   * Get unacknowledged alerts.
   */
  getUnacknowledgedAlerts() {
    return this.getAlertsSync().filter(a => a.isUnacknowledged());
  }

  /**
   * Get critical alerts.
   */
  getCriticalAlerts() {
    return this.getAlertsSync().filter(a => a.severity === 'critical' && a.isUnacknowledged());
  }

  /**
   * Refresh alerts from API.
   */
  refreshAlerts() {
    return this.getAlerts();
  }

  /**
   * Clear cache.
   */
  clearCache() {
    this._clearAlerts();
    this._notifyChange();
  }

  // ==========================================================================
  // WebSocket Integration
  // ==========================================================================

  subscribeToWebSocket() {
    if (this._wsInitialized) return;

    const handleNewAlert = (data) => {
      const alertId = data.alert_id || data.alertId || data.id;

      // Check for duplicate
      if (alertId && this._alerts.has(alertId)) {
        console.log('[AlertsCache] Alert already exists, skipping:', alertId);
        return;
      }

      const alert = this._upsertAlert(data);
      if (alert) {
        playAlertSound(alert);
        this._notifyChange();
        this._emit('new', alert);
      }
    };

    subscribeWS(WS_EVENTS.ALERT_CREATED, handleNewAlert);
    subscribeWS(WS_EVENTS.ALERT_NEW, handleNewAlert);

    subscribeWS(WS_EVENTS.ALERT_RESOLVED, (data) => {
      const alertId = data.alert_id || data.alertId || data.id;
      if (!alertId) {
        console.warn('[AlertsCache] ALERT_RESOLVED: No alert_id in data', data);
        return;
      }

      console.log('[AlertsCache] Removing resolved alert:', alertId);
      const removed = this._removeAlert(alertId);
      if (!removed) {
        console.warn('[AlertsCache] Alert not found in cache:', alertId);
      }
      this._notifyChange();
    });

    subscribeWS(WS_EVENTS.ALERT_DELETED, (data) => {
      const alertId = data.alert_id || data.alertId || data.id;
      if (!alertId) {
        console.warn('[AlertsCache] ALERT_DELETED: No alert_id in data', data);
        return;
      }

      console.log('[AlertsCache] Removing deleted alert:', alertId);
      this._removeAlert(alertId);
      this._notifyChange();
    });

    wsAlerts.subscribe();
    this.getAlerts();
    this._wsInitialized = true;
  }

  unsubscribeFromWebSocket() {
    this._wsInitialized = false;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

const alertsCache = AlertsCache.getInstance();

// ============================================================================
// Export Functions (for backward compatibility)
// ============================================================================

export async function getAlerts() {
  return alertsCache.getAlerts();
}

export function getAlertsSync() {
  return alertsCache.getAlertsSync();
}

export function getAllAlertsSync() {
  return alertsCache.getAllAlertsSync();
}

export function isAlertsLoading() {
  return alertsCache.isLoading();
}

export function getAlertsError() {
  return alertsCache.getError();
}

export function onAlertsChange(event, callback) {
  return alertsCache.on(event, callback);
}

export async function resolveAlert(ids) {
  return alertsCache.resolveAlert(ids);
}

export async function deleteAlert(ids) {
  return alertsCache.deleteAlert(ids);
}

export async function acknowledgeAlert(id) {
  return alertsCache.acknowledgeAlert(id);
}

export async function acknowledgeAllAlerts() {
  return alertsCache.acknowledgeAllAlerts();
}

export function refreshAlerts() {
  return alertsCache.refreshAlerts();
}

export function clearAlertsCache() {
  return alertsCache.clearCache();
}

export function getUnacknowledgedAlertCount() {
  return alertsCache.getUnacknowledgedCount();
}

export function getAlertById(id) {
  return alertsCache.getAlertById(id);
}

export function getUnacknowledgedAlerts() {
  return alertsCache.getUnacknowledgedAlerts();
}

export function getCriticalAlerts() {
  return alertsCache.getCriticalAlerts();
}

export function subscribeToAlertWebSocket() {
  return alertsCache.subscribeToWebSocket();
}

export function unsubscribeFromAlertWebSocket() {
  return alertsCache.unsubscribeFromWebSocket();
}

// Export singleton and class
export { alertsCache, AlertsCache };
export default alertsCache;
