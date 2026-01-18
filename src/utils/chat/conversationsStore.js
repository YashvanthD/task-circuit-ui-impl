/**
 * Chat Cache - Conversations Store
 * Manages conversations cache with API and WebSocket integration.
 *
 * @module utils/chat/conversationsStore
 */

import { STORAGE_KEYS, CACHE_TTL } from './constants';
import { createEventEmitter, chatEvents, CHAT_EVENTS } from './events';
import { normalizeConversation, createLastMessage } from './normalizers';
import { listConversations, getCurrentUserKey } from '../../api/chat';
import { getUsersSync } from '../cache/usersCache';

// ============================================================================
// Store State
// ============================================================================

const state = {
  data: [],
  byId: new Map(),
  loading: false,
  error: null,
  lastFetch: null,
  totalUnread: 0,
  activeConversationId: null,
};

const events = createEventEmitter();

// ============================================================================
// Cache Helpers
// ============================================================================

/**
 * Check if cache is valid
 */
function hasValidCache() {
  if (!state.lastFetch) return false;
  return Date.now() - state.lastFetch < CACHE_TTL.CONVERSATIONS;
}

/**
 * Persist cache to localStorage
 */
function persistToStorage() {
  try {
    const toStore = {
      data: state.data,
      totalUnread: state.totalUnread,
      lastFetch: state.lastFetch,
    };
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(toStore));
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Load cache from localStorage
 */
function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Don't use stale data - only use if recent
      if (parsed.lastFetch && Date.now() - parsed.lastFetch < CACHE_TTL.CONVERSATIONS) {
        state.data = parsed.data || [];
        state.totalUnread = Math.max(0, parsed.totalUnread || 0);
        state.lastFetch = parsed.lastFetch;
        // Rebuild byId map
        state.byId.clear();
        state.data.forEach((c) => state.byId.set(String(c.conversation_id), c));
        return true;
      }
    }
  } catch (e) {
    // Ignore parse errors
  }
  return false;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Get all conversations (fetches from API if needed)
 * @param {boolean} force - Force refresh from API
 * @returns {Promise<Array>}
 */
export async function getConversations(force = false) {
  if (!force && hasValidCache()) {
    return state.data;
  }

  if (state.loading) {
    return state.data;
  }

  // Clear on force reload
  if (force) {
    state.data = [];
    state.byId.clear();
    state.totalUnread = 0;
  }

  state.loading = true;
  state.error = null;

  try {
    const response = await listConversations();
    const raw = response?.data?.conversations || [];
    const users = getUsersSync() || [];

    // Normalize conversations
    const normalized = raw.map((c) => normalizeConversation(c, users));

    // Update state
    state.data = normalized;
    state.byId.clear();
    normalized.forEach((c) => state.byId.set(String(c.conversation_id), c));
    state.totalUnread = normalized.reduce((sum, c) => sum + (c.unread_count || 0), 0);
    state.lastFetch = Date.now();
    state.loading = false;

    // Persist and emit
    persistToStorage();
    events.emit('updated', state.data);
    chatEvents.emit(CHAT_EVENTS.CONVERSATIONS_UPDATED, state.data);

    return normalized;
  } catch (error) {
    state.error = error;
    state.loading = false;
    console.error('[ConversationsStore] Failed to fetch:', error);
    return state.data;
  }
}

/**
 * Get conversations synchronously (from cache only)
 * @returns {Array}
 */
export function getConversationsSync() {
  return state.data;
}

/**
 * Get conversation by ID
 * @param {string} conversationId
 * @returns {object|null}
 */
export function getConversationById(conversationId) {
  return state.byId.get(String(conversationId)) || null;
}

/**
 * Get total unread count
 * @returns {number}
 */
export function getTotalUnreadCount() {
  return Math.max(0, state.totalUnread);
}

/**
 * Set active conversation (for unread handling)
 * @param {string|null} conversationId
 */
export function setActiveConversation(conversationId) {
  state.activeConversationId = conversationId;
}

/**
 * Get active conversation ID
 * @returns {string|null}
 */
export function getActiveConversation() {
  return state.activeConversationId;
}

/**
 * Check if loading
 * @returns {boolean}
 */
export function isLoading() {
  return state.loading;
}

/**
 * Get error
 * @returns {Error|null}
 */
export function getError() {
  return state.error;
}

/**
 * Subscribe to conversation events
 * @param {string} event - Event name ('updated', 'created', etc.)
 * @param {function} callback
 * @returns {function} Unsubscribe function
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
  state.totalUnread = 0;
  state.lastFetch = null;
  state.error = null;
  localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
  events.emit('updated', state.data);
}

// ============================================================================
// Update Functions (called by WebSocket handlers)
// ============================================================================

/**
 * Add or update a conversation
 * @param {object} conversation - Conversation data
 */
export function upsertConversation(conversation) {
  const users = getUsersSync() || [];
  const normalized = normalizeConversation(conversation, users);
  const id = String(normalized.conversation_id);

  const existing = state.byId.get(id);
  if (existing) {
    // Update existing
    Object.assign(existing, normalized);
  } else {
    // Add new at top
    state.data.unshift(normalized);
    state.byId.set(id, normalized);
    state.totalUnread += normalized.unread_count || 0;
  }

  persistToStorage();
  events.emit('updated', state.data);
  chatEvents.emit(CHAT_EVENTS.CONVERSATIONS_UPDATED, state.data);
}

/**
 * Update conversation with new message
 * @param {string} conversationId
 * @param {object} message
 * @param {boolean} incrementUnread
 */
export function updateConversationWithMessage(conversationId, message, incrementUnread = false) {
  const conv = state.byId.get(String(conversationId));
  if (!conv) return;

  // Update last message
  conv.last_message = createLastMessage(message);
  conv.last_activity = message.created_at;

  // Increment unread if needed
  if (incrementUnread) {
    conv.unread_count = (conv.unread_count || 0) + 1;
    state.totalUnread = Math.max(0, state.totalUnread + 1);
    chatEvents.emit(CHAT_EVENTS.UNREAD_COUNT_CHANGED, state.totalUnread);
  }

  // Move to top
  const index = state.data.findIndex((c) => c.conversation_id === conversationId);
  if (index > 0) {
    state.data.splice(index, 1);
    state.data.unshift(conv);
  }

  persistToStorage();
  events.emit('updated', state.data);
  chatEvents.emit(CHAT_EVENTS.CONVERSATIONS_UPDATED, state.data);
}

/**
 * Mark conversation as read
 * @param {string} conversationId
 */
export function markAsRead(conversationId) {
  const conv = state.byId.get(String(conversationId));
  if (conv && conv.unread_count > 0) {
    state.totalUnread = Math.max(0, state.totalUnread - conv.unread_count);
    conv.unread_count = 0;

    persistToStorage();
    events.emit('updated', state.data);
    chatEvents.emit(CHAT_EVENTS.UNREAD_COUNT_CHANGED, state.totalUnread);
  }
}

/**
 * Update user presence in conversations
 * @param {string} userKey
 * @param {boolean} isOnline
 * @param {string|null} lastSeen
 */
export function updatePresence(userKey, isOnline, lastSeen = null) {
  let updated = false;

  state.data.forEach((conv) => {
    const participant = conv.participants_info?.find((p) => p.user_key === userKey);
    if (participant) {
      const wasOnline = participant.is_online;
      participant.is_online = isOnline;
      if (!isOnline && lastSeen) {
        participant.last_seen = lastSeen;
      }
      if (wasOnline !== isOnline) {
        updated = true;
      }
    }
  });

  if (updated) {
    persistToStorage();
    events.emit('updated', state.data);
    events.emit('presence', { user_key: userKey, is_online: isOnline, last_seen: lastSeen });
    chatEvents.emit(CHAT_EVENTS.PRESENCE_UPDATED, { userKey, isOnline, lastSeen });
  }
}

/**
 * Remove conversation
 * @param {string} conversationId
 */
export function removeConversation(conversationId) {
  const index = state.data.findIndex((c) => c.conversation_id === conversationId);
  if (index !== -1) {
    const conv = state.data[index];
    state.totalUnread = Math.max(0, state.totalUnread - (conv.unread_count || 0));
    state.data.splice(index, 1);
    state.byId.delete(String(conversationId));

    persistToStorage();
    events.emit('updated', state.data);
    chatEvents.emit(CHAT_EVENTS.CONVERSATION_DELETED, conversationId);
  }
}

// Initialize from storage on load
loadFromStorage();

export default {
  getConversations,
  getConversationsSync,
  getConversationById,
  getTotalUnreadCount,
  setActiveConversation,
  getActiveConversation,
  isLoading,
  getError,
  subscribe,
  clearCache,
  upsertConversation,
  updateConversationWithMessage,
  markAsRead,
  updatePresence,
  removeConversation,
};

