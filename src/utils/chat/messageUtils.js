/**
 * Chat Message Sender/Receiver Utilities
 * Based on Chat Message Sender/Receiver Differentiation Guide
 *
 * @module utils/chat/messageUtils
 */

/**
 * Calculate receivers from conversation participants and message sender
 * Rule: receivers = participants - sender
 *
 * @param {Array<string>} participants - All conversation participants
 * @param {string} sender - Message sender user key
 * @returns {Array<string>} Array of receiver user keys
 *
 * @example
 * const receivers = calculateReceivers(
 *   ['user_key_123', 'user_key_456', 'user_key_789'],
 *   'user_key_123'
 * );
 * // Returns: ['user_key_456', 'user_key_789']
 */
export function calculateReceivers(participants, sender) {
  if (!participants || !Array.isArray(participants)) {
    return [];
  }
  if (!sender) {
    return participants;
  }
  return participants.filter(p => String(p) !== String(sender));
}

/**
 * Determine if a message is incoming or outgoing for the current user
 *
 * @param {object} message - Message object
 * @param {string} currentUserKey - Current user's key (user_key, not user_id)
 * @returns {string} 'incoming' or 'outgoing'
 *
 * @example
 * const direction = getMessageDirection(message, 'user_key_123');
 * // Returns: 'outgoing' if sender is user_key_123, 'incoming' otherwise
 */
export function getMessageDirection(message, currentUserKey) {
  // Extract sender with multiple fallbacks to handle different API response formats
  const sender = message.sender_key || message.senderKey || message.sender || message.sender_id || message.senderId;

  if (!sender) {
    console.warn('[messageUtils] Message has no sender field:', message);
    return 'incoming'; // Default to incoming if no sender
  }

  if (String(sender) === String(currentUserKey)) {
    return 'outgoing';
  }
  return 'incoming';
}

/**
 * Check if message is from current user (outgoing)
 *
 * @param {object} message - Message object
 * @param {string} currentUserKey - Current user's key (user_key, not user_id)
 * @returns {boolean} True if message is from current user
 */
export function isOwnMessage(message, currentUserKey) {
  return getMessageDirection(message, currentUserKey) === 'outgoing';
}

/**
 * Check if message is to current user (incoming)
 *
 * @param {object} message - Message object
 * @param {string} currentUserKey - Current user's key (user_key, not user_id)
 * @returns {boolean} True if message is to current user
 */
export function isIncomingMessage(message, currentUserKey) {
  return getMessageDirection(message, currentUserKey) === 'incoming';
}

/**
 * Determine message delivery status
 * Priority: read_at > delivered_at > status string
 *
 * @param {object} message - Message object
 * @param {boolean} isOwn - Whether message is from current user
 * @returns {string} Status: 'sending', 'sent', 'delivered', 'read', 'failed'
 */
export function getMessageStatus(message, isOwn) {
  // Non-own messages don't have delivery status
  if (!isOwn) {
    return null;
  }

  // Check timestamps first (authoritative from server)
  if (message.read_at || message.is_read) {
    return 'read';
  }
  if (message.delivered_at || message.is_delivered) {
    return 'delivered';
  }

  // Use status field
  if (message.status) {
    return message.status;
  }

  // Default for own messages
  return 'sent';
}

/**
 * Check if all receivers have read the message
 *
 * @param {object} message - Message object with read_by array
 * @param {Array<string>} receivers - Array of receiver user keys
 * @returns {boolean} True if all receivers have read
 */
export function isReadByAll(message, receivers) {
  if (!message.read_by || !Array.isArray(message.read_by)) {
    return false;
  }
  if (!receivers || receivers.length === 0) {
    return false;
  }

  return receivers.every(receiver =>
    message.read_by.some(readBy => String(readBy) === String(receiver))
  );
}

/**
 * Check if all receivers have received the message
 *
 * @param {object} message - Message object with delivered_to array
 * @param {Array<string>} receivers - Array of receiver user keys
 * @returns {boolean} True if all receivers have received
 */
export function isDeliveredToAll(message, receivers) {
  if (!message.delivered_to || !Array.isArray(message.delivered_to)) {
    return false;
  }
  if (!receivers || receivers.length === 0) {
    return false;
  }

  return receivers.every(receiver =>
    message.delivered_to.some(delivered => String(delivered) === String(receiver))
  );
}

/**
 * Get UI rendering configuration for a message
 *
 * @param {object} message - Message object
 * @param {string} currentUserKey - Current user's key (user_key, not user_id)
 * @param {boolean} isGroupChat - Whether this is a group conversation
 * @returns {object} UI configuration
 *
 * @example
 * const config = getMessageUIConfig(message, 'user_key_123', false);
 * // Returns: {
 * //   alignment: 'right',
 * //   backgroundColor: '#DCF8C6',
 * //   showSenderName: false,
 * //   showDeliveryStatus: true,
 * //   showTimestamp: true,
 * //   isOwn: true
 * // }
 */
export function getMessageUIConfig(message, currentUserKey, isGroupChat = false) {
  const isOwn = isOwnMessage(message, currentUserKey);

  return {
    alignment: isOwn ? 'right' : 'left',
    backgroundColor: isOwn ? '#DCF8C6' : '#FFFFFF', // WhatsApp colors
    showSenderName: !isOwn && isGroupChat, // Show sender name for incoming group messages
    showDeliveryStatus: isOwn, // Show checkmarks only for outgoing messages
    showTimestamp: true,
    isOwn,
  };
}

/**
 * Enrich message with receiver information
 * Calculates receivers from participants if not present
 *
 * @param {object} message - Message object
 * @param {Array<string>} participants - Conversation participants
 * @returns {object} Enriched message with receivers field
 */
export function enrichMessageWithReceivers(message, participants) {
  // If receivers already exist, use them
  if (message.receivers && Array.isArray(message.receivers)) {
    return message;
  }

  // Calculate receivers from participants
  const sender = message.sender_key || message.sender;
  const receivers = calculateReceivers(participants, sender);

  return {
    ...message,
    receivers,
  };
}

/**
 * Get unread messages for current user
 * A message is unread if:
 * - It's incoming (not from current user)
 * - Current user is in receivers
 * - Current user is NOT in read_by array
 *
 * @param {Array<object>} messages - Array of messages
 * @param {string} currentUserKey - Current user's key (user_key, not user_id)
 * @returns {Array<object>} Unread messages
 */
export function getUnreadMessages(messages, currentUserKey) {
  return messages.filter(message => {
    // Skip own messages
    if (isOwnMessage(message, currentUserKey)) {
      return false;
    }

    // Check if user is in receivers
    if (message.receivers && !message.receivers.includes(currentUserKey)) {
      return false;
    }

    // Check if already read
    if (message.read_by && message.read_by.includes(currentUserKey)) {
      return false;
    }

    // Check legacy read status
    if (message.is_read || message.status === 'read') {
      return false;
    }

    return true;
  });
}

/**
 * Count unread messages for current user
 *
 * @param {Array<object>} messages - Array of messages
 * @param {string} currentUserKey - Current user's key (user_key, not user_id)
 * @returns {number} Count of unread messages
 */
export function countUnreadMessages(messages, currentUserKey) {
  return getUnreadMessages(messages, currentUserKey).length;
}

export default {
  calculateReceivers,
  getMessageDirection,
  isOwnMessage,
  isIncomingMessage,
  getMessageStatus,
  isReadByAll,
  isDeliveredToAll,
  getMessageUIConfig,
  enrichMessageWithReceivers,
  getUnreadMessages,
  countUnreadMessages,
};
