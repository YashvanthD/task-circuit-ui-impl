/**
 * MessageList Component
 * List of messages with date separators and auto-scroll.
 *
 * @module components/chat/MessageList
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { Box, Typography, Chip, CircularProgress } from '@mui/material';
import { format, isToday, isYesterday, isThisYear } from 'date-fns';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { getUsersSync } from '../../utils/cache/usersCache';

// ============================================================================
// Helper Functions
// ============================================================================

function formatDateSeparator(dateString) {
  const date = new Date(dateString);

  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisYear(date)) return format(date, 'EEEE, MMMM d');
  return format(date, 'MMMM d, yyyy');
}

function getDateKey(dateString) {
  return format(new Date(dateString), 'yyyy-MM-dd');
}

function groupMessagesByDate(messages) {
  const groups = [];
  let currentDate = null;

  messages.forEach((message) => {
    const dateKey = getDateKey(message.created_at);

    if (dateKey !== currentDate) {
      currentDate = dateKey;
      groups.push({
        type: 'date',
        key: dateKey,
        label: formatDateSeparator(message.created_at),
      });
    }

    groups.push({
      type: 'message',
      key: message.message_id,
      message,
    });
  });

  return groups;
}

// ============================================================================
// Date Separator
// ============================================================================

function DateSeparator({ label }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        my: 2,
      }}
    >
      <Chip
        label={label}
        size="small"
        sx={{
          bgcolor: 'action.hover',
          fontSize: '0.7rem',
          fontWeight: 500,
        }}
      />
    </Box>
  );
}

// ============================================================================
// Component
// ============================================================================

export default function MessageList({
  messages = [],
  currentUserId,
  participants = [],
  typingUsers = [],
  loading = false,
  hasMore = false,
  onLoadMore,
  onReply,
  onEdit,
  onDelete,
  onReaction,
}) {
  const listRef = useRef(null);
  const bottomRef = useRef(null);
  const prevMessagesLength = useRef(messages.length);

  // Group messages by date
  const groupedItems = useMemo(() => {
    return groupMessagesByDate(messages);
  }, [messages]);

  // Helper to check if a string looks like a userKey (numeric or UUID-like)
  const looksLikeUserKey = (str) => {
    if (!str) return true;
    return /^\d+$/.test(str) || /^[a-f0-9-]{20,}$/i.test(str);
  };

  // Get participant name by key
  const getParticipantName = (userKey) => {
    const participant = participants.find((p) => p.user_key === userKey);

    // If participant has a real name (not a userKey), use it
    if (participant?.name && !looksLikeUserKey(participant.name)) {
      return participant.name;
    }

    // Try to get from users cache
    try {
      const users = getUsersSync() || [];
      const user = users.find((u) => (u.user_key || u.id) === userKey);
      if (user) {
        const name = user.name || user.username;
        if (name && !looksLikeUserKey(name)) {
          return name;
        }
      }
    } catch (e) {
      // users cache not available
    }

    return participant?.name || userKey;
  };

  // Get message by ID (for reply preview)
  const getMessageById = (messageId) => {
    return messages.find((m) => m.message_id === messageId);
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length]);

  // Initial scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, []);

  // Handle scroll for loading more
  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    if (scrollTop === 0 && hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  };

  return (
    <Box
      ref={listRef}
      onScroll={handleScroll}
      sx={{
        flex: 1,
        overflowY: 'auto',
        px: 2,
        py: 1,
        display: 'flex',
        flexDirection: 'column',
        scrollBehavior: 'smooth',
      }}
    >
      {/* Load more indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* Empty state */}
      {!loading && messages.length === 0 && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography color="text.secondary" variant="body2">
            No messages yet. Start the conversation!
          </Typography>
        </Box>
      )}

      {/* Messages */}
      {groupedItems.map((item) => {
        if (item.type === 'date') {
          return <DateSeparator key={item.key} label={item.label} />;
        }

        const { message } = item;
        const isOwn = message.sender_key === currentUserId;
        const showSender = !isOwn && participants.length > 2; // Group chat

        return (
          <MessageBubble
            key={message.message_id}
            message={message}
            isOwn={isOwn}
            showSender={showSender}
            senderName={getParticipantName(message.sender_key)}
            replyToMessage={message.reply_to ? getMessageById(message.reply_to) : null}
            onReply={onReply}
            onEdit={isOwn ? onEdit : undefined}
            onDelete={isOwn ? onDelete : undefined}
            onReaction={onReaction}
            onCopy={() => {}}
          />
        );
      })}

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <TypingIndicator
          users={typingUsers.map(getParticipantName)}
        />
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </Box>
  );
}

