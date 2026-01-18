/**
 * Notifications Store
 * Manages notifications cache with API integration.
 *
 * @module utils/notifications/notificationsStore
 */

import { STORAGE_KEYS, CACHE_TTL } from './constants';
import { notificationEvents, NOTIFICATION_EVENTS, createEventEmitter } from './events';
import { normalizeNotification } from './normalizers';
import { listNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../../api/notifications';
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
  unreadCount: 0,
};

const events = createEventEmitter();

// ============================================================================
// Cache Helpers
// ============================================================================

function hasValidCache() {
  if (!state.lastFetch) return false;
  return Date.now() - state.lastFetch < CACHE_TTL.NOTIFICATIONS;
}

function persistToStorage() {
  try {
    const toStore = {
      data: state.data,
      unreadCount: state.unreadCount,
      lastFetch: state.lastFetch,
    };
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(toStore));
  } catch (e) {
    // Ignore storage errors
  }
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.lastFetch && Date.now() - parsed.lastFetch < CACHE_TTL.NOTIFICATIONS) {
        state.data = parsed.data || [];
        state.unreadCount = Math.max(0, parsed.unreadCount || 0);
        state.lastFetch = parsed.lastFetch;
        state.byId.clear();
        state.data.forEach((n) => state.byId.set(String(n.notification_id), n));
        return true;
      }
    }
  } catch (e) {
    // Ignore parse errors
  }
  return false;
}

function recalculateUnreadCount() {
  state.unreadCount = state.data.filter((n) => !n.read).length;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Get all notifications
 * @param {boolean} force - Force refresh from API
 * @param {object} params - Query params
 * @returns {Promise<Array>}
 */
export async function getNotifications(force = false, params = {}) {
  if (!force && hasValidCache()) {
    return state.data;
  }

  if (state.loading) {
    return state.data;
  }

  state.loading = true;
  state.error = null;

  try {
    const response = await listNotifications(params);
    const raw = response?.data?.notifications || [];

    const normalized = raw.map(normalizeNotification);

    state.data = normalized;
    state.byId.clear();
    normalized.forEach((n) => state.byId.set(String(n.notification_id), n));
    recalculateUnreadCount();
    state.lastFetch = Date.now();
    state.loading = false;

    persistToStorage();
    events.emit('updated', state.data);
    notificationEvents.emit(NOTIFICATION_EVENTS.NOTIFICATIONS_UPDATED, state.data);
    notificationEvents.emit(NOTIFICATION_EVENTS.UNREAD_COUNT_CHANGED, state.unreadCount);

    return normalized;
  } catch (error) {
    state.error = error;
    state.loading = false;
    console.error('[NotificationsStore] Failed to fetch:', error);
    return state.data;
  }
}

/**
 * Get notifications synchronously
 * @returns {Array}
 */
export function getNotificationsSync() {
  return state.data;
}

/**
 * Get notification by ID
 * @param {string} notificationId
 * @returns {object|null}
 */
export function getNotificationById(notificationId) {
  return state.byId.get(String(notificationId)) || null;
}

/**
 * Get unread count
 * @returns {number}
 */
export function getUnreadCount() {
  return Math.max(0, state.unreadCount);
}

/**
 * Get unread notifications
 * @returns {Array}
 */
export function getUnreadNotifications() {
  return state.data.filter((n) => !n.read);
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
  state.unreadCount = 0;
  state.lastFetch = null;
  state.error = null;
  localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  events.emit('updated', state.data);
}

// ============================================================================
// Actions
// ============================================================================

/**
 * Mark notification as read
 * @param {string} notificationId
 */
export async function markAsRead(notificationId) {
  const notif = state.byId.get(String(notificationId));
  if (!notif || notif.read) return;

  // Optimistic update
  notif.read = true;
  notif.read_at = new Date().toISOString();
  recalculateUnreadCount();

  persistToStorage();
  events.emit('updated', state.data);
  notificationEvents.emit(NOTIFICATION_EVENTS.NOTIFICATION_READ, notificationId);
  notificationEvents.emit(NOTIFICATION_EVENTS.UNREAD_COUNT_CHANGED, state.unreadCount);

  // API call
  try {
    await markNotificationAsRead(notificationId);
  } catch (error) {
    console.error('[NotificationsStore] Failed to mark as read:', error);
    // Revert on error
    notif.read = false;
    notif.read_at = null;
    recalculateUnreadCount();
    persistToStorage();
    events.emit('updated', state.data);
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead() {
  const unreadIds = state.data.filter((n) => !n.read).map((n) => n.notification_id);
  if (unreadIds.length === 0) return;

  // Optimistic update
  const now = new Date().toISOString();
  state.data.forEach((n) => {
    if (!n.read) {
      n.read = true;
      n.read_at = now;
    }
  });
  state.unreadCount = 0;

  persistToStorage();
  events.emit('updated', state.data);
  notificationEvents.emit(NOTIFICATION_EVENTS.UNREAD_COUNT_CHANGED, 0);

  // API call
  try {
    await markAllNotificationsAsRead();
  } catch (error) {
    console.error('[NotificationsStore] Failed to mark all as read:', error);
    // Refresh from API on error
    await getNotifications(true);
  }
}

/**
 * Delete notification
 * @param {string} notificationId
 */
export async function removeNotification(notificationId) {
  const index = state.data.findIndex((n) => n.notification_id === notificationId);
  if (index === -1) return;

  const removed = state.data[index];

  // Optimistic update
  state.data.splice(index, 1);
  state.byId.delete(String(notificationId));
  recalculateUnreadCount();

  persistToStorage();
  events.emit('updated', state.data);
  notificationEvents.emit(NOTIFICATION_EVENTS.NOTIFICATION_DELETED, notificationId);
  notificationEvents.emit(NOTIFICATION_EVENTS.UNREAD_COUNT_CHANGED, state.unreadCount);

  // API call
  try {
    await deleteNotification(notificationId);
  } catch (error) {
    console.error('[NotificationsStore] Failed to delete:', error);
    // Restore on error
    state.data.splice(index, 0, removed);
    state.byId.set(String(notificationId), removed);
    recalculateUnreadCount();
    persistToStorage();
    events.emit('updated', state.data);
  }
}

/**
 * Add new notification (from WebSocket)
 * @param {object} notification
 */
export function addNotification(notification) {
  const normalized = normalizeNotification(notification);
  const id = String(normalized.notification_id);

  if (state.byId.has(id)) return;

  state.data.unshift(normalized);
  state.byId.set(id, normalized);
  recalculateUnreadCount();

  persistToStorage();
  events.emit('updated', state.data);
  events.emit('new', normalized);
  notificationEvents.emit(NOTIFICATION_EVENTS.NOTIFICATION_NEW, normalized);
  notificationEvents.emit(NOTIFICATION_EVENTS.UNREAD_COUNT_CHANGED, state.unreadCount);

  // Play notification sound
  playNotificationSound();
}

// Initialize from storage
loadFromStorage();

export default {
  getNotifications,
  getNotificationsSync,
  getNotificationById,
  getUnreadCount,
  getUnreadNotifications,
  isLoading,
  subscribe,
  clearCache,
  markAsRead,
  markAllAsRead,
  removeNotification,
  addNotification,
};

