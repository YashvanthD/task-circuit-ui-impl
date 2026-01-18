/**
 * Chat Cache - Messages Store
 * Manages messages cache per conversation.
 *
 * @module utils/chat/messagesStore
 */

import { CACHE_TTL, MESSAGE_STATUS } from './constants';
import { createEventEmitter, chatEvents, CHAT_EVENTS } from './events';
import { normalizeMessage } from './normalizers';
import { getMessages, getCurrentUserKey } from '../../api/chat';
import { getUsersSync } from '../cache/usersCache';
import { playNotificationSound } from '../notifications/sound';

// ============================================================================
// Store State - Per conversation cache
// ============================================================================

// Map<conversationId, { data, byId, loading, error, lastFetch, events }>
const caches = new Map();

/**
 * Get or create cache for a conversation
 * @param {string} conversationId
 * @returns {object} Cache object
 */
function getOrCreateCache(conversationId) {
  if (!caches.has(conversationId)) {
    caches.set(conversationId, {
      data: [],
      byId: new Map(),
      loading: false,
      error: null,
      lastFetch: null,
      events: createEventEmitter(),
    });
  }
  return caches.get(conversationId);
}

/**
 * Check if cache is valid
 * @param {object} cache
 * @returns {boolean}
 */
function hasValidCache(cache) {
  if (!cache || !cache.lastFetch) return false;
  return Date.now() - cache.lastFetch < CACHE_TTL.MESSAGES;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Get messages for a conversation (fetches from API if needed)
 * @param {string} conversationId
 * @param {boolean} force - Force refresh from API
 * @param {object} params - Additional params (limit, before, after)
 * @returns {Promise<Array>}
 */
export async function getMessagesForConversation(conversationId, force = false, params = {}) {
  const cache = getOrCreateCache(conversationId);

  if (!force && hasValidCache(cache)) {
    return cache.data;
  }

  if (cache.loading) {
    return cache.data;
  }

  // Clear on force reload
  if (force) {
    cache.data = [];
    cache.byId.clear();
  }

  cache.loading = true;
  cache.error = null;

  try {
    const response = await getMessages(conversationId, { limit: 50, ...params });
    const rawMessages = response?.data?.messages || [];
    const users = getUsersSync() || [];

    // Normalize messages
    const normalized = rawMessages.map((m) => normalizeMessage(m, conversationId, users));

    // Update cache
    cache.data = normalized;
    cache.byId.clear();
    normalized.forEach((m) => cache.byId.set(String(m.message_id), m));
    cache.lastFetch = Date.now();
    cache.loading = false;

    // Emit update
    cache.events.emit('updated', cache.data);
    chatEvents.emit(CHAT_EVENTS.MESSAGES_UPDATED, { conversationId, messages: cache.data });

    return normalized;
  } catch (error) {
    cache.error = error;
    cache.loading = false;
    console.error('[MessagesStore] Failed to fetch:', error);
    return cache.data;
  }
}

/**
 * Get messages synchronously (from cache only)
 * @param {string} conversationId
 * @returns {Array}
 */
export function getMessagesSync(conversationId) {
  const cache = caches.get(conversationId);
  return cache?.data || [];
}

/**
 * Get message by ID
 * @param {string} conversationId
 * @param {string} messageId
 * @returns {object|null}
 */
export function getMessageById(conversationId, messageId) {
  const cache = caches.get(conversationId);
  return cache?.byId.get(String(messageId)) || null;
}

/**
 * Check if loading
 * @param {string} conversationId
 * @returns {boolean}
 */
export function isLoading(conversationId) {
  const cache = caches.get(conversationId);
  return cache?.loading || false;
}

/**
 * Subscribe to message events for a conversation
 * @param {string} conversationId
 * @param {string} event - Event name ('updated', 'new', etc.)
 * @param {function} callback
 * @returns {function} Unsubscribe function
 */
export function subscribe(conversationId, event, callback) {
  const cache = getOrCreateCache(conversationId);
  return cache.events.on(event, callback);
}

/**
 * Clear cache for a conversation
 * @param {string} conversationId
 */
export function clearCache(conversationId) {
  if (caches.has(conversationId)) {
    const cache = caches.get(conversationId);
    cache.data = [];
    cache.byId.clear();
    cache.lastFetch = null;
    cache.error = null;
    cache.events.emit('updated', cache.data);
  }
}

/**
 * Clear all message caches
 */
export function clearAllCaches() {
  caches.forEach((cache) => {
    cache.data = [];
    cache.byId.clear();
    cache.lastFetch = null;
  });
  caches.clear();
}

// ============================================================================
// Update Functions (called by WebSocket handlers)
// ============================================================================

/**
 * Add a new message to cache
 * @param {string} conversationId
 * @param {object} message - Raw or normalized message
 * @param {boolean} playSound - Whether to play notification sound (default: true for messages from others)
 * @returns {object} Normalized message
 */
export function addMessage(conversationId, message, playSound = true) {
  const cache = getOrCreateCache(conversationId);
  const users = getUsersSync() || [];
  const normalized = normalizeMessage(message, conversationId, users);
  const id = String(normalized.message_id);

  // Check for duplicates
  if (cache.byId.has(id)) {
    return cache.byId.get(id);
  }

  cache.data.push(normalized);
  cache.byId.set(id, normalized);

  cache.events.emit('updated', cache.data);
  cache.events.emit('new', normalized);
  chatEvents.emit(CHAT_EVENTS.MESSAGE_NEW, { conversationId, message: normalized });

  // Play sound for messages from others (not our own messages)
  const currentUserKey = getCurrentUserKey();
  if (playSound && normalized.sender_key !== currentUserKey) {
    playNotificationSound();
  }

  return normalized;
}

/**
 * Update message (for sent confirmation, status changes)
 * @param {string} conversationId
 * @param {string} messageId - Original or temp ID
 * @param {object} updates - Fields to update
 */
export function updateMessage(conversationId, messageId, updates) {
  const cache = caches.get(conversationId);
  if (!cache) return;

  const msg = cache.byId.get(String(messageId));
  if (msg) {
    // If updating message_id (temp -> real), update byId map
    if (updates.message_id && updates.message_id !== messageId) {
      cache.byId.delete(String(messageId));
      cache.byId.set(String(updates.message_id), msg);
    }

    Object.assign(msg, updates);
    cache.events.emit('updated', cache.data);
    chatEvents.emit(CHAT_EVENTS.MESSAGE_STATUS_CHANGED, { conversationId, messageId: msg.message_id, status: msg.status });
  }
}

/**
 * Update message status (delivered, read)
 * @param {string} conversationId
 * @param {string} messageId
 * @param {string} status
 * @param {string} timestamp
 */
export function updateMessageStatus(conversationId, messageId, status, timestamp = null) {
  const updates = { status };
  if (status === MESSAGE_STATUS.DELIVERED && timestamp) {
    updates.delivered_at = timestamp;
  } else if (status === MESSAGE_STATUS.READ && timestamp) {
    updates.read_at = timestamp;
  }
  updateMessage(conversationId, messageId, updates);
}

/**
 * Mark all messages in conversation as read (for current user's sent messages)
 * @param {string} conversationId
 * @param {string} readBy - User who read
 * @param {string} timestamp
 */
export function markMessagesAsRead(conversationId, readBy, timestamp) {
  const cache = caches.get(conversationId);
  if (!cache) return;

  const currentUserKey = getCurrentUserKey();
  let updated = false;

  cache.data.forEach((msg) => {
    // Mark messages sent by current user as read
    if (msg.sender_key === currentUserKey && msg.status !== MESSAGE_STATUS.READ) {
      msg.status = MESSAGE_STATUS.READ;
      msg.read_at = timestamp;
      updated = true;
    }
  });

  if (updated) {
    cache.events.emit('updated', cache.data);
  }
}

/**
 * Remove a message
 * @param {string} conversationId
 * @param {string} messageId
 */
export function removeMessage(conversationId, messageId) {
  const cache = caches.get(conversationId);
  if (!cache) return;

  const index = cache.data.findIndex((m) => m.message_id === messageId);
  if (index !== -1) {
    cache.data.splice(index, 1);
    cache.byId.delete(String(messageId));
    cache.events.emit('updated', cache.data);
    chatEvents.emit(CHAT_EVENTS.MESSAGE_DELETED, { conversationId, messageId });
  }
}

/**
 * Get the last message in a conversation
 * @param {string} conversationId
 * @returns {object|null}
 */
export function getLastMessage(conversationId) {
  const cache = caches.get(conversationId);
  if (!cache || cache.data.length === 0) return null;
  return cache.data[cache.data.length - 1];
}

export default {
  getMessagesForConversation,
  getMessagesSync,
  getMessageById,
  isLoading,
  subscribe,
  clearCache,
  clearAllCaches,
  addMessage,
  updateMessage,
  updateMessageStatus,
  markMessagesAsRead,
  removeMessage,
  getLastMessage,
};

