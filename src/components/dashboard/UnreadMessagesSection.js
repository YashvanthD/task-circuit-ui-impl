/**
 * UnreadMessagesSection Component
 * Dashboard section for displaying unread chat messages.
 *
 * @module components/dashboard/UnreadMessagesSection
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Skeleton,
  Chip,
} from '@mui/material';
import {
  Chat as ChatIcon,
  ArrowForward as ArrowForwardIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import {
  getConversations,
  getConversationsSync,
  getUnreadConversations,
  getTotalUnreadCount,
  onConversationsChange,
  subscribeToChatWebSocket,
  isWebSocketConnected,
} from '../../utils/cache/chatCache';
import { getConversationDisplayName, getCurrentUserKey } from '../../api/chat';

// ============================================================================
// Helper Functions
// ============================================================================

function formatLastMessageTime(dateString) {
  if (!dateString) return '';
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return '';
  }
}

function truncateMessage(message, maxLength = 50) {
  if (!message) return '';
  if (message.length <= maxLength) return message;
  return message.slice(0, maxLength) + '...';
}

// ============================================================================
// Unread Message Item Component
// ============================================================================

function UnreadMessageItem({ conversation, currentUserId, onClick }) {
  const displayName = getConversationDisplayName(conversation, currentUserId);
  const isGroup = conversation.conversation_type === 'group';
  const lastMessage = conversation.last_message;
  const unreadCount = conversation.unread_count || 0;

  // Get avatar initials
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        onClick={() => onClick(conversation)}
        sx={{
          borderRadius: 2,
          bgcolor: 'action.hover',
          '&:hover': { bgcolor: 'action.selected' },
          py: 1,
        }}
      >
        <ListItemAvatar>
          <Badge
            badgeContent={unreadCount}
            color="primary"
            max={99}
            overlap="circular"
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Avatar
              sx={{
                bgcolor: isGroup ? 'secondary.main' : 'primary.main',
                width: 44,
                height: 44,
              }}
            >
              {isGroup ? <GroupIcon /> : getInitials(displayName)}
            </Avatar>
          </Badge>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" fontWeight={600} noWrap component="div">
                {displayName}
              </Typography>
              {isGroup && (
                <Chip label="Group" size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
              )}
            </Box>
          }
          secondary={
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                sx={{ fontWeight: unreadCount > 0 ? 600 : 400 }}
                component="div"
              >
                {lastMessage?.content ? truncateMessage(lastMessage.content) : 'No messages yet'}
              </Typography>
              <Typography variant="caption" color="text.disabled" component="span">
                {formatLastMessageTime(lastMessage?.created_at || conversation.last_activity)}
              </Typography>
            </Box>
          }
          primaryTypographyProps={{ component: 'div' }}
          secondaryTypographyProps={{ component: 'div' }}
        />
      </ListItemButton>
    </ListItem>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function LoadingSkeleton() {
  return (
    <List disablePadding>
      {[1, 2, 3].map((i) => (
        <ListItem key={i} sx={{ py: 1.5 }}>
          <ListItemAvatar>
            <Skeleton variant="circular" width={44} height={44} />
          </ListItemAvatar>
          <ListItemText
            primary={<Skeleton width="60%" />}
            secondary={<Skeleton width="80%" />}
          />
        </ListItem>
      ))}
    </List>
  );
}

// ============================================================================
// Empty State
// ============================================================================

function EmptyState() {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 4,
        color: 'text.secondary',
      }}
    >
      <ChatIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
      <Typography variant="body2">No unread messages</Typography>
      <Typography variant="caption" color="text.disabled">
        You're all caught up!
      </Typography>
    </Box>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function UnreadMessagesSection({ maxItems = 5 }) {
  const navigate = useNavigate();
  const currentUserId = getCurrentUserKey();

  // Local state synced with cache
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);

  // Subscribe to cache changes and WebSocket events
  useEffect(() => {
    console.log('[UnreadMessages] Initializing WebSocket subscription...');

    // Subscribe to WebSocket FIRST (ensures connection is established)
    subscribeToChatWebSocket();

    // Get initial data after a short delay to allow WS to connect
    const initTimer = setTimeout(() => {
      console.log('[UnreadMessages] WebSocket connected:', isWebSocketConnected());
      // Use getUnreadConversations which filters by current user and excludes cleared
      const initialConvs = getUnreadConversations() || [];
      console.log('[UnreadMessages] Initial unread conversations:', initialConvs.length);
      setConversations(initialConvs);
      setTotalUnread(getTotalUnreadCount());
      setLoading(false);

      // Force load from server if empty (to get fresh data)
      const allConvs = getConversationsSync() || [];
      if (allConvs.length === 0) {
        console.log('[UnreadMessages] No conversations, fetching from server...');
        getConversations(true);
      }
    }, 200);

    // Subscribe to cache 'updated' event
    const unsubUpdated = onConversationsChange('updated', () => {
      // Use getUnreadConversations for proper filtering
      const unreadConvs = getUnreadConversations() || [];
      const unreadCount = getTotalUnreadCount();
      console.log('[UnreadMessages] Conversations updated, unread:', unreadConvs.length, 'Total:', unreadCount);
      setConversations([...unreadConvs]);
      setTotalUnread(unreadCount);
    });

    const unsubLoading = onConversationsChange('loading', (val) => {
      setLoading(val);
    });

    // Subscribe to new message events specifically for immediate updates
    const unsubMessage = onConversationsChange('message', (msgData) => {
      console.log('[UnreadMessages] New message event received:', msgData?.conversation_id);
      // Force refresh state when new message arrives - use filtered list
      const freshConvs = getUnreadConversations() || [];
      setConversations([...freshConvs]);
      setTotalUnread(getTotalUnreadCount());
    });

    // Subscribe to conversation created events
    const unsubCreated = onConversationsChange('created', (conv) => {
      console.log('[UnreadMessages] New conversation created:', conv?.conversation_id);
      const freshConvs = getUnreadConversations() || [];
      setConversations([...freshConvs]);
      setTotalUnread(getTotalUnreadCount());
    });

    // Periodic check to ensure WebSocket stays connected (fallback)
    const wsCheckInterval = setInterval(() => {
      if (!isWebSocketConnected()) {
        console.log('[UnreadMessages] WebSocket disconnected, attempting reconnect...');
        subscribeToChatWebSocket();
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearTimeout(initTimer);
      clearInterval(wsCheckInterval);
      unsubUpdated();
      unsubLoading();
      unsubMessage();
      unsubCreated();
    };
  }, []);

  // Sort and limit conversations (already filtered by getUnreadConversations)
  const unreadConversations = useMemo(() => {
    return conversations
      .filter((conv) => (conv.unread_count || 0) > 0 && conv.last_message) // Extra safety check
      .sort((a, b) => {
        // Sort by last activity (most recent first)
        const dateA = new Date(a.last_activity || a.last_message?.created_at || 0);
        const dateB = new Date(b.last_activity || b.last_message?.created_at || 0);
        return dateB - dateA;
      })
      .slice(0, maxItems);
  }, [conversations, maxItems]);

  // Handle click on conversation
  const handleConversationClick = useCallback((conversation) => {
    navigate('/user/chat', { state: { conversationId: conversation.conversation_id } });
  }, [navigate]);

  // Handle view all
  const handleViewAll = useCallback(() => {
    navigate('/user/chat');
  }, [navigate]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        minHeight: 200,
        height: 'auto',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'info.lighter',
              color: 'info.main',
            }}
          >
            <Badge badgeContent={totalUnread} color="error" max={99}>
              <ChatIcon />
            </Badge>
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Unread Messages
            </Typography>
            {totalUnread > 0 && (
              <Typography variant="caption" color="text.secondary">
                {totalUnread} unread message{totalUnread !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>
        </Box>

        <Button
          size="small"
          endIcon={<ArrowForwardIcon />}
          onClick={handleViewAll}
          sx={{ textTransform: 'none' }}
        >
          Open Chat
        </Button>
      </Box>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : unreadConversations.length === 0 ? (
        <EmptyState />
      ) : (
        <List disablePadding>
          {unreadConversations.map((conversation) => (
            <UnreadMessageItem
              key={conversation.conversation_id}
              conversation={conversation}
              currentUserId={currentUserId}
              onClick={handleConversationClick}
            />
          ))}
        </List>
      )}
    </Paper>
  );
}

