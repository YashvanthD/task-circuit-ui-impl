/**
 * ChatHeader Component
 * Header for chat window with user info and actions.
 *
 * @module components/chat/ChatHeader
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  Call as CallIcon,
  Videocam as VideoIcon,
  Group as GroupIcon,
  PushPin as PinIcon,
  PushPinOutlined as UnpinIcon,
  VolumeOff as MuteIcon,
  VolumeUp as UnmuteIcon,
  CleaningServices as ClearIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  Info as InfoIcon,
  NotificationsOff as NotificationsOffIcon,
} from '@mui/icons-material';
import OnlineStatus from './OnlineStatus';
import { formatDistanceToNow } from 'date-fns';

// ============================================================================
// Component
// ============================================================================

export default function ChatHeader({
  conversation,
  displayName,
  avatarUrl,
  isOnline = false,
  lastSeen = null,
  participantsCount = 0,
  onBack,
  onSearch,
  onPinConversation,
  onMuteConversation,
  onClearChat,
  onDeleteConversation,
  onBlockUser,
  onViewInfo,
}) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const isGroup = conversation?.conversation_type === 'group';
  const isPinned = conversation?.is_pinned || false;
  const isMuted = conversation?.is_muted || false;

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

  // Format last seen time
  const formatLastSeen = (dateString) => {
    if (!dateString) return 'Offline';
    try {
      const date = new Date(dateString);
      return `Last seen ${formatDistanceToNow(date, { addSuffix: true })}`;
    } catch {
      return 'Offline';
    }
  };

  // Subtitle based on conversation type and online status
  const getSubtitle = () => {
    if (isGroup) {
      return `${participantsCount} members`;
    }
    if (isOnline) {
      return 'Online';
    }
    return formatLastSeen(lastSeen);
  };

  const handleMenuOpen = (e) => {
    setMenuAnchor(e.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handlePin = () => {
    onPinConversation?.(!isPinned);
    handleMenuClose();
  };

  const handleMute = () => {
    onMuteConversation?.(!isMuted);
    handleMenuClose();
  };

  const handleClearChat = () => {
    onClearChat?.();
    handleMenuClose();
  };

  const handleDelete = () => {
    onDeleteConversation?.();
    handleMenuClose();
  };

  const handleBlock = () => {
    onBlockUser?.();
    handleMenuClose();
  };

  const handleViewInfo = () => {
    onViewInfo?.();
    handleMenuClose();
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {displayName}
            </Typography>
            {isPinned && (
              <PinIcon sx={{ fontSize: 14, color: 'primary.main', transform: 'rotate(45deg)' }} />
            )}
            {isMuted && (
              <NotificationsOffIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            )}
          </Box>
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
        <Tooltip title="More options">
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Settings Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: { sx: { minWidth: 200 } },
        }}
      >
        <MenuItem onClick={handleViewInfo}>
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View info</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handlePin}>
          <ListItemIcon>
            {isPinned ? <UnpinIcon fontSize="small" /> : <PinIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{isPinned ? 'Unpin chat' : 'Pin chat'}</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleMute}>
          <ListItemIcon>
            {isMuted ? <UnmuteIcon fontSize="small" /> : <MuteIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{isMuted ? 'Unmute notifications' : 'Mute notifications'}</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleClearChat}>
          <ListItemIcon>
            <ClearIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Clear chat</ListItemText>
        </MenuItem>

        {!isGroup && (
          <MenuItem onClick={handleBlock} sx={{ color: 'warning.main' }}>
            <ListItemIcon>
              <BlockIcon fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText>Block user</ListItemText>
          </MenuItem>
        )}

        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete conversation</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}

