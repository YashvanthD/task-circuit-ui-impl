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
import { getUsersSync } from './usersCache';
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

// Track currently active/open conversation (for unread count handling)
let activeConversationId = null;

// Always start fresh - don't load stale persisted data that may have incorrect read/unread state
// The server is the source of truth for conversation and message state
clearCache(conversationsCache);
conversationsCache.totalUnread = 0;
localStorage.removeItem(STORAGE_KEY_CONVERSATIONS);

// ============================================================================
// WebSocket Integration
// ============================================================================

let wsSubscribed = false;
let wsConnectionFailed = false; // Track if WebSocket connection has failed
let visibilityListenerAdded = false; // Track if visibility listener is added

/**
 * Check if WebSocket is connected and working
 */
export function isWebSocketConnected() {
  return socketService.isConnected();
}

/**
 * Reset WebSocket connection state (call if you want to retry connection)
 */
export function resetWebSocketState() {
  wsConnectionFailed = false;
  wsSubscribed = false;
}

/**
 * Subscribe to WebSocket chat events
 * Note: Connection should be established before calling this (via DataContext)
 */
export function subscribeToChatWebSocket() {
  // If already subscribed and connected, just return
  if (wsSubscribed && socketService.isConnected()) {
    return;
  }

  // If previously failed but not subscribed, allow retry
  if (wsConnectionFailed && !wsSubscribed) {
    wsConnectionFailed = false;
  }

  // If already subscribed (event listeners set up), just return
  if (wsSubscribed) {
    return;
  }

  // Don't try to subscribe if previous connection failed
  if (wsConnectionFailed) {
    console.log('[ChatCache] Skipping WebSocket - previous connection failed');
    wsSubscribed = true;
    return;
  }

  // Check if connected - if not, wait for connection
  if (!socketService.isConnected()) {
    console.log('[ChatCache] WebSocket not connected, waiting...');
    // Don't connect here - DataContext handles connection
    return;
  }

  // Set up visibility change listener for online/offline status
  setupVisibilityListener();

  console.log('[ChatCache] Setting up WebSocket event listeners...');

  // Set user as online when connected
  socketService.setOnline();

  // Auto-load conversations
  (async () => {
    try {
      await getConversations(true);
      requestPresenceForAllParticipants();
    } catch (e) {
      console.warn('[ChatCache] Failed to load conversations:', e);
    }
  })();

  // Listen for 'connected' event from server (authentication confirmation)
  socketService.on(WS_EVENTS.CONNECTED, (data) => {
    console.log('[ChatCache] Authenticated as:', data?.user_key);
    // Set user as online when authenticated
    socketService.setOnline();
    // Reload conversations after authentication
    (async () => {
      try {
        await getConversations(true);
        requestPresenceForAllParticipants();
      } catch (e) {
        console.warn('[ChatCache] Failed to reload conversations:', e);
      }
    })();
  });

  // New message received (chat:message)
  // User B receives this when User A sends a message
  socketService.on(WS_EVENTS.MESSAGE_NEW, (message) => {
    // Backend sends: messageId, conversationId, senderKey, senderName, senderAvatar, content, type, status, createdAt
    const conversationId = message.conversation_id || message.conversationId;
    const messageId = message.message_id || message.messageId;
    const senderKey = message.sender_key || message.senderKey;
    let senderName = message.sender_name || message.senderName;
    const currentUserKey = getCurrentUserKey();

    console.log('[ChatCache] New message received:', { messageId, conversationId, senderKey });

    // Enrich sender_name from users cache if not provided
    if (!senderName && senderKey) {
      const users = getUsersSync() || [];
      const user = users.find((u) => (u.user_key || u.id) === senderKey);
      senderName = user?.name || user?.username || senderKey;
    }

    // Add to messages cache
    const msgCache = getOrCreateMessagesCache(conversationId);

    // Normalize message format
    const normalizedMessage = {
      message_id: messageId,
      conversation_id: conversationId,
      sender_key: senderKey,
      sender_name: senderName,
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
    let convIndex = conversationsCache.data.findIndex(
      (c) => c.conversation_id === conversationId
    );

    // If conversation doesn't exist in cache, create it
    if (convIndex === -1) {
      console.log('[ChatCache] Conversation not in cache, creating:', conversationId);

      // Get user info for participants_info
      const users = getUsersSync() || [];
      const senderUser = users.find((u) => (u.user_key || u.id) === senderKey);
      const currentUserInfo = {
        user_key: currentUserKey,
        name: 'You',
        is_online: true,
      };
      const senderInfo = {
        user_key: senderKey,
        name: senderUser?.name || senderUser?.username || senderName || senderKey,
        avatar_url: senderUser?.avatar_url || senderUser?.profile_picture || null,
        is_online: true,
      };

      const newConv = {
        conversation_id: conversationId,
        conversation_type: 'direct',
        participants: [currentUserKey, senderKey],
        participants_info: [currentUserInfo, senderInfo],
        last_message: {
          content: normalizedMessage.content,
          sender_key: senderKey,
          created_at: normalizedMessage.created_at,
        },
        last_activity: normalizedMessage.created_at,
        unread_count: 1,
        is_muted: false,
        is_pinned: false,
        created_at: normalizedMessage.created_at,
      };

      conversationsCache.data.unshift(newConv);
      conversationsCache.byId.set(String(conversationId), newConv);
      conversationsCache.totalUnread++;
      convIndex = 0;

      conversationsCache.events.emit('updated', conversationsCache.data);
      conversationsCache.events.emit('created', newConv);
      conversationsCache.events.emit('message', { conversation_id: conversationId, message: normalizedMessage });
      persistCache(conversationsCache, STORAGE_KEY_CONVERSATIONS);
    } else {
      const conv = conversationsCache.data[convIndex];
      conv.last_message = {
        content: normalizedMessage.content,
        sender_key: senderKey,
        created_at: normalizedMessage.created_at,
      };
      conv.last_activity = normalizedMessage.created_at;

      // Only increment unread if:
      // 1. Message is from someone else
      // 2. This conversation is NOT currently active (user is viewing it)
      if (senderKey !== currentUserKey && conversationId !== activeConversationId) {
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
  socketService.on(WS_EVENTS.MESSAGE_READ_RECEIPT, (data) => {
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
    for (const [convId, msgCache] of messagesCache) {
      const index = msgCache.data.findIndex((m) => m.message_id === messageId);
      if (index !== -1) {
        // Remove the message
        msgCache.data.splice(index, 1);
        msgCache.byId.delete(String(messageId));
        msgCache.events.emit('updated', msgCache.data);

        // Update conversation's last_message to the previous message
        const conv = conversationsCache.byId.get(String(convId));
        if (conv) {
          if (msgCache.data.length > 0) {
            const lastMsg = msgCache.data[msgCache.data.length - 1];
            conv.last_message = {
              content: lastMsg.content,
              sender_key: lastMsg.sender_key,
              created_at: lastMsg.created_at,
            };
          } else {
            conv.last_message = null;
          }
          conversationsCache.events.emit('updated', conversationsCache.data);
          persistCache(conversationsCache, STORAGE_KEY_CONVERSATIONS);
        }
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

    console.log('[ChatCache] Conversation created:', conversationId, data);

    // Get participants list
    const participants = data.participants || [];

    // Helper to check if a string looks like a userKey (numeric or UUID-like)
    const looksLikeUserKey = (str) => {
      if (!str) return true;
      return /^\d+$/.test(str) || /^[a-f0-9-]{20,}$/i.test(str);
    };

    // Always enrich participants_info with user data from cache
    const users = getUsersSync() || [];
    const existingInfo = data.participants_info || [];
    const participantsInfo = participants.map((userKey) => {
      const existing = existingInfo.find((p) => p.user_key === userKey);
      const user = users.find((u) => (u.user_key || u.id) === userKey);
      const realName = user?.name || user?.username || null;

      let finalName = realName;
      if (!finalName && existing?.name && !looksLikeUserKey(existing.name)) {
        finalName = existing.name;
      }
      if (!finalName) {
        finalName = userKey;
      }

      return {
        user_key: userKey,
        name: finalName,
        avatar_url: user?.avatar_url || user?.profile_picture || existing?.avatar_url || null,
        is_online: existing?.is_online || false,
      };
    });

    // Normalize conversation format
    const conversation = {
      conversation_id: conversationId,
      conversation_type: data.type || data.conversation_type || 'direct',
      participants: participants,
      participants_info: participantsInfo,
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
      console.log('[ChatCache] Conversation added to cache:', conversation);
    } else {
      console.log('[ChatCache] Conversation already exists in cache:', conversationId);
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

  // Presence updates with last_seen
  socketService.on(WS_EVENTS.PRESENCE_ONLINE, (data) => {
    const userKey = data.user_key || data.userKey;
    const currentUserKey = getCurrentUserKey();
    // Don't update our own presence from server events
    if (userKey === currentUserKey) return;
    console.log('[ChatCache] User online:', userKey);
    updateUserPresence(userKey, true, null);
  });

  socketService.on(WS_EVENTS.PRESENCE_OFFLINE, (data) => {
    const userKey = data.user_key || data.userKey;
    const currentUserKey = getCurrentUserKey();
    // Don't update our own presence from server events
    if (userKey === currentUserKey) return;
    const lastSeen = data.last_seen || data.lastSeen || new Date().toISOString();
    console.log('[ChatCache] User offline:', userKey, 'lastSeen:', lastSeen);
    updateUserPresence(userKey, false, lastSeen);
  });

  // General presence update
  socketService.on(WS_EVENTS.PRESENCE_UPDATE, (data) => {
    const userKey = data.user_key || data.userKey;
    const currentUserKey = getCurrentUserKey();
    // Don't update our own presence from server events
    if (userKey === currentUserKey) return;
    const isOnline = data.is_online || data.isOnline || data.status === 'online';
    const lastSeen = data.last_seen || data.lastSeen;
    console.log('[ChatCache] Presence update:', userKey, isOnline, lastSeen);
    updateUserPresence(userKey, isOnline, lastSeen);
  });

  wsSubscribed = true;
}

/**
 * Update user presence in all conversations
 * @param {string} userKey - User key
 * @param {boolean} isOnline - Whether user is online
 * @param {string|null} lastSeen - Last seen timestamp (only for offline)
 */
function updateUserPresence(userKey, isOnline, lastSeen = null) {
  let updated = false;

  conversationsCache.data.forEach((conv) => {
    const participant = conv.participants_info?.find((p) => p.user_key === userKey);
    if (participant) {
      const wasOnline = participant.is_online;
      participant.is_online = isOnline;
      if (!isOnline && lastSeen) {
        participant.last_seen = lastSeen;
      }
      // Mark as updated only if status actually changed
      if (wasOnline !== isOnline) {
        updated = true;
      }
    }
  });

  if (updated) {
    console.log('[ChatCache] Presence updated for', userKey, '-> online:', isOnline);
    conversationsCache.events.emit('updated', conversationsCache.data);
    conversationsCache.events.emit('presence', {
      user_key: userKey,
      is_online: isOnline,
      last_seen: lastSeen
    });
    // Persist to keep presence state across page reloads
    persistCache(conversationsCache, STORAGE_KEY_CONVERSATIONS);
  }
}

/**
 * Set up visibility change listener for online/offline status
 * User is online when the chat tab is visible/focused
 * User is offline when the chat tab is hidden/blurred
 */
function setupVisibilityListener() {
  if (visibilityListenerAdded || typeof document === 'undefined') return;

  // Track current visibility state to avoid duplicate events
  let isCurrentlyOnline = true;

  // Handle page visibility change (tab switch, minimize)
  const handleVisibilityChange = () => {
    const shouldBeOnline = document.visibilityState === 'visible';
    if (shouldBeOnline !== isCurrentlyOnline) {
      isCurrentlyOnline = shouldBeOnline;
      if (shouldBeOnline) {
        console.log('[ChatCache] Tab visible - setting online');
        socketService.setOnline();
      } else {
        console.log('[ChatCache] Tab hidden - setting offline');
        socketService.setOffline();
      }
    }
  };

  // Handle page unload (close tab, navigate away)
  const handleBeforeUnload = () => {
    console.log('[ChatCache] Page unloading - setting offline');
    // Use sync beacon for reliability during unload
    if (socketService.isConnected()) {
      socketService.setOffline();
    }
  };

  // Add event listeners
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);

  visibilityListenerAdded = true;
  console.log('[ChatCache] Visibility listeners set up');
}

/**
 * Manually set user as online (call when entering chat page)
 */
export function setUserOnline() {
  console.log('[ChatCache] Manually setting user online');
  if (socketService.isConnected()) {
    socketService.setOnline();
  }
}

/**
 * Manually set user as offline (call when leaving chat page)
 */
export function setUserOffline() {
  console.log('[ChatCache] Manually setting user offline');
  if (socketService.isConnected()) {
    socketService.setOffline();
  }
}

/**
 * Request presence status for all participants in conversations
 * Called after loading conversations to sync online status
 */
async function requestPresenceForAllParticipants() {
  const currentUserKey = getCurrentUserKey();

  // Collect unique user keys from all conversations
  const userKeys = new Set();
  conversationsCache.data.forEach((conv) => {
    (conv.participants || []).forEach((key) => {
      if (key !== currentUserKey) {
        userKeys.add(key);
      }
    });
  });

  if (userKeys.size === 0) return;

  console.log('[ChatCache] Requesting presence for', userKeys.size, 'users');

  try {
    // Call presence API
    const { getUserPresence } = await import('../../api/chat');
    const userKeysArray = Array.from(userKeys);
    const response = await getUserPresence(userKeysArray);

    if (response?.success && response?.data?.presence) {
      const presenceData = response.data.presence;

      // Update presence for each user
      Object.entries(presenceData).forEach(([userKey, presence]) => {
        const isOnline = presence.status === 'online';
        const lastSeen = presence.last_seen || null;
        updateUserPresence(userKey, isOnline, lastSeen);
      });

      console.log('[ChatCache] Presence updated for', Object.keys(presenceData).length, 'users');
    }
  } catch (error) {
    console.warn('[ChatCache] Failed to fetch presence:', error);
  }
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
export async function getConversations(force = false) {
  if (!force && hasValidCache(conversationsCache)) {
    return conversationsCache.data;
  }

  if (conversationsCache.loading) {
    return conversationsCache.data;
  }

  // Clear existing cache on force reload to avoid stale data mixing
  if (force) {
    conversationsCache.data = [];
    conversationsCache.byId.clear();
    conversationsCache.totalUnread = 0;
  }

  setCacheLoading(conversationsCache, true);

  try {
    const response = await listConversations();
    const raw = response?.data?.conversations || [];

    // Users cache snapshot to enrich conversation participant info
    const usersForEnrichment = getUsersSync() || [];

    // Normalize conversations
    const normalizedConversations = raw.map((conv) => {
      const participants = conv.participants || [];
      let participantsInfo = conv.participants_info || conv.participantsInfo || [];

      // Helper to check if a string looks like a userKey (numeric or UUID-like)
      const looksLikeUserKey = (str) => {
        if (!str) return true;
        // Check if it's all numbers or looks like a UUID/key
        return /^\d+$/.test(str) || /^[a-f0-9-]{20,}$/i.test(str);
      };

      // Always enrich participants_info with user data from cache
      // This handles cases where name is missing OR name is actually a userKey
      if (participants.length > 0) {
        participantsInfo = participants.map((userKey) => {
          // Check if we already have info for this participant
          const existingInfo = participantsInfo.find((p) => p.user_key === userKey);

          // Look up user in cache to get real name
          const user = usersForEnrichment.find((u) => (u.user_key || u.id) === userKey);
          const realName = user?.name || user?.username || null;

          // Use real name if available, or existing name if it doesn't look like a userKey
          let finalName = realName;
          if (!finalName && existingInfo?.name && !looksLikeUserKey(existingInfo.name)) {
            finalName = existingInfo.name;
          }
          if (!finalName) {
            finalName = userKey; // Last resort fallback
          }

          return {
            user_key: userKey,
            name: finalName,
            avatar_url: user?.avatar_url || user?.profile_picture || existingInfo?.avatar_url || null,
            is_online: existingInfo?.is_online || false,
          };
        });
      }

      return {
        conversation_id: conv.conversation_id || conv.conversationId || conv.id,
        conversation_type: conv.conversation_type || conv.type || 'direct',
        name: conv.name || null,
        participants: participants,
        participants_info: participantsInfo,
        last_message: conv.last_message || conv.lastMessage || null,
        unread_count: Number(conv.unread_count || conv.unreadCount) || 0,
        is_muted: conv.is_muted || conv.isMuted || false,
        is_pinned: conv.is_pinned || conv.isPinned || false,
        last_activity: conv.last_activity || conv.lastActivity || conv.updatedAt || conv.createdAt,
        created_at: conv.created_at || conv.createdAt,
      };
    });

    updateCache(conversationsCache, normalizedConversations, 'conversation_id');

    // Calculate total unread
    conversationsCache.totalUnread = normalizedConversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

    persistCache(conversationsCache, STORAGE_KEY_CONVERSATIONS);
    setCacheLoading(conversationsCache, false);

    return normalizedConversations;
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
 * REST API is called for server-side conversations
 */
export async function getMessagesForConversation(conversationId, force = false, params = {}) {
  const cache = getOrCreateMessagesCache(conversationId);

  if (!force && hasValidCache(cache)) {
    return cache.data;
  }

  if (cache.loading) {
    return cache.data;
  }

  // Clear existing cache data on force reload to avoid stale data mixing
  if (force) {
    cache.data = [];
    cache.byId.clear();
  }

  setCacheLoading(cache, true);

  try {
    console.log('[ChatCache] Fetching messages for:', conversationId);
    const response = await getMessages(conversationId, { limit: 50, ...params });

    // Get messages array from response
    const rawMessages = response?.data?.messages || [];
    console.log('[ChatCache] Received messages:', rawMessages.length);

    // Get users for enriching sender names
    const users = getUsersSync() || [];
    const currentUserKey = getCurrentUserKey();

    // Normalize messages to snake_case format and enrich sender names
    // Trust server data completely on fresh fetch
    const normalizedMessages = rawMessages.map((msg) => {
        const senderKey = msg.sender_key || msg.senderKey;
        let senderName = msg.sender_name || msg.senderName;
        const msgId = msg.message_id || msg.messageId || msg.id;

        // Enrich sender_name from users cache if not provided
        if (!senderName && senderKey) {
          const user = users.find((u) => (u.user_key || u.id) === senderKey);
          senderName = user?.name || user?.username || senderKey;
        }

        // Get server-provided timestamps
        const deliveredAt = msg.delivered_at || msg.deliveredAt || null;
        const readAt = msg.read_at || msg.readAt || null;

        // Derive status from timestamps if server provides them (authoritative)
        let status = msg.status || 'sent';
        if (readAt) {
          status = 'read';
        } else if (deliveredAt) {
          status = 'delivered';
        }

        return {
          message_id: msgId,
          conversation_id: msg.conversation_id || msg.conversationId || conversationId,
          sender_key: senderKey,
          sender_name: senderName,
          content: msg.content,
          message_type: msg.message_type || msg.type || 'text',
          status: status,
          created_at: msg.created_at || msg.createdAt,
          edited_at: msg.edited_at || msg.editedAt || null,
          reply_to: msg.reply_to || msg.replyTo || null,
          reactions: msg.reactions || [],
          delivered_at: deliveredAt,
          read_at: readAt,
       };
     });

    updateCache(cache, normalizedMessages, 'message_id');

    // Sync conversation state with actual messages from server
    const conv = conversationsCache.byId.get(String(conversationId));
    if (conv) {
      // Update last_message to match actual messages (server is authoritative)
      if (normalizedMessages.length > 0) {
        const lastMsg = normalizedMessages[normalizedMessages.length - 1];
        conv.last_message = {
          content: lastMsg.content,
          sender_key: lastMsg.sender_key,
          created_at: lastMsg.created_at,
        };
      } else {
        // No messages - clear last_message to avoid showing stale data
        conv.last_message = null;
      }

      // Count messages not sent by me that are not read
      const unreadCount = normalizedMessages.filter((m) => {
        return m.sender_key !== currentUserKey && m.status !== 'read' && !m.read_at;
      }).length;

      // Update conversation unread count
      conv.unread_count = unreadCount;

      // Recompute total unread across all conversations
      conversationsCache.totalUnread = Math.max(0,
        conversationsCache.data.reduce((sum, c) => sum + (c.unread_count || 0), 0)
      );

      conversationsCache.events.emit('updated', conversationsCache.data);
    }

    setCacheLoading(cache, false);

    return normalizedMessages;
  } catch (error) {
    setCacheError(cache, error);
    console.error('[ChatCache] Failed to fetch messages:', error);
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
  console.log('[ChatCache] sendMessage called:', { conversationId, content });

  const currentUserKey = getCurrentUserKey();
  console.log('[ChatCache] Current user key:', currentUserKey);
  console.log('[ChatCache] Socket connected:', socketService.isConnected());

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
    // Ensure totalUnread never goes negative
    conversationsCache.totalUnread = Math.max(0, conversationsCache.totalUnread - conv.unread_count);
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
 * Delete a message via WebSocket
 * Event: chat:delete
 * @param {string} conversationId - Conversation ID
 * @param {string} messageId - Message ID to delete
 * @param {boolean} forEveryone - Delete for everyone (default: false)
 */
export async function deleteMessage(conversationId, messageId, forEveryone = false) {
  console.log('[ChatCache] Deleting message:', { conversationId, messageId, forEveryone });

  // Optimistic update - remove message from local cache
  const cache = messagesCache.get(conversationId);
  if (cache) {
    const msgIndex = cache.data.findIndex((m) => m.message_id === messageId);
    if (msgIndex !== -1) {
      // Remove from cache immediately
      cache.data.splice(msgIndex, 1);
      cache.byId.delete(String(messageId));
      cache.events.emit('updated', cache.data);

      // Update conversation's last_message to the previous message
      const conv = conversationsCache.byId.get(String(conversationId));
      if (conv) {
        if (cache.data.length > 0) {
          const lastMsg = cache.data[cache.data.length - 1];
          conv.last_message = {
            content: lastMsg.content,
            sender_key: lastMsg.sender_key,
            created_at: lastMsg.created_at,
          };
        } else {
          conv.last_message = null;
        }
        conversationsCache.events.emit('updated', conversationsCache.data);
        persistCache(conversationsCache, STORAGE_KEY_CONVERSATIONS);
      }
    }
  }

  // Send to server via WebSocket
  if (socketService.isConnected()) {
    await socketService.deleteMessage(messageId, forEveryone);
  } else {
    showErrorAlert('Not connected to chat server.', 'Chat Error');
    throw new Error('WebSocket not connected');
  }
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
 * Track when user opens a conversation
 * - Sets this as the active conversation (for unread count handling)
 * - Joins the conversation room via WebSocket
 * - Loads messages via REST API
 * - Marks all messages as read
 * @param {string} conversationId - Conversation ID
 */
export function trackConversationOpen(conversationId) {
  if (!conversationId) return;

  console.log('[ChatCache] Opening conversation:', conversationId);

  // Set as active conversation (messages received won't increase unread count)
  activeConversationId = conversationId;

  // Update local last activity
  const conv = conversationsCache.byId.get(String(conversationId));
  if (conv) {
    conv.last_opened = new Date().toISOString();
  }

  // Join conversation room via WebSocket (to receive real-time messages)
  if (socketService.isConnected()) {
    socketService.joinConversation(conversationId);
  }

  // Load messages via REST API
  getMessagesForConversation(conversationId, true);

  // Mark all messages as read when user opens the conversation
  markConversationAsRead(conversationId);
}

/**
 * Track when user closes/leaves a conversation
 * Call this when navigating away from a conversation
 */
export function trackConversationClose() {
  console.log('[ChatCache] Closing conversation:', activeConversationId);
  activeConversationId = null;
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
 * Pin/Unpin a conversation
 * @param {string} conversationId - Conversation ID
 * @param {boolean} pinned - Whether to pin or unpin
 */
export function pinConversation(conversationId, pinned) {
  const conv = conversationsCache.byId.get(String(conversationId));
  if (conv) {
    conv.is_pinned = pinned;

    // Re-sort conversations (pinned first)
    conversationsCache.data.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.last_activity || 0) - new Date(a.last_activity || 0);
    });

    conversationsCache.events.emit('updated', conversationsCache.data);
    persistCache(conversationsCache, STORAGE_KEY_CONVERSATIONS);

    console.log('[ChatCache] Conversation pinned:', conversationId, pinned);
  }
}

/**
 * Mute/Unmute a conversation
 * @param {string} conversationId - Conversation ID
 * @param {boolean} muted - Whether to mute or unmute
 */
export function muteConversation(conversationId, muted) {
  const conv = conversationsCache.byId.get(String(conversationId));
  if (conv) {
    conv.is_muted = muted;
    conversationsCache.events.emit('updated', conversationsCache.data);
    persistCache(conversationsCache, STORAGE_KEY_CONVERSATIONS);

    console.log('[ChatCache] Conversation muted:', conversationId, muted);
  }
}

/**
 * Clear conversation messages via WebSocket
 * @param {string} conversationId - Conversation ID
 * @param {boolean} forEveryone - Clear for everyone (default: false - just for me)
 */
export async function clearConversation(conversationId, forEveryone = false) {
  console.log('[ChatCache] Clearing conversation:', conversationId, 'forEveryone:', forEveryone);

  // Optimistic update - clear local cache
  const cache = messagesCache.get(conversationId);
  if (cache) {
    cache.data = [];
    cache.byId.clear();
    cache.events.emit('updated', cache.data);
  }

  // Update conversation
  const conv = conversationsCache.byId.get(String(conversationId));
  if (conv) {
    conv.last_message = null;
    conversationsCache.events.emit('updated', conversationsCache.data);
    persistCache(conversationsCache, STORAGE_KEY_CONVERSATIONS);
  }

  // Send to server via WebSocket
  if (socketService.isConnected()) {
    await socketService.clearConversation(conversationId, forEveryone);
  }
}

/**
 * Delete a conversation (leave it)
 * @param {string} conversationId - Conversation ID
 */
export function deleteConversation(conversationId) {
  // Remove from local cache
  const index = conversationsCache.data.findIndex(
    (c) => c.conversation_id === conversationId
  );
  if (index !== -1) {
    conversationsCache.data.splice(index, 1);
    conversationsCache.byId.delete(String(conversationId));
    conversationsCache.events.emit('updated', conversationsCache.data);
    persistCache(conversationsCache, STORAGE_KEY_CONVERSATIONS);
  }

  // Clear messages cache
  messagesCache.delete(conversationId);
  typingState.delete(conversationId);

  console.log('[ChatCache] Conversation deleted locally:', conversationId);

  // TODO: Send to server if needed
}

/**
 * Get last seen time for a user in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userKey - User key to get last seen for
 * @returns {string|null} Last seen ISO timestamp
 */
export function getLastSeen(conversationId, userKey) {
  const conv = conversationsCache.byId.get(String(conversationId));
  if (!conv) return null;

  const participant = conv.participants_info?.find((p) => p.user_key === userKey);
  return participant?.last_seen || null;
}

/**
 * Check if a user is online
 * @param {string} userKey - User key
 * @returns {boolean}
 */
export function isUserOnline(userKey) {
  // Check across all conversations
  for (const conv of conversationsCache.data) {
    const participant = conv.participants_info?.find((p) => p.user_key === userKey);
    if (participant?.is_online) return true;
  }
  return false;
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
  deleteMessage,
  markConversationAsRead,
  pinConversation,
  muteConversation,
  clearConversation,
  deleteConversation,
  getLastSeen,
  isUserOnline,
  setUserOnline,
  setUserOffline,
  startTyping,
  stopTyping,
  getTypingUsers,
  trackConversationOpen,
  trackConversationClose,
  addReaction,
  subscribeToChatWebSocket,
  createConversation,
  startDirectConversation,
  isWebSocketConnected,
  resetWebSocketState,
};

export default chatCache;

