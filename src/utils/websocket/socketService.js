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
  // Alerts WebSocket Events
  // =========================================================================

  // Client -> Server
  SUBSCRIBE_ALERTS: 'subscribe_alerts',
  CREATE_ALERT: 'create_alert',
  ACKNOWLEDGE_ALERT: 'acknowledge_alert',
  RESOLVE_ALERT: 'resolve_alert',
  DELETE_ALERT: 'delete_alert',

  // Server -> Client
  SUBSCRIBED: 'subscribed',
  ALERT_CREATED: 'alert_created',
  ALERT_ACKNOWLEDGED: 'alert_acknowledged',
  ALERT_RESOLVED: 'alert_resolved',
  ALERT_DELETED: 'alert_deleted',

  // Legacy support
  ALERT_NEW: 'alert_created',
  ALERT_ACKNOWLEDGED_ALL: 'alert:acknowledged_all',
  ALERT_COUNT: 'alert:count',
  ALERT_ERROR: 'alert:error',
  DISMISS_ALERT: 'alert:dismiss',
  ACKNOWLEDGE_ALL_ALERTS: 'alert:acknowledge_all',
  GET_ALERT_COUNT: 'alert:get_count',

  // =========================================================================
  // Notifications WebSocket Events
  // =========================================================================

  // Client -> Server
  SUBSCRIBE_NOTIFICATIONS: 'subscribe_notifications',
  SEND_NOTIFICATION: 'send_notification',
  MARK_NOTIFICATION_READ: 'mark_notification_read',
  MARK_ALL_NOTIFICATIONS_READ: 'mark_all_notifications_read',
  DELETE_NOTIFICATION: 'delete_notification',

  // Server -> Client
  NOTIFICATION: 'notification',
  NOTIFICATION_READ: 'notification_read',
  ALL_NOTIFICATIONS_READ: 'all_notifications_read',
  NOTIFICATION_DELETED: 'notification_deleted',

  // Legacy support
  NOTIFICATION_NEW: 'notification',
  NOTIFICATION_READ_ALL: 'all_notifications_read',
  NOTIFICATION_COUNT: 'notification:count',

  // =========================================================================
  // Tasks WebSocket Events
  // =========================================================================

  // Client -> Server
  SUBSCRIBE_TASKS: 'subscribe_tasks',
  CREATE_TASK: 'create_task',
  UPDATE_TASK: 'update_task',
  COMPLETE_TASK: 'complete_task',
  DELETE_TASK: 'delete_task',

  // Server -> Client
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_COMPLETED: 'task_completed',
  TASK_DELETED: 'task_deleted',

  // =========================================================================
  // Chat/Messaging Events
  // =========================================================================

  // Client -> Server
  SUBSCRIBE_CHAT: 'subscribe_chat',
  SEND_MESSAGE: 'send_message',
  MARK_MESSAGE_READ: 'mark_message_read',
  DELETE_MESSAGE: 'delete_message',
  TYPING: 'typing',
  CREATE_CONVERSATION: 'create_conversation',

  // Server -> Client
  MESSAGE: 'message',
  MESSAGE_READ_RECEIPT: 'message_read',
  MESSAGE_DELETED: 'message_deleted',
  USER_TYPING: 'user_typing',
  CONVERSATION_CREATED: 'conversation_created',

  // Legacy support
  MESSAGE_SEND: 'send_message',
  MESSAGE_READ: 'mark_message_read',
  MESSAGE_DELETE: 'delete_message',
  MESSAGE_TYPING: 'typing',
  MESSAGE_NEW: 'message',
  MESSAGE_SENT: 'chat:message:sent',
  MESSAGE_DELIVERED: 'chat:message:delivered',
  MESSAGE_EDITED: 'chat:message:edited',
  CHAT_ERROR: 'chat:error',
  TYPING_START: 'chat:typing:start',
  TYPING_STOP: 'chat:typing:stop',
  CONVERSATION_JOIN: 'chat:conversation:join',
  CONVERSATION_CLEAR: 'chat:conversation:clear',
  CONVERSATION_JOINED: 'chat:conversation:joined',
  CONVERSATION_CLEARED: 'chat:conversation:cleared',
  CONVERSATION_UPDATED: 'chat:conversation:updated',
  CONVERSATION_DELETED: 'chat:conversation:deleted',


  // =========================================================================
  // Cross-Pod Broadcast (server -> client)
  // =========================================================================
  TEST_BROADCAST: 'test:broadcast',

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
        this._connectingPromise = null; // Track pending connection
    }

    /**
     * Initialize and connect to WebSocket server
     * @param {string} url - WebSocket server URL (optional, uses window.location.origin by default)
     * @returns {Promise<boolean>} Connection success
     */
    connect(url) {
        // If already connected, return immediately
        if (this.socket?.connected) {
            console.log('[SocketService] Already connected');
            return Promise.resolve(true);
        }

        // If connection is in progress, return the existing promise
        if (this._connectingPromise) {
            console.log('[SocketService] Connection already in progress, waiting...');
            return this._connectingPromise;
        }

        // If socket exists but disconnected, try to reconnect
        if (this.socket && !this.socket.connected) {
            console.log('[SocketService] Socket exists but disconnected, reconnecting...');
            this.socket.connect();
            return new Promise((resolve) => {
                const onConnect = () => {
                    this.socket.off('connect', onConnect);
                    this.socket.off('connect_error', onError);
                    resolve(true);
                };
                const onError = () => {
                    this.socket.off('connect', onConnect);
                    this.socket.off('connect_error', onError);
                    resolve(false);
                };
                this.socket.once('connect', onConnect);
                this.socket.once('connect_error', onError);
                // Timeout after 10 seconds
                setTimeout(() => {
                    this.socket.off('connect', onConnect);
                    this.socket.off('connect_error', onError);
                    resolve(this.socket?.connected || false);
                }, 10000);
            });
        }

        const token = getAccessToken();
        if (!token) {
            console.warn('[SocketService] No access token, skipping connection');
            return Promise.resolve(false);
        }

        // Use provided URL, or BASE_URL from config, or fallback to window.location.origin
        const serverUrl = url || BASE_URL || window.location.origin;

        console.log('[SocketService] Connecting to:', serverUrl);

        // Create connection promise
        this._connectingPromise = new Promise((resolve) => {
            this.socket = io(serverUrl, {
                path: '/socket.io',
                auth: { token },
                query: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 10000,
                // Don't use forceNew - reuse existing connection
            });

            // Connection events
            this.socket.on('connect', () => {
                console.log('[SocketService] Socket connected, ID:', this.socket.id);
                this.connected = true;
                this.reconnectAttempts = 0;
                this._connectingPromise = null;
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
                    this._connectingPromise = null;
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

        return this._connectingPromise;
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
        // Alert events
        // =========================================================================
        this.socket.on(WS_EVENTS.SUBSCRIBED, (data) => {
            console.log('[SocketService] Subscribed:', data);
            this._emit(WS_EVENTS.SUBSCRIBED, data);
        });

        this.socket.on(WS_EVENTS.ALERT_CREATED, (data) => {
            console.log('[SocketService] Alert created:', data);
            this._emit(WS_EVENTS.ALERT_CREATED, data);
            this._emit(WS_EVENTS.ALERT_NEW, data); // Legacy support
        });

        this.socket.on(WS_EVENTS.ALERT_ACKNOWLEDGED, (data) => {
            console.log('[SocketService] Alert acknowledged:', data);
            this._emit(WS_EVENTS.ALERT_ACKNOWLEDGED, data);
        });

        this.socket.on(WS_EVENTS.ALERT_RESOLVED, (data) => {
            console.log('[SocketService] Alert resolved:', data);
            this._emit(WS_EVENTS.ALERT_RESOLVED, data);
        });

        this.socket.on(WS_EVENTS.ALERT_DELETED, (data) => {
            console.log('[SocketService] Alert deleted:', data);
            this._emit(WS_EVENTS.ALERT_DELETED, data);
        });

        // Legacy alert events
        this.socket.on(WS_EVENTS.ALERT_ACKNOWLEDGED_ALL, (data) => {
            console.log('[SocketService] All alerts acknowledged:', data);
            this._emit(WS_EVENTS.ALERT_ACKNOWLEDGED_ALL, data);
        });

        this.socket.on(WS_EVENTS.ALERT_COUNT, (data) => {
            console.log('[SocketService] Alert count:', data);
            this._emit(WS_EVENTS.ALERT_COUNT, data);
        });

        this.socket.on(WS_EVENTS.ALERT_ERROR, (data) => {
            console.error('[SocketService] Alert error:', data);
            this._emit(WS_EVENTS.ALERT_ERROR, data);
        });

        // =========================================================================
        // Notification events
        // =========================================================================
        this.socket.on(WS_EVENTS.NOTIFICATION, (data) => {
            console.log('[SocketService] Notification received:', data);
            this._emit(WS_EVENTS.NOTIFICATION, data);
            this._emit(WS_EVENTS.NOTIFICATION_NEW, data); // Legacy support
        });

        this.socket.on(WS_EVENTS.NOTIFICATION_READ, (data) => {
            console.log('[SocketService] Notification read:', data);
            this._emit(WS_EVENTS.NOTIFICATION_READ, data);
        });

        this.socket.on(WS_EVENTS.ALL_NOTIFICATIONS_READ, (data) => {
            console.log('[SocketService] All notifications read:', data);
            this._emit(WS_EVENTS.ALL_NOTIFICATIONS_READ, data);
            this._emit(WS_EVENTS.NOTIFICATION_READ_ALL, data); // Legacy support
        });

        this.socket.on(WS_EVENTS.NOTIFICATION_DELETED, (data) => {
            console.log('[SocketService] Notification deleted:', data);
            this._emit(WS_EVENTS.NOTIFICATION_DELETED, data);
        });

        // Legacy notification count
        this.socket.on(WS_EVENTS.NOTIFICATION_COUNT, (data) => {
            console.log('[SocketService] Notification count:', data);
            this._emit(WS_EVENTS.NOTIFICATION_COUNT, data);
        });

        // =========================================================================
        // Task events
        // =========================================================================
        this.socket.on(WS_EVENTS.TASK_CREATED, (data) => {
            console.log('[SocketService] Task created:', data);
            this._emit(WS_EVENTS.TASK_CREATED, data);
        });

        this.socket.on(WS_EVENTS.TASK_UPDATED, (data) => {
            console.log('[SocketService] Task updated:', data);
            this._emit(WS_EVENTS.TASK_UPDATED, data);
        });

        this.socket.on(WS_EVENTS.TASK_COMPLETED, (data) => {
            console.log('[SocketService] Task completed:', data);
            this._emit(WS_EVENTS.TASK_COMPLETED, data);
        });

        this.socket.on(WS_EVENTS.TASK_DELETED, (data) => {
            console.log('[SocketService] Task deleted:', data);
            this._emit(WS_EVENTS.TASK_DELETED, data);
        });

        // =========================================================================
        // Chat/Messaging Events
        // =========================================================================

        // New message received
        this.socket.on(WS_EVENTS.MESSAGE, (data) => {
            console.log('[SocketService] Chat message received:', data);
            this._emit(WS_EVENTS.MESSAGE, data);
            this._emit(WS_EVENTS.MESSAGE_NEW, data); // Legacy support
        });

        // Message read by recipient
        this.socket.on(WS_EVENTS.MESSAGE_READ_RECEIPT, (data) => {
            console.log('[SocketService] Message read:', data);
            this._emit(WS_EVENTS.MESSAGE_READ_RECEIPT, data);
        });

        // Message deleted
        this.socket.on(WS_EVENTS.MESSAGE_DELETED, (data) => {
            console.log('[SocketService] Message deleted:', data);
            this._emit(WS_EVENTS.MESSAGE_DELETED, data);
        });

        // Typing indicators
        this.socket.on(WS_EVENTS.USER_TYPING, (data) => {
            console.log('[SocketService] User typing:', data);
            this._emit(WS_EVENTS.USER_TYPING, data);
            // Legacy events
            if (data.is_typing) {
                this._emit(WS_EVENTS.TYPING_START, data);
            } else {
                this._emit(WS_EVENTS.TYPING_STOP, data);
            }
        });

        // Conversation created
        this.socket.on(WS_EVENTS.CONVERSATION_CREATED, (data) => {
            console.log('[SocketService] Conversation created:', data);
            this._emit(WS_EVENTS.CONVERSATION_CREATED, data);
        });

        // Legacy chat events
        this.socket.on(WS_EVENTS.MESSAGE_SENT, (data) => {
            console.log('[SocketService] Chat message sent confirmation:', data);
            this._emit(WS_EVENTS.MESSAGE_SENT, data);
        });

        this.socket.on(WS_EVENTS.MESSAGE_DELIVERED, (data) => {
            console.log('[SocketService] Message delivered:', data);
            this._emit(WS_EVENTS.MESSAGE_DELIVERED, data);
        });

        this.socket.on(WS_EVENTS.MESSAGE_EDITED, (data) => {
            console.log('[SocketService] Message edited:', data);
            this._emit(WS_EVENTS.MESSAGE_EDITED, data);
        });

        this.socket.on(WS_EVENTS.CONVERSATION_JOINED, (data) => {
            console.log('[SocketService] Conversation joined:', data);
            this._emit(WS_EVENTS.CONVERSATION_JOINED, data);
        });

        this.socket.on(WS_EVENTS.CONVERSATION_CLEARED, (data) => {
            console.log('[SocketService] Conversation cleared:', data);
            this._emit(WS_EVENTS.CONVERSATION_CLEARED, data);
        });

        this.socket.on(WS_EVENTS.CONVERSATION_UPDATED, (data) => {
            this._emit(WS_EVENTS.CONVERSATION_UPDATED, data);
        });

        this.socket.on(WS_EVENTS.CHAT_ERROR, (data) => {
            console.error('[SocketService] Chat error:', data);
            this._emit(WS_EVENTS.CHAT_ERROR, data);
        });

        // =========================================================================
        // Cross-Pod Broadcast
        // =========================================================================
        this.socket.on(WS_EVENTS.TEST_BROADCAST, (data) => {
            console.log('[SocketService] Broadcast received:', data);
            this._emit(WS_EVENTS.TEST_BROADCAST, data);
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

    // =========================================================================
    // Notification Methods (client -> server)
    // =========================================================================

    /**
     * Mark a notification as read via WebSocket
     * Event: notification:mark_read
     * @param {string} notificationId - Notification ID
     */
    markNotificationRead(notificationId) {
        console.log('[SocketService] Marking notification read:', notificationId);
        return this.emit(WS_EVENTS.MARK_NOTIFICATION_READ, { notification_id: notificationId });
    }

    /**
     * Mark all notifications as read via WebSocket
     * Event: notification:mark_all_read
     */
    markAllNotificationsRead() {
        console.log('[SocketService] Marking all notifications read');
        return this.emit(WS_EVENTS.MARK_ALL_NOTIFICATIONS_READ, {});
    }

    // =========================================================================
    // Alert Methods (client -> server)
    // =========================================================================

    /**
     * Acknowledge a single alert via WebSocket
     * Event: alert:acknowledge
     * @param {string} alertId - Alert ID
     */
    acknowledgeAlert(alertId) {
        console.log('[SocketService] Acknowledging alert:', alertId);
        return this.emit(WS_EVENTS.ACKNOWLEDGE_ALERT, { alert_id: alertId });
    }

    /**
     * Acknowledge all alerts via WebSocket
     * Event: alert:acknowledge_all
     */
    acknowledgeAllAlerts() {
        console.log('[SocketService] Acknowledging all alerts');
        return this.emit(WS_EVENTS.ACKNOWLEDGE_ALL_ALERTS, {});
    }

    /**
     * Dismiss/delete an alert via WebSocket
     * Event: alert:dismiss
     * @param {string} alertId - Alert ID
     */
    dismissAlert(alertId) {
        console.log('[SocketService] Dismissing alert:', alertId);
        return this.emit(WS_EVENTS.DISMISS_ALERT, { alert_id: alertId });
    }

    /**
     * Request unacknowledged alert count via WebSocket
     * Event: alert:get_count
     */
    getAlertCount() {
        console.log('[SocketService] Requesting alert count');
        return this.emit(WS_EVENTS.GET_ALERT_COUNT, {});
    }

    // =========================================================================
    // Presence Methods
    // =========================================================================

    /**
     * Set user as online (call when chat tab/window is opened/focused)
     */
    setOnline() {
        if (this.isConnected()) {
            console.log('[SocketService] Setting user online');
            return this.emit('presence:online', {});
        }
    }

    /**
     * Set user as offline (call when chat tab/window is closed/blurred)
     */
    setOffline() {
        if (this.isConnected()) {
            console.log('[SocketService] Setting user offline');
            return this.emit('presence:offline', {});
        }
    }

    /**
     * Update presence status
     * @param {string} status - 'online' or 'offline'
     */
    updatePresence(status) {
        if (this.isConnected()) {
            console.log('[SocketService] Updating presence:', status);
            return this.emit('presence:update', { status });
        }
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================
export const socketService = new SocketService();

export default socketService;
