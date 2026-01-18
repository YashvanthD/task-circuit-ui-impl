/**
 * Notifications Cache
 * Caches notification list data with lazy loading.
 * Integrates with WebSocket for real-time updates via centralized wsManager.
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
} from './baseCache';
import {
  listNotifications,
  markNotificationAsRead as apiMarkAsRead,
  markAllNotificationsAsRead as apiMarkAllAsRead,
  deleteNotification as apiDeleteNotification,
} from '../../api/notifications';
import { WS_EVENTS, subscribeWS, isConnected, wsNotifications } from '../websocket';
import { showErrorAlert } from '../alertManager';
import { playNotificationSound } from '../notifications/sound';

/**
 * Normalize notification ID from various formats
 * Server may send: notificationId, notification_id, or id
 */
function getNotificationId(notif) {
  return notif.notification_id || notif.notificationId || notif.id || null;
}

/**
 * Normalize a notification object to ensure consistent field names
 */
function normalizeNotification(notif) {
  if (!notif) return null;

  const id = getNotificationId(notif);


  return {
    notification_id: id,
    title: notif.title || '',
    message: notif.message || notif.body || '',
    type: notif.type || 'info',
    priority: notif.priority || 'normal',
    read: !!notif.read,
    data: notif.data || null,
    link: notif.link || notif.action_url || null,
    created_at: notif.created_at || notif.createdAt || new Date().toISOString(),
    read_at: notif.read_at || notif.readAt || null,
    user_key: notif.user_key || notif.userKey || null,
    account_key: notif.account_key || notif.accountKey || null,
  };
}

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
let unsubscribeFns = []; // Store unsubscribe functions

/**
 * Subscribe to WebSocket notification events via centralized wsManager.
 * Note: wsManager should be initialized before calling this (via DataContext).
 */
export function subscribeToWebSocket() {
  if (wsSubscribed) return;

  // Check if connected - if not, wait for connection
  if (!isConnected()) {
    console.log('[NotificationsCache] WebSocket not connected, waiting...');
    return;
  }

  console.log('[NotificationsCache] Subscribing to notification events via wsManager...');

  // New notification received
  unsubscribeFns.push(subscribeWS(WS_EVENTS.NOTIFICATION_NEW, (rawNotification) => {
    try {
      const notification = normalizeNotification(rawNotification);
      if (!notification || !notification.notification_id) {
        console.error('[NotificationsCache] Invalid notification received:', rawNotification);
        return;
      }

      const id = String(notification.notification_id);

      if (cache.byId.has(id)) {
        cache.data = [notification, ...cache.data.filter((n) => String(n.notification_id) !== id)];
      } else {
        cache.data = [notification, ...cache.data];
      }

      cache.byId.clear();
      cache.data.forEach((item) => cache.byId.set(String(item.notification_id), item));
      cache.unreadCount = Math.max(0, cache.data.filter((n) => !n.read).length);
      cache.events.emit('updated', [...cache.data]);
      cache.events.emit('new', notification);
      playNotificationSound();
      persistCache(cache, STORAGE_KEY);
    } catch (e) {
      console.error('[NotificationsCache] Error handling NOTIFICATION_NEW:', e);
    }
  }));

  // Notification marked as read
  unsubscribeFns.push(subscribeWS(WS_EVENTS.NOTIFICATION_READ, (data) => {
    try {
      const notificationId = data.notification_id || data.notificationId || data.id;
      if (!notificationId) return;

      const id = String(notificationId);
      let changed = false;
      cache.data = cache.data.map((n) => {
        if (String(n.notification_id) === id && !n.read) {
          changed = true;
          return { ...n, read: true };
        }
        return n;
      });

      if (changed) {
        cache.byId.clear();
        cache.data.forEach((n) => cache.byId.set(String(n.notification_id), n));
        cache.unreadCount = Math.max(0, cache.data.filter((n) => !n.read).length);
        cache.events.emit('updated', [...cache.data]);
        persistCache(cache, STORAGE_KEY);
      }
    } catch (e) {
      console.error('[NotificationsCache] Error handling NOTIFICATION_READ:', e);
    }
  }));

  // All notifications marked as read
  unsubscribeFns.push(subscribeWS(WS_EVENTS.NOTIFICATION_READ_ALL, () => {
    try {
      cache.data = cache.data.map((n) => ({ ...n, read: true }));
      cache.byId.clear();
      cache.data.forEach((n) => cache.byId.set(String(n.notification_id), n));
      cache.unreadCount = 0;
      cache.events.emit('updated', [...cache.data]);
      persistCache(cache, STORAGE_KEY);
    } catch (e) {
      console.error('[NotificationsCache] Error handling NOTIFICATION_READ_ALL:', e);
    }
  }));

  // Notification deleted
  unsubscribeFns.push(subscribeWS(WS_EVENTS.NOTIFICATION_DELETED, (data) => {
    try {
      const notificationId = data.notification_id || data.notificationId || data.id;
      if (!notificationId) return;

      const id = String(notificationId);
      const beforeLen = cache.data.length;
      cache.data = cache.data.filter((n) => String(n.notification_id) !== id);
      cache.byId.delete(id);

      if (cache.data.length !== beforeLen) {
        cache.byId.clear();
        cache.data.forEach((n) => cache.byId.set(String(n.notification_id), n));
        cache.unreadCount = Math.max(0, cache.data.filter((n) => !n.read).length);
        cache.events.emit('updated', [...cache.data]);
        persistCache(cache, STORAGE_KEY);
      }
    } catch (e) {
      console.error('[NotificationsCache] Error handling NOTIFICATION_DELETED:', e);
    }
  }));

  // Unread count update from server
  unsubscribeFns.push(subscribeWS(WS_EVENTS.NOTIFICATION_COUNT, (data) => {
    try {
      const count = data?.count;
      cache.unreadCount = (typeof count === 'number' && !isNaN(count))
        ? Math.max(0, count)
        : Math.max(0, cache.data.filter((n) => !n.read).length);
      cache.events.emit('countUpdated', cache.unreadCount);
    } catch (e) {
      console.error('[NotificationsCache] Error handling NOTIFICATION_COUNT:', e);
    }
  }));

  wsSubscribed = true;
  console.log('[NotificationsCache] Subscribed to notification events');
}

/**
 * Unsubscribe from WebSocket events
 */
export function unsubscribeFromWebSocket() {
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

    // Normalize notifications - ensure consistent field names and read flag is boolean
    const data = rawData.map((n) => normalizeNotification(n)).filter(Boolean);

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
 * Uses WebSocket if connected, falls back to REST API.
 * @param {string} id - Notification ID
 * @returns {Promise<object|null>} Updated notification
 */
export async function markNotificationAsRead(id) {
  const notificationId = String(id);

  try {
    // Find notification by checking multiple possible ID fields
    const index = cache.data.findIndex((n) => {
      const nid = String(n.notification_id || n.notificationId || n.id || '');
      return nid === notificationId;
    });

    if (index !== -1 && !cache.data[index].read) {
      // Optimistic update - create new array for React
      const updatedNotification = { ...cache.data[index], read: true };
      cache.data = [
        ...cache.data.slice(0, index),
        updatedNotification,
        ...cache.data.slice(index + 1)
      ];
      cache.byId.set(notificationId, updatedNotification);
      cache.unreadCount = Math.max(0, cache.data.filter((n) => !n.read).length);
      cache.events.emit('updated', [...cache.data]);
    }

    // Use WebSocket if connected, otherwise REST API
    if (isConnected()) {
      wsNotifications.markAsRead(notificationId);
    } else {
      await apiMarkAsRead(notificationId);
    }

    // If notification wasn't in cache, refresh to sync
    if (index === -1) {
      console.log('[NotificationsCache] Notification not in cache, refreshing...');
      await getNotifications(true);
    }

    return index !== -1 ? cache.data[index] : null;
  } catch (error) {
    console.error('[NotificationsCache] Failed to mark as read:', error);
    // Revert optimistic update on error
    const revertIndex = cache.data.findIndex((n) => {
      const nid = String(n.notification_id || n.notificationId || n.id || '');
      return nid === notificationId;
    });
    if (revertIndex !== -1) {
      const revertedNotification = { ...cache.data[revertIndex], read: false };
      cache.data = [
        ...cache.data.slice(0, revertIndex),
        revertedNotification,
        ...cache.data.slice(revertIndex + 1)
      ];
      cache.byId.set(notificationId, revertedNotification);
      cache.unreadCount = Math.max(0, cache.data.filter((n) => !n.read).length);
      cache.events.emit('updated', [...cache.data]);
    }
    // Refresh to sync on error
    await getNotifications(true);
    showErrorAlert('Failed to mark notification as read.', 'Notifications');
    throw error;
  }
}

/**
 * Delete notification.
 * Uses REST API (no WebSocket event for delete in the spec).
 * @param {string} id - Notification ID
 * @returns {Promise<boolean>} Success
 */
export async function deleteNotification(id) {
  const notificationId = String(id);

  // Debug: log cache contents
  console.log('[NotificationsCache] Delete requested for ID:', notificationId);
  console.log('[NotificationsCache] Cache has', cache.data.length, 'notifications');

  // Find notification by checking multiple possible ID fields
  const index = cache.data.findIndex((n) => {
    const nid = String(n.notification_id || n.notificationId || n.id || '');
    return nid === notificationId;
  });

  const removedItem = index !== -1 ? { ...cache.data[index] } : null;

  if (index === -1) {
    console.warn('[NotificationsCache] Notification not found in cache:', notificationId);
    console.warn('[NotificationsCache] This may be stale UI data. Attempting to delete via API anyway and refresh cache...');

    // Try to delete via API anyway - the notification might exist on server but not in local cache
    try {
      await apiDeleteNotification(notificationId);
      console.log('[NotificationsCache] API delete successful, refreshing cache...');
      // Force refresh to sync UI with server
      await getNotifications(true);
      return true;
    } catch (error) {
      console.error('[NotificationsCache] API delete failed:', error);
      // Still refresh to sync UI
      await getNotifications(true);
      return false;
    }
  }

  console.log('[NotificationsCache] Found notification at index:', index);

  try {
    // Create new array without the item (immutable update for React)
    cache.data = [...cache.data.slice(0, index), ...cache.data.slice(index + 1)];
    cache.byId.delete(notificationId);
    cache.unreadCount = Math.max(0, cache.data.filter((n) => !n.read).length);
    cache.events.emit('updated', [...cache.data]); // Emit new array reference

    // REST API call (no WebSocket event for delete)
    await apiDeleteNotification(notificationId);
    return true;
  } catch (error) {
    console.error('[NotificationsCache] Failed to delete:', error);
    // Revert optimistic update on error
    if (removedItem) {
      cache.data = [
        ...cache.data.slice(0, index),
        removedItem,
        ...cache.data.slice(index)
      ];
      cache.byId.set(notificationId, removedItem);
      cache.unreadCount = Math.max(0, cache.data.filter((n) => !n.read).length);
      cache.events.emit('updated', [...cache.data]);
    }
    showErrorAlert('Failed to delete notification.', 'Notifications');
    throw error;
  }
}

/**
 * Mark all notifications as read.
 * Uses WebSocket if connected, falls back to REST API.
 * @returns {Promise<number>} Count of marked notifications
 */
export async function markAllNotificationsAsRead() {
  // Store for rollback
  const previousData = cache.data.map((n) => ({ ...n }));
  const previousUnreadCount = cache.unreadCount;

  try {
    // Optimistic update - create new array for React
    cache.data = cache.data.map((n) => ({ ...n, read: true }));
    cache.byId.clear();
    cache.data.forEach((n) => cache.byId.set(String(n.notification_id), n));
    cache.unreadCount = 0;
    cache.events.emit('updated', [...cache.data]);

    // Use WebSocket if connected, otherwise REST API
    if (isConnected()) {
      wsNotifications.markAllAsRead();
    } else {
      await apiMarkAllAsRead();
    }

    return previousUnreadCount;
  } catch (error) {
    console.error('[NotificationsCache] Failed to mark all as read:', error);
    // Revert optimistic update on error
    cache.data = previousData;
    cache.byId.clear();
    cache.data.forEach((n) => cache.byId.set(String(n.notification_id), n));
    cache.unreadCount = previousUnreadCount;
    cache.events.emit('updated', [...cache.data]);
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

