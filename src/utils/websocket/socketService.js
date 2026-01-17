/**
 * WebSocket Service - CORRECTED VERSION
 * Real-time connection manager using Socket.IO for notifications, alerts, chat, and data streams.
 *
 * @module utils/websocket/socketService
 */
import { io } from 'socket.io-client';
import { getAccessToken } from '../auth/storage';
import { BASE_URL } from '../../config';

// ============================================================================
// WebSocket Events Constants (matching backend exactly)
// ============================================================================
export const WS_EVENTS = {
  // Connection events
  CONNECTED: 'connected',
  ERROR: 'error',
  PONG: 'pong',

  // =========================================================================
  // Chat/Messaging Events
  // =========================================================================

  // Message events (client -> server)
  MESSAGE_SEND: 'chat:send',
  MESSAGE_READ: 'chat:read',
  MESSAGE_DELETE: 'chat:delete',
  MESSAGE_TYPING: 'chat:typing',

  // Message events (server -> client)
  MESSAGE_NEW: 'chat:message',
  MESSAGE_SENT: 'chat:message:sent',
  MESSAGE_DELIVERED: 'chat:message:delivered',
  MESSAGE_READ_RECEIPT: 'chat:message:read',
  MESSAGE_DELETED: 'chat:message:deleted',
  CHAT_ERROR: 'chat:error',

  // Typing indicators (server -> client)
  TYPING_START: 'chat:typing:start',
  TYPING_STOP: 'chat:typing:stop',

  // Conversation events (client -> server)
  CONVERSATION_CREATE: 'chat:conversation:create',
  CONVERSATION_JOIN: 'chat:conversation:join',
  CONVERSATION_CLEAR: 'chat:conversation:clear',

  // Conversation events (server -> client)
  CONVERSATION_CREATED: 'chat:conversation:created',
  CONVERSATION_JOINED: 'chat:conversation:joined',
  CONVERSATION_CLEARED: 'chat:conversation:cleared',
  CONVERSATION_UPDATED: 'chat:conversation:updated',

  // =========================================================================
  // Notification events
  // =========================================================================
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
        this.maxReconnectAttempts = 5;
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

            // Use provided URL, or BASE_URL from config, or fallback to window.location.origin
            const serverUrl = url || BASE_URL || window.location.origin;

            console.log('[SocketService] Connecting to:', serverUrl);
            console.log('[SocketService] Using token:', token ? token.substring(0, 20) + '...' : 'none');

            this.socket = io(serverUrl, {
                path: '/socket.io',  // Explicit path
                auth: { token },     // Primary auth method
                query: { token },    // Fallback auth via query param
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 10000,
                forceNew: true,      // Force new connection
            });

            // Connection events
            this.socket.on('connect', () => {
                console.log('[SocketService] Socket connected, ID:', this.socket.id);
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
                console.log('[SocketService] Authenticated:', data);
                console.log('[SocketService] User key:', data?.user_key);
                console.log('[SocketService] Features:', data?.features);
                this._emit(WS_EVENTS.CONNECTED, data);
            });

            // Listen for errors
            this.socket.on('error', (error) => {
                console.error('[SocketService] Server error:', error);
                this._emit(WS_EVENTS.ERROR, error);
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
     * @returns {Promise<void>} Resolves when emitted
     */
    emit(event, data) {
        return new Promise((resolve, reject) => {
            if (!this.isConnected()) {
                // Queue for later if not connected
                this.pendingEmits.push({ event, data, resolve, reject });
                console.warn('[SocketService] Not connected, queuing event:', event);
                return;
            }

            console.log('[SocketService] Emitting:', event, data);

            // Just emit without waiting for callback (like the test HTML does)
            // The response will come as a separate event (e.g., chat:message:sent)
            this.socket.emit(event, data);
            resolve();
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
        // =========================================================================
        // Notification events
        // =========================================================================
        this.socket.on(WS_EVENTS.NOTIFICATION_NEW, (data) => {
            console.log('[SocketService] Notification new:', data);
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

        // =========================================================================
        // Alert events
        // =========================================================================
        this.socket.on(WS_EVENTS.ALERT_NEW, (data) => {
            console.log('[SocketService] Alert new:', data);
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

        // =========================================================================
        // Chat/Messaging Events - CORRECTED
        // =========================================================================

        // New message received
        this.socket.on(WS_EVENTS.MESSAGE_NEW, (data) => {
            console.log('[SocketService] Chat message received:', data);
            this._emit(WS_EVENTS.MESSAGE_NEW, data);
        });

        // Your message was sent (confirmation)
        this.socket.on(WS_EVENTS.MESSAGE_SENT, (data) => {
            console.log('[SocketService] Chat message sent confirmation:', data);
            this._emit(WS_EVENTS.MESSAGE_SENT, data);
        });

        // Message delivered to recipient
        this.socket.on(WS_EVENTS.MESSAGE_DELIVERED, (data) => {
            console.log('[SocketService] Message delivered:', data);
            this._emit(WS_EVENTS.MESSAGE_DELIVERED, data);
        });

        // Message read by recipient
        this.socket.on(WS_EVENTS.MESSAGE_READ_RECEIPT, (data) => {
            console.log('[SocketService] Message read:', data);
            this._emit(WS_EVENTS.MESSAGE_READ_RECEIPT, data);
        });

        // Message edited
        this.socket.on(WS_EVENTS.MESSAGE_EDITED, (data) => {
            console.log('[SocketService] Message edited:', data);
            this._emit(WS_EVENTS.MESSAGE_EDITED, data);
        });

        // Message deleted
        this.socket.on(WS_EVENTS.MESSAGE_DELETED, (data) => {
            console.log('[SocketService] Message deleted:', data);
            this._emit(WS_EVENTS.MESSAGE_DELETED, data);
        });

        // Typing indicators
        this.socket.on(WS_EVENTS.TYPING_START, (data) => {
            console.log('[SocketService] Typing start:', data);
            this._emit(WS_EVENTS.TYPING_START, data);
        });

        this.socket.on(WS_EVENTS.TYPING_STOP, (data) => {
            console.log('[SocketService] Typing stop:', data);
            this._emit(WS_EVENTS.TYPING_STOP, data);
        });

        // Conversation created
        this.socket.on(WS_EVENTS.CONVERSATION_CREATED, (data) => {
            console.log('[SocketService] Conversation created:', data);
            this._emit(WS_EVENTS.CONVERSATION_CREATED, data);
        });

        // Conversation joined (room)
        this.socket.on(WS_EVENTS.CONVERSATION_JOINED, (data) => {
            console.log('[SocketService] Conversation joined:', data);
            this._emit(WS_EVENTS.CONVERSATION_JOINED, data);
        });

        // Conversation cleared
        this.socket.on(WS_EVENTS.CONVERSATION_CLEARED, (data) => {
            console.log('[SocketService] Conversation cleared:', data);
            this._emit(WS_EVENTS.CONVERSATION_CLEARED, data);
        });

        // Conversation updated
        this.socket.on(WS_EVENTS.CONVERSATION_UPDATED, (data) => {
            this._emit(WS_EVENTS.CONVERSATION_UPDATED, data);
        });

        // Chat errors
        this.socket.on(WS_EVENTS.CHAT_ERROR, (data) => {
            console.error('[SocketService] Chat error:', data);
            this._emit(WS_EVENTS.CHAT_ERROR, data);
        });

        // =========================================================================
        // Presence events
        // =========================================================================
        this.socket.on(WS_EVENTS.PRESENCE_UPDATE, (data) => {
            console.log('[SocketService] Presence update:', data);
            this._emit(WS_EVENTS.PRESENCE_UPDATE, data);
        });

        this.socket.on(WS_EVENTS.PRESENCE_ONLINE, (data) => {
            this._emit(WS_EVENTS.PRESENCE_ONLINE, data);
        });

        this.socket.on(WS_EVENTS.PRESENCE_OFFLINE, (data) => {
            this._emit(WS_EVENTS.PRESENCE_OFFLINE, data);
        });

        // =========================================================================
        // Stream events (real-time data updates)
        // =========================================================================
        this.socket.on(WS_EVENTS.STREAM_TASK_UPDATE, (data) => {
            this._emit(WS_EVENTS.STREAM_TASK_UPDATE, data);
        });

        this.socket.on(WS_EVENTS.STREAM_POND_UPDATE, (data) => {
            this._emit(WS_EVENTS.STREAM_POND_UPDATE, data);
        });

        this.socket.on(WS_EVENTS.STREAM_EXPENSE_UPDATE, (data) => {
            this._emit(WS_EVENTS.STREAM_EXPENSE_UPDATE, data);
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
    // Convenience Methods for Chat (matching backend exactly)
    // ============================================================================

    /**
     * Send a chat message via WebSocket
     * Event: chat:send
     *
     * @param {string} conversationId - Conversation ID (required)
     * @param {string} content - Message content (required)
     * @param {string} type - Message type: text, image, file (default: text)
     * @param {string} tempId - Temporary ID for optimistic update (optional)
     */
    sendMessage(conversationId, content, type = 'text', tempId = null) {
        const payload = {
            conversationId,
            content,
            type,
            tempId: tempId || `temp_${Date.now()}`,
        };

        console.log('[SocketService] Sending chat:send:', payload);
        return this.emit(WS_EVENTS.MESSAGE_SEND, payload);
    }

    /**
     * Mark conversation as read via WebSocket
     * Event: chat:read
     * @param {string} conversationId - Conversation ID
     */
    markMessagesRead(conversationId) {
        console.log('[SocketService] Sending chat:read:', { conversationId });
        return this.emit(WS_EVENTS.MESSAGE_READ, { conversationId });
    }

    /**
     * Delete a message via WebSocket
     * Event: chat:delete
     * @param {string} messageId - Message ID
     * @param {boolean} forEveryone - Delete for everyone
     */
    deleteMessage(messageId, forEveryone = false) {
        console.log('[SocketService] Sending chat:delete:', { messageId, forEveryone });
        return this.emit(WS_EVENTS.MESSAGE_DELETE, { messageId, forEveryone });
    }

    /**
     * Send typing indicator
     * Event: chat:typing
     * @param {string} conversationId - Conversation ID
     * @param {boolean} isTyping - Whether user is typing
     */
    sendTyping(conversationId, isTyping = true) {
        return this.emit(WS_EVENTS.MESSAGE_TYPING, { conversationId, isTyping });
    }

    /**
     * Start typing indicator (convenience)
     * @param {string} conversationId - Conversation ID
     */
    startTyping(conversationId) {
        return this.sendTyping(conversationId, true);
    }

    /**
     * Stop typing indicator (convenience)
     * @param {string} conversationId - Conversation ID
     */
    stopTyping(conversationId) {
        return this.sendTyping(conversationId, false);
    }

    /**
     * Create a new conversation
     * Event: chat:conversation:create
     * @param {Array} participants - Array of user keys
     * @param {string} name - Conversation name (for groups)
     * @param {string} type - 'direct' or 'group'
     */
    createConversation(participants, name = null, type = 'direct') {
        const payload = {
            type,
            participants,
            name: type === 'group' ? name : null,
        };
        console.log('[SocketService] Sending chat:conversation:create:', payload);
        return this.emit(WS_EVENTS.CONVERSATION_CREATE, payload);
    }

    /**
     * Join a conversation room to receive messages
     * Event: chat:conversation:join
     * @param {string} conversationId - Conversation ID
     */
    joinConversation(conversationId) {
        console.log('[SocketService] Sending chat:conversation:join:', { conversationId });
        return this.emit(WS_EVENTS.CONVERSATION_JOIN, { conversationId });
    }

    /**
     * Clear conversation messages
     * Event: chat:conversation:clear
     * @param {string} conversationId - Conversation ID
     * @param {boolean} forEveryone - Clear for everyone
     */
    clearConversation(conversationId, forEveryone = false) {
        console.log('[SocketService] Sending chat:conversation:clear:', { conversationId, forEveryone });
        return this.emit(WS_EVENTS.CONVERSATION_CLEAR, { conversationId, forEveryone });
    }

    /**
     * Track when user opens a conversation (updates last activity)
     * @param {string} conversationId - Conversation ID
     */
    openConversation(conversationId) {
        // Join the conversation room when opening
        return this.joinConversation(conversationId);
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================
export const socketService = new SocketService();

export default socketService;
