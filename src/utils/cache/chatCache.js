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
  createConversation as apiCreateConversation,
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

  // New message received
  socketService.on(WS_EVENTS.MESSAGE_NEW, (message) => {
    const { conversation_id } = message;
    const currentUserKey = getCurrentUserKey();

    // Add to messages cache
    const msgCache = getOrCreateMessagesCache(conversation_id);

    // Check if message already exists (avoid duplicates)
    if (!msgCache.byId.has(String(message.message_id))) {
      msgCache.data.push(message);
      msgCache.byId.set(String(message.message_id), message);
      msgCache.events.emit('updated', msgCache.data);
      msgCache.events.emit('new', message);
    }

    // Update conversation and move to top
    const convIndex = conversationsCache.data.findIndex(
      (c) => c.conversation_id === conversation_id
    );
    if (convIndex !== -1) {
      const conv = conversationsCache.data[convIndex];
      conv.last_message = {
        content: message.content,
        sender_key: message.sender_key,
        created_at: message.created_at,
      };
      conv.last_activity = message.created_at;
      if (message.sender_key !== currentUserKey) {
        conv.unread_count = (conv.unread_count || 0) + 1;
        conversationsCache.totalUnread++;
      }

      // Move conversation to top if not already
      if (convIndex > 0) {
        conversationsCache.data.splice(convIndex, 1);
        conversationsCache.data.unshift(conv);
      }

      conversationsCache.events.emit('updated', conversationsCache.data);
      conversationsCache.events.emit('message', { conversation_id, message });
      persistCache(conversationsCache, STORAGE_KEY_CONVERSATIONS);
    }
  });

  // Message sent confirmation
  socketService.on(WS_EVENTS.MESSAGE_SENT, (data) => {
    const { message_id, conversation_id, temp_id } = data;
    const msgCache = messagesCache.get(conversation_id);
    if (msgCache) {
      // Update temp message with real ID
      const msg = msgCache.data.find((m) => m.message_id === temp_id);
      if (msg) {
        msg.message_id = message_id;
        msg.status = 'sent';
        msgCache.byId.delete(temp_id);
        msgCache.byId.set(String(message_id), msg);
        msgCache.events.emit('updated', msgCache.data);
      }
    }
  });

  // Message delivered
  socketService.on(WS_EVENTS.MESSAGE_DELIVERED, (data) => {
    const { message_id, conversation_id } = data;
    const msgCache = messagesCache.get(conversation_id);
    if (msgCache) {
      const msg = msgCache.byId.get(String(message_id));
      if (msg) {
        msg.status = 'delivered';
        msgCache.events.emit('updated', msgCache.data);
      }
    }
  });

  // Message edited
  socketService.on(WS_EVENTS.MESSAGE_EDITED, (data) => {
    const { message_id, conversation_id, content, edited_at } = data;
    const msgCache = messagesCache.get(conversation_id);
    if (msgCache) {
      const msg = msgCache.byId.get(String(message_id));
      if (msg) {
        msg.content = content;
        msg.edited_at = edited_at;
        msgCache.events.emit('updated', msgCache.data);
      }
    }
  });

  // Message deleted
  socketService.on(WS_EVENTS.MESSAGE_DELETED, (data) => {
    const { message_id, conversation_id } = data;
    const msgCache = messagesCache.get(conversation_id);
    if (msgCache) {
      const index = msgCache.data.findIndex((m) => m.message_id === message_id);
      if (index !== -1) {
        msgCache.data.splice(index, 1);
        msgCache.byId.delete(String(message_id));
        msgCache.events.emit('updated', msgCache.data);
      }
    }
  });

  // Typing indicator update
  socketService.on(WS_EVENTS.TYPING_UPDATE, (data) => {
    const { conversation_id, user_key, is_typing } = data;

    if (!typingState.has(conversation_id)) {
      typingState.set(conversation_id, new Set());
    }

    const typing = typingState.get(conversation_id);
    if (is_typing) {
      typing.add(user_key);
    } else {
      typing.delete(user_key);
    }

    // Emit typing update event
    conversationsCache.events.emit('typing', {
      conversation_id,
      users: Array.from(typing),
    });
  });

  // Conversation created
  socketService.on(WS_EVENTS.CONVERSATION_CREATED, (conversation) => {
    conversationsCache.data.unshift(conversation);
    conversationsCache.byId.set(String(conversation.conversation_id), conversation);
    conversationsCache.events.emit('updated', conversationsCache.data);
    conversationsCache.events.emit('created', conversation);
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
 * Send a message
 */
export async function sendMessage(conversationId, content, replyTo = null) {
  const currentUserKey = getCurrentUserKey();

  // Create optimistic message
  const tempId = `temp_${Date.now()}`;
  const optimisticMessage = {
    message_id: tempId,
    conversation_id: conversationId,
    sender_key: currentUserKey,
    content,
    message_type: 'text',
    created_at: new Date().toISOString(),
    edited_at: null,
    reply_to: replyTo,
    reactions: [],
    status: 'sending',
  };

  // Add to cache immediately
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
    // Always use WebSocket for sending messages
    if (socketService.isConnected()) {
      await socketService.sendMessage(conversationId, content, 'text', replyTo);
      // WebSocket will send MESSAGE_SENT event to confirm, handled by subscriber
    } else {
      // No WebSocket - mark as sent locally (offline mode)
      optimisticMessage.message_id = `msg_local_${Date.now()}`;
      optimisticMessage.status = 'sent';
      cache.byId.delete(tempId);
      cache.byId.set(String(optimisticMessage.message_id), optimisticMessage);
      cache.events.emit('updated', cache.data);
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
 * Create a new conversation
 * @param {object} data - Conversation data
 * @param {string} data.conversation_type - 'direct' or 'group'
 * @param {Array<string>} data.participants - Array of user keys
 * @param {string} [data.name] - Name for group conversations
 */
export async function createConversation(data) {
  try {
    const response = await apiCreateConversation(data);

    if (response.success && response.data?.conversation) {
      const conversation = response.data.conversation;

      // Add to cache if it's a new conversation
      if (!response.data.existing) {
        conversationsCache.data.unshift(conversation);
        conversationsCache.byId.set(String(conversation.conversation_id), conversation);
        conversationsCache.events.emit('updated', conversationsCache.data);
        conversationsCache.events.emit('created', conversation);
        persistCache(conversationsCache, STORAGE_KEY_CONVERSATIONS);
      }

      return conversation;
    }

    throw new Error(response.error || 'Failed to create conversation');
  } catch (error) {
    console.error('[ChatCache] Failed to create conversation:', error);
    throw error;
  }
}

/**
 * Start a direct conversation with a user (creates if doesn't exist)
 * @param {string} userKey - The user key to start conversation with
 * @param {object} [userInfo] - Optional user info for creating new conversation
 */
export async function startDirectConversation(userKey, userInfo = null) {
  const currentUserKey = getCurrentUserKey();

  // Check if conversation already exists
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

  // Try to create via API first
  try {
    const conversation = await createConversation({
      conversation_type: 'direct',
      participants: [currentUserKey, userKey],
    });
    return conversation;
  } catch (error) {
    console.warn('[ChatCache] API create failed, creating local conversation:', error);
  }

  // Fallback: Create local conversation if API fails
  // Get user info from cache if not provided
  let targetUserInfo = userInfo;
  if (!targetUserInfo) {
    const users = getUsersSync() || [];
    const foundUser = users.find((u) => (u.user_key || u.id) === userKey);
    if (foundUser) {
      targetUserInfo = {
        user_key: foundUser.user_key || foundUser.id,
        name: foundUser.name || foundUser.username || 'Unknown',
        avatar_url: foundUser.avatar_url || foundUser.profile_picture || null,
        is_online: foundUser.is_online || false,
      };
    } else {
      targetUserInfo = {
        user_key: userKey,
        name: userKey,
        avatar_url: null,
        is_online: false,
      };
    }
  }

  // Get current user info
  const currentUserInfo = {
    user_key: currentUserKey,
    name: 'You',
    avatar_url: null,
    is_online: true,
  };

  // Create local conversation
  const newConversation = {
    conversation_id: `conv_local_${Date.now()}`,
    conversation_type: 'direct',
    name: null,
    participants: [currentUserKey, userKey],
    participants_info: [currentUserInfo, targetUserInfo],
    last_message: null,
    unread_count: 0,
    is_muted: false,
    is_pinned: false,
    last_activity: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  // Add to cache at the top
  conversationsCache.data.unshift(newConversation);
  conversationsCache.byId.set(String(newConversation.conversation_id), newConversation);
  conversationsCache.events.emit('updated', conversationsCache.data);
  conversationsCache.events.emit('created', newConversation);
  persistCache(conversationsCache, STORAGE_KEY_CONVERSATIONS);

  return newConversation;
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

