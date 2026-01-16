/**
 * Notifications Cache
 * Caches notification list data with lazy loading.
 * Integrates with WebSocket for real-time updates.
 *
 * @module utils/cache/notificationsCache
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
  listNotifications,
  markNotificationAsRead as apiMarkAsRead,
  markAllNotificationsAsRead as apiMarkAllAsRead,
  deleteNotification as apiDeleteNotification,
} from '../../api/notifications';
import { socketService, WS_EVENTS } from '../websocket';

// ============================================================================
// Cache Instance
// ============================================================================
const STORAGE_KEY = 'tc_cache_notifications';
const cache = createCache('notifications', 2 * 60 * 1000); // 2 min TTL

// Add unread count to cache
cache.unreadCount = 0;

// Load from localStorage on init
loadPersistedCache(cache, STORAGE_KEY, 'notification_id');

// ============================================================================
// WebSocket Integration
// ============================================================================

let wsSubscribed = false;

/**
 * Subscribe to WebSocket notification events
 */
export function subscribeToWebSocket() {
  if (wsSubscribed) return;

  // New notification received
  socketService.on(WS_EVENTS.NOTIFICATION_NEW, (notification) => {
    // Add to beginning of cache
    cache.data.unshift(notification);
    cache.byId.set(String(notification.notification_id), notification);
    cache.unreadCount++;
    cache.events.emit('updated', cache.data);
    cache.events.emit('new', notification);
    persistCache(cache, STORAGE_KEY);
  });

  // Notification marked as read
  socketService.on(WS_EVENTS.NOTIFICATION_READ, ({ notification_id }) => {
    const index = cache.data.findIndex((n) => n.notification_id === notification_id);
    if (index !== -1 && !cache.data[index].read) {
      cache.data[index] = { ...cache.data[index], read: true };
      cache.byId.set(String(notification_id), cache.data[index]);
      cache.unreadCount = Math.max(0, cache.unreadCount - 1);
      cache.events.emit('updated', cache.data);
      persistCache(cache, STORAGE_KEY);
    }
  });

  // All notifications marked as read
  socketService.on(WS_EVENTS.NOTIFICATION_READ_ALL, () => {
    cache.data = cache.data.map((n) => ({ ...n, read: true }));
    cache.data.forEach((n) => cache.byId.set(String(n.notification_id), n));
    cache.unreadCount = 0;
    cache.events.emit('updated', cache.data);
    persistCache(cache, STORAGE_KEY);
  });

  // Notification deleted
  socketService.on(WS_EVENTS.NOTIFICATION_DELETED, ({ notification_id }) => {
    const index = cache.data.findIndex((n) => n.notification_id === notification_id);
    if (index !== -1) {
      const wasUnread = !cache.data[index].read;
      cache.data.splice(index, 1);
      cache.byId.delete(String(notification_id));
      if (wasUnread) {
        cache.unreadCount = Math.max(0, cache.unreadCount - 1);
      }
      cache.events.emit('updated', cache.data);
      persistCache(cache, STORAGE_KEY);
    }
  });

  // Unread count update from server
  socketService.on(WS_EVENTS.NOTIFICATION_COUNT, ({ count }) => {
    cache.unreadCount = count;
    cache.events.emit('countUpdated', count);
  });

  wsSubscribed = true;
}

/**
 * Unsubscribe from WebSocket events
 */
export function unsubscribeFromWebSocket() {
  // Note: socketService handles cleanup on disconnect
  wsSubscribed = false;
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get notifications list (lazy loaded).
 * @param {boolean} force - Force refresh even if cache is valid
 * @param {object} params - Filter params { unread, limit, skip }
 * @returns {Promise<Array>} Notifications array
 */
export async function getNotifications(force = false, params = {}) {
  if (!force && hasValidCache(cache) && !params.unread) {
    return cache.data;
  }

  if (cache.loading) {
    return cache.data;
  }

  setCacheLoading(cache, true);

  try {
    const response = await listNotifications(params);
    const data = response?.data?.notifications || [];

    // Only update full cache if no filters
    if (!params.unread) {
      updateCache(cache, data, 'notification_id');
      cache.unreadCount = data.filter((n) => !n.read).length;
      persistCache(cache, STORAGE_KEY);
    }

    setCacheLoading(cache, false);
    return data;
  } catch (error) {
    setCacheError(cache, error);
    console.error('[NotificationsCache] Failed to fetch:', error);
    return cache.data;
  }
}

/**
 * Force refresh notifications cache.
 * @returns {Promise<Array>} Notifications array
 */
export async function refreshNotifications() {
  return getNotifications(true);
}

/**
 * Get cached notifications synchronously (no fetch).
 * @returns {Array} Cached notifications array
 */
export function getNotificationsSync() {
  return cache.data;
}

/**
 * Clear notifications cache.
 */
export function clearNotificationsCache() {
  clearCache(cache);
  cache.unreadCount = 0;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get cache loading state.
 * @returns {boolean}
 */
export function isNotificationsLoading() {
  return cache.loading;
}

/**
 * Get cache error.
 * @returns {Error|null}
 */
export function getNotificationsError() {
  return cache.error;
}

/**
 * Get unread count.
 * @returns {number}
 */
export function getUnreadNotificationCount() {
  return cache.unreadCount;
}

// ============================================================================
// Sub-functions
// ============================================================================

/**
 * Get notification by ID.
 * @param {string} id - Notification ID
 * @returns {object|null} Notification object
 */
export function getNotificationById(id) {
  return getFromCacheById(cache, id);
}

/**
 * Get unread notifications.
 * @returns {Array} Unread notifications
 */
export function getUnreadNotifications() {
  return cache.data.filter((n) => !n.read);
}

/**
 * Get notifications by type.
 * @param {string} type - Notification type (info, warning, error, success)
 * @returns {Array} Filtered notifications
 */
export function getNotificationsByType(type) {
  if (!type) return cache.data;
  return cache.data.filter((n) => n.type === type);
}

/**
 * Get notifications by priority.
 * @param {string} priority - Priority (low, normal, high)
 * @returns {Array} Filtered notifications
 */
export function getNotificationsByPriority(priority) {
  if (!priority) return cache.data;
  return cache.data.filter((n) => n.priority === priority);
}

/**
 * Get recent notifications (last N).
 * @param {number} limit - Number of notifications (default 5)
 * @returns {Array} Recent notifications
 */
export function getRecentNotifications(limit = 5) {
  return cache.data
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
}

// ============================================================================
// Action Functions (with cache update)
// ============================================================================

/**
 * Mark notification as read.
 * @param {string} id - Notification ID
 * @returns {Promise<object|null>} Updated notification
 */
export async function markNotificationAsRead(id) {
  try {
    const result = await apiMarkAsRead(id);

    // Update cache
    const index = cache.data.findIndex((n) => n.notification_id === id);
    if (index !== -1) {
      cache.data[index] = { ...cache.data[index], read: true };
      cache.byId.set(String(id), cache.data[index]);
      cache.unreadCount = cache.data.filter((n) => !n.read).length;
      cache.events.emit('updated', cache.data);
      persistCache(cache, STORAGE_KEY);
    }

    return result;
  } catch (error) {
    console.error('[NotificationsCache] Failed to mark as read:', error);
    throw error;
  }
}

/**
 * Delete notification.
 * @param {string} id - Notification ID
 * @returns {Promise<boolean>} Success
 */
export async function deleteNotification(id) {
  try {
    const result = await apiDeleteNotification(id);

    // Update cache
    const index = cache.data.findIndex((n) => n.notification_id === id);
    if (index !== -1) {
      cache.data.splice(index, 1);
      cache.byId.delete(String(id));
      cache.unreadCount = cache.data.filter((n) => !n.read).length;
      cache.events.emit('updated', cache.data);
      persistCache(cache, STORAGE_KEY);
    }

    return result;
  } catch (error) {
    console.error('[NotificationsCache] Failed to delete:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read.
 * @returns {Promise<number>} Count of marked notifications
 */
export async function markAllNotificationsAsRead() {
  try {
    const result = await apiMarkAllAsRead();

    // Update cache
    cache.data = cache.data.map((n) => ({ ...n, read: true }));
    cache.data.forEach((n) => cache.byId.set(String(n.notification_id), n));
    cache.unreadCount = 0;
    cache.events.emit('updated', cache.data);
    persistCache(cache, STORAGE_KEY);

    return result;
  } catch (error) {
    console.error('[NotificationsCache] Failed to mark all as read:', error);
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
export function onNotificationsChange(event, callback) {
  return cache.events.on(event, callback);
}

// ============================================================================
// Export cache for advanced usage
// ============================================================================
export const notificationsCache = cache;

