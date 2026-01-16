/**
 * ConversationItem Component
 * Single conversation row in the list.
 *
 * @module components/chat/ConversationItem
 */

import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Badge,
  ListItemButton,
} from '@mui/material';
import {
  Group as GroupIcon,
  PushPin as PinIcon,
  VolumeOff as MutedIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import OnlineStatus from './OnlineStatus';

// ============================================================================
// Helper Functions
// ============================================================================

function formatLastMessageTime(dateString) {
  if (!dateString) return '';
  return formatDistanceToNow(new Date(dateString), { addSuffix: false })
    .replace('about ', '')
    .replace(' minutes', 'm')
    .replace(' minute', 'm')
    .replace(' hours', 'h')
    .replace(' hour', 'h')
    .replace(' days', 'd')
    .replace(' day', 'd')
    .replace('less than a minute', 'now');
}

function truncateMessage(message, maxLength = 40) {
  if (!message) return '';
  if (message.length <= maxLength) return message;
  return message.slice(0, maxLength) + '...';
}

// ============================================================================
// Component
// ============================================================================

export default function ConversationItem({
  conversation,
  displayName,
  avatarUrl,
  isOnline = false,
  isSelected = false,
  onClick,
}) {
  const {
    conversation_type,
    last_message,
    unread_count = 0,
    is_pinned,
    is_muted,
  } = conversation;

  const isGroup = conversation_type === 'group';

  // Get initials for avatar
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
    <ListItemButton
      onClick={onClick}
      selected={isSelected}
      sx={{
        py: 1.5,
        px: 2,
        borderRadius: 2,
        mx: 1,
        mb: 0.5,
        '&.Mui-selected': {
          bgcolor: 'primary.lighter',
          '&:hover': {
            bgcolor: 'primary.light',
          },
        },
      }}
    >
      {/* Avatar with online/unread badge */}
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          !isGroup && isOnline ? (
            <OnlineStatus isOnline={true} size={10} showTooltip={false} />
          ) : null
        }
      >
        <Badge
          badgeContent={unread_count}
          color="primary"
          max={99}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          invisible={unread_count === 0}
        >
          <Avatar
            src={avatarUrl}
            sx={{
              width: 50,
              height: 50,
              bgcolor: isGroup ? 'secondary.main' : 'primary.main',
            }}
          >
            {isGroup ? <GroupIcon /> : getInitials(displayName)}
          </Avatar>
        </Badge>
      </Badge>

      {/* Content */}
      <Box sx={{ ml: 2, flex: 1, minWidth: 0 }}>
        {/* Name and time */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            variant="subtitle2"
            fontWeight={unread_count > 0 ? 700 : 500}
            noWrap
            sx={{ flex: 1, mr: 1 }}
          >
            {displayName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {is_pinned && <PinIcon sx={{ fontSize: 14, color: 'text.secondary' }} />}
            {is_muted && <MutedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />}
            <Typography variant="caption" color="text.secondary">
              {formatLastMessageTime(last_message?.created_at)}
            </Typography>
          </Box>
        </Box>

        {/* Last message preview */}
        <Typography
          variant="body2"
          color={unread_count > 0 ? 'text.primary' : 'text.secondary'}
          fontWeight={unread_count > 0 ? 500 : 400}
          noWrap
          sx={{ mt: 0.25 }}
        >
          {truncateMessage(last_message?.content) || 'No messages yet'}
        </Typography>
      </Box>
    </ListItemButton>
  );
}

