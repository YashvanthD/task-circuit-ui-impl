// JSDoc type definitions for chat-related API shapes

/**
 * @typedef {Object} Conversation
 * @property {string} conversation_id - Conversation ID (12-digit format: YYMMDDHHmmSS)
 * @property {string} account_key - Account key
 * @property {'direct'|'group'} type - Conversation type
 * @property {string} [name] - Conversation name (for group chats)
 * @property {Array<string>} participants - Array of participant user keys (alias: participant_keys)
 * @property {Array<string>} [participant_keys] - Array of participant user keys
 * @property {string} [last_message] - Last message content
 * @property {number} [unread_count] - Unread messages count
 * @property {string} created_by - User key who created conversation
 * @property {string} created_at - ISO timestamp when created
 * @property {string} [updated_at] - ISO timestamp when updated
 * @property {string} [last_message_at] - ISO timestamp of last message
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * @typedef {Object} ConversationsListResponse
 * @property {boolean} success - Always true
 * @property {Object} data - Response data
 * @property {Array<Conversation>} data.conversations - Array of conversations
 */

/**
 * @typedef {Object} Message
 * @property {string} message_id - Message ID (12-digit format: YYMMDDHHmmSS)
 * @property {string} conversation_id - Conversation ID
 * @property {string} sender - Sender user key (alias: sender_key)
 * @property {string} [sender_key] - Sender user key
 * @property {string} message - Message content (alias: content)
 * @property {string} [content] - Message content
 * @property {'text'|'image'|'file'|'audio'|'video'} [type] - Message type
 * @property {string} timestamp - ISO timestamp when sent
 * @property {boolean} [is_read] - Whether message has been read
 * @property {string} [read_at] - ISO timestamp when read
 * @property {boolean} [is_deleted] - Whether message is deleted
 * @property {string} [deleted_at] - ISO timestamp when deleted
 * @property {string} [deleted_for] - 'me' or 'all'
 * @property {string} [reply_to] - Message ID this is replying to
 * @property {Array<string>} [attachments] - Array of attachment URLs
 * @property {Object} [metadata] - Additional metadata
 * @property {string} created_at - ISO timestamp when created
 * @property {string} [updated_at] - ISO timestamp when updated
 */

/**
 * @typedef {Object} MessagesListResponse
 * @property {boolean} success - Always true
 * @property {Object} data - Response data
 * @property {Array<Message>} data.messages - Array of messages
 */

/**
 * @typedef {Object} CreateConversationRequest
 * @property {Array<string>} participant_keys - Array of participant user keys
 * @property {string} [name] - Conversation name (for group chats)
 * @property {'direct'|'group'} [type] - Conversation type (auto-detected if not provided)
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * @typedef {Object} SendMessageRequest
 * @property {string} conversation_id - Conversation ID
 * @property {string} content - Message content
 * @property {'text'|'image'|'file'|'audio'|'video'} [type] - Message type (defaults to 'text')
 * @property {string} [reply_to] - Message ID this is replying to
 * @property {Array<string>} [attachments] - Array of attachment URLs
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * @typedef {Object} TypingIndicator
 * @property {string} conversation_id - Conversation ID
 * @property {string} user_key - User key who is typing
 * @property {string} name - User name
 * @property {boolean} is_typing - Whether user is typing
 */

/**
 * @typedef {Object} ConversationUnreadCount
 * @property {string} conversation_id - Conversation ID
 * @property {number} unread_count - Number of unread messages
 */

// Export nothing at runtime; file is used for JSDoc imports
export default {};
