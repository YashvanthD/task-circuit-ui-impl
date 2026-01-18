/**
 * WebSocket Manager
 * Centralized WebSocket event handling for the entire application.
 * This is the SINGLE source of truth for all WebSocket subscriptions.
 *
 * @module utils/websocket/wsManager
 */

import { socketService, WS_EVENTS } from './socketService';

// ============================================================================
// State
// ============================================================================

let initialized = false;
let connectionAttempted = false;

// Event handlers registry - allows components to register callbacks
const eventHandlers = {
  // Notification events
  [WS_EVENTS.NOTIFICATION_NEW]: new Set(),
  [WS_EVENTS.NOTIFICATION_READ]: new Set(),
  [WS_EVENTS.NOTIFICATION_READ_ALL]: new Set(),
  [WS_EVENTS.NOTIFICATION_DELETED]: new Set(),
  [WS_EVENTS.NOTIFICATION_COUNT]: new Set(),

  // Alert events
  [WS_EVENTS.ALERT_NEW]: new Set(),
  [WS_EVENTS.ALERT_ACKNOWLEDGED]: new Set(),
  [WS_EVENTS.ALERT_ACKNOWLEDGED_ALL]: new Set(),
  [WS_EVENTS.ALERT_DELETED]: new Set(),
  [WS_EVENTS.ALERT_COUNT]: new Set(),
  [WS_EVENTS.ALERT_ERROR]: new Set(),

  // Chat events
  [WS_EVENTS.MESSAGE_NEW]: new Set(),
  [WS_EVENTS.MESSAGE_SENT]: new Set(),
  [WS_EVENTS.MESSAGE_READ]: new Set(),
  [WS_EVENTS.MESSAGE_DELETED]: new Set(),
  [WS_EVENTS.MESSAGE_TYPING]: new Set(),
  [WS_EVENTS.CONVERSATION_CREATED]: new Set(),
  [WS_EVENTS.CONVERSATION_UPDATED]: new Set(),
  [WS_EVENTS.CONVERSATION_CLEARED]: new Set(),
  [WS_EVENTS.CONVERSATION_DELETED]: new Set(),

  // Presence events
  [WS_EVENTS.PRESENCE_UPDATE]: new Set(),
  [WS_EVENTS.PRESENCE_ONLINE]: new Set(),
  [WS_EVENTS.PRESENCE_OFFLINE]: new Set(),

  // Connection events
  [WS_EVENTS.CONNECTED]: new Set(),
  [WS_EVENTS.ERROR]: new Set(),
};

// ============================================================================
// Internal Event Dispatcher
// ============================================================================

/**
 * Dispatch event to all registered handlers
 */
function dispatchEvent(eventName, data) {
  const handlers = eventHandlers[eventName];
  if (handlers && handlers.size > 0) {
    handlers.forEach((handler) => {
      try {
        handler(data);
      } catch (e) {
        console.error(`[WSManager] Error in handler for ${eventName}:`, e);
      }
    });
  }
}

// ============================================================================
// Socket Event Registration (Internal - called once)
// ============================================================================

function registerSocketListeners() {
  if (initialized) {
    console.log('[WSManager] Already initialized, skipping listener registration');
    return;
  }

  console.log('[WSManager] Registering centralized WebSocket event listeners...');

  // Register listeners for all events
  Object.keys(eventHandlers).forEach((eventName) => {
    socketService.on(eventName, (data) => {
      console.log(`[WSManager] Event received: ${eventName}`, data);
      dispatchEvent(eventName, data);
    });
  });

  initialized = true;
  console.log('[WSManager] Centralized WebSocket listeners registered');
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Initialize the WebSocket manager.
 * Should be called once when the app starts (e.g., in DataContext).
 *
 * @returns {Promise<boolean>} - True if connected successfully
 */
export async function initializeWebSocket() {
  if (connectionAttempted && socketService.isConnected()) {
    console.log('[WSManager] Already connected');
    return true;
  }

  connectionAttempted = true;

  try {
    const connected = await socketService.connect();
    if (connected) {
      registerSocketListeners();
      console.log('[WSManager] WebSocket connected and initialized');
      return true;
    }
    return false;
  } catch (error) {
    console.error('[WSManager] Failed to initialize WebSocket:', error);
    return false;
  }
}

/**
 * Check if WebSocket is connected
 */
export function isConnected() {
  return socketService.isConnected();
}

/**
 * Subscribe to a WebSocket event.
 * Returns an unsubscribe function.
 *
 * @param {string} eventName - The event name from WS_EVENTS
 * @param {function} handler - The callback function
 * @returns {function} - Unsubscribe function
 */
export function subscribe(eventName, handler) {
  if (!eventHandlers[eventName]) {
    console.warn(`[WSManager] Unknown event: ${eventName}. Creating new handler set.`);
    eventHandlers[eventName] = new Set();
  }

  eventHandlers[eventName].add(handler);

  // Return unsubscribe function
  return () => {
    eventHandlers[eventName].delete(handler);
  };
}

/**
 * Unsubscribe from a WebSocket event
 *
 * @param {string} eventName - The event name
 * @param {function} handler - The handler to remove
 */
export function unsubscribe(eventName, handler) {
  if (eventHandlers[eventName]) {
    eventHandlers[eventName].delete(handler);
  }
}

/**
 * Emit an event to the server
 *
 * @param {string} eventName - The event name
 * @param {object} data - The data to send
 */
export function emit(eventName, data) {
  if (!socketService.isConnected()) {
    console.warn('[WSManager] Cannot emit - not connected');
    return false;
  }
  return socketService.emit(eventName, data);
}

/**
 * Disconnect WebSocket
 */
export function disconnect() {
  socketService.disconnect();
  initialized = false;
  connectionAttempted = false;
}

/**
 * Reset manager state (for logout)
 */
export function reset() {
  disconnect();
  // Clear all handlers
  Object.keys(eventHandlers).forEach((eventName) => {
    eventHandlers[eventName].clear();
  });
}

// ============================================================================
// Convenience Methods for Common Actions
// ============================================================================

// Notification actions
export const notifications = {
  markAsRead: (notificationId) => {
    return emit(WS_EVENTS.MARK_NOTIFICATION_READ, { notification_id: notificationId });
  },
  markAllAsRead: () => {
    return emit(WS_EVENTS.MARK_ALL_NOTIFICATIONS_READ, {});
  },
};

// Alert actions
export const alerts = {
  acknowledge: (alertId) => {
    return emit(WS_EVENTS.ACKNOWLEDGE_ALERT, { alert_id: alertId });
  },
  acknowledgeAll: () => {
    return emit(WS_EVENTS.ACKNOWLEDGE_ALL_ALERTS, {});
  },
  dismiss: (alertId) => {
    return emit(WS_EVENTS.DISMISS_ALERT, { alert_id: alertId });
  },
  getCount: () => {
    return emit(WS_EVENTS.GET_ALERT_COUNT, {});
  },
};

// Chat actions
export const chat = {
  sendMessage: (conversationId, content, type = 'text', tempId = null) => {
    return socketService.sendMessage(conversationId, content, type, tempId);
  },
  markAsRead: (conversationId) => {
    return socketService.markMessagesRead(conversationId);
  },
  deleteMessage: (messageId, forEveryone = false) => {
    return socketService.deleteMessage(messageId, forEveryone);
  },
  startTyping: (conversationId) => {
    return socketService.sendTyping(conversationId, true);
  },
  stopTyping: (conversationId) => {
    return socketService.sendTyping(conversationId, false);
  },
  createConversation: (participants, name = null, type = 'direct') => {
    return socketService.createConversation(participants, name, type);
  },
  setOnline: () => socketService.setOnline(),
  setOffline: () => socketService.setOffline(),
};

// ============================================================================
// Export
// ============================================================================

export default {
  initializeWebSocket,
  isConnected,
  subscribe,
  unsubscribe,
  emit,
  disconnect,
  reset,
  notifications,
  alerts,
  chat,
  WS_EVENTS,
};

