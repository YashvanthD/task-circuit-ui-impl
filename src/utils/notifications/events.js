/**
 * Notifications - Event Emitter
 *
 * @module utils/notifications/events
 */

/**
 * Create a simple event emitter
 */
function createEventEmitter() {
  const listeners = new Map();

  return {
    on(event, callback) {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event).add(callback);
      return () => this.off(event, callback);
    },

    off(event, callback) {
      if (listeners.has(event)) {
        listeners.get(event).delete(callback);
      }
    },

    emit(event, data) {
      if (listeners.has(event)) {
        listeners.get(event).forEach((callback) => {
          try {
            callback(data);
          } catch (e) {
            console.error(`[NotificationEvents] Error in ${event} listener:`, e);
          }
        });
      }
    },

    clear() {
      listeners.clear();
    },
  };
}

// Global notifications events emitter
export const notificationEvents = createEventEmitter();

// Event types
export const NOTIFICATION_EVENTS = {
  // Notifications
  NOTIFICATIONS_UPDATED: 'notifications:updated',
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_DELETED: 'notification:deleted',
  UNREAD_COUNT_CHANGED: 'notifications:unread',

  // Alerts
  ALERTS_UPDATED: 'alerts:updated',
  ALERT_NEW: 'alert:new',
  ALERT_ACKNOWLEDGED: 'alert:acknowledged',
  ALERT_DELETED: 'alert:deleted',
  ACTIVE_ALERTS_CHANGED: 'alerts:active',
};

export { createEventEmitter };

export default {
  notificationEvents,
  NOTIFICATION_EVENTS,
  createEventEmitter,
};

