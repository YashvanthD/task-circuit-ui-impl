/**
 * Chat Cache - Actions
 * High-level action functions for chat operations.
 *
 * @module utils/chat/actions
 */

import { socketService } from '../websocket';
import { getCurrentUserKey } from '../../api/chat';
import { showErrorAlert } from '../alertManager';

import * as conversationsStore from './conversationsStore';
import * as messagesStore from './messagesStore';
import {MESSAGE_STATUS} from "../../constants";

// ============================================================================
// Message Actions
// ============================================================================

/**
 * Send a message
 * @param {string} conversationId
 * @param {string} content
 * @returns {Promise<object>} Optimistic message
 */
export async function sendMessage(conversationId, content) {
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
    status: MESSAGE_STATUS.SENDING,
  };

  // Add to cache immediately
  messagesStore.addMessage(conversationId, optimisticMessage);

  // Update conversation
  conversationsStore.updateConversationWithMessage(conversationId, optimisticMessage, false);

  try {
    if (socketService.isConnected()) {
      await socketService.sendMessage(conversationId, content, 'text', tempId);
    } else {
      throw new Error('Not connected to chat server');
    }
    return optimisticMessage;
  } catch (error) {
    // Mark as failed
    messagesStore.updateMessage(conversationId, tempId, {
      status: MESSAGE_STATUS.FAILED,
      error: error.message,
    });
    showErrorAlert('Failed to send message', 'Chat Error');
    throw error;
  }
}

/**
 * Delete a message
 * @param {string} conversationId
 * @param {string} messageId
 * @param {boolean} forEveryone
 */
export async function deleteMessage(conversationId, messageId, forEveryone = false) {
  // Optimistic delete
  messagesStore.removeMessage(conversationId, messageId);

  // Update conversation last message
  const lastMsg = messagesStore.getLastMessage(conversationId);
  if (lastMsg) {
    conversationsStore.updateConversationWithMessage(conversationId, lastMsg, false);
  }

  // Send to server
  if (socketService.isConnected()) {
    await socketService.deleteMessage(messageId, forEveryone);
  }
}

/**
 * Retry sending a failed message
 * @param {string} conversationId
 * @param {string} messageId
 */
export async function retryMessage(conversationId, messageId) {
  const msg = messagesStore.getMessageById(conversationId, messageId);
  if (!msg || msg.status !== MESSAGE_STATUS.FAILED) return;

  // Remove old message
  messagesStore.removeMessage(conversationId, messageId);

  // Send again
  return sendMessage(conversationId, msg.content);
}

// ============================================================================
// Conversation Actions
// ============================================================================

/**
 * Mark conversation as read
 * @param {string} conversationId
 */
export async function markConversationAsRead(conversationId) {
  const currentUserKey = getCurrentUserKey();

  // Update local state
  conversationsStore.markAsRead(conversationId);

  // Mark messages as read locally
  const messages = messagesStore.getMessagesSync(conversationId);
  messages.forEach((m) => {
    if (m.sender_key !== currentUserKey && m.status !== MESSAGE_STATUS.READ) {
      messagesStore.updateMessage(conversationId, m.message_id, {
        status: MESSAGE_STATUS.READ,
      });
    }
  });

  // Send to server
  if (socketService.isConnected()) {
    await socketService.markMessagesRead(conversationId);
  }
}

/**
 * Open a conversation (join room, set active)
 * @param {string} conversationId
 */
export async function openConversation(conversationId) {
  conversationsStore.setActiveConversation(conversationId);

  // Join conversation room
  if (socketService.isConnected()) {
    await socketService.joinConversation(conversationId);
  }

  // Mark as read
  await markConversationAsRead(conversationId);
}

/**
 * Close conversation (clear active)
 */
export function closeConversation() {
  conversationsStore.setActiveConversation(null);
}

/**
 * Create a new conversation
 * @param {Array<string>} participants
 * @param {string} name - For group conversations
 * @param {string} type - 'direct' or 'group'
 */
export async function createConversation(participants, name = null, type = 'direct') {
  if (socketService.isConnected()) {
    await socketService.createConversation(participants, name, type);
  } else {
    throw new Error('Not connected to chat server');
  }
}

/**
 * Clear conversation messages
 * @param {string} conversationId
 * @param {boolean} forEveryone
 */
export async function clearConversation(conversationId, forEveryone = false) {
  // Clear local cache
  messagesStore.clearCache(conversationId);

  // Send to server
  if (socketService.isConnected()) {
    await socketService.clearConversation(conversationId, forEveryone);
  }
}

// ============================================================================
// Typing Actions
// ============================================================================

/**
 * Send typing indicator
 * @param {string} conversationId
 * @param {boolean} isTyping
 */
export function sendTyping(conversationId, isTyping = true) {
  if (socketService.isConnected()) {
    socketService.sendTyping(conversationId, isTyping);
  }
}

/**
 * Start typing
 * @param {string} conversationId
 */
export function startTyping(conversationId) {
  sendTyping(conversationId, true);
}

/**
 * Stop typing
 * @param {string} conversationId
 */
export function stopTyping(conversationId) {
  sendTyping(conversationId, false);
}

// ============================================================================
// Presence Actions
// ============================================================================

/**
 * Set user online
 */
export function setUserOnline() {
  if (socketService.isConnected()) {
    socketService.setOnline();
  }
}

/**
 * Set user offline
 */
export function setUserOffline() {
  if (socketService.isConnected()) {
    socketService.setOffline();
  }
}

// ============================================================================
// Cache Actions
// ============================================================================

/**
 * Refresh conversations
 */
export async function refreshConversations() {
  return conversationsStore.getConversations(true);
}

/**
 * Refresh messages for a conversation
 * @param {string} conversationId
 */
export async function refreshMessages(conversationId) {
  return messagesStore.getMessagesForConversation(conversationId, true);
}

/**
 * Clear all chat cache
 */
export function clearAllCache() {
  conversationsStore.clearCache();
  messagesStore.clearAllCaches();
}
