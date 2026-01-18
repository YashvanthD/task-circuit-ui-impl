/**
 * SystemAlertsSection Component
 * Displays system alerts from WebSocket (alertsCache).
 * Different from task-based AlertsSection.
 * Mobile-first responsive design.
 *
 * @module components/dashboard/SystemAlertsSection
 */

import React, { useEffect, useCallback, useState } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Stack,
  Button,
  CircularProgress,
  Box,
  IconButton,
  Tooltip,
  Chip,
  alpha,
} from '@mui/material';
import {
  Warning as AlertIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  DoneAll as AcknowledgeAllIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  getAlerts,
  getAlertsSync,
  isAlertsLoading,
  getAlertsError,
  acknowledgeAlert,
  acknowledgeAllAlerts,
  resolveAlert,
  refreshAlerts,
  onAlertsChange,
  getUnacknowledgedAlertCount,
} from '../../utils/cache/alertsCache';
import { getUsersSync } from '../../utils/cache/usersCache';
import { createTask } from '../../api/task';
import { userSession } from '../../utils/auth/userSession';
import AlertCard from './AlertCard';
import SystemAlertDetailDialog from './SystemAlertDetailDialog';

// ============================================================================
// Component
// ============================================================================

export default function SystemAlertsSection({ maxItems = 5 }) {
  // Local state synced with cache
  const [alerts, setAlerts] = useState(getAlertsSync);
  const [loading, setLoading] = useState(isAlertsLoading);
  const [error, setError] = useState(getAlertsError);

  // Dialog state
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Get current user (userSession.user is a getter property)
  const currentUser = userSession.user;

  // Subscribe to cache changes
  useEffect(() => {
    const unsubUpdated = onAlertsChange('updated', (data) => setAlerts([...data]));
    const unsubLoading = onAlertsChange('loading', (val) => setLoading(val));
    const unsubError = onAlertsChange('error', (err) => setError(err));

    // Initial load
    getAlerts();

    return () => {
      unsubUpdated();
      unsubLoading();
      unsubError();
    };
  }, []);

  // Handlers
  const handleRefresh = useCallback(() => {
    refreshAlerts();
  }, []);

  const handleAcknowledgeAll = useCallback(() => {
    acknowledgeAllAlerts();
  }, []);

  const handleAlertClick = useCallback((alert) => {
    setSelectedAlert(alert);
    setDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setSelectedAlert(null);
  }, []);

  const handleAcknowledge = useCallback(async (alertId) => {
    await acknowledgeAlert(alertId);
  }, []);

  const handleResolve = useCallback(async (alertId) => {
    await resolveAlert(alertId);
  }, []);

  const handleAssignTask = useCallback(async (taskData) => {
    // Extract task fields (remove source_alert metadata)
    const { source_alert_id, source_alert, ...taskPayload } = taskData;

    try {
      // Create task via API
      const response = await createTask(taskPayload);
      console.log('[SystemAlertsSection] Task created:', response);

      // Acknowledge the alert after task creation
      if (source_alert_id) {
        await acknowledgeAlert(source_alert_id);
      }

      return response;
    } catch (error) {
      console.error('[SystemAlertsSection] Failed to create task:', error);
      throw error;
    }
  }, []);

  const handleAddNote = useCallback(async (alertId, noteText) => {
    // TODO: Integrate with note/comment API when available
    console.log('[SystemAlertsSection] Adding note to alert:', alertId, noteText);
    // For now, just acknowledge
    await acknowledgeAlert(alertId);
  }, []);

  const handleViewAll = useCallback(() => {
    // Refresh to show all alerts
    handleRefresh();
  }, [handleRefresh]);

  // Filter out resolved alerts and sort: unacknowledged first, then by severity
  const activeAlerts = alerts.filter((a) => !a.resolved);
  const sortedAlerts = [...activeAlerts]
    .sort((a, b) => {
      // Unacknowledged first
      if (a.acknowledged !== b.acknowledged) {
        return a.acknowledged ? 1 : -1;
      }
      // Then by severity (critical > high > medium > low)
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const aSev = severityOrder[a.severity] ?? 4;
      const bSev = severityOrder[b.severity] ?? 4;
      if (aSev !== bSev) return aSev - bSev;
      // Then by date (newest first)
      return new Date(b.created_at) - new Date(a.created_at);
    })
    .slice(0, maxItems);

  // Unacknowledged count (only from active alerts)
  const unacknowledgedCount = activeAlerts.filter((a) => !a.acknowledged).length;

  // Get users for assignment
  const users = getUsersSync() || [];

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: 2,
          border: '1px solid',
          borderColor: unacknowledgedCount > 0 ? 'warning.main' : 'divider',
          bgcolor: unacknowledgedCount > 0 ? (theme) => alpha(theme.palette.warning.main, 0.02) : 'background.paper',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: { xs: 2, sm: 2.5 },
            flexWrap: 'wrap',
            gap: 1,
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
                bgcolor: 'warning.lighter',
                color: 'warning.main',
              }}
            >
              <AlertIcon />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  System Alerts
                </Typography>
                {unacknowledgedCount > 0 && (
                  <Chip
                    label={unacknowledgedCount}
                    color="warning"
                    size="small"
                    sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
                  />
                )}
              </Box>
              {activeAlerts.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {unacknowledgedCount > 0
                    ? `${unacknowledgedCount} requiring attention`
                    : 'All acknowledged'}
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {unacknowledgedCount > 0 && (
              <Tooltip title="Acknowledge all">
                <IconButton
                  size="small"
                  onClick={handleAcknowledgeAll}
                  sx={{ color: 'warning.main' }}
                >
                  <AcknowledgeAllIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={handleRefresh} disabled={loading}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={handleViewAll}
              sx={{ textTransform: 'none', ml: 1 }}
            >
              View All
            </Button>
          </Box>
        </Box>

        {/* Content */}
        {loading ? (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading alerts...
            </Typography>
          </Stack>
        ) : error ? (
          <Typography color="error" sx={{ py: 2 }}>
            {typeof error === 'string' ? error : 'Failed to load alerts'}
          </Typography>
        ) : activeAlerts.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              color: 'text.secondary',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.light', mb: 1 }} />
            <Typography variant="body2">No system alerts</Typography>
            <Typography variant="caption" color="text.disabled">
              All systems operating normally
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {sortedAlerts.map((alert) => (
              <Grid item xs={12} sm={6} md={4} key={alert.alert_id || alert.id}>
                <AlertCard
                  alert={alert}
                  onClick={() => handleAlertClick(alert)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Alert Detail Dialog */}
      <SystemAlertDetailDialog
        open={dialogOpen}
        alert={selectedAlert}
        users={users}
        currentUser={currentUser}
        onClose={handleDialogClose}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
        onAssignTask={handleAssignTask}
        onAddNote={handleAddNote}
      />
    </>
  );
}

