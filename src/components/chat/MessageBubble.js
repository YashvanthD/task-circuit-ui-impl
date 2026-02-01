/**
 * MessageBubble Component
 * Single chat message bubble with proper sender/receiver differentiation.
 * Based on Chat Message Sender/Receiver Differentiation Guide.
 *
 * @module components/chat/MessageBubble
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Reply as ReplyIcon,
  ContentCopy as CopyIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import {getMessageStatus} from "../../utils/chat";

// ============================================================================
// Helper Functions
// ============================================================================

function formatMessageTime(dateString) {
  const date = new Date(dateString);
  return format(date, 'h:mm a');
}

function getStatusIcon(status) {
  // WhatsApp style: grey ticks for sent/delivered, blue ticks for read
  switch (status) {
    case 'sending':
      return <ScheduleIcon sx={{ fontSize: 14, color: 'rgba(0,0,0,0.4)' }} />;
    case 'sent':
      return <DoneIcon sx={{ fontSize: 14, color: 'rgba(0,0,0,0.4)' }} />;
    case 'delivered':
      return <DoneAllIcon sx={{ fontSize: 14, color: 'rgba(0,0,0,0.4)' }} />;
    case 'read':
      return <DoneAllIcon sx={{ fontSize: 14, color: '#53bdeb' }} />; // WhatsApp blue tick
    case 'failed':
      return <ScheduleIcon sx={{ fontSize: 14, color: '#f44336' }} />;
    default:
      return null;
  }
}

// ============================================================================
// Component
// ============================================================================

export default function MessageBubble({
  message,
  isOwn = false,
  showSender = false,
  senderName = '',
  replyToMessage = null,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  onCopy,
}) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const {
    message_id,
    content,
    created_at,
    edited_at,
    status,
    reactions = [],
    delivered_at,
    read_at,
    is_delivered,
    is_read,
  } = message;

  // Use utility to determine effective status
  // Handles: read_at > delivered_at > status > sent/sending
  const effectiveStatus = getMessageStatus(message, isOwn);

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    onCopy?.(message_id);
    handleMenuClose();
  };

  const handleReply = () => {
    onReply?.(message);
    handleMenuClose();
  };

  const handleEdit = () => {
    onEdit?.(message);
    handleMenuClose();
  };

  const handleDeleteForMe = () => {
    onDelete?.(message_id, false);
    handleMenuClose();
  };

  const handleDeleteForEveryone = () => {
    onDelete?.(message_id, true);
    handleMenuClose();
  };

  const handleReactionClick = (emoji) => {
    onReaction?.(message_id, emoji);
  };

  // Quick reactions
  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOwn ? 'flex-end' : 'flex-start',
        mb: 1,
        position: 'relative',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sender name for group chats */}
      {showSender && !isOwn && (
        <Typography
          variant="caption"
          color="primary"
          sx={{ ml: 1.5, mb: 0.25, fontWeight: 500 }}
        >
          {senderName}
        </Typography>
      )}

      {/* Reply preview */}
      {replyToMessage && (
        <Box
          sx={{
            bgcolor: isOwn ? 'primary.dark' : 'action.hover',
            borderRadius: 1,
            px: 1.5,
            py: 0.5,
            mb: 0.5,
            maxWidth: '80%',
            borderLeft: '3px solid',
            borderColor: 'primary.main',
          }}
        >
          <Typography variant="caption" color="text.secondary" noWrap>
            {replyToMessage.content}
          </Typography>
        </Box>
      )}

      {/* Message bubble wrapper - contains bubble and actions */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          flexDirection: isOwn ? 'row-reverse' : 'row',
          position: 'relative',
          maxWidth: '85%',
        }}
      >
        {/* Message content */}
        <Box
          sx={{
            // WhatsApp style colors - green for own messages, white/light for others
            bgcolor: isOwn ? '#dcf8c6' : '#ffffff', // Light theme
            color: '#303030', // Dark text for both
            borderRadius: 2,
            borderTopRightRadius: isOwn ? 4 : 16,
            borderTopLeftRadius: isOwn ? 16 : 4,
            px: 2,
            py: 1,
            maxWidth: '100%',
            minWidth: 80,
            position: 'relative',
            flexShrink: 0,
            boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
            // Dark theme overrides
            '.MuiBox-root[data-theme="dark"] &, [data-mui-color-scheme="dark"] &': {
              bgcolor: isOwn ? '#005c4b' : '#202c33',
              color: '#e9edef',
            },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {content}
          </Typography>

          {/* Time and status */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 0.5,
              mt: 0.5,
            }}
          >
            {edited_at && (
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(0,0,0,0.45)',
                  fontSize: '0.65rem',
                  '.MuiBox-root[data-theme="dark"] &, [data-mui-color-scheme="dark"] &': {
                    color: 'rgba(255,255,255,0.6)',
                  },
                }}
              >
                edited
              </Typography>
            )}
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(0,0,0,0.45)',
                fontSize: '0.65rem',
                '.MuiBox-root[data-theme="dark"] &, [data-mui-color-scheme="dark"] &': {
                  color: 'rgba(255,255,255,0.6)',
                },
              }}
            >
              {formatMessageTime(created_at)}
            </Typography>
            {isOwn && getStatusIcon(effectiveStatus)}
          </Box>
        </Box>

        {/* Actions - absolute positioned to prevent layout shift */}
        <Box
          sx={{
            display: 'flex',
            gap: 0.25,
            opacity: isHovered ? 1 : 0,
            visibility: isHovered ? 'visible' : 'hidden',
            transition: 'opacity 0.15s ease-in-out',
            position: 'absolute',
            [isOwn ? 'left' : 'right']: isOwn ? 'auto' : 'auto',
            [isOwn ? 'right' : 'left']: '100%',
            mx: 0.5,
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 1,
            p: 0.25,
          }}
        >
          <Tooltip title="React">
            <IconButton
              size="small"
              onClick={() => handleReactionClick('👍')}
              sx={{
                p: 0.5,
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <span style={{ fontSize: 14 }}>👍</span>
            </IconButton>
          </Tooltip>
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{
              p: 0.5,
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <MoreIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Reactions */}
      {reactions.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            mt: 0.5,
            ml: isOwn ? 0 : 1.5,
            mr: isOwn ? 1.5 : 0,
          }}
        >
          {reactions.map((reaction, idx) => (
            <Chip
              key={idx}
              label={`${reaction.emoji} ${reaction.users.length}`}
              size="small"
              onClick={() => handleReactionClick(reaction.emoji)}
              sx={{
                height: 24,
                fontSize: '0.75rem',
                bgcolor: 'action.hover',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.selected' },
              }}
            />
          ))}
        </Box>
      )}

      {/* Context menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: isOwn ? 'left' : 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: isOwn ? 'right' : 'left' }}
      >
        {/* Quick reactions */}
        <Box sx={{ display: 'flex', gap: 0.5, px: 1, py: 0.5 }}>
          {quickReactions.map((emoji) => (
            <IconButton
              key={emoji}
              size="small"
              onClick={() => {
                handleReactionClick(emoji);
                handleMenuClose();
              }}
            >
              <span style={{ fontSize: 18 }}>{emoji}</span>
            </IconButton>
          ))}
        </Box>
        <MenuItem onClick={handleReply}>
          <ListItemIcon><ReplyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Reply</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCopy}>
          <ListItemIcon><CopyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Copy</ListItemText>
        </MenuItem>
        {isOwn && (
          <MenuItem onClick={handleEdit}>
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}
        {isOwn && (
          <MenuItem onClick={handleDeleteForMe}>
            <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Delete for me</ListItemText>
          </MenuItem>
        )}
        {isOwn && (
          <MenuItem onClick={handleDeleteForEveryone} sx={{ color: 'error.main' }}>
            <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>Delete for everyone</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}

