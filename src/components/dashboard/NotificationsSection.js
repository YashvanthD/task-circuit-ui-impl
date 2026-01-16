/**
 * NotificationsSection Component
 * Dashboard section for displaying notifications.
 * Matches BE API structure.
 *
 * @module components/dashboard/NotificationsSection
 */

import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Box,
  Typography,
  Button,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { NotificationList } from '../notifications';
import {
  getNotifications,
  getNotificationsSync,
  isNotificationsLoading,
  getNotificationsError,
  markNotificationAsRead,
  deleteNotification,
  markAllNotificationsAsRead,
  refreshNotifications,
  onNotificationsChange,
} from '../../utils/cache/notificationsCache';

// ============================================================================
// Component
// ============================================================================

export default function NotificationsSection({ maxItems = 5 }) {
  const navigate = useNavigate();

  // Local state synced with cache
  const [notifications, setNotifications] = React.useState(getNotificationsSync);
  const [loading, setLoading] = React.useState(isNotificationsLoading);
  const [error, setError] = React.useState(getNotificationsError);

  // Subscribe to cache changes
  useEffect(() => {
    const unsubUpdated = onNotificationsChange('updated', (data) => setNotifications(data));
    const unsubLoading = onNotificationsChange('loading', (val) => setLoading(val));
    const unsubError = onNotificationsChange('error', (err) => setError(err));

    // Initial load
    getNotifications();

    return () => {
      unsubUpdated();
      unsubLoading();
      unsubError();
    };
  }, []);

  // Handlers
  const handleRefresh = useCallback(() => {
    refreshNotifications();
  }, []);

  const handleMarkAsRead = useCallback((id) => {
    markNotificationAsRead(id);
  }, []);

  const handleDelete = useCallback((id) => {
    deleteNotification(id);
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    markAllNotificationsAsRead();
  }, []);

  const handleAction = useCallback((notification) => {
    if (notification.link) {
      navigate(notification.link);
    }
  }, [navigate]);

  const handleViewAll = useCallback(() => {
    navigate('/user/notifications');
  }, [navigate]);

  // Unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

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
              bgcolor: 'primary.lighter',
              color: 'primary.main',
            }}
          >
            <NotificationsIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Typography variant="caption" color="text.secondary">
                {unreadCount} unread
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
          View All
        </Button>
      </Box>

      {/* Notification List */}
      <NotificationList
        notifications={notifications}
        loading={loading}
        error={error}
        onRefresh={handleRefresh}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
        onMarkAllAsRead={handleMarkAllAsRead}
        onAction={handleAction}
        maxItems={maxItems}
        showHeader={false}
        showFilters={false}
        compact={true}
        emptyMessage="You're all caught up!"
      />
    </Paper>
  );
}

