/**
 * WebSocket Service
 * Real-time connection manager using Socket.IO for notifications, alerts, chat, and data streams.
 *
 * @module utils/websocket/socketService
 */

import { io } from 'socket.io-client';
import { getAccessToken } from '../auth/storage';

// ============================================================================
// WebSocket Events Constants
// ============================================================================
export const WS_EVENTS = {
  // Connection events
  CONNECTED: 'connected',
  ERROR: 'error',

  // Notification events (server -> client)
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_READ_ALL: 'notification:read_all',
  NOTIFICATION_DELETED: 'notification:deleted',
  NOTIFICATION_COUNT: 'notification:count',

  // Alert events (server -> client)
  ALERT_NEW: 'alert:new',
  ALERT_ACKNOWLEDGED: 'alert:acknowledged',
  ALERT_DELETED: 'alert:deleted',
  ALERT_COUNT: 'alert:count',

  // Notification client -> server events
  MARK_NOTIFICATION_READ: 'notification:mark_read',
  MARK_ALL_NOTIFICATIONS_READ: 'notification:mark_all_read',
  ACKNOWLEDGE_ALERT: 'alert:acknowledge',

  // =========================================================================
  // Chat/Messaging Events (matching backend API)
  // =========================================================================

  // Message events (client -> server)
  MESSAGE_SEND: 'chat:send',           // Was 'message:send'
  MESSAGE_EDIT: 'chat:edit',           // Was 'message:edit'
  MESSAGE_DELETE: 'chat:delete',       // Was 'message:delete'
  MESSAGE_READ: 'chat:read',           // Was 'message:read'
  MESSAGE_REACTION: 'chat:reaction',   // Was 'message:reaction'

  // Message events (server -> client)
  MESSAGE_SENT: 'chat:message:sent',   // Was 'message:sent'
  MESSAGE_NEW: 'chat:message',         // Was 'message:new'
  MESSAGE_DELIVERED: 'chat:message:delivered',
  MESSAGE_EDITED: 'chat:message:edited',
  MESSAGE_DELETED: 'chat:message:deleted',

  // Typing indicators
  TYPING_START: 'chat:typing',         // Was 'typing:start'
  TYPING_STOP: 'chat:typing:stop',     // Was 'typing:stop'
  TYPING_UPDATE: 'chat:typing',        // Was 'typing:update'

  // Conversation events (client -> server)
  CONVERSATION_CREATE: 'conversation:create',
  CONVERSATION_UPDATE: 'conversation:update',
  CONVERSATION_ADD_PARTICIPANTS: 'conversation:add_participants',
  CONVERSATION_REMOVE_PARTICIPANT: 'conversation:remove_participant',
  CONVERSATION_LEAVE: 'conversation:leave',
  CONVERSATION_OPEN: 'conversation:open',

  // Conversation events (server -> client)
  CONVERSATION_CREATED: 'conversation:created',
  CONVERSATION_UPDATED: 'conversation:updated',
  CONVERSATION_PARTICIPANT_ADDED: 'conversation:participant_added',
  CONVERSATION_PARTICIPANT_REMOVED: 'conversation:participant_removed',

  // Presence events
  PRESENCE_ONLINE: 'presence:online',
  PRESENCE_OFFLINE: 'presence:offline',
  PRESENCE_UPDATE: 'presence:update',

  // Stream events (real-time data updates)
  STREAM_TASK_UPDATE: 'stream:task_update',
  STREAM_POND_UPDATE: 'stream:pond_update',
  STREAM_EXPENSE_UPDATE: 'stream:expense_update',
};

// ============================================================================
// Socket Service Singleton
// ============================================================================

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 2; // Reduced from 5 to fail faster
    this.listeners = new Map();
    this.pendingEmits = [];
  }

  /**
   * Initialize and connect to WebSocket server
   * @param {string} url - WebSocket server URL (optional, uses window.location.origin by default)
   * @returns {Promise<boolean>} Connection success
   */
  connect(url) {
    return new Promise((resolve) => {
      if (this.socket?.connected) {
        resolve(true);
        return;
      }

      const token = getAccessToken();
      if (!token) {
        console.warn('[SocketService] No access token, skipping connection');
        resolve(false);
        return;
      }

      const serverUrl = url || window.location.origin;

      this.socket = io(serverUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 3000,
        timeout: 5000, // Reduced from 10000 to fail faster
      });

      // Connection events
      this.socket.on('connect', () => {
        console.log('[SocketService] Connected');
        this.connected = true;
        this.reconnectAttempts = 0;
        this._processPendingEmits();
        this._emit('connection', { status: 'connected' });
        resolve(true);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[SocketService] Disconnected:', reason);
        this.connected = false;
        this._emit('connection', { status: 'disconnected', reason });
      });

      this.socket.on('connect_error', (error) => {
        console.error('[SocketService] Connection error:', error.message);
        this.reconnectAttempts++;
        this._emit('connection', { status: 'error', error: error.message });

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          resolve(false);
        }
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('[SocketService] Reconnected after', attemptNumber, 'attempts');
        this.connected = true;
        this._emit('connection', { status: 'reconnected', attempts: attemptNumber });
      });

      // Listen for backend 'connected' event (confirms user authentication)
      this.socket.on('connected', (data) => {
        console.log('[SocketService] Authenticated as:', data?.user_key);
        this._emit(WS_EVENTS.CONNECTED, data);
      });

      // Register all WebSocket event handlers
      this._registerEventHandlers();
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log('[SocketService] Disconnected manually');
    }
  }

  /**
   * Check if connected
   * @returns {boolean}
   */
  isConnected() {
    return this.connected && this.socket?.connected;
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   * @returns {function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  /**
   * Emit an event to server
   * @param {string} event - Event name
   * @param {*} data - Data to send
   * @returns {Promise<*>} Response from server
   */
  emit(event, data) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        // Queue for later if not connected
        this.pendingEmits.push({ event, data, resolve, reject });
        return;
      }

      this.socket.emit(event, data, (response) => {
        if (response?.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Emit to internal listeners
   * @private
   */
  _emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (e) {
          console.error('[SocketService] Listener error:', e);
        }
      });
    }
  }

  /**
   * Process pending emits after connection
   * @private
   */
  _processPendingEmits() {
    while (this.pendingEmits.length > 0) {
      const { event, data, resolve, reject } = this.pendingEmits.shift();
      this.emit(event, data).then(resolve).catch(reject);
    }
  }

  /**
   * Register all event handlers from server
   * @private
   */
  _registerEventHandlers() {
    // Notification events
    this.socket.on(WS_EVENTS.NOTIFICATION_NEW, (data) => {
      this._emit(WS_EVENTS.NOTIFICATION_NEW, data);
    });

    this.socket.on(WS_EVENTS.NOTIFICATION_READ, (data) => {
      this._emit(WS_EVENTS.NOTIFICATION_READ, data);
    });

    this.socket.on(WS_EVENTS.NOTIFICATION_READ_ALL, (data) => {
      this._emit(WS_EVENTS.NOTIFICATION_READ_ALL, data);
    });

    this.socket.on(WS_EVENTS.NOTIFICATION_DELETED, (data) => {
      this._emit(WS_EVENTS.NOTIFICATION_DELETED, data);
    });

    this.socket.on(WS_EVENTS.NOTIFICATION_COUNT, (data) => {
      this._emit(WS_EVENTS.NOTIFICATION_COUNT, data);
    });

    // Alert events
    this.socket.on(WS_EVENTS.ALERT_NEW, (data) => {
      this._emit(WS_EVENTS.ALERT_NEW, data);
    });

    this.socket.on(WS_EVENTS.ALERT_ACKNOWLEDGED, (data) => {
      this._emit(WS_EVENTS.ALERT_ACKNOWLEDGED, data);
    });

    this.socket.on(WS_EVENTS.ALERT_DELETED, (data) => {
      this._emit(WS_EVENTS.ALERT_DELETED, data);
    });

    this.socket.on(WS_EVENTS.ALERT_COUNT, (data) => {
      this._emit(WS_EVENTS.ALERT_COUNT, data);
    });

    // Presence events
    this.socket.on(WS_EVENTS.PRESENCE_UPDATE, (data) => {
      this._emit(WS_EVENTS.PRESENCE_UPDATE, data);
    });

    // Stream events (real-time data updates)
    this.socket.on(WS_EVENTS.STREAM_TASK_UPDATE, (data) => {
      this._emit(WS_EVENTS.STREAM_TASK_UPDATE, data);
    });

    this.socket.on(WS_EVENTS.STREAM_POND_UPDATE, (data) => {
      this._emit(WS_EVENTS.STREAM_POND_UPDATE, data);
    });

    this.socket.on(WS_EVENTS.STREAM_EXPENSE_UPDATE, (data) => {
      this._emit(WS_EVENTS.STREAM_EXPENSE_UPDATE, data);
    });

    // =========================================================================
    // Chat/Messaging Events
    // =========================================================================

    // Message events from server
    this.socket.on(WS_EVENTS.MESSAGE_NEW, (data) => {
      this._emit(WS_EVENTS.MESSAGE_NEW, data);
    });

    this.socket.on(WS_EVENTS.MESSAGE_SENT, (data) => {
      this._emit(WS_EVENTS.MESSAGE_SENT, data);
    });

    this.socket.on(WS_EVENTS.MESSAGE_DELIVERED, (data) => {
      this._emit(WS_EVENTS.MESSAGE_DELIVERED, data);
    });

    this.socket.on(WS_EVENTS.MESSAGE_EDITED, (data) => {
      this._emit(WS_EVENTS.MESSAGE_EDITED, data);
    });

    this.socket.on(WS_EVENTS.MESSAGE_DELETED, (data) => {
      this._emit(WS_EVENTS.MESSAGE_DELETED, data);
    });

    // Typing indicator
    this.socket.on(WS_EVENTS.TYPING_UPDATE, (data) => {
      this._emit(WS_EVENTS.TYPING_UPDATE, data);
    });

    // Conversation events from server
    this.socket.on(WS_EVENTS.CONVERSATION_CREATED, (data) => {
      this._emit(WS_EVENTS.CONVERSATION_CREATED, data);
    });

    this.socket.on(WS_EVENTS.CONVERSATION_UPDATED, (data) => {
      this._emit(WS_EVENTS.CONVERSATION_UPDATED, data);
    });

    this.socket.on(WS_EVENTS.CONVERSATION_PARTICIPANT_ADDED, (data) => {
      this._emit(WS_EVENTS.CONVERSATION_PARTICIPANT_ADDED, data);
    });

    this.socket.on(WS_EVENTS.CONVERSATION_PARTICIPANT_REMOVED, (data) => {
      this._emit(WS_EVENTS.CONVERSATION_PARTICIPANT_REMOVED, data);
    });

    // Presence events
    this.socket.on(WS_EVENTS.PRESENCE_ONLINE, (data) => {
      this._emit(WS_EVENTS.PRESENCE_ONLINE, data);
    });

    this.socket.on(WS_EVENTS.PRESENCE_OFFLINE, (data) => {
      this._emit(WS_EVENTS.PRESENCE_OFFLINE, data);
    });
  }

  // ============================================================================
  // Convenience Methods for Notifications
  // ============================================================================

  /**
   * Mark notification as read via WebSocket
   * @param {string} notificationId - Notification ID
   */
  markNotificationRead(notificationId) {
    return this.emit(WS_EVENTS.MARK_NOTIFICATION_READ, { notification_id: notificationId });
  }

  /**
   * Mark all notifications as read via WebSocket
   */
  markAllNotificationsRead() {
    return this.emit(WS_EVENTS.MARK_ALL_NOTIFICATIONS_READ, {});
  }

  /**
   * Acknowledge alert via WebSocket
   * @param {string} alertId - Alert ID
   */
  acknowledgeAlert(alertId) {
    return this.emit(WS_EVENTS.ACKNOWLEDGE_ALERT, { alert_id: alertId });
  }

  // ============================================================================
  // Convenience Methods for Chat
  // ============================================================================

  /**
   * Send a chat message via WebSocket
   * @param {string} conversationId - Conversation ID
   * @param {string} content - Message content
   * @param {string} type - Message type (text, image, file)
   * @param {string} replyTo - Message ID to reply to (optional)
   * @param {string} tempId - Temporary ID for optimistic update (optional)
   */
  sendMessage(conversationId, content, type = 'text', replyTo = null, tempId = null) {
    return this.emit(WS_EVENTS.MESSAGE_SEND, {
      conversationId,
      content,
      type,
      replyTo,
      tempId: tempId || `temp_${Date.now()}`,
    });
  }

  /**
   * Edit a message via WebSocket
   * @param {string} messageId - Message ID
   * @param {string} content - New content
   */
  editMessage(messageId, content) {
    return this.emit(WS_EVENTS.MESSAGE_EDIT, { messageId, content });
  }

  /**
   * Delete a message via WebSocket
   * @param {string} messageId - Message ID
   * @param {boolean} forEveryone - Delete for everyone
   */
  deleteMessage(messageId, forEveryone = false) {
    return this.emit(WS_EVENTS.MESSAGE_DELETE, { messageId, forEveryone });
  }

  /**
   * Mark messages as read via WebSocket
   * @param {string} conversationId - Conversation ID
   */
  markMessagesRead(conversationId) {
    return this.emit(WS_EVENTS.MESSAGE_READ, { conversationId });
  }

  /**
   * Add reaction to a message
   * @param {string} messageId - Message ID
   * @param {string} emoji - Emoji reaction
   */
  addReaction(messageId, emoji) {
    return this.emit(WS_EVENTS.MESSAGE_REACTION, { messageId, emoji });
  }

  /**
   * Start typing indicator
   * @param {string} conversationId - Conversation ID
   */
  startTyping(conversationId) {
    return this.emit(WS_EVENTS.TYPING_START, { conversationId });
  }

  /**
   * Stop typing indicator
   * @param {string} conversationId - Conversation ID
   */
  stopTyping(conversationId) {
    return this.emit(WS_EVENTS.TYPING_STOP, { conversationId });
  }

  /**
   * Create a new conversation
   * @param {Array} participants - Array of user keys
   * @param {string} name - Conversation name (for groups)
   * @param {string} type - 'direct' or 'group'
   */
  createConversation(participants, name = null, type = 'direct') {
    return this.emit(WS_EVENTS.CONVERSATION_CREATE, { participants, name, type });
  }

  /**
   * Track when user opens a conversation (updates last activity)
   * @param {string} conversationId - Conversation ID
   */
  openConversation(conversationId) {
    return this.emit(WS_EVENTS.CONVERSATION_OPEN, {
      conversationId,
      timestamp: new Date().toISOString()
    });
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================
export const socketService = new SocketService();

export default socketService;

