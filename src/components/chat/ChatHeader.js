/**
 * ChatHeader Component
 * Header for chat window with user info and actions.
 *
 * @module components/chat/ChatHeader
 */

import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  Call as CallIcon,
  Videocam as VideoIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import OnlineStatus from './OnlineStatus';

// ============================================================================
// Component
// ============================================================================

export default function ChatHeader({
  conversation,
  displayName,
  avatarUrl,
  isOnline = false,
  participantsCount = 0,
  onBack,
  onSearch,
  onMore,
}) {
  const isGroup = conversation?.conversation_type === 'group';

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

  // Subtitle based on conversation type
  const getSubtitle = () => {
    if (isGroup) {
      return `${participantsCount} members`;
    }
    return isOnline ? 'Online' : 'Offline';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {/* Left: Back button, Avatar, Name */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {/* Back button (for mobile) */}
        {onBack && (
          <IconButton onClick={onBack} size="small" sx={{ mr: 0.5 }}>
            <BackIcon />
          </IconButton>
        )}

        {/* Avatar with online badge */}
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            !isGroup && isOnline ? (
              <OnlineStatus isOnline={true} size={10} showTooltip={false} />
            ) : null
          }
        >
          <Avatar
            src={avatarUrl}
            sx={{
              width: 44,
              height: 44,
              bgcolor: isGroup ? 'secondary.main' : 'primary.main',
            }}
          >
            {isGroup ? <GroupIcon /> : getInitials(displayName)}
          </Avatar>
        </Badge>

        {/* Name and status */}
        <Box>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {displayName}
          </Typography>
          <Typography
            variant="caption"
            color={isOnline && !isGroup ? 'success.main' : 'text.secondary'}
          >
            {getSubtitle()}
          </Typography>
        </Box>
      </Box>

      {/* Right: Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="Voice call">
          <IconButton size="small">
            <CallIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Video call">
          <IconButton size="small">
            <VideoIcon />
          </IconButton>
        </Tooltip>
        {onSearch && (
          <Tooltip title="Search in chat">
            <IconButton size="small" onClick={onSearch}>
              <SearchIcon />
            </IconButton>
          </Tooltip>
        )}
        {onMore && (
          <Tooltip title="More options">
            <IconButton size="small" onClick={onMore}>
              <MoreIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}

