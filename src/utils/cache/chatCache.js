/**
 * Chat Cache
 * Caches conversations and messages with WebSocket integration.
 *
 * @module utils/cache/chatCache
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
  loadPersistedCache,
} from './baseCache';
import {
  listConversations,
  getMessages,
  getCurrentUserKey,
} from '../../api/chat';
import { getUsers, getUsersSync } from './usersCache';
import { socketService, WS_EVENTS } from '../websocket';
import { showErrorAlert } from '../alertManager';

// ============================================================================
// Cache Instances
// ============================================================================

const STORAGE_KEY_CONVERSATIONS = 'tc_cache_conversations';
const conversationsCache = createCache('conversations', 5 * 60 * 1000); // 5 min TTL

// Messages cache is per-conversation
const messagesCache = new Map(); // Map<conversationId, cache>

// Typing indicators state
const typingState = new Map(); // Map<conversationId, Set<userKey>>

// Clear old mock data on init (uncomment to clear once)
// localStorage.removeItem(STORAGE_KEY_CONVERSATIONS);

// Load conversations from localStorage
loadPersistedCache(conversationsCache, STORAGE_KEY_CONVERSATIONS, 'conversation_id');

// Add total unread count
conversationsCache.totalUnread = 0;

// ============================================================================
// WebSocket Integration
// ============================================================================

let wsSubscribed = false;
let wsConnectionFailed = false; // Track if WebSocket connection has failed

/**
 * Subscribe to WebSocket chat events
 * Also connects to WebSocket if not already connected
 */
export function subscribeToChatWebSocket() {
  if (wsSubscribed) return;

  // Don't try to connect if previous connection failed
  if (wsConnectionFailed) {
    console.log('[ChatCache] Skipping WebSocket - previous connection failed');
    wsSubscribed = true; // Still mark as subscribed to prevent repeated attempts
    return;
  }

  // Connect to WebSocket if not already connected
  if (!socketService.isConnected()) {
    socketService.connect()
      .then((connected) => {
        if (!connected) {
          wsConnectionFailed = true;
          console.warn('[ChatCache] WebSocket not available, running in offline mode');
        }
      })
      .catch((err) => {
        wsConnectionFailed = true;
        console.warn('[ChatCache] WebSocket connection failed, running in offline mode:', err);
      });
  }

  // New message received (chat:message)
  // User B receives this when User A sends a message
  socketService.on(WS_EVENTS.MESSAGE_NEW, (message) => {
    // Backend sends: messageId, conversationId, senderKey, senderName, senderAvatar, content, type, status, createdAt
    const conversationId = message.conversation_id || message.conversationId;
    const messageId = message.message_id || message.messageId;
    const senderKey = message.sender_key || message.senderKey;
    const currentUserKey = getCurrentUserKey();

    console.log('[ChatCache] New message received:', { messageId, conversationId, senderKey });

    // Add to messages cache
    const msgCache = getOrCreateMessagesCache(conversationId);

    // Normalize message format
    const normalizedMessage = {
      message_id: messageId,
      conversation_id: conversationId,
      sender_key: senderKey,
      sender_name: message.sender_name || message.senderName,
      sender_avatar: message.sender_avatar || message.senderAvatar,
      content: message.content,
      message_type: message.type || message.message_type || 'text',
      status: message.status || 'sent',
      created_at: message.created_at || message.createdAt,
      edited_at: message.edited_at || message.editedAt || null,
      reply_to: message.reply_to || message.replyTo || null,
      reactions: message.reactions || [],
    };

    // Check if message already exists (avoid duplicates)
    if (!msgCache.byId.has(String(messageId))) {
      msgCache.data.push(normalizedMessage);
      msgCache.byId.set(String(messageId), normalizedMessage);
      msgCache.events.emit('updated', msgCache.data);
      msgCache.events.emit('new', normalizedMessage);
    }

    // Update conversation and move to top
    const convIndex = conversationsCache.data.findIndex(
      (c) => c.conversation_id === conversationId
    );
    if (convIndex !== -1) {
      const conv = conversationsCache.data[convIndex];
      conv.last_message = {
        content: normalizedMessage.content,
        sender_key: senderKey,
        created_at: normalizedMessage.created_at,
      };
      conv.last_activity = normalizedMessage.created_at;
      if (senderKey !== currentUserKey) {
        conv.unread_count = (conv.unread_count || 0) + 1;
        conversationsCache.totalUnread++;
      }

      // Move conversation to top if not already
      if (convIndex > 0) {
        conversationsCache.data.splice(convIndex, 1);
        conversationsCache.data.unshift(conv);
      }

      conversationsCache.events.emit('updated', conversationsCache.data);
      conversationsCache.events.emit('message', { conversation_id: conversationId, message: normalizedMessage });
      persistCache(conversationsCache, STORAGE_KEY_CONVERSATIONS);
    }
  });

  // Message sent confirmation (chat:message:sent)
  // User A receives this after sending a message
  socketService.on(WS_EVENTS.MESSAGE_SENT, (data) => {
    // Backend sends: messageId, conversationId, senderKey, content, type, status, createdAt, tempId
    const messageId = data.message_id || data.messageId;
    const conversationId = data.conversation_id || data.conversationId;
    const tempId = data.temp_id || data.tempId;

    console.log('[ChatCache] Message sent confirmation:', { messageId, conversationId, tempId });

    const msgCache = messagesCache.get(conversationId);
    if (msgCache) {
      // Update temp message with real ID
      const msg = msgCache.data.find((m) => m.message_id === tempId);
      if (msg) {
        msg.message_id = messageId;
        msg.status = data.status || 'sent';
        msg.created_at = data.createdAt || data.created_at || msg.created_at;
        msgCache.byId.delete(tempId);
        msgCache.byId.set(String(messageId), msg);
        msgCache.events.emit('updated', msgCache.data);
      }
    }
  });

  // Message delivered confirmation (chat:message:delivered)
  // User A receives this when User B's client receives the message
  socketService.on(WS_EVENTS.MESSAGE_DELIVERED, (data) => {
    // Backend sends: messageId, deliveredTo, timestamp
    const messageId = data.message_id || data.messageId;
    const conversationId = data.conversation_id || data.conversationId;
    const deliveredTo = data.delivered_to || data.deliveredTo;

    console.log('[ChatCache] Message delivered:', { messageId, deliveredTo });

    // Find the message in any conversation cache
    if (conversationId) {
      const msgCache = messagesCache.get(conversationId);
      if (msgCache) {
        const msg = msgCache.byId.get(String(messageId));
        if (msg) {
          msg.status = 'delivered';
          msg.delivered_at = data.timestamp;
          msgCache.events.emit('updated', msgCache.data);
        }
      }
    } else {
      // Search all conversations
      for (const [, cache] of messagesCache) {
        const msg = cache.byId.get(String(messageId));
        if (msg) {
          msg.status = 'delivered';
          msg.delivered_at = data.timestamp;
          cache.events.emit('updated', cache.data);
          break;
        }
      }
    }
  });

  // Message read confirmation (chat:message:read)
  // User A receives this when User B reads the message
  socketService.on('chat:message:read', (data) => {
    // Backend sends: conversationId, readBy, timestamp
    const conversationId = data.conversation_id || data.conversationId;
    const readBy = data.read_by || data.readBy;

    console.log('[ChatCache] Messages read:', { conversationId, readBy });

    const msgCache = messagesCache.get(conversationId);
    if (msgCache) {
      const currentUserKey = getCurrentUserKey();
      // Mark all messages from current user as read
      msgCache.data.forEach((msg) => {
        if (msg.sender_key === currentUserKey && msg.status !== 'read') {
          msg.status = 'read';
          msg.read_at = data.timestamp;
        }
      });
      msgCache.events.emit('updated', msgCache.data);
    }
  });

  // Message deleted (chat:message:deleted)
  socketService.on(WS_EVENTS.MESSAGE_DELETED, (data) => {
    // Backend sends: messageId, forEveryone
    const messageId = data.message_id || data.messageId;
    const forEveryone = data.forEveryone || data.for_everyone;

    console.log('[ChatCache] Message deleted:', { messageId, forEveryone });

    // Search all conversations for this message
    for (const [conversationId, msgCache] of messagesCache) {
      const index = msgCache.data.findIndex((m) => m.message_id === messageId);
      if (index !== -1) {
        msgCache.data.splice(index, 1);
        msgCache.byId.delete(String(messageId));
        msgCache.events.emit('updated', msgCache.data);
        break;
      }
    }
  });

  // Chat error handler - marks message as failed
  socketService.on(WS_EVENTS.CHAT_ERROR, (data) => {
    const { code, message, tempId, temp_id } = data;
    const msgTempId = tempId || temp_id;

    console.error('[ChatCache] Chat error:', code, message, 'tempId:', msgTempId);

    // Find and mark the message as failed
    if (msgTempId) {
      for (const [, cache] of messagesCache) {
        const msg = cache.data.find((m) => m.message_id === msgTempId);
        if (msg) {
          msg.status = 'failed';
          msg.error = message || code;
          cache.events.emit('updated', cache.data);
          break;
        }
      }
    }

    // Show error alert for user
    showErrorAlert(message || 'Failed to send message', 'Chat Error');
  });

  // Typing indicator - user started typing (chat:typing:start)
  socketService.on(WS_EVENTS.TYPING_START, (data) => {
    const conversationId = data.conversation_id || data.conversationId;
    const userKey = data.user_key || data.userKey;

    console.log('[ChatCache] Typing start:', { conversationId, userKey });

    if (!typingState.has(conversationId)) {
      typingState.set(conversationId, new Set());
    }

    const typing = typingState.get(conversationId);
    typing.add(userKey);

    // Emit typing update event
    conversationsCache.events.emit('typing', {
      conversation_id: conversationId,
      users: Array.from(typing),
    });
  });

  // Typing indicator - user stopped typing (chat:typing:stop)
  socketService.on(WS_EVENTS.TYPING_STOP, (data) => {
    const conversationId = data.conversation_id || data.conversationId;
    const userKey = data.user_key || data.userKey;

    console.log('[ChatCache] Typing stop:', { conversationId, userKey });

    if (typingState.has(conversationId)) {
      const typing = typingState.get(conversationId);
      typing.delete(userKey);

      // Emit typing update event
      conversationsCache.events.emit('typing', {
        conversation_id: conversationId,
        users: Array.from(typing),
      });
    }
  });

  // Conversation joined (chat:conversation:joined)
  socketService.on(WS_EVENTS.CONVERSATION_JOINED, (data) => {
    const conversationId = data.conversation_id || data.conversationId;
    console.log('[ChatCache] Joined conversation room:', conversationId);
  });

  // Conversation cleared (chat:conversation:cleared)
  socketService.on(WS_EVENTS.CONVERSATION_CLEARED, (data) => {
    const conversationId = data.conversation_id || data.conversationId;
    const messagesCleared = data.messagesCleared || data.messages_cleared || 0;

    console.log('[ChatCache] Conversation cleared:', { conversationId, messagesCleared });

    // Clear messages from cache
    const msgCache = messagesCache.get(conversationId);
    if (msgCache) {
      msgCache.data = [];
      msgCache.byId.clear();
      msgCache.events.emit('updated', msgCache.data);
    }

    // Update conversation
    const conv = conversationsCache.byId.get(String(conversationId));
    if (conv) {
      conv.last_message = null;
      conversationsCache.events.emit('updated', conversationsCache.data);
      persistCache(conversationsCache, STORAGE_KEY_CONVERSATIONS);
    }
  });

  // Conversation created (chat:conversation:created)
  // Both User A and User B receive this when a conversation is created
  socketService.on(WS_EVENTS.CONVERSATION_CREATED, (data) => {
    // Backend sends: conversationId, type, participants, createdBy, createdAt
    const conversationId = data.conversation_id || data.conversationId;

    console.log('[ChatCache] Conversation created:', conversationId);

    // Normalize conversation format
    const conversation = {
      conversation_id: conversationId,
      conversation_type: data.type || data.conversation_type || 'direct',
      participants: data.participants || [],
      participants_info: data.participants_info || [],
      created_by: data.created_by || data.createdBy,
      created_at: data.created_at || data.createdAt,
      last_activity: data.created_at || data.createdAt,
      last_message: null,
      unread_count: 0,
      is_muted: false,
      is_pinned: false,
      name: data.name || null,
    };

    // Check if already exists
    if (!conversationsCache.byId.has(String(conversationId))) {
      conversationsCache.data.unshift(conversation);
      conversationsCache.byId.set(String(conversationId), conversation);
      conversationsCache.events.emit('updated', conversationsCache.data);
      conversationsCache.events.emit('created', conversation);
      persistCache(conversationsCache, STORAGE_KEY_CONVERSATIONS);
    }
  });

  // Conversation updated
  socketService.on(WS_EVENTS.CONVERSATION_UPDATED, (data) => {
    const { conversation_id, ...updates } = data;
    const conv = conversationsCache.byId.get(String(conversation_id));
    if (conv) {
      Object.assign(conv, updates);
      conversationsCache.events.emit('updated', conversationsCache.data);
    }
  });

  // Presence updates
  socketService.on(WS_EVENTS.PRESENCE_ONLINE, ({ user_key }) => {
    updateUserPresence(user_key, true);
  });

  socketService.on(WS_EVENTS.PRESENCE_OFFLINE, ({ user_key }) => {
    updateUserPresence(user_key, false);
  });

  wsSubscribed = true;
}

/**
 * Update user presence in all conversations
 */
function updateUserPresence(userKey, isOnline) {
  conversationsCache.data.forEach((conv) => {
    const participant = conv.participants_info?.find((p) => p.user_key === userKey);
    if (participant) {
      participant.is_online = isOnline;
    }
  });
  conversationsCache.events.emit('presence', { user_key: userKey, is_online: isOnline });
}

/**
 * Get or create messages cache for a conversation
 */
function getOrCreateMessagesCache(conversationId) {
  if (!messagesCache.has(conversationId)) {
    const cache = createCache(`messages_${conversationId}`, 5 * 60 * 1000);
    messagesCache.set(conversationId, cache);
  }
  return messagesCache.get(conversationId);
}

// ============================================================================
// Conversations Cache Functions
// ============================================================================

/**
 * Get conversations list (lazy loaded)
 * Uses users from cache to generate mock conversations
 */
export async function getConversations(force = false, params = {}) {
  if (!force && hasValidCache(conversationsCache)) {
    return conversationsCache.data;
  }

  if (conversationsCache.loading) {
    return conversationsCache.data;
  }

  setCacheLoading(conversationsCache, true);

  try {
    // Get users from cache for mock data generation
    let users = getUsersSync();
    if (!users || users.length === 0) {
      // Try to fetch users if not in cache
      try {
        users = await getUsers();
      } catch (e) {
        users = [];
      }
    }

    const response = await listConversations(params, users);
    const data = response?.data?.conversations || [];

    updateCache(conversationsCache, data, 'conversation_id');

    // Calculate total unread
    conversationsCache.totalUnread = data.reduce((sum, c) => sum + (c.unread_count || 0), 0);

    persistCache(conversationsCache, STORAGE_KEY_CONVERSATIONS);
    setCacheLoading(conversationsCache, false);

    return data;
  } catch (error) {
    setCacheError(conversationsCache, error);
    console.error('[ChatCache] Failed to fetch conversations:', error);
    // Don't show alert for background fetch failures - just log
    setCacheLoading(conversationsCache, false);
    return conversationsCache.data;
  }
}

/**
 * Refresh conversations
 */
export async function refreshConversations() {
  return getConversations(true);
}

/**
 * Get conversations sync
 */
export function getConversationsSync() {
  return conversationsCache.data;
}

/**
 * Get conversation by ID
 */
export function getConversationById(conversationId) {
  return getFromCacheById(conversationsCache, conversationId);
}

/**
 * Get total unread count
 */
export function getTotalUnreadCount() {
  return conversationsCache.totalUnread;
}

/**
 * Check if loading
 */
export function isConversationsLoading() {
  return conversationsCache.loading;
}

/**
 * Get error
 */
export function getConversationsError() {
  return conversationsCache.error;
}

/**
 * Clear conversations cache
 */
export function clearConversationsCache() {
  clearCache(conversationsCache);
  conversationsCache.totalUnread = 0;
  messagesCache.clear();
  typingState.clear();
  localStorage.removeItem(STORAGE_KEY_CONVERSATIONS);
}

/**
 * Subscribe to conversation events
 */
export function onConversationsChange(event, callback) {
  return conversationsCache.events.on(event, callback);
}

// ============================================================================
// Messages Cache Functions
// ============================================================================

/**
 * Get messages for a conversation (lazy loaded)
 * For local conversations (conv_local_*), only use cached data
 * REST API is only called for server-side conversations on first load
 */
export async function getMessagesForConversation(conversationId, force = false, params = {}) {
  const cache = getOrCreateMessagesCache(conversationId);

  // For local conversations, don't call REST API - just return cached data
  // Messages will come through WebSocket
  if (conversationId.startsWith('conv_local_')) {
    setCacheLoading(cache, false);
    return cache.data;
  }

  if (!force && hasValidCache(cache)) {
    return cache.data;
  }

  if (cache.loading) {
    return cache.data;
  }

  setCacheLoading(cache, true);

  try {
    const response = await getMessages(conversationId, params);
    const data = response?.data?.messages || [];

    updateCache(cache, data, 'message_id');
    setCacheLoading(cache, false);

    return data;
  } catch (error) {
    setCacheError(cache, error);
    console.error('[ChatCache] Failed to fetch messages:', error);
    // Don't show alert for background fetch failures - just log
    setCacheLoading(cache, false);
    return cache.data;
  }
}

/**
 * Refresh messages for a conversation
 */
export async function refreshMessages(conversationId) {
  return getMessagesForConversation(conversationId, true);
}

/**
 * Get messages sync
 */
export function getMessagesSync(conversationId) {
  const cache = messagesCache.get(conversationId);
  return cache?.data || [];
}

/**
 * Check if messages are loading
 */
export function isMessagesLoading(conversationId) {
  const cache = messagesCache.get(conversationId);
  return cache?.loading || false;
}

/**
 * Subscribe to message events for a conversation
 */
export function onMessagesChange(conversationId, event, callback) {
  const cache = getOrCreateMessagesCache(conversationId);
  return cache.events.on(event, callback);
}

// ============================================================================
// Action Functions
// ============================================================================

/**
 * Send a message via WebSocket
 * Event: chat:send
 */
export async function sendMessage(conversationId, content) {
  const currentUserKey = getCurrentUserKey();

  // Create optimistic message with temp ID
  const tempId = `temp_${Date.now()}`;
  const optimisticMessage = {
    message_id: tempId,
    conversation_id: conversationId,
    sender_key: currentUserKey,
    content,
    message_type: 'text',
    created_at: new Date().toISOString(),
    status: 'sending',
  };

  // Add to cache immediately for optimistic UI
  const cache = getOrCreateMessagesCache(conversationId);
  cache.data.push(optimisticMessage);
  cache.byId.set(tempId, optimisticMessage);
  cache.events.emit('updated', cache.data);

  // Update conversation last message and move to top
  const convIndex = conversationsCache.data.findIndex(
    (c) => c.conversation_id === conversationId
  );
  if (convIndex !== -1) {
    const conv = conversationsCache.data[convIndex];
    conv.last_message = {
      content,
      sender_key: currentUserKey,
      created_at: optimisticMessage.created_at,
    };
    conv.last_activity = optimisticMessage.created_at;

    // Move conversation to top if not already
    if (convIndex > 0) {
      conversationsCache.data.splice(convIndex, 1);
      conversationsCache.data.unshift(conv);
    }

    conversationsCache.events.emit('updated', conversationsCache.data);
    persistCache(conversationsCache, STORAGE_KEY_CONVERSATIONS);
  }

  try {
    // Send via WebSocket
    if (socketService.isConnected()) {
      await socketService.sendMessage(conversationId, content, 'text', tempId);
      // WebSocket will send chat:message:sent event to confirm
    } else {
      // No WebSocket - mark as failed
      optimisticMessage.status = 'failed';
      optimisticMessage.error = 'Not connected to chat server';
      cache.events.emit('updated', cache.data);
      showErrorAlert('Not connected to chat server', 'Chat Error');
    }

    return optimisticMessage;
  } catch (error) {
    // Mark as failed
    optimisticMessage.status = 'failed';
    cache.events.emit('updated', cache.data);
    showErrorAlert('Failed to send message. Please try again.', 'Chat Error');
    throw error;
  }
}

/**
 * Mark conversation as read
 */
export async function markConversationAsRead(conversationId) {
  const currentUserKey = getCurrentUserKey();
  const conv = conversationsCache.byId.get(String(conversationId));
  if (conv && conv.unread_count > 0) {
    conversationsCache.totalUnread -= conv.unread_count;
    conv.unread_count = 0;
    conversationsCache.events.emit('updated', conversationsCache.data);
  }

  // Mark messages as read
  const cache = messagesCache.get(conversationId);
  if (cache) {
    cache.data.forEach((m) => {
      if (m.sender_key !== currentUserKey && m.status !== 'read') {
        m.status = 'read';
      }
    });
    cache.events.emit('updated', cache.data);
  }

  // Send to server via WebSocket only
  if (socketService.isConnected()) {
    socketService.markMessagesRead(conversationId);
  }
  // If not connected, local update is enough - will sync when reconnected
}

/**
 * Start typing indicator
 */
export function startTyping(conversationId) {
  if (socketService.isConnected()) {
    socketService.startTyping(conversationId);
  }
}

/**
 * Stop typing indicator
 */
export function stopTyping(conversationId) {
  if (socketService.isConnected()) {
    socketService.stopTyping(conversationId);
  }
}

/**
 * Get typing users for a conversation
 */
export function getTypingUsers(conversationId) {
  return Array.from(typingState.get(conversationId) || []);
}

/**
 * Track when user opens a conversation (sends to server via WebSocket)
 * @param {string} conversationId - Conversation ID
 */
export function trackConversationOpen(conversationId) {
  if (!conversationId) return;

  // Update local last activity
  const conv = conversationsCache.byId.get(String(conversationId));
  if (conv) {
    conv.last_opened = new Date().toISOString();
  }

  // Send to server via WebSocket
  if (socketService.isConnected()) {
    socketService.openConversation(conversationId);
  }
}

/**
 * Add reaction to a message
 */
export async function addReaction(conversationId, messageId, emoji) {
  const currentUserKey = getCurrentUserKey();
  const cache = messagesCache.get(conversationId);
  if (cache) {
    const msg = cache.byId.get(String(messageId));
    if (msg) {
      // Optimistic update
      if (!msg.reactions) msg.reactions = [];
      const existing = msg.reactions.find((r) => r.emoji === emoji);
      if (existing) {
        if (!existing.users.includes(currentUserKey)) {
          existing.users.push(currentUserKey);
        }
      } else {
        msg.reactions.push({ emoji, users: [currentUserKey] });
      }
      cache.events.emit('updated', cache.data);
    }
  }

  if (socketService.isConnected()) {
    await socketService.addReaction(messageId, emoji);
  }
}

/**
 * Create a new conversation via WebSocket
 * The conversation will be added to cache when chat:conversation:created event is received
 * @param {object} data - Conversation data
 * @param {string} data.conversation_type - 'direct' or 'group'
 * @param {Array<string>} data.participants - Array of user keys
 * @param {string} [data.name] - Name for group conversations
 */
export async function createConversation(data) {
  if (!socketService.isConnected()) {
    showErrorAlert('Not connected to chat server.', 'Chat Error');
    throw new Error('WebSocket not connected');
  }

  try {
    // Use WebSocket to create conversation
    // Backend will respond with chat:conversation:created event
    const participants = data.participants || [];
    const name = data.name || null;
    const type = data.conversation_type || 'direct';

    await socketService.createConversation(participants, name, type);

    // Return null - the actual conversation will come via WebSocket event
    return null;
  } catch (error) {
    console.error('[ChatCache] Failed to create conversation:', error);
    showErrorAlert('Failed to create conversation.', 'Chat Error');
    throw error;
  }
}

/**
 * Start a direct conversation with a user (creates if doesn't exist)
 * Conversation will be created via WebSocket and come back via chat:conversation:created event
 * @param {string} userKey - The user key to start conversation with
 * @param {object} [userInfo] - Optional user info (not used, kept for compatibility)
 */
export async function startDirectConversation(userKey, userInfo = null) {
  const currentUserKey = getCurrentUserKey();

  // Check if conversation already exists in cache
  const existingIndex = conversationsCache.data.findIndex((c) => {
    if (c.conversation_type !== 'direct') return false;
    const participants = c.participants || [];
    return (
      participants.length === 2 &&
      participants.includes(currentUserKey) &&
      participants.includes(userKey)
    );
  });

  if (existingIndex !== -1) {
    const existingConv = conversationsCache.data[existingIndex];

    // Move to top if not already
    if (existingIndex > 0) {
      conversationsCache.data.splice(existingIndex, 1);
      conversationsCache.data.unshift(existingConv);
      conversationsCache.events.emit('updated', conversationsCache.data);
      persistCache(conversationsCache, STORAGE_KEY_CONVERSATIONS);
    }

    return existingConv;
  }

  // Create conversation via WebSocket - backend will send chat:conversation:created event
  if (socketService.isConnected()) {
    try {
      // Emit conversation create event to backend
      await socketService.createConversation([userKey], null, 'direct');
      // The conversation will be added to cache when we receive chat:conversation:created event
      // Return null for now - UI should wait for the event
      return null;
    } catch (error) {
      console.error('[ChatCache] Failed to create conversation via WebSocket:', error);
      showErrorAlert('Failed to start conversation. Please try again.', 'Chat Error');
      throw error;
    }
  } else {
    // No WebSocket connection
    showErrorAlert('Not connected to chat server. Please check your connection.', 'Chat Error');
    throw new Error('WebSocket not connected');
  }
}

// ============================================================================
// Export
// ============================================================================

export const chatCache = {
  getConversations,
  refreshConversations,
  getConversationsSync,
  getConversationById,
  getTotalUnreadCount,
  isConversationsLoading,
  getConversationsError,
  clearConversationsCache,
  onConversationsChange,
  getMessagesForConversation,
  refreshMessages,
  getMessagesSync,
  isMessagesLoading,
  onMessagesChange,
  sendMessage,
  markConversationAsRead,
  startTyping,
  stopTyping,
  getTypingUsers,
  trackConversationOpen,
  addReaction,
  subscribeToChatWebSocket,
  createConversation,
  startDirectConversation,
};

export default chatCache;

