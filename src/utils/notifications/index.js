/**
 * Notifications - Main Index
 * Unified exports for notifications and alerts.
 *
 * @module utils/notifications
 */

// Import modules first
import * as notificationsStoreModule from './notificationsStore';
import * as alertsStoreModule from './alertsStore';
import * as soundModule from './sound';

// Constants
export {
  STORAGE_KEYS,
  CACHE_TTL,
  NOTIFICATION_TYPE,
  NOTIFICATION_PRIORITY,
  ALERT_SEVERITY,
  ALERT_TYPE,
} from './constants';

// Events
export { notificationEvents, NOTIFICATION_EVENTS, createEventEmitter } from './events';

// Normalizers
export { normalizeNotification, normalizeAlert } from './normalizers';

// Stores
export const notificationsStore = notificationsStoreModule;
export const alertsStore = alertsStoreModule;

// Sound
export const sound = soundModule;
export {
  playNotificationSound,
  enableSound,
  disableSound,
  toggleSound,
  isSoundEnabled,
  setVolume,
} from './sound';

// ============================================================================
// Convenience Re-exports
// ============================================================================

// Notifications
export const getNotifications = notificationsStoreModule.getNotifications;
export const getNotificationsSync = notificationsStoreModule.getNotificationsSync;
export const getNotificationById = notificationsStoreModule.getNotificationById;
export const getUnreadCount = notificationsStoreModule.getUnreadCount;
export const getUnreadNotifications = notificationsStoreModule.getUnreadNotifications;
export const markNotificationAsRead = notificationsStoreModule.markAsRead;
export const markAllNotificationsAsRead = notificationsStoreModule.markAllAsRead;
export const deleteNotification = notificationsStoreModule.removeNotification;
export const addNotification = notificationsStoreModule.addNotification;
export const clearNotificationsCache = notificationsStoreModule.clearCache;
export const onNotificationsChange = notificationsStoreModule.subscribe;

// Alerts
export const getAlerts = alertsStoreModule.getAlerts;
export const getAlertsSync = alertsStoreModule.getAlertsSync;
export const getAlertById = alertsStoreModule.getAlertById;
export const getActiveAlertsCount = alertsStoreModule.getActiveCount;
export const getActiveAlerts = alertsStoreModule.getActiveAlerts;
export const getCriticalAlerts = alertsStoreModule.getCriticalAlerts;
export const acknowledgeAlert = alertsStoreModule.acknowledge;
export const deleteAlert = alertsStoreModule.removeAlert;
export const addAlert = alertsStoreModule.addAlert;
export const clearAlertsCache = alertsStoreModule.clearCache;
export const onAlertsChange = alertsStoreModule.subscribe;

// ============================================================================
// Combined Actions
// ============================================================================

/**
 * Refresh all (notifications + alerts)
 */
export async function refreshAll() {
  await Promise.all([
    notificationsStoreModule.getNotifications(true),
    alertsStoreModule.getAlerts(true),
  ]);
}

/**
 * Clear all cache
 */
export function clearAllCache() {
  notificationsStoreModule.clearCache();
  alertsStoreModule.clearCache();
}

/**
 * Get combined unread/active count
 * @returns {number}
 */
export function getTotalBadgeCount() {
  return notificationsStoreModule.getUnreadCount() + alertsStoreModule.getActiveCount();
}

// Default export
const notificationsUtil = {
  // Stores
  notifications: notificationsStoreModule,
  alerts: alertsStoreModule,
  sound: soundModule,

  // Quick access - Notifications
  getNotifications: notificationsStoreModule.getNotifications,
  getUnreadCount: notificationsStoreModule.getUnreadCount,
  markAsRead: notificationsStoreModule.markAsRead,
  markAllAsRead: notificationsStoreModule.markAllAsRead,

  // Quick access - Alerts
  getAlerts: alertsStoreModule.getAlerts,
  getActiveCount: alertsStoreModule.getActiveCount,
  acknowledge: alertsStoreModule.acknowledge,

  // Combined
  refreshAll,
  clearAllCache,
  getTotalBadgeCount,

  // Sound
  playSound: soundModule.playNotificationSound,
};

export default notificationsUtil;

