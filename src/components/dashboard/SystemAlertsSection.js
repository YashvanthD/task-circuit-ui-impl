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
  deleteAlert,
  refreshAlerts,
  onAlertsChange,
} from '../../utils/cache/alertsCache';
import { getUsersSync } from '../../utils/cache/usersCache';
import { createTask } from '../../api/task';
import { userSession } from '../../utils/auth/userSession';
import AlertCard from './AlertCard';
import SystemAlertDetailDialog from './SystemAlertDetailDialog';

// ============================================================================
// Component
// ============================================================================

export default function SystemAlertsSection({ maxItems = 5, showTaskAlerts = false, taskAlerts = [], onTaskAlertClick }) {
  // Local state synced with singleton cache
  const [alerts, setAlerts] = useState(() => getAlertsSync());
  const [loading, setLoading] = useState(() => isAlertsLoading());
  const [error, setError] = useState(() => getAlertsError());

  // Dialog state
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Get current user (userSession.user is a getter property)
  const currentUser = userSession.user;

  // Subscribe to singleton cache changes (single source of truth)
  useEffect(() => {
    // Single handler for all changes - cache is already deduplicated
    const unsubChange = onAlertsChange('change', (data) => {
      // Cache returns deduplicated array, just use it directly
      setAlerts(Array.isArray(data) ? data : []);
    });

    const unsubNew = onAlertsChange('new', () => {
      // On new alert, get fresh list from singleton
      setAlerts(getAlertsSync());
    });

    const unsubLoading = onAlertsChange('loading', setLoading);
    const unsubError = onAlertsChange('error', setError);

    // Initial load from cache
    getAlerts();

    return () => {
      unsubChange();
      unsubNew();
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

  const handleAlertClick = useCallback((alert, isTask = false) => {
    if (isTask && onTaskAlertClick) {
      onTaskAlertClick(alert);
      return;
    }
    setSelectedAlert(alert);
    setDialogOpen(true);
  }, [onTaskAlertClick]);

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

  const handleDelete = useCallback(async (alertId) => {
    await deleteAlert(alertId);
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

  // Alerts from cache are already filtered (non-resolved)
  // The singleton cache uses Map to prevent duplicates
  const activeAlerts = alerts;

  // Normalize task alerts to have consistent structure with system alerts
  const normalizedTaskAlerts = showTaskAlerts
    ? taskAlerts.map((task) => ({
        ...task,
        alert_id: `task_${task.task_id || task.id}`,
        alert_type: 'task',
        severity: task.priority <= 1 ? 'high' : task.priority === 2 ? 'medium' : 'low',
        source: 'task',
        acknowledged: task.status === 'completed',
        resolved: task.status === 'completed',
        created_at: task.createdAt || task.created_at || task.completeBy,
        _isTaskAlert: true,
      }))
    : [];

  // Combine and sort all alerts
  const allAlerts = [...activeAlerts, ...normalizedTaskAlerts];
  const sortedAlerts = [...allAlerts]
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

  // Unacknowledged count (only from active alerts, not task alerts)
  const unacknowledgedCount = activeAlerts.filter((a) => !a.acknowledged).length;

  // Total count including task alerts
  const totalAlertCount = allAlerts.filter((a) => !a.acknowledged && !a.resolved).length;

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
          borderColor: totalAlertCount > 0 ? 'warning.main' : 'divider',
          bgcolor: totalAlertCount > 0 ? (theme) => alpha(theme.palette.warning.main, 0.02) : 'background.paper',
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
                  Alerts
                </Typography>
                {totalAlertCount > 0 && (
                  <Chip
                    label={totalAlertCount}
                    color="warning"
                    size="small"
                    sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
                  />
                )}
              </Box>
              {allAlerts.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {totalAlertCount > 0
                    ? `${totalAlertCount} requiring attention`
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
        ) : allAlerts.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              color: 'text.secondary',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.light', mb: 1 }} />
            <Typography variant="body2">No alerts</Typography>
            <Typography variant="caption" color="text.disabled">
              All systems operating normally
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {sortedAlerts.map((alert, index) => (
              <Grid item xs={12} sm={6} md={4} key={`alert-${alert.alert_id || alert.id || alert.task_id || index}`}>
                <AlertCard
                  alert={alert}
                  onClick={() => handleAlertClick(alert, alert._isTaskAlert)}
                  onResolve={handleResolve}
                  onDelete={handleDelete}
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

