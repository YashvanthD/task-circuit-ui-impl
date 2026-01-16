/**
 * NotificationsPage
 * Full page view for all notifications with search and date separators.
 *
 * @module pages/user/NotificationsPage
 */

import React, { useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
  Divider,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  DoneAll as MarkAllReadIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { NotificationCard } from '../../components/notifications';
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
import { format, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format date for group header
 */
function formatDateHeader(dateString) {
  const date = new Date(dateString);

  if (isToday(date)) {
    return 'Today';
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  if (isThisWeek(date)) {
    return format(date, 'EEEE'); // Day name (Monday, Tuesday, etc.)
  }
  if (isThisYear(date)) {
    return format(date, 'MMMM d'); // January 15
  }
  return format(date, 'MMMM d, yyyy'); // January 15, 2025
}

/**
 * Get date key for grouping (YYYY-MM-DD)
 */
function getDateKey(dateString) {
  return format(new Date(dateString), 'yyyy-MM-dd');
}

/**
 * Group notifications by date
 */
function groupNotificationsByDate(notifications) {
  const groups = {};

  notifications.forEach((notification) => {
    const dateKey = getDateKey(notification.created_at);
    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: notification.created_at,
        label: formatDateHeader(notification.created_at),
        notifications: [],
      };
    }
    groups[dateKey].notifications.push(notification);
  });

  // Convert to array and sort by date (newest first)
  return Object.values(groups).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
}

// ============================================================================
// Date Separator Component
// ============================================================================

function DateSeparator({ label, count }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        my: 2,
        position: 'sticky',
        top: 0,
        bgcolor: 'background.default',
        py: 1,
        zIndex: 1,
      }}
    >
      <Divider sx={{ flex: 1 }} />
      <Chip
        label={`${label} (${count})`}
        size="small"
        sx={{
          bgcolor: 'action.hover',
          fontWeight: 500,
          fontSize: '0.75rem',
        }}
      />
      <Divider sx={{ flex: 1 }} />
    </Box>
  );
}

// ============================================================================
// Component
// ============================================================================

export default function NotificationsPage() {
  const navigate = useNavigate();

  // Local state synced with cache
  const [notifications, setNotifications] = React.useState(getNotificationsSync);
  const [loading, setLoading] = React.useState(isNotificationsLoading);
  const [error, setError] = React.useState(getNotificationsError);
  const [filter, setFilter] = React.useState('all'); // 'all', 'unread'
  const [searchQuery, setSearchQuery] = React.useState('');

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

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    let result = notifications;

    // Apply filter
    if (filter === 'unread') {
      result = result.filter((n) => !n.read);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((n) =>
        n.title?.toLowerCase().includes(query) ||
        n.message?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [notifications, filter, searchQuery]);

  // Group by date
  const groupedNotifications = useMemo(() => {
    return groupNotificationsByDate(filteredNotifications);
  }, [filteredNotifications]);

  // Unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

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

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleFilterChange = (event, newValue) => {
    setFilter(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: 800,
        mx: 'auto',
        // Smooth scrolling for the entire page
        '& *': {
          scrollBehavior: 'smooth',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: 'primary.lighter',
                color: 'primary.main',
              }}
            >
              <NotificationsIcon />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <Button
                size="small"
                startIcon={<MarkAllReadIcon />}
                onClick={handleMarkAllAsRead}
                sx={{ textTransform: 'none' }}
              >
                Mark all read
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Search Bar */}
      <Paper
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <TextField
          fullWidth
          placeholder="Search notifications by title or content..."
          value={searchQuery}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              '& fieldset': { border: 'none' },
            },
          }}
          sx={{ '& .MuiOutlinedInput-root': { py: 0.5 } }}
        />
      </Paper>

      {/* Filter Tabs */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Tabs
          value={filter}
          onChange={handleFilterChange}
          sx={{ px: 2 }}
          TabIndicatorProps={{ sx: { height: 3 } }}
        >
          <Tab
            label={`All (${notifications.length})`}
            value="all"
            sx={{ textTransform: 'none', fontWeight: 500 }}
          />
          <Tab
            label={`Unread (${unreadCount})`}
            value="unread"
            sx={{ textTransform: 'none', fontWeight: 500 }}
          />
        </Tabs>
      </Paper>

      {/* Search results info */}
      {searchQuery && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {filteredNotifications.length} result{filteredNotifications.length !== 1 ? 's' : ''} for "{searchQuery}"
          </Typography>
        </Box>
      )}

      {/* Loading state */}
      {loading && notifications.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error state */}
      {error && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'error.light',
            bgcolor: 'error.lighter',
          }}
        >
          <Typography color="error" variant="body1" gutterBottom>
            Failed to load notifications
          </Typography>
          <Button onClick={handleRefresh} variant="outlined" color="error" sx={{ mt: 2 }}>
            Retry
          </Button>
        </Paper>
      )}

      {/* Empty state */}
      {!loading && !error && filteredNotifications.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <NotificationsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchQuery
              ? 'No matching notifications'
              : filter === 'unread'
              ? 'No unread notifications'
              : 'No notifications yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery
              ? 'Try a different search term.'
              : filter === 'unread'
              ? "You're all caught up!"
              : 'Notifications will appear here when you receive them.'}
          </Typography>
          {searchQuery && (
            <Button onClick={handleClearSearch} sx={{ mt: 2 }}>
              Clear search
            </Button>
          )}
        </Paper>
      )}

      {/* Notification list grouped by date */}
      {!error && groupedNotifications.length > 0 && (
        <Box
          sx={{
            // Enable smooth scrolling
            scrollBehavior: 'smooth',
          }}
        >
          {groupedNotifications.map((group) => (
            <Box key={group.label}>
              <DateSeparator label={group.label} count={group.notifications.length} />
              {group.notifications.map((notification) => (
                <NotificationCard
                  key={notification.notification_id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  onAction={handleAction}
                  compact={false}
                />
              ))}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

