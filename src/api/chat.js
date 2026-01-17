/**
 * Chat API Module
 * REST API for chat conversations and messages.
 * Real-time operations use WebSocket.
 *
 * @module api/chat
 */

import { apiFetch } from './client';
import { getAuthHeaders } from './auth';
import { userSession } from '../utils/auth/userSession';

// ============================================================================
// API Endpoints
// ============================================================================
const API_CHAT = {
  CONVERSATIONS: '/api/chat/conversations',
  CONVERSATION_DETAIL: (id) => `/api/chat/conversations/${id}`,
  MESSAGES: (conversationId) => `/api/chat/conversations/${conversationId}/messages`,
  SEARCH: '/api/chat/search',
  UNREAD: '/api/chat/unread',
  PRESENCE: '/api/chat/presence',
  CREATE_CONVERSATION: '/api/chat/conversations', // POST endpoint
};

// Flag to use mock data (set to false for real WebSocket data)
const USE_MOCK = false;

// ============================================================================
// Current User Helper
// ============================================================================

/**
 * Get current user key from session
 */
export function getCurrentUserKey() {
  return userSession.user?.user_key || userSession.user?.id || 'user_current';
}

/**
 * Get current user info
 */
export function getCurrentUserInfo() {
  const user = userSession.user;
  if (!user) {
    return {
      user_key: 'user_current',
      name: 'You',
      avatar_url: null,
      is_online: true,
    };
  }
  return {
    user_key: user.user_key || user.id,
    name: user.name || user.username || 'You',
    avatar_url: user.avatar_url || user.profile_picture || null,
    is_online: true,
  };
}

// ============================================================================
// Mock Data Generator (uses actual users when available)
// ============================================================================

let mockConversationsCache = null;
let mockMessagesCache = {};

/**
 * Generate mock conversations from actual user list
 */
export function generateMockConversations(users = []) {
  const currentUser = getCurrentUserInfo();
  const currentUserKey = currentUser.user_key;

  // Filter out current user and create participant info
  const otherUsers = users
    .filter((u) => (u.user_key || u.id) !== currentUserKey)
    .map((u) => ({
      user_key: u.user_key || u.id,
      name: u.name || u.username || 'Unknown',
      avatar_url: u.avatar_url || u.profile_picture || null,
      is_online: Math.random() > 0.5, // Random online status for mock
    }));

  if (otherUsers.length === 0) {
    // Fallback mock users if no actual users
    otherUsers.push(
      { user_key: 'user_demo1', name: 'Demo User 1', avatar_url: null, is_online: true },
      { user_key: 'user_demo2', name: 'Demo User 2', avatar_url: null, is_online: false },
    );
  }

  const conversations = [];
  const now = Date.now();

  // Create direct conversations with each user
  otherUsers.slice(0, 5).forEach((user, idx) => {
    const convId = `conv_${user.user_key}`;
    const lastMessageTime = now - (idx + 1) * 60 * 60 * 1000; // Hours ago

    conversations.push({
      conversation_id: convId,
      conversation_type: 'direct',
      name: null,
      participants: [currentUserKey, user.user_key],
      participants_info: [currentUser, user],
      last_message: {
        content: getRandomLastMessage(idx),
        sender_key: idx % 2 === 0 ? user.user_key : currentUserKey,
        created_at: new Date(lastMessageTime).toISOString(),
      },
      unread_count: idx % 3 === 0 ? Math.floor(Math.random() * 5) + 1 : 0,
      is_muted: false,
      is_pinned: idx === 0,
      last_activity: new Date(lastMessageTime).toISOString(),
      created_at: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Generate mock messages for this conversation
    mockMessagesCache[convId] = generateMockMessages(convId, currentUserKey, user.user_key, user.name);
  });

  // Create a group conversation if we have enough users
  if (otherUsers.length >= 2) {
    const groupParticipants = [currentUserKey, ...otherUsers.slice(0, 3).map((u) => u.user_key)];
    const groupParticipantsInfo = [currentUser, ...otherUsers.slice(0, 3)];

    conversations.push({
      conversation_id: 'conv_group_team',
      conversation_type: 'group',
      name: 'Team Chat',
      description: 'Team discussion group',
      participants: groupParticipants,
      participants_info: groupParticipantsInfo,
      admins: [currentUserKey],
      last_message: {
        content: 'Let\'s discuss the project updates',
        sender_key: otherUsers[0].user_key,
        created_at: new Date(now - 30 * 60 * 1000).toISOString(),
      },
      unread_count: 3,
      is_muted: false,
      is_pinned: false,
      last_activity: new Date(now - 30 * 60 * 1000).toISOString(),
      created_at: new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Generate messages for group
    mockMessagesCache['conv_group_team'] = generateGroupMockMessages(
      'conv_group_team',
      currentUserKey,
      groupParticipantsInfo
    );
  }

  // Sort by pinned first, then by last activity
  conversations.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.last_activity) - new Date(a.last_activity);
  });

  mockConversationsCache = conversations;
  return conversations;
}

function getRandomLastMessage(idx) {
  const messages = [
    'Hey, how are you?',
    'Can you check the latest report?',
    'Thanks for the update!',
    'Let me know when you\'re free',
    'Sounds good 👍',
    'I\'ll get back to you on that',
    'Perfect, thanks!',
  ];
  return messages[idx % messages.length];
}

function generateMockMessages(conversationId, currentUserKey, otherUserKey, otherUserName) {
  const messages = [];
  const now = Date.now();

  const sampleMessages = [
    { sender: otherUserKey, content: 'Hi there! 👋' },
    { sender: currentUserKey, content: 'Hey! How are you?' },
    { sender: otherUserKey, content: 'I\'m good, thanks! Working on the new features.' },
    { sender: currentUserKey, content: 'That\'s great! Need any help?' },
    { sender: otherUserKey, content: 'Actually yes, can you review my changes?' },
    { sender: currentUserKey, content: 'Sure, I\'ll take a look this afternoon.' },
    { sender: otherUserKey, content: 'Perfect, thanks! 🙏' },
  ];

  sampleMessages.forEach((msg, idx) => {
    const timeOffset = (sampleMessages.length - idx) * 10 * 60 * 1000; // 10 minutes apart
    messages.push({
      message_id: `${conversationId}_msg_${idx + 1}`,
      conversation_id: conversationId,
      sender_key: msg.sender,
      content: msg.content,
      message_type: 'text',
      created_at: new Date(now - timeOffset).toISOString(),
      edited_at: null,
      reply_to: null,
      reactions: idx === 1 ? [{ emoji: '👍', users: [otherUserKey] }] : [],
      status: msg.sender === currentUserKey ? 'read' : 'delivered',
    });
  });

  return messages;
}

function generateGroupMockMessages(conversationId, currentUserKey, participants) {
  const messages = [];
  const now = Date.now();

  const sampleMessages = [
    { senderIdx: 1, content: 'Hey team! 🎉' },
    { senderIdx: 2, content: 'Hi everyone!' },
    { senderIdx: 0, content: 'Welcome to the team chat' },
    { senderIdx: 1, content: 'What\'s on the agenda for today?' },
    { senderIdx: 0, content: 'We need to review the weekly tasks' },
    { senderIdx: 2, content: 'I can prepare the report' },
    { senderIdx: 1, content: 'Let\'s discuss the project updates' },
  ];

  sampleMessages.forEach((msg, idx) => {
    const timeOffset = (sampleMessages.length - idx) * 15 * 60 * 1000;
    const sender = participants[msg.senderIdx] || participants[0];

    messages.push({
      message_id: `${conversationId}_msg_${idx + 1}`,
      conversation_id: conversationId,
      sender_key: sender.user_key,
      content: msg.content,
      message_type: 'text',
      created_at: new Date(now - timeOffset).toISOString(),
      edited_at: null,
      reply_to: null,
      reactions: idx === 0 ? [{ emoji: '🎉', users: participants.slice(1, 3).map((p) => p.user_key) }] : [],
      status: sender.user_key === currentUserKey ? 'read' : 'delivered',
    });
  });

  return messages;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get display name for a conversation
 */
export function getConversationDisplayName(conversation, currentUserKey = null) {
  const userKey = currentUserKey || getCurrentUserKey();

  // Helper to check if a string looks like a userKey (numeric or UUID-like)
  const looksLikeUserKey = (str) => {
    if (!str) return true;
    return /^\d+$/.test(str) || /^[a-f0-9-]{20,}$/i.test(str);
  };

  // For group chats, use the name
  if (conversation.conversation_type === 'group') {
    return conversation.name || 'Group Chat';
  }

  // For direct chats, show the other participant's name
  // Try to find the other participant
  let otherUserKey = null;
  let otherParticipantName = null;
  let otherParticipantInfo = null;

  // Try participants_info first
  if (conversation.participants_info && conversation.participants_info.length > 0) {
    otherParticipantInfo = conversation.participants_info.find(
      (p) => p.user_key !== userKey
    );
    if (otherParticipantInfo) {
      otherUserKey = otherParticipantInfo.user_key;
      if (otherParticipantInfo.name && !looksLikeUserKey(otherParticipantInfo.name)) {
        otherParticipantName = otherParticipantInfo.name;
      }
    }
  }

  // Get other user key from participants array if not found
  if (!otherUserKey && conversation.participants && conversation.participants.length > 0) {
    otherUserKey = conversation.participants.find((p) => p !== userKey);
  }

  // If we have a good name, return it
  if (otherParticipantName) {
    return otherParticipantName;
  }

  // Try to get real name from users cache
  if (otherUserKey) {
    try {
      const { getUsersSync } = require('../utils/cache/usersCache');
      const users = getUsersSync() || [];
      const user = users.find((u) => (u.user_key || u.id) === otherUserKey);
      if (user) {
        const name = user.name || user.username;
        if (name && !looksLikeUserKey(name)) {
          return name;
        }
      }
    } catch (e) {
      // usersCache not available
    }
    // Return the user key as last resort
    return otherUserKey;
  }

  return 'Unknown';
}

/**
 * Get avatar for a conversation
 */
export function getConversationAvatar(conversation, currentUserKey = null) {
  const userKey = currentUserKey || getCurrentUserKey();

  if (conversation.conversation_type === 'group') {
    return null; // Group avatar
  }

  // Try participants_info first
  if (conversation.participants_info && conversation.participants_info.length > 0) {
    const otherParticipant = conversation.participants_info.find(
      (p) => p.user_key !== userKey
    );
    if (otherParticipant?.avatar_url) {
      return otherParticipant.avatar_url;
    }
  }

  // Fallback: try to get from users cache
  if (conversation.participants && conversation.participants.length > 0) {
    const otherUserKey = conversation.participants.find((p) => p !== userKey);
    if (otherUserKey) {
      try {
        const { getUsersSync } = require('../utils/cache/usersCache');
        const users = getUsersSync() || [];
        const user = users.find((u) => (u.user_key || u.id) === otherUserKey);
        if (user) {
          return user.avatar_url || user.profile_picture || null;
        }
      } catch (e) {
        // usersCache not available
      }
    }
  }

  return null;
}

/**
 * Check if other user is online (for direct chats)
 */
export function isOtherUserOnline(conversation, currentUserKey = null) {
  const userKey = currentUserKey || getCurrentUserKey();

  if (conversation.conversation_type === 'group') {
    return false;
  }

  // Try participants_info first
  if (conversation.participants_info && conversation.participants_info.length > 0) {
    const otherParticipant = conversation.participants_info.find(
      (p) => p.user_key !== userKey
    );
    if (otherParticipant) {
      return otherParticipant.is_online || false;
    }
  }

  // Fallback: try to get from users cache
  if (conversation.participants && conversation.participants.length > 0) {
    const otherUserKey = conversation.participants.find((p) => p !== userKey);
    if (otherUserKey) {
      try {
        const { getUsersSync } = require('../utils/cache/usersCache');
        const users = getUsersSync() || [];
        const user = users.find((u) => (u.user_key || u.id) === otherUserKey);
        if (user) {
          return user.is_online || false;
        }
      } catch (e) {
        // usersCache not available
      }
    }
  }

  return false;
}

/**
 * Get last seen time of other user (for direct chats)
 */
export function getOtherUserLastSeen(conversation, currentUserKey = null) {
  const userKey = currentUserKey || getCurrentUserKey();

  if (conversation.conversation_type === 'group') {
    return null;
  }

  // Try participants_info first
  if (conversation.participants_info && conversation.participants_info.length > 0) {
    const otherParticipant = conversation.participants_info.find(
      (p) => p.user_key !== userKey
    );
    if (otherParticipant) {
      return otherParticipant.last_seen || otherParticipant.last_activity || null;
    }
  }

  return null;
}

// ============================================================================
// REST API Functions
// ============================================================================

/**
 * List conversations (with user data integration)
 * @param {object} params - Query params
 * @param {Array} users - Optional users array for mock generation
 */
export async function listConversations(params = {}, users = []) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));

    // Generate or use cached conversations
    if (!mockConversationsCache || users.length > 0) {
      generateMockConversations(users);
    }

    let result = [...(mockConversationsCache || [])];

    // Filter by type
    if (params.type) {
      result = result.filter((c) => c.conversation_type === params.type);
    }

    // Sort by last activity (newest first), pinned first
    result.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.last_activity) - new Date(a.last_activity);
    });

    const skip = params.skip || 0;
    const limit = params.limit || 50;

    return {
      success: true,
      data: {
        conversations: result.slice(skip, skip + limit),
        count: result.length,
        has_more: result.length > skip + limit,
        meta: { limit, skip },
      },
    };
  }

  const qs = new URLSearchParams();
  if (params.limit) qs.append('limit', params.limit);
  if (params.skip) qs.append('skip', params.skip);
  if (params.type) qs.append('type', params.type);

  try {
    const response = await apiFetch(`${API_CHAT.CONVERSATIONS}?${qs}`, {
      method: 'GET',
      headers: getAuthHeaders({ contentType: null }),
    });

    // Check if response is OK and is JSON
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response');
    }

    return response.json();
  } catch (error) {
    console.error('[Chat API] Failed to fetch conversations:', error);
    // Return empty structure on error
    return {
      success: false,
      data: {
        conversations: [],
        count: 0,
        has_more: false,
        meta: { limit: params.limit || 50, skip: params.skip || 0 },
      },
      error: error.message,
    };
  }
}

/**
 * Get conversation details
 */
export async function getConversation(conversationId) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 100));
    const conversation = (mockConversationsCache || []).find((c) => c.conversation_id === conversationId);
    return {
      success: true,
      data: { conversation },
    };
  }

  try {
    const response = await apiFetch(API_CHAT.CONVERSATION_DETAIL(conversationId), {
      method: 'GET',
      headers: getAuthHeaders({ contentType: null }),
    });
    return response.json();
  } catch (error) {
    console.error('[Chat API] Failed to fetch conversation:', error);
    return {
      success: false,
      data: { conversation: null },
      error: error.message,
    };
  }
}

/**
 * Get messages for a conversation
 */
export async function getMessages(conversationId, params = {}) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 150));

    let messages = mockMessagesCache[conversationId] || [];

    // Filter by before/after timestamp
    if (params.before) {
      messages = messages.filter((m) => new Date(m.created_at) < new Date(params.before));
    }
    if (params.after) {
      messages = messages.filter((m) => new Date(m.created_at) > new Date(params.after));
    }

    // Sort by created_at (oldest first for display)
    messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const limit = params.limit || 50;

    return {
      success: true,
      data: {
        messages: messages.slice(-limit),
        count: messages.length,
        has_more: messages.length > limit,
        oldest_timestamp: messages[0]?.created_at,
        newest_timestamp: messages[messages.length - 1]?.created_at,
      },
    };
  }

  const qs = new URLSearchParams();
  if (params.limit) qs.append('limit', params.limit);
  if (params.before) qs.append('before', params.before);
  if (params.after) qs.append('after', params.after);

  try {
    const response = await apiFetch(`${API_CHAT.MESSAGES(conversationId)}?${qs}`, {
      method: 'GET',
      headers: getAuthHeaders({ contentType: null }),
    });

    // Check if response is OK and is JSON
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response');
    }

    return response.json();
  } catch (error) {
    console.error('[Chat API] Failed to fetch messages:', error);
    return {
      success: false,
      data: {
        messages: [],
        count: 0,
        has_more: false,
      },
      error: error.message,
    };
  }
}

/**
 * Search messages
 */
export async function searchMessages(query, conversationId = null) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));

    const results = [];
    const q = query.toLowerCase();

    Object.entries(mockMessagesCache).forEach(([convId, messages]) => {
      if (conversationId && convId !== conversationId) return;

      messages.forEach((msg) => {
        if (msg.content.toLowerCase().includes(q)) {
          const conv = (mockConversationsCache || []).find((c) => c.conversation_id === convId);
          results.push({
            ...msg,
            conversation_name: conv ? getConversationDisplayName(conv) : 'Unknown',
          });
        }
      });
    });

    return {
      success: true,
      data: {
        messages: results,
        count: results.length,
        query,
      },
    };
  }

  const qs = new URLSearchParams({ q: query });
  if (conversationId) qs.append('conversation_id', conversationId);

  try {
    const response = await apiFetch(`${API_CHAT.SEARCH}?${qs}`, {
      method: 'GET',
      headers: getAuthHeaders({ contentType: null }),
    });
    return response.json();
  } catch (error) {
    console.error('[Chat API] Failed to search messages:', error);
    return {
      success: false,
      data: {
        messages: [],
        count: 0,
        query,
      },
      error: error.message,
    };
  }
}

/**
 * Get unread counts
 */
export async function getUnreadCounts() {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 100));

    const conversations = {};
    let total = 0;

    (mockConversationsCache || []).forEach((c) => {
      if (c.unread_count > 0) {
        conversations[c.conversation_id] = c.unread_count;
        total += c.unread_count;
      }
    });

    return {
      success: true,
      data: {
        total_unread: total,
        conversations,
      },
    };
  }

  try {
    const response = await apiFetch(API_CHAT.UNREAD, {
      method: 'GET',
      headers: getAuthHeaders({ contentType: null }),
    });
    return response.json();
  } catch (error) {
    console.error('[Chat API] Failed to get unread counts:', error);
    return {
      success: false,
      data: {
        total_unread: 0,
        conversations: {},
      },
      error: error.message,
    };
  }
}

/**
 * Get user presence
 */
export async function getUserPresence(userKeys) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 50));

    const presence = {};

    // Get presence from conversations cache
    userKeys.forEach((key) => {
      let isOnline = false;
      (mockConversationsCache || []).forEach((conv) => {
        const participant = conv.participants_info?.find((p) => p.user_key === key);
        if (participant) {
          isOnline = participant.is_online;
        }
      });

      presence[key] = {
        status: isOnline ? 'online' : 'offline',
        last_seen: isOnline ? null : new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      };
    });

    return {
      success: true,
      data: { presence },
    };
  }

  try {
    const response = await apiFetch(`${API_CHAT.PRESENCE}?user_keys=${userKeys.join(',')}`, {
      method: 'GET',
      headers: getAuthHeaders({ contentType: null }),
    });
    return response.json();
  } catch (error) {
    console.error('[Chat API] Failed to get user presence:', error);
    const presence = {};
    userKeys.forEach((key) => {
      presence[key] = { status: 'offline', last_seen: null };
    });
    return {
      success: false,
      data: { presence },
      error: error.message,
    };
  }
}

/**
 * Create a new conversation
 * @param {object} data - Conversation data
 * @param {string} data.conversation_type - 'direct' or 'group'
 * @param {Array<string>} data.participants - Array of user keys
 * @param {string} [data.name] - Name for group conversations
 * @param {string} [data.description] - Description for group conversations
 */
export async function createConversation(data) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));

    const currentUser = getCurrentUserInfo();
    const currentUserKey = currentUser.user_key;

    // Ensure current user is in participants
    const participants = data.participants.includes(currentUserKey)
      ? data.participants
      : [currentUserKey, ...data.participants];

    // For direct conversations, check if one already exists
    if (data.conversation_type === 'direct' && participants.length === 2) {
      const existingConv = (mockConversationsCache || []).find((c) => {
        if (c.conversation_type !== 'direct') return false;
        const convParticipants = c.participants || [];
        return (
          convParticipants.length === 2 &&
          participants.every((p) => convParticipants.includes(p))
        );
      });

      if (existingConv) {
        return {
          success: true,
          data: { conversation: existingConv, existing: true },
        };
      }
    }

    // Build participants info
    const participantsInfo = participants.map((userKey) => {
      if (userKey === currentUserKey) {
        return currentUser;
      }
      // Try to find in existing conversations
      for (const conv of mockConversationsCache || []) {
        const participant = conv.participants_info?.find((p) => p.user_key === userKey);
        if (participant) return participant;
      }
      return {
        user_key: userKey,
        name: userKey,
        avatar_url: null,
        is_online: false,
      };
    });

    const newConversation = {
      conversation_id: `conv_${Date.now()}`,
      conversation_type: data.conversation_type,
      name: data.name || null,
      description: data.description || null,
      participants,
      participants_info: participantsInfo,
      admins: data.conversation_type === 'group' ? [currentUserKey] : [],
      last_message: null,
      unread_count: 0,
      is_muted: false,
      is_pinned: false,
      last_activity: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    // Add to cache
    if (!mockConversationsCache) {
      mockConversationsCache = [];
    }
    mockConversationsCache.unshift(newConversation);
    mockMessagesCache[newConversation.conversation_id] = [];

    return {
      success: true,
      data: { conversation: newConversation, existing: false },
    };
  }

  try {
    const response = await apiFetch(API_CHAT.CREATE_CONVERSATION, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    // Check if response is OK and is JSON
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response');
    }

    return response.json();
  } catch (error) {
    console.error('[Chat API] Failed to create conversation:', error);
    return {
      success: false,
      data: { conversation: null },
      error: error.message,
    };
  }
}

// ============================================================================
// Mock Message Operations (for testing)
// ============================================================================

/**
 * Add a mock message (simulates receiving a message)
 */
export function addMockMessage(conversationId, message) {
  if (!mockMessagesCache[conversationId]) {
    mockMessagesCache[conversationId] = [];
  }

  const currentUserKey = getCurrentUserKey();
  const newMessage = {
    message_id: `msg_${Date.now()}`,
    conversation_id: conversationId,
    sender_key: message.sender_key || 'user_other',
    content: message.content,
    message_type: message.message_type || 'text',
    created_at: new Date().toISOString(),
    edited_at: null,
    reply_to: message.reply_to || null,
    reactions: [],
    status: 'delivered',
  };

  mockMessagesCache[conversationId].push(newMessage);

  // Update conversation last message
  const conv = (mockConversationsCache || []).find((c) => c.conversation_id === conversationId);
  if (conv) {
    conv.last_message = {
      content: newMessage.content,
      sender_key: newMessage.sender_key,
      created_at: newMessage.created_at,
    };
    conv.last_activity = newMessage.created_at;
    if (newMessage.sender_key !== currentUserKey) {
      conv.unread_count++;
    }
  }

  return newMessage;
}

/**
 * Send a mock message (simulates sending)
 */
export function sendMockMessage(conversationId, content, replyTo = null) {
  const currentUserKey = getCurrentUserKey();
  const message = addMockMessage(conversationId, {
    sender_key: currentUserKey,
    content,
    reply_to: replyTo,
  });
  message.status = 'sent';
  return message;
}

/**
 * Mark conversation as read (mock)
 */
export function markConversationRead(conversationId) {
  const currentUserKey = getCurrentUserKey();
  const conv = (mockConversationsCache || []).find((c) => c.conversation_id === conversationId);
  if (conv) {
    conv.unread_count = 0;
  }

  const messages = mockMessagesCache[conversationId] || [];
  messages.forEach((m) => {
    if (m.sender_key !== currentUserKey) {
      m.status = 'read';
    }
  });
}

// ============================================================================
// Export
// ============================================================================

const chatApi = {
  listConversations,
  getConversation,
  getMessages,
  searchMessages,
  getUnreadCounts,
  getUserPresence,
  getConversationDisplayName,
  getConversationAvatar,
  isOtherUserOnline,
  getOtherUserLastSeen,
  getCurrentUserKey,
  getCurrentUserInfo,
  generateMockConversations,
  addMockMessage,
  sendMockMessage,
  markConversationRead,
  createConversation,
};

export default chatApi;

