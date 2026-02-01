/**
 * Chat Cache - Main Index
 * Unified exports for the chat cache system.
 *
 * @module utils/chat
 */

// Import all modules first
import * as conversationsStoreModule from './conversationsStore';
import * as messagesStoreModule from './messagesStore';
import * as typingStoreModule from './typingStore';
import { subscribeToWebSocket } from './wsHandler';

// Events
export { chatEvents, CHAT_EVENTS, createEventEmitter } from './events';

// Normalizers
export { normalizeMessage, normalizeConversation, normalizeParticipantsInfo, createLastMessage } from './normalizers';

// Message utilities (sender/receiver differentiation)
export * from './messageUtils';
export { default as messageUtils } from './messageUtils';

// Stores

export const conversationsStore = conversationsStoreModule;
export const messagesStore = messagesStoreModule;
export const typingStore = typingStoreModule;

// WebSocket handler
export { subscribeToWebSocket, unsubscribeFromWebSocket, isSubscribed, resetState } from './wsHandler';

// Actions
export {
  sendMessage,
  deleteMessage,
  retryMessage,
  markConversationAsRead,
  openConversation,
  closeConversation,
  createConversation,
  clearConversation,
  sendTyping,
  startTyping,
  stopTyping,
  setUserOnline,
  setUserOffline,
  refreshConversations,
  refreshMessages,
  clearAllCache,
} from './actions';

// ============================================================================
// Convenience Re-exports (backward compatibility)
// ============================================================================

// Conversations
export const getConversations = conversationsStoreModule.getConversations;
export const getConversationsSync = conversationsStoreModule.getConversationsSync;
export const getConversationById = conversationsStoreModule.getConversationById;
export const getTotalUnreadCount = conversationsStoreModule.getTotalUnreadCount;
export const isConversationsLoading = conversationsStoreModule.isLoading;
export const clearConversationsCache = conversationsStoreModule.clearCache;
export const onConversationsChange = conversationsStoreModule.subscribe;

// Messages
export const getMessagesForConversation = messagesStoreModule.getMessagesForConversation;
export const getMessagesSync = messagesStoreModule.getMessagesSync;
export const isMessagesLoading = messagesStoreModule.isLoading;
export const onMessagesChange = messagesStoreModule.subscribe;

// Typing
export const getTypingUsers = typingStoreModule.getTypingUsers;
export const isAnyoneTyping = typingStoreModule.isAnyoneTyping;
export const onTypingChange = typingStoreModule.subscribe;

// WebSocket
export { subscribeToChatWebSocket } from './wsHandler';
export const subscribeToChatWebSocket_legacy = subscribeToWebSocket;

// Default export with all modules
const chatCache = {
  // Stores
  conversations: conversationsStoreModule,
  messages: messagesStoreModule,
  typing: typingStoreModule,

  // Quick access
  getConversations: conversationsStoreModule.getConversations,
  getConversationsSync: conversationsStoreModule.getConversationsSync,
  getConversationById: conversationsStoreModule.getConversationById,
  getTotalUnreadCount: conversationsStoreModule.getTotalUnreadCount,

  getMessagesForConversation: messagesStoreModule.getMessagesForConversation,
  getMessagesSync: messagesStoreModule.getMessagesSync,

  getTypingUsers: typingStoreModule.getTypingUsers,
};

export default chatCache;

