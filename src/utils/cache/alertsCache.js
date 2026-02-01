/**
 * Alerts State Manager
 * Simple state with Alert model and WebSocket listeners
 */

import Alert from '../../models/Alert';
import { listAlerts as apiListAlerts } from '../../api/notifications';
import { WS_EVENTS, subscribeWS, wsAlerts } from '../websocket';
import { playAlertSound } from '../notifications/sound';

class EventEmitter {
  constructor() {
    this.listeners = new Map();
  }
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => {
      if (this.listeners.has(event)) {
        this.listeners.get(event).delete(callback);
      }
    };
  }
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error('[Alerts] Event error:', e);
        }
      });
    }
  }
}

const state = {
  alerts: [],
  loading: false,
  error: null,
  events: new EventEmitter(),
};

function notifyChange() {
  const alertsCopy = [...state.alerts];
  state.events.emit('updated', alertsCopy);
  state.events.emit('change', alertsCopy);
}

export async function getAlerts() {
  state.loading = true;
  state.events.emit('loading', true);

  try {
    const response = await apiListAlerts();
    const data = response?.data?.alerts || response?.data || [];
    // Filter out resolved and deleted alerts
    const activeAlerts = data.filter(item =>
      item.status !== 'resolved' &&
      item.status !== 'deleted'
    );
    state.alerts = activeAlerts.map(item => new Alert(item));
    state.loading = false;
    state.error = null;
    state.events.emit('loading', false);
    notifyChange();
    return state.alerts;
  } catch (error) {
    state.error = error;
    state.loading = false;
    state.events.emit('loading', false);
    state.events.emit('error', error);
    return state.alerts;
  }
}

export async function resolveAlert(ids) {
  const alertIds = Array.isArray(ids) ? ids : [ids];

  try {
    for (const id of alertIds) {
      state.alerts = state.alerts.filter(a => a.alert_id !== id);
      wsAlerts.resolve(id);
    }
    notifyChange();
    return true;
  } catch (error) {
    console.error('[Alerts] Resolve failed:', error);
    await getAlerts();
    return false;
  }
}

export async function deleteAlert(ids) {
  const alertIds = Array.isArray(ids) ? ids : [ids];

  try {
    for (const id of alertIds) {
      state.alerts = state.alerts.filter(a => a.alert_id !== id);
      wsAlerts.delete(id);
    }
    notifyChange();
    return true;
  } catch (error) {
    console.error('[Alerts] Delete failed:', error);
    await getAlerts();
    return false;
  }
}

export function getAlertsSync() {
  // Only return active (non-resolved) alerts
  return state.alerts.filter(a => !a.isResolved());
}

export function getAllAlertsSync() {
  // Return all alerts including resolved
  return state.alerts;
}

export function isAlertsLoading() {
  return state.loading;
}

export function getAlertsError() {
  return state.error;
}

export function onAlertsChange(event, callback) {
  return state.events.on(event, callback);
}

let wsInitialized = false;

export function subscribeToAlertWebSocket() {
  if (wsInitialized) return;

  const handleNewAlert = (data) => {
    const existingAlert = state.alerts.find(a => a.alert_id === data.alert_id);
    if (!existingAlert) {
      const alert = new Alert(data);
      state.alerts = [alert, ...state.alerts];
      playAlertSound(alert);
      notifyChange();
      state.events.emit('new', alert);
    }
  };

  subscribeWS(WS_EVENTS.ALERT_CREATED, handleNewAlert);
  subscribeWS(WS_EVENTS.ALERT_NEW, handleNewAlert);

  subscribeWS(WS_EVENTS.ALERT_RESOLVED, (data) => {
    state.alerts = state.alerts.filter(a => a.alert_id !== data.alert_id);
    notifyChange();
  });

  subscribeWS(WS_EVENTS.ALERT_DELETED, (data) => {
    state.alerts = state.alerts.filter(a => a.alert_id !== data.alert_id);
    notifyChange();
  });

  wsAlerts.subscribe();
  getAlerts();
  wsInitialized = true;
}

export function refreshAlerts() {
  return getAlerts();
}

export function clearAlertsCache() {
  state.alerts = [];
  notifyChange();
}

export function getUnacknowledgedAlertCount() {
  return state.alerts.filter(a => a.isUnacknowledged()).length;
}

export function getAlertById(id) {
  return state.alerts.find(a => a.alert_id === id) || null;
}

export function getUnacknowledgedAlerts() {
  return state.alerts.filter(a => a.isUnacknowledged());
}

export function getCriticalAlerts() {
  return state.alerts.filter(a => a.severity === 'critical' && a.isUnacknowledged());
}

export async function acknowledgeAlert(id) {
  const alert = state.alerts.find(a => a.alert_id === id);
  if (alert) {
    alert.acknowledge('current_user');
    notifyChange();
  }
  return alert;
}

export async function acknowledgeAllAlerts() {
  state.alerts.forEach(a => a.acknowledge('current_user'));
  notifyChange();
}

export function unsubscribeFromAlertWebSocket() {
  wsInitialized = false;
}
