/**
 * Chat Cache - Normalizers
 * Functions to normalize API data to consistent format.
 *
 * @module utils/chat/normalizers
 */

import { MESSAGE_STATUS } from '../../constants';

/**
 * Normalize a message from API to consistent format
 * @param {object} msg - Raw message from API
 * @param {string} conversationId - Conversation ID
 * @param {Array} users - Users array for sender name enrichment
 * @returns {object} Normalized message
 */
export function normalizeMessage(msg, conversationId = null, users = []) {
  if (!msg) return null;

  const senderKey = msg.sender_key || msg.senderKey;
  let senderName = msg.sender_name || msg.senderName;
  const msgId = msg.message_id || msg.messageId || msg.id;

  // Enrich sender_name from users if not provided
  if (!senderName && senderKey && users.length > 0) {
    const user = users.find((u) => (u.user_key || u.id) === senderKey);
    senderName = user?.name || user?.username || senderKey;
  }

  // Get timestamps
  const deliveredAt = msg.delivered_at || msg.deliveredAt || null;
  const readAt = msg.read_at || msg.readAt || null;

  // Derive status from timestamps (server is authoritative)
  let status = msg.status || MESSAGE_STATUS.SENT;
  if (readAt) {
    status = MESSAGE_STATUS.READ;
  } else if (deliveredAt) {
    status = MESSAGE_STATUS.DELIVERED;
  }

  return {
    message_id: msgId,
    conversation_id: msg.conversation_id || msg.conversationId || conversationId,
    sender_key: senderKey,
    sender_name: senderName,
    sender_avatar: msg.sender_avatar || msg.senderAvatar || null,
    content: msg.content,
    message_type: msg.message_type || msg.type || 'text',
    status,
    created_at: msg.created_at || msg.createdAt,
    edited_at: msg.edited_at || msg.editedAt || null,
    reply_to: msg.reply_to || msg.replyTo || null,
    reactions: msg.reactions || [],
    delivered_at: deliveredAt,
    read_at: readAt,
  };
}

/**
 * Check if a string looks like a user key (numeric or UUID-like)
 * @param {string} str - String to check
 * @returns {boolean}
 */
function looksLikeUserKey(str) {
  if (!str) return true;
  return /^\d+$/.test(str) || /^[a-f0-9-]{20,}$/i.test(str);
}

/**
 * Normalize participant info
 * @param {Array} participants - Participant user keys
 * @param {Array} existingInfo - Existing participant info
 * @param {Array} users - Users array for enrichment
 * @returns {Array} Normalized participants_info
 */
export function normalizeParticipantsInfo(participants = [], existingInfo = [], users = []) {
  return participants.map((userKey) => {
    const existing = existingInfo.find((p) => p.user_key === userKey);
    const user = users.find((u) => (u.user_key || u.id) === userKey);
    const realName = user?.name || user?.username || null;

    // Use real name if available, or existing name if it doesn't look like a userKey
    let finalName = realName;
    if (!finalName && existing?.name && !looksLikeUserKey(existing.name)) {
      finalName = existing.name;
    }
    if (!finalName) {
      finalName = userKey; // Last resort fallback
    }

    return {
      user_key: userKey,
      name: finalName,
      avatar_url: user?.avatar_url || user?.profile_picture || existing?.avatar_url || null,
      is_online: existing?.is_online || false,
      last_seen: existing?.last_seen || null,
    };
  });
}

/**
 * Normalize a conversation from API to consistent format
 * @param {object} conv - Raw conversation from API
 * @param {Array} users - Users array for participant enrichment
 * @returns {object} Normalized conversation
 */
export function normalizeConversation(conv, users = []) {
  if (!conv) return null;

  const participants = conv.participants || [];
  const existingInfo = conv.participants_info || conv.participantsInfo || [];
  const participantsInfo = normalizeParticipantsInfo(participants, existingInfo, users);

  return {
    conversation_id: conv.conversation_id || conv.conversationId || conv.id,
    conversation_type: conv.conversation_type || conv.type || 'direct',
    name: conv.name || null,
    participants,
    participants_info: participantsInfo,
    last_message: conv.last_message || conv.lastMessage || null,
    unread_count: Math.max(0, Number(conv.unread_count || conv.unreadCount) || 0),
    is_muted: conv.is_muted || conv.isMuted || false,
    is_pinned: conv.is_pinned || conv.isPinned || false,
    last_activity: conv.last_activity || conv.lastActivity || conv.updatedAt || conv.createdAt,
    created_at: conv.created_at || conv.createdAt,
    created_by: conv.created_by || conv.createdBy || null,
  };
}

/**
 * Create a last_message object from a message
 * @param {object} message - Message object
 * @returns {object} Last message summary
 */
export function createLastMessage(message) {
  if (!message) return null;
  return {
    content: message.content,
    sender_key: message.sender_key,
    created_at: message.created_at,
  };
}
