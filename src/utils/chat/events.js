/**
 * Chat Cache - Event Emitter
 * Simple event system for chat updates.
 *
 * @module utils/chat/events
 */

/**
 * Create a simple event emitter
 */
export function createEventEmitter() {
  const listeners = new Map();

  return {
    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     * @returns {function} Unsubscribe function
     */
    on(event, callback) {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event).add(callback);
      return () => this.off(event, callback);
    },

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     */
    off(event, callback) {
      if (listeners.has(event)) {
        listeners.get(event).delete(callback);
      }
    },

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
      if (listeners.has(event)) {
        listeners.get(event).forEach((callback) => {
          try {
            callback(data);
          } catch (e) {
            console.error(`[ChatEvents] Error in ${event} listener:`, e);
          }
        });
      }
    },

    /**
     * Clear all listeners
     */
    clear() {
      listeners.clear();
    },
  };
}

// Global chat events emitter
export const chatEvents = createEventEmitter();

// Event types
export const CHAT_EVENTS = {
  // Conversation events
  CONVERSATIONS_UPDATED: 'conversations:updated',
  CONVERSATION_CREATED: 'conversation:created',
  CONVERSATION_DELETED: 'conversation:deleted',

  // Message events
  MESSAGES_UPDATED: 'messages:updated',
  MESSAGE_NEW: 'message:new',
  MESSAGE_SENT: 'message:sent',
  MESSAGE_DELETED: 'message:deleted',
  MESSAGE_STATUS_CHANGED: 'message:status',

  // Typing events
  TYPING_UPDATED: 'typing:updated',

  // Presence events
  PRESENCE_UPDATED: 'presence:updated',

  // Unread count
  UNREAD_COUNT_CHANGED: 'unread:changed',
};

export default {
  createEventEmitter,
  chatEvents,
  CHAT_EVENTS,
};

