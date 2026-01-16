/**
 * ChatWindow Component
 * Main chat window with messages and input.
 *
 * @module components/chat/ChatWindow
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import {
  getConversationDisplayName,
  getConversationAvatar,
  isOtherUserOnline,
  getCurrentUserKey,
} from '../../api/chat';
import {
  getMessagesForConversation,
  getMessagesSync,
  isMessagesLoading,
  onMessagesChange,
  sendMessage,
  markConversationAsRead,
  startTyping,
  stopTyping,
  getTypingUsers,
  addReaction,
  onConversationsChange,
} from '../../utils/cache/chatCache';

// ============================================================================
// Empty State Component
// ============================================================================

function EmptyState() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        bgcolor: 'grey.50',
        p: 4,
      }}
    >
      <ChatIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Select a conversation
      </Typography>
      <Typography variant="body2" color="text.disabled" textAlign="center">
        Choose a conversation from the list to start messaging
      </Typography>
    </Box>
  );
}

// ============================================================================
// Component
// ============================================================================

export default function ChatWindow({
  conversation,
  currentUserId,
  onBack,
}) {
  // Use provided currentUserId or get from session
  const effectiveUserId = currentUserId || getCurrentUserKey();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);

  const conversationId = conversation?.conversation_id;

  // Load messages when conversation changes
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    // Get sync data first
    setMessages(getMessagesSync(conversationId));
    setLoading(isMessagesLoading(conversationId));

    // Subscribe to message updates
    const unsubMessages = onMessagesChange(conversationId, 'updated', (data) => {
      setMessages([...data]);
    });

    const unsubLoading = onMessagesChange(conversationId, 'loading', (val) => {
      setLoading(val);
    });

    // Subscribe to typing updates
    const unsubTyping = onConversationsChange('typing', (data) => {
      if (data.conversation_id === conversationId) {
        setTypingUsers(data.users.filter((u) => u !== effectiveUserId));
      }
    });

    // Fetch messages
    getMessagesForConversation(conversationId);

    // Mark as read
    markConversationAsRead(conversationId);

    return () => {
      unsubMessages();
      unsubLoading();
      unsubTyping();
    };
  }, [conversationId, effectiveUserId]);

  // Handlers
  const handleSend = useCallback((content, replyToId) => {
    if (!conversationId) return;
    sendMessage(conversationId, content, replyToId);
    setReplyTo(null);
  }, [conversationId]);

  const handleReply = useCallback((message) => {
    setReplyTo({
      message_id: message.message_id,
      content: message.content,
      sender_name: message.sender_key === effectiveUserId ? 'yourself' :
        conversation?.participants_info?.find((p) => p.user_key === message.sender_key)?.name || 'User',
    });
  }, [effectiveUserId, conversation]);

  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  const handleTypingStart = useCallback(() => {
    if (conversationId) {
      startTyping(conversationId);
    }
  }, [conversationId]);

  const handleTypingStop = useCallback(() => {
    if (conversationId) {
      stopTyping(conversationId);
    }
  }, [conversationId]);

  const handleReaction = useCallback((messageId, emoji) => {
    if (conversationId) {
      addReaction(conversationId, messageId, emoji);
    }
  }, [conversationId]);

  const handleEdit = useCallback((message) => {
    // TODO: Implement edit dialog
    console.log('Edit message:', message);
  }, []);

  const handleDelete = useCallback((messageId) => {
    // TODO: Implement delete confirmation
    console.log('Delete message:', messageId);
  }, []);

  // No conversation selected
  if (!conversation) {
    return <EmptyState />;
  }

  const displayName = getConversationDisplayName(conversation, effectiveUserId);
  const avatarUrl = getConversationAvatar(conversation, effectiveUserId);
  const isOnline = isOtherUserOnline(conversation, effectiveUserId);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.default',
      }}
    >
      {/* Header */}
      <ChatHeader
        conversation={conversation}
        displayName={displayName}
        avatarUrl={avatarUrl}
        isOnline={isOnline}
        participantsCount={conversation.participants?.length || 0}
        onBack={onBack}
      />

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={effectiveUserId}
        participants={conversation.participants_info || []}
        typingUsers={typingUsers}
        loading={loading}
        onReply={handleReply}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReaction={handleReaction}
      />

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        replyTo={replyTo}
        onCancelReply={handleCancelReply}
      />
    </Box>
  );
}

