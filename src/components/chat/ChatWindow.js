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
  getOtherUserLastSeen,
} from '../../api/chat';
import {
  getMessagesForConversation,
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
  startTyping,
  stopTyping,
  getTypingUsers,
  addReaction,
  onConversationsChange,
  trackConversationOpen,
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

    // Get cached messages first
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

    // Join room and load messages via trackConversationOpen
    trackConversationOpen(conversationId);

    // Mark as read
    markConversationAsRead(conversationId);

    return () => {
      unsubMessages();
      unsubLoading();
      unsubTyping();
    };
  }, [conversationId, effectiveUserId]);

  // Handlers
  const handleSend = useCallback((content) => {
    if (!conversationId || !content.trim()) return;
    sendMessage(conversationId, content);
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

  const handleDelete = useCallback((messageId, forEveryone = false) => {
    if (!conversationId || !messageId) return;
    console.log('[ChatWindow] Delete message:', { conversationId, messageId, forEveryone });
    deleteMessage(conversationId, messageId, forEveryone);
  }, [conversationId]);

  // Conversation action handlers
  const handlePinConversation = useCallback((pinned) => {
    if (!conversationId) return;
    pinConversation(conversationId, pinned);
  }, [conversationId]);

  const handleMuteConversation = useCallback((muted) => {
    if (!conversationId) return;
    muteConversation(conversationId, muted);
  }, [conversationId]);

  const handleClearChat = useCallback(() => {
    if (!conversationId) return;
    if (window.confirm('Are you sure you want to clear all messages? This cannot be undone.')) {
      clearConversation(conversationId, false);
    }
  }, [conversationId]);

  const handleDeleteConversation = useCallback(() => {
    if (!conversationId) return;
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation(conversationId);
      onBack?.();
    }
  }, [conversationId, onBack]);

  const handleBlockUser = useCallback(() => {
    // TODO: Implement block user
    console.log('Block user');
  }, []);

  const handleViewInfo = useCallback(() => {
    // TODO: Implement view conversation info
    console.log('View conversation info');
  }, []);

  // No conversation selected
  if (!conversation) {
    return <EmptyState />;
  }

  const displayName = getConversationDisplayName(conversation, effectiveUserId);
  const avatarUrl = getConversationAvatar(conversation, effectiveUserId);
  const isOnline = isOtherUserOnline(conversation, effectiveUserId);
  const lastSeen = getOtherUserLastSeen(conversation, effectiveUserId);

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
        lastSeen={lastSeen}
        participantsCount={conversation.participants?.length || 0}
        onBack={onBack}
        onPinConversation={handlePinConversation}
        onMuteConversation={handleMuteConversation}
        onClearChat={handleClearChat}
        onDeleteConversation={handleDeleteConversation}
        onBlockUser={handleBlockUser}
        onViewInfo={handleViewInfo}
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

