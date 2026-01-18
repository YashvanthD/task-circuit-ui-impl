/**
 * Notifications - WebSocket Handler
 * Handles WebSocket events for notifications and alerts.
 *
 * @module utils/notifications/wsHandler
 */

import { socketService, WS_EVENTS } from '../websocket';
import * as notificationsStore from './notificationsStore';
import * as alertsStore from './alertsStore';

// ============================================================================
// State
// ============================================================================

let subscribed = false;

// ============================================================================
// Public API
// ============================================================================

/**
 * Subscribe to WebSocket notification/alert events
 *
 * NOTE: The actual WebSocket event handling is done by:
 * - utils/cache/notificationsCache.js - for notifications
 * - utils/cache/alertsCache.js - for alerts
 *
 * This function is kept for backward compatibility but does NOT register
 * duplicate listeners anymore to avoid double-handling of events.
 */
export function subscribeToNotificationWebSocket() {
  if (subscribed) return;
  if (!socketService.isConnected()) {
    console.log('[NotificationWS] WebSocket not connected, skipping subscription');
    return;
  }

  console.log('[NotificationWS] Subscription delegated to notificationsCache and alertsCache');

  // NOTE: We do NOT call registerNotificationHandlers() or registerAlertHandlers()
  // because notificationsCache.js and alertsCache.js already handle these events.
  // Registering them here would cause duplicate event handling.

  subscribed = true;
}

/**
 * Unsubscribe from WebSocket events
 */
export function unsubscribeFromNotificationWebSocket() {
  subscribed = false;
}

/**
 * Check if subscribed
 * @returns {boolean}
 */
export function isSubscribed() {
  return subscribed;
}

/**
 * Reset subscription state
 */
export function resetState() {
  subscribed = false;
}

// ============================================================================
// Notification Handlers
// ============================================================================

function registerNotificationHandlers() {
  // New notification received
  socketService.on(WS_EVENTS.NOTIFICATION_NEW, (data) => {
    console.log('[NotificationWS] New notification:', data);
    notificationsStore.addNotification(data);
  });

  // Notification marked as read (from another device/tab)
  socketService.on(WS_EVENTS.NOTIFICATION_READ, (data) => {
    const notificationId = data.notification_id || data.notificationId || data.id;
    console.log('[NotificationWS] Notification read:', notificationId);

    const notif = notificationsStore.getNotificationById(notificationId);
    if (notif && !notif.read) {
      notif.read = true;
      notif.read_at = data.read_at || new Date().toISOString();
      // Trigger update without API call (already synced)
      notificationsStore.getNotifications(true);
    }
  });

  // All notifications marked as read
  socketService.on(WS_EVENTS.NOTIFICATION_READ_ALL, () => {
    console.log('[NotificationWS] All notifications read');
    notificationsStore.getNotifications(true);
  });

  // Notification deleted
  socketService.on(WS_EVENTS.NOTIFICATION_DELETED, (data) => {
    const notificationId = data.notification_id || data.notificationId || data.id;
    console.log('[NotificationWS] Notification deleted:', notificationId);
    // Refresh to sync
    notificationsStore.getNotifications(true);
  });

  // Notification count update
  socketService.on(WS_EVENTS.NOTIFICATION_COUNT, (data) => {
    const count = data.count || data.unread_count || 0;
    console.log('[NotificationWS] Notification count:', count);
    // Refresh if count differs from local
    const localCount = notificationsStore.getUnreadCount();
    if (count !== localCount) {
      notificationsStore.getNotifications(true);
    }
  });
}

// ============================================================================
// Alert Handlers
// ============================================================================

function registerAlertHandlers() {
  // New alert received
  socketService.on(WS_EVENTS.ALERT_NEW, (data) => {
    console.log('[NotificationWS] New alert:', data);
    alertsStore.addAlert(data);
  });

  // Alert acknowledged (from another device/tab)
  socketService.on(WS_EVENTS.ALERT_ACKNOWLEDGED, (data) => {
    const alertId = data.alert_id || data.alertId || data.id;
    console.log('[NotificationWS] Alert acknowledged:', alertId);

    const alert = alertsStore.getAlertById(alertId);
    if (alert && !alert.acknowledged) {
      alert.acknowledged = true;
      alert.acknowledged_at = data.acknowledged_at || new Date().toISOString();
      alert.acknowledged_by = data.acknowledged_by;
      // Refresh to sync
      alertsStore.getAlerts(true);
    }
  });

  // Alert deleted
  socketService.on(WS_EVENTS.ALERT_DELETED, (data) => {
    const alertId = data.alert_id || data.alertId || data.id;
    console.log('[NotificationWS] Alert deleted:', alertId);
    // Refresh to sync
    alertsStore.getAlerts(true);
  });

  // Alert count update
  socketService.on(WS_EVENTS.ALERT_COUNT, (data) => {
    const count = data.count || data.active_count || 0;
    console.log('[NotificationWS] Alert count:', count);
    // Refresh if count differs from local
    const localCount = alertsStore.getActiveCount();
    if (count !== localCount) {
      alertsStore.getAlerts(true);
    }
  });
}

// ============================================================================
// Actions via WebSocket
// ============================================================================

/**
 * Mark notification as read via WebSocket
 * @param {string} notificationId
 */
export function markNotificationReadWS(notificationId) {
  if (socketService.isConnected()) {
    socketService.emit(WS_EVENTS.MARK_NOTIFICATION_READ, { notification_id: notificationId });
  }
}

/**
 * Mark all notifications as read via WebSocket
 */
export function markAllNotificationsReadWS() {
  if (socketService.isConnected()) {
    socketService.emit(WS_EVENTS.MARK_ALL_NOTIFICATIONS_READ, {});
  }
}

/**
 * Acknowledge alert via WebSocket
 * @param {string} alertId
 */
export function acknowledgeAlertWS(alertId) {
  if (socketService.isConnected()) {
    socketService.emit(WS_EVENTS.ACKNOWLEDGE_ALERT, { alert_id: alertId });
  }
}

export default {
  subscribeToNotificationWebSocket,
  unsubscribeFromNotificationWebSocket,
  isSubscribed,
  resetState,
  markNotificationReadWS,
  markAllNotificationsReadWS,
  acknowledgeAlertWS,
};

