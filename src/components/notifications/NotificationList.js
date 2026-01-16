/**
 * NotificationList Component
 * List of notifications with filters and actions.
 * Matches BE API structure.
 *
 * @module components/notifications/NotificationList
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  IconButton,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  DoneAll as MarkAllReadIcon,
} from '@mui/icons-material';
import NotificationCard from './NotificationCard';

// ============================================================================
// Component
// ============================================================================

export default function NotificationList({
  notifications = [],
  loading = false,
  error = null,
  onRefresh,
  onMarkAsRead,
  onDelete,
  onMarkAllAsRead,
  onAction,
  maxItems = null,
  showHeader = true,
  showFilters = true,
  compact = false,
  emptyMessage = 'No notifications',
}) {
  const [filter, setFilter] = useState('all'); // 'all', 'unread'

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  // Limit items if maxItems is set
  const displayNotifications = maxItems
    ? filteredNotifications.slice(0, maxItems)
    : filteredNotifications;

  // Unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handle filter change
  const handleFilterChange = (event, newValue) => {
    setFilter(newValue);
  };

  return (
    <Box>
      {/* Header */}
      {showHeader && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Box
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: '12px',
                  px: 1,
                  py: 0.25,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {unreadCount}
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {unreadCount > 0 && (
              <Tooltip title="Mark all as read">
                <Button
                  size="small"
                  startIcon={<MarkAllReadIcon />}
                  onClick={onMarkAllAsRead}
                  sx={{ textTransform: 'none' }}
                >
                  Mark all read
                </Button>
              </Tooltip>
            )}
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={onRefresh} disabled={loading}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      {/* Filter tabs */}
      {showFilters && (
        <Tabs
          value={filter}
          onChange={handleFilterChange}
          sx={{ mb: 2, minHeight: 36 }}
          TabIndicatorProps={{ sx: { height: 2 } }}
        >
          <Tab
            label="All"
            value="all"
            sx={{ minHeight: 36, py: 0.5, textTransform: 'none' }}
          />
          <Tab
            label={`Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
            value="unread"
            sx={{ minHeight: 36, py: 0.5, textTransform: 'none' }}
          />
        </Tabs>
      )}

      {/* Loading state */}
      {loading && notifications.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      )}

      {/* Error state */}
      {error && (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography color="error" variant="body2">
            Failed to load notifications
          </Typography>
          <Button size="small" onClick={onRefresh} sx={{ mt: 1 }}>
            Retry
          </Button>
        </Box>
      )}

      {/* Empty state */}
      {!loading && !error && displayNotifications.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography color="text.secondary" variant="body2">
            {filter === 'unread' ? 'No unread notifications' : emptyMessage}
          </Typography>
        </Box>
      )}

      {/* Notification cards */}
      <Box>
        {displayNotifications.map((notification) => (
          <NotificationCard
            key={notification.notification_id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
            onAction={onAction}
            compact={compact}
          />
        ))}
      </Box>

      {/* Show more indicator */}
      {maxItems && filteredNotifications.length > maxItems && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            +{filteredNotifications.length - maxItems} more notifications
          </Typography>
        </Box>
      )}
    </Box>
  );
}

