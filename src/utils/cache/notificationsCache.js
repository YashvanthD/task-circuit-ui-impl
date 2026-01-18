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
import { showErrorAlert } from '../alertManager';
import { playNotificationSound } from '../notifications/sound';

// ============================================================================
// Cache Instance
// ============================================================================
const STORAGE_KEY = 'tc_cache_notifications';
const cache = createCache('notifications', 2 * 60 * 1000); // 2 min TTL

// Add unread count to cache
cache.unreadCount = 0;

// Always start fresh - don't load stale persisted data that may have incorrect read/unread state
// The server is the source of truth for notification state
clearCache(cache);
cache.unreadCount = 0;
localStorage.removeItem(STORAGE_KEY);

// ============================================================================
// WebSocket Integration
// ============================================================================

let wsSubscribed = false;

let wsConnectionFailed = false;

/**
 * Subscribe to WebSocket notification events
 * Note: Connection should be established before calling this (via DataContext)
 */
export function subscribeToWebSocket() {
  if (wsSubscribed) return;

  // Don't try to subscribe if previous attempt failed
  if (wsConnectionFailed) {
    wsSubscribed = true;
    return;
  }

  // Check if connected - if not, wait for connection
  if (!socketService.isConnected()) {
    console.log('[NotificationsCache] WebSocket not connected, waiting...');
    // Don't connect here - DataContext handles connection
    // Just mark as not subscribed so it can retry later
    return;
  }

  // New notification received
  socketService.on(WS_EVENTS.NOTIFICATION_NEW, (notification) => {
    try {
      const id = String(notification.notification_id);

      // If we already have this notification, update it and move to front
      if (cache.byId.has(id)) {
        // Replace existing item and move to front
        cache.data = [
          notification,
          ...cache.data.filter((n) => String(n.notification_id) !== id),
        ];
      } else {
        // Add to beginning of cache
        cache.data.unshift(notification);
      }

      // Rebuild id map (ensure no duplicates)
      cache.byId.clear();
      cache.data.forEach((item) => cache.byId.set(String(item.notification_id), item));

      // Recompute unread count deterministically (avoid increment/decrement drift)
      cache.unreadCount = Math.max(0, cache.data.filter((n) => !n.read).length);

      // Emit events
      cache.events.emit('updated', cache.data);
      cache.events.emit('new', notification);

      // Play notification sound
      playNotificationSound();

      // Persist cache
      persistCache(cache, STORAGE_KEY);
    } catch (e) {
      console.error('[NotificationsCache] Error handling NOTIFICATION_NEW:', e);
    }
  });

  // Notification marked as read
  socketService.on(WS_EVENTS.NOTIFICATION_READ, ({ notification_id }) => {
    try {
      const id = String(notification_id);
      // Mark all matching items as read (defensive: remove duplicate unread items)
      let changed = false;
      cache.data = cache.data.map((n) => {
        if (String(n.notification_id) === id && !n.read) {
          changed = true;
          return { ...n, read: true };
        }
        return n;
      });

      if (changed) {
        // Rebuild id map
        cache.byId.clear();
        cache.data.forEach((n) => cache.byId.set(String(n.notification_id), n));

        // Recompute unread count
        cache.unreadCount = Math.max(0, cache.data.filter((n) => !n.read).length);

        cache.events.emit('updated', cache.data);
        persistCache(cache, STORAGE_KEY);
      }
    } catch (e) {
      console.error('[NotificationsCache] Error handling NOTIFICATION_READ:', e);
    }
  });

  // All notifications marked as read
  socketService.on(WS_EVENTS.NOTIFICATION_READ_ALL, () => {
    try {
      cache.data = cache.data.map((n) => ({ ...n, read: true }));
      cache.byId.clear();
      cache.data.forEach((n) => cache.byId.set(String(n.notification_id), n));
      cache.unreadCount = 0;
      cache.events.emit('updated', cache.data);
      persistCache(cache, STORAGE_KEY);
    } catch (e) {
      console.error('[NotificationsCache] Error handling NOTIFICATION_READ_ALL:', e);
    }
  });

  // Notification deleted
  socketService.on(WS_EVENTS.NOTIFICATION_DELETED, ({ notification_id }) => {
    try {
      const id = String(notification_id);
      const beforeLen = cache.data.length;
      // Remove all occurrences of this id (defensive)
      cache.data = cache.data.filter((n) => String(n.notification_id) !== id);
      cache.byId.delete(id);

      // If we removed items, rebuild id map and recompute unread
      if (cache.data.length !== beforeLen) {
        cache.byId.clear();
        cache.data.forEach((n) => cache.byId.set(String(n.notification_id), n));
        cache.unreadCount = Math.max(0, cache.data.filter((n) => !n.read).length);
        cache.events.emit('updated', cache.data);
        persistCache(cache, STORAGE_KEY);
      }
    } catch (e) {
      console.error('[NotificationsCache] Error handling NOTIFICATION_DELETED:', e);
    }
  });

  // Unread count update from server
  socketService.on(WS_EVENTS.NOTIFICATION_COUNT, ({ count }) => {
    try {
      // Ensure server-sent counts are used safely and never negative
      cache.unreadCount = (typeof count === 'number' && !isNaN(count)) ? Math.max(0, count) : Math.max(0, cache.data.filter((n) => !n.read).length);
      cache.events.emit('countUpdated', cache.unreadCount);
    } catch (e) {
      console.error('[NotificationsCache] Error handling NOTIFICATION_COUNT:', e);
    }
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

  // Clear cache on force reload to avoid stale data mixing
  if (force) {
    cache.data = [];
    cache.byId.clear();
    cache.unreadCount = 0;
  }

  setCacheLoading(cache, true);

  try {
    const response = await listNotifications(params);
    const rawData = response?.data?.notifications || [];

    // Normalize notifications - ensure read flag is boolean
    const data = rawData.map((n) => ({
      ...n,
      read: !!n.read,  // Normalize to boolean
    }));

    // Only update full cache if no filters
    if (!params.unread) {
      updateCache(cache, data, 'notification_id');
      // Compute unread count from server data (authoritative)
      cache.unreadCount = Math.max(0, data.filter((n) => !n.read).length);
      // Don't persist - server is source of truth
    }

    setCacheLoading(cache, false);
    return data;
  } catch (error) {
    setCacheError(cache, error);
    console.error('[NotificationsCache] Failed to fetch:', error);
    // Don't show alert for background fetch failures
    setCacheLoading(cache, false);
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
      // Recompute unread count
      cache.unreadCount = Math.max(0, cache.data.filter((n) => !n.read).length);
      cache.events.emit('updated', cache.data);
      persistCache(cache, STORAGE_KEY);
    }

    return result;
  } catch (error) {
    console.error('[NotificationsCache] Failed to mark as read:', error);
    showErrorAlert('Failed to mark notification as read.', 'Notifications');
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
      cache.unreadCount = Math.max(0, cache.data.filter((n) => !n.read).length);
      cache.events.emit('updated', cache.data);
      persistCache(cache, STORAGE_KEY);
    }

    return result;
  } catch (error) {
    console.error('[NotificationsCache] Failed to delete:', error);
    showErrorAlert('Failed to delete notification.', 'Notifications');
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
    showErrorAlert('Failed to mark all notifications as read.', 'Notifications');
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

