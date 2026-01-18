/**
 * Chat Cache - WebSocket Handler
 * Handles WebSocket events and updates stores accordingly.
 *
 * @module utils/chat/wsHandler
 */

import { socketService, WS_EVENTS } from '../websocket';
import { getCurrentUserKey } from '../../api/chat';
import { getUsersSync } from '../cache/usersCache';
import { showErrorAlert } from '../alertManager';

import * as conversationsStore from './conversationsStore';
import * as messagesStore from './messagesStore';
import * as typingStore from './typingStore';
import { normalizeMessage, normalizeConversation, normalizeParticipantsInfo } from './normalizers';
import { MESSAGE_STATUS } from './constants';

// ============================================================================
// State
// ============================================================================

let subscribed = false;
let visibilityListenerAdded = false;

// ============================================================================
// Public API
// ============================================================================

/**
 * Subscribe to WebSocket chat events
 * Call this after WebSocket is connected (via DataContext)
 */
export function subscribeToWebSocket() {
  if (subscribed) return;
  if (!socketService.isConnected()) {
    console.log('[ChatWS] WebSocket not connected, skipping subscription');
    return;
  }

  console.log('[ChatWS] Setting up WebSocket event listeners...');
  setupVisibilityListener();
  socketService.setOnline();

  // Load initial data
  (async () => {
    try {
      await conversationsStore.getConversations(true);
      requestPresenceForAllParticipants();
    } catch (e) {
      console.warn('[ChatWS] Failed to load conversations:', e);
    }
  })();

  // Register all handlers
  registerConnectionHandlers();
  registerMessageHandlers();
  registerConversationHandlers();
  registerTypingHandlers();
  registerPresenceHandlers();

  subscribed = true;
}

// Alias for backward compatibility
export const subscribeToChatWebSocket = subscribeToWebSocket;

/**
 * Unsubscribe from WebSocket events
 */
export function unsubscribeFromWebSocket() {
  subscribed = false;
  // Note: socketService handles actual unsubscription
}

/**
 * Check if subscribed
 * @returns {boolean}
 */
export function isSubscribed() {
  return subscribed;
}

/**
 * Reset subscription state (for retry)
 */
export function resetState() {
  subscribed = false;
}

// ============================================================================
// Handler Registration
// ============================================================================

function registerConnectionHandlers() {
  socketService.on(WS_EVENTS.CONNECTED, (data) => {
    console.log('[ChatWS] Authenticated as:', data?.user_key);
    socketService.setOnline();
    // Reload conversations
    conversationsStore.getConversations(true).then(() => {
      requestPresenceForAllParticipants();
    }).catch(console.warn);
  });

  socketService.on(WS_EVENTS.ERROR, (error) => {
    console.error('[ChatWS] Server error:', error);
  });

  socketService.on(WS_EVENTS.CHAT_ERROR, (data) => {
    const { code, message, tempId, temp_id } = data;
    const msgTempId = tempId || temp_id;

    console.error('[ChatWS] Chat error:', code, message);

    // Mark message as failed
    if (msgTempId) {
      // Search all conversation caches
      const convs = conversationsStore.getConversationsSync();
      convs.forEach((conv) => {
        const msg = messagesStore.getMessageById(conv.conversation_id, msgTempId);
        if (msg) {
          messagesStore.updateMessage(conv.conversation_id, msgTempId, {
            status: MESSAGE_STATUS.FAILED,
            error: message || code,
          });
        }
      });
    }

    showErrorAlert(message || 'Failed to send message', 'Chat Error');
  });
}

function registerMessageHandlers() {
  const currentUserKey = getCurrentUserKey();

  // New message received
  socketService.on(WS_EVENTS.MESSAGE_NEW, (data) => {
    const conversationId = data.conversation_id || data.conversationId;
    const messageId = data.message_id || data.messageId;
    const senderKey = data.sender_key || data.senderKey;

    console.log('[ChatWS] New message:', { messageId, conversationId, senderKey });

    // Add to messages store
    const message = messagesStore.addMessage(conversationId, data);

    // Check if conversation exists
    const conv = conversationsStore.getConversationById(conversationId);
    if (conv) {
      // Update conversation
      const shouldIncrementUnread = senderKey !== currentUserKey &&
        conversationId !== conversationsStore.getActiveConversation();
      conversationsStore.updateConversationWithMessage(conversationId, message, shouldIncrementUnread);
    } else {
      // Create new conversation
      const users = getUsersSync() || [];
      const newConv = {
        conversation_id: conversationId,
        conversation_type: 'direct',
        participants: [currentUserKey, senderKey],
        participants_info: normalizeParticipantsInfo([currentUserKey, senderKey], [], users),
        last_message: {
          content: message.content,
          sender_key: senderKey,
          created_at: message.created_at,
        },
        last_activity: message.created_at,
        unread_count: senderKey !== currentUserKey ? 1 : 0,
        created_at: message.created_at,
      };
      conversationsStore.upsertConversation(newConv);
    }
  });

  // Message sent confirmation
  socketService.on(WS_EVENTS.MESSAGE_SENT, (data) => {
    const conversationId = data.conversation_id || data.conversationId;
    const messageId = data.message_id || data.messageId;
    const tempId = data.temp_id || data.tempId;

    console.log('[ChatWS] Message sent:', { messageId, tempId });

    messagesStore.updateMessage(conversationId, tempId, {
      message_id: messageId,
      status: MESSAGE_STATUS.SENT,
      created_at: data.createdAt || data.created_at,
    });
  });

  // Message delivered
  socketService.on(WS_EVENTS.MESSAGE_DELIVERED, (data) => {
    const conversationId = data.conversation_id || data.conversationId;
    const messageId = data.message_id || data.messageId;

    console.log('[ChatWS] Message delivered:', messageId);

    if (conversationId) {
      messagesStore.updateMessageStatus(conversationId, messageId, MESSAGE_STATUS.DELIVERED, data.timestamp);
    }
  });

  // Message read
  socketService.on(WS_EVENTS.MESSAGE_READ_RECEIPT, (data) => {
    const conversationId = data.conversation_id || data.conversationId;
    const readBy = data.read_by || data.readBy;

    console.log('[ChatWS] Messages read:', { conversationId, readBy });

    messagesStore.markMessagesAsRead(conversationId, readBy, data.timestamp);
  });

  // Message deleted
  socketService.on(WS_EVENTS.MESSAGE_DELETED, (data) => {
    const messageId = data.message_id || data.messageId;

    console.log('[ChatWS] Message deleted:', messageId);

    // Search all conversations
    const convs = conversationsStore.getConversationsSync();
    convs.forEach((conv) => {
      messagesStore.removeMessage(conv.conversation_id, messageId);

      // Update last message
      const lastMsg = messagesStore.getLastMessage(conv.conversation_id);
      if (lastMsg) {
        conversationsStore.updateConversationWithMessage(conv.conversation_id, lastMsg, false);
      }
    });
  });
}

function registerConversationHandlers() {
  // Conversation created
  socketService.on(WS_EVENTS.CONVERSATION_CREATED, (data) => {
    const conversationId = data.conversation_id || data.conversationId;
    console.log('[ChatWS] Conversation created:', conversationId);

    const users = getUsersSync() || [];
    const conv = normalizeConversation(data, users);
    conversationsStore.upsertConversation(conv);
  });

  // Conversation joined
  socketService.on(WS_EVENTS.CONVERSATION_JOINED, (data) => {
    const conversationId = data.conversation_id || data.conversationId;
    console.log('[ChatWS] Joined conversation:', conversationId);
  });

  // Conversation cleared
  socketService.on(WS_EVENTS.CONVERSATION_CLEARED, (data) => {
    const conversationId = data.conversation_id || data.conversationId;
    console.log('[ChatWS] Conversation cleared:', conversationId);

    messagesStore.clearCache(conversationId);

    const conv = conversationsStore.getConversationById(conversationId);
    if (conv) {
      conv.last_message = null;
    }
  });

  // Conversation updated
  socketService.on(WS_EVENTS.CONVERSATION_UPDATED, (data) => {
    const conversationId = data.conversation_id || data.conversationId;
    const conv = conversationsStore.getConversationById(conversationId);
    if (conv) {
      const { conversation_id, ...updates } = data;
      Object.assign(conv, updates);
    }
  });
}

function registerTypingHandlers() {
  socketService.on(WS_EVENTS.TYPING_START, (data) => {
    const conversationId = data.conversation_id || data.conversationId;
    const userKey = data.user_key || data.userKey;
    console.log('[ChatWS] Typing start:', { conversationId, userKey });
    typingStore.setTyping(conversationId, userKey);
  });

  socketService.on(WS_EVENTS.TYPING_STOP, (data) => {
    const conversationId = data.conversation_id || data.conversationId;
    const userKey = data.user_key || data.userKey;
    console.log('[ChatWS] Typing stop:', { conversationId, userKey });
    typingStore.clearTyping(conversationId, userKey);
  });
}

function registerPresenceHandlers() {
  const currentUserKey = getCurrentUserKey();

  socketService.on(WS_EVENTS.PRESENCE_ONLINE, (data) => {
    const userKey = data.user_key || data.userKey;
    if (userKey === currentUserKey) return;
    console.log('[ChatWS] User online:', userKey);
    conversationsStore.updatePresence(userKey, true, null);
  });

  socketService.on(WS_EVENTS.PRESENCE_OFFLINE, (data) => {
    const userKey = data.user_key || data.userKey;
    if (userKey === currentUserKey) return;
    const lastSeen = data.last_seen || data.lastSeen || new Date().toISOString();
    console.log('[ChatWS] User offline:', userKey);
    conversationsStore.updatePresence(userKey, false, lastSeen);
  });

  socketService.on(WS_EVENTS.PRESENCE_UPDATE, (data) => {
    const userKey = data.user_key || data.userKey;
    if (userKey === currentUserKey) return;
    const isOnline = data.is_online || data.isOnline || data.status === 'online';
    const lastSeen = data.last_seen || data.lastSeen;
    console.log('[ChatWS] Presence update:', { userKey, isOnline });
    conversationsStore.updatePresence(userKey, isOnline, lastSeen);
  });
}

// ============================================================================
// Helpers
// ============================================================================

function setupVisibilityListener() {
  if (visibilityListenerAdded || typeof document === 'undefined') return;

  let isCurrentlyOnline = true;

  const handleVisibilityChange = () => {
    const shouldBeOnline = document.visibilityState === 'visible';
    if (shouldBeOnline !== isCurrentlyOnline) {
      isCurrentlyOnline = shouldBeOnline;
      if (shouldBeOnline) {
        socketService.setOnline();
      } else {
        socketService.setOffline();
      }
    }
  };

  const handleBeforeUnload = () => {
    if (socketService.isConnected()) {
      socketService.setOffline();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);
  visibilityListenerAdded = true;
}

async function requestPresenceForAllParticipants() {
  const currentUserKey = getCurrentUserKey();
  const convs = conversationsStore.getConversationsSync();

  const userKeys = new Set();
  convs.forEach((conv) => {
    (conv.participants || []).forEach((key) => {
      if (key !== currentUserKey) {
        userKeys.add(key);
      }
    });
  });

  if (userKeys.size === 0) return;

  try {
    const { getUserPresence } = await import('../../api/chat');
    const response = await getUserPresence(Array.from(userKeys));

    if (response?.success && response?.data?.presence) {
      Object.entries(response.data.presence).forEach(([userKey, presence]) => {
        const isOnline = presence.status === 'online';
        conversationsStore.updatePresence(userKey, isOnline, presence.last_seen);
      });
    }
  } catch (error) {
    console.warn('[ChatWS] Failed to fetch presence:', error);
  }
}

export default {
  subscribeToWebSocket,
  unsubscribeFromWebSocket,
  isSubscribed,
  resetState,
};

