/**
 * NotificationCard Component
 * Single notification card with iOS/Android style design.
 * Matches BE API structure.
 *
 * @module components/notifications/NotificationCard
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  MoreVert as MoreIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  OpenInNew as OpenIcon,
  Delete as DeleteIcon,
  Circle as UnreadIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

// ============================================================================
// Constants
// ============================================================================

const TYPE_CONFIG = {
  info: { icon: InfoIcon, color: '#2196F3', bgColor: '#E3F2FD' },
  success: { icon: SuccessIcon, color: '#4CAF50', bgColor: '#E8F5E9' },
  warning: { icon: WarningIcon, color: '#FF9800', bgColor: '#FFF3E0' },
  error: { icon: ErrorIcon, color: '#F44336', bgColor: '#FFEBEE' },
  critical: { icon: ErrorIcon, color: '#D32F2F', bgColor: '#FFCDD2' },
};

const PRIORITY_COLORS = {
  low: '#9E9E9E',
  normal: '#2196F3',
  high: '#FF9800',
};

// ============================================================================
// Component
// ============================================================================

export default function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
  onAction,
  compact = false,
}) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const {
    notification_id,
    title,
    message,
    type = 'info',
    priority = 'normal',
    read,
    link,
    data,
    created_at,
  } = notification;

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
  const TypeIcon = config.icon;

  // Format timestamp
  const timeAgo = created_at
    ? formatDistanceToNow(new Date(created_at), { addSuffix: true })
    : '';

  // Get sender info from data
  const senderName = data?.sender_name;

  // Handlers
  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleMarkAsRead = (e) => {
    e.stopPropagation();
    onMarkAsRead?.(notification_id);
    handleMenuClose();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(notification_id);
    handleMenuClose();
  };

  const handleAction = (e) => {
    e.stopPropagation();
    if (!read) {
      onMarkAsRead?.(notification_id);
    }
    onAction?.(notification);
  };

  const handleCardClick = () => {
    if (!read) {
      onMarkAsRead?.(notification_id);
    }
    if (link) {
      onAction?.(notification);
    }
  };

  return (
    <Card
      sx={{
        mb: 1.5,
        cursor: link ? 'pointer' : 'default',
        borderLeft: `4px solid ${PRIORITY_COLORS[priority]}`,
        bgcolor: read ? 'background.paper' : config.bgColor,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-1px)',
        },
      }}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent sx={{ py: compact ? 1.5 : 2, px: 2, '&:last-child': { pb: compact ? 1.5 : 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          {/* Avatar/Icon */}
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: compact ? 36 : 44,
                height: compact ? 36 : 44,
                bgcolor: config.bgColor,
                color: config.color,
              }}
            >
              <TypeIcon />
            </Avatar>
            {/* Unread indicator */}
            {!read && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: '#2196F3',
                  border: '2px solid white',
                }}
              />
            )}
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography
                variant={compact ? 'body2' : 'subtitle2'}
                fontWeight={read ? 500 : 700}
                noWrap
                sx={{ flex: 1 }}
              >
                {title}
                {senderName && (
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    from {senderName}
                  </Typography>
                )}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 1, flexShrink: 0 }}
              >
                {timeAgo}
              </Typography>
            </Box>

            {/* Message */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1,
                display: '-webkit-box',
                WebkitLineClamp: compact ? 1 : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {message}
            </Typography>

            {/* Actions - show on hover or always on mobile */}
            <Collapse in={isHovered || !compact}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                {/* Primary action button */}
                {link && (
                  <Chip
                    label="View"
                    size="small"
                    color="primary"
                    variant="outlined"
                    onClick={handleAction}
                    icon={<OpenIcon sx={{ fontSize: 16 }} />}
                    sx={{ height: 26 }}
                  />
                )}

                {/* Quick action buttons */}
                {!read && (
                  <Tooltip title="Mark as read">
                    <IconButton size="small" onClick={handleMarkAsRead}>
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

                <Tooltip title="Delete">
                  <IconButton size="small" onClick={handleDelete}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {/* More options */}
                <IconButton size="small" onClick={handleMenuOpen}>
                  <MoreIcon fontSize="small" />
                </IconButton>
              </Box>
            </Collapse>
          </Box>
        </Box>
      </CardContent>

      {/* More options menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {!read && (
          <MenuItem onClick={handleMarkAsRead}>
            <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Mark as read</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
}

