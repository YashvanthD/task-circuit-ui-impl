/**
 * Chat Cache - Typing Store
 * Manages typing indicators.
 *
 * @module utils/chat/typingStore
 */

import { createEventEmitter, chatEvents, CHAT_EVENTS } from './events';

// ============================================================================
// Store State
// ============================================================================

// Map<conversationId, Set<userKey>>
const typingState = new Map();

// Typing timeout (auto-clear after 5 seconds)
const TYPING_TIMEOUT = 5000;
const typingTimers = new Map(); // Map<`${conversationId}_${userKey}`, timeoutId>

const events = createEventEmitter();

// ============================================================================
// Public API
// ============================================================================

/**
 * Set user as typing
 * @param {string} conversationId
 * @param {string} userKey
 */
export function setTyping(conversationId, userKey) {
  if (!typingState.has(conversationId)) {
    typingState.set(conversationId, new Set());
  }

  const typing = typingState.get(conversationId);
  const wasTyping = typing.has(userKey);
  typing.add(userKey);

  // Clear existing timeout
  const timerKey = `${conversationId}_${userKey}`;
  if (typingTimers.has(timerKey)) {
    clearTimeout(typingTimers.get(timerKey));
  }

  // Set auto-clear timeout
  const timerId = setTimeout(() => {
    clearTyping(conversationId, userKey);
  }, TYPING_TIMEOUT);
  typingTimers.set(timerKey, timerId);

  // Emit if state changed
  if (!wasTyping) {
    emitTypingUpdate(conversationId);
  }
}

/**
 * Clear user typing
 * @param {string} conversationId
 * @param {string} userKey
 */
export function clearTyping(conversationId, userKey) {
  if (!typingState.has(conversationId)) return;

  const typing = typingState.get(conversationId);
  const wasTyping = typing.has(userKey);
  typing.delete(userKey);

  // Clear timeout
  const timerKey = `${conversationId}_${userKey}`;
  if (typingTimers.has(timerKey)) {
    clearTimeout(typingTimers.get(timerKey));
    typingTimers.delete(timerKey);
  }

  // Emit if state changed
  if (wasTyping) {
    emitTypingUpdate(conversationId);
  }
}

/**
 * Get typing users for a conversation
 * @param {string} conversationId
 * @returns {Array<string>} Array of user keys
 */
export function getTypingUsers(conversationId) {
  const typing = typingState.get(conversationId);
  return typing ? Array.from(typing) : [];
}

/**
 * Check if anyone is typing
 * @param {string} conversationId
 * @returns {boolean}
 */
export function isAnyoneTyping(conversationId) {
  const typing = typingState.get(conversationId);
  return typing ? typing.size > 0 : false;
}

/**
 * Subscribe to typing events
 * @param {function} callback - Receives { conversationId, users }
 * @returns {function} Unsubscribe function
 */
export function subscribe(callback) {
  return events.on('typing', callback);
}

/**
 * Clear all typing state
 */
export function clearAll() {
  typingTimers.forEach((timerId) => clearTimeout(timerId));
  typingTimers.clear();
  typingState.clear();
}

// ============================================================================
// Internal
// ============================================================================

function emitTypingUpdate(conversationId) {
  const users = getTypingUsers(conversationId);
  events.emit('typing', { conversationId, users });
  chatEvents.emit(CHAT_EVENTS.TYPING_UPDATED, { conversationId, users });
}

export default {
  setTyping,
  clearTyping,
  getTypingUsers,
  isAnyoneTyping,
  subscribe,
  clearAll,
};

