/**
 * Chat Cache - Constants and Configuration
 *
 * @module utils/chat/constants
 */

// Storage keys
export const CHAT_STORAGE_KEYS = {
    CONVERSATIONS: 'tc_cache_conversations',
    MESSAGES_PREFIX: 'tc_cache_messages_',
};

// Cache TTL (Time To Live)
export const CHAT_CACHE_TTL = {
    CONVERSATIONS: 5 * 60 * 1000, // 5 minutes
    MESSAGES: 5 * 60 * 1000, // 5 minutes
};

// Message status
export const MESSAGE_STATUS = {
    SENDING: 'sending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read',
    FAILED: 'failed',
};

// Conversation types
export const CONVERSATION_TYPE = {
    DIRECT: 'direct',
    GROUP: 'group',
};

