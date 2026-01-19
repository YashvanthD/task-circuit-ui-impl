/**
 * DashboardPage
 * Main dashboard for logged-in users.
 * Uses modular components for clean separation of concerns.
 *
 * @module pages/user/DashboardPage
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Utils & Helpers
import { getAccessToken } from '../../utils/auth/storage';
import { getTasks, updateTask as updateTaskApi } from '../../utils/tasks';
import { countActiveTasks, countCriticalTasks, getTaskAlerts } from '../../utils/helpers/tasks';
import { formatTimestamp } from '../../utils/helpers/date';

// Components
import {
  CriticalSummary,
  DashboardStats,
  SystemAlertsSection,
  ActionsSection,
  DashboardHeader,
  NotificationsSection,
  UnreadMessagesSection,
} from '../../components/dashboard';

// Config
import {
  BASE_APP_PATH_LOGIN,
  BASE_APP_PATH_USER_WATER_TEST,
  BASE_APP_PATH_USER_SAMPLING,
  BASE_APP_PATH_USER_TRANSFORM,
  BASE_APP_PATH_USER_TASKS,
  BASE_APP_PATH_USER_REPORTS,
} from '../../config';

// Constants
import { REMINDER_OPTIONS } from '../../constants';

// Dashboard refresh utility
import { refreshAllDashboardData } from '../../utils/helpers/dashboard';

// ============================================================================
// Constants
// ============================================================================

const QUICK_ACTIONS = [
  { label: 'Water Test', to: BASE_APP_PATH_USER_WATER_TEST },
  { label: 'Sampling', to: BASE_APP_PATH_USER_SAMPLING },
  { label: 'Transform', to: BASE_APP_PATH_USER_TRANSFORM },
  { label: 'New Task', to: BASE_APP_PATH_USER_TASKS },
  { label: 'Reports', to: BASE_APP_PATH_USER_REPORTS },
];

// ============================================================================
// Alert Dialog Component
// ============================================================================

function AlertDetailDialog({
  open,
  alert,
  remindValue,
  onRemindChange,
  onMarkDone,
  onRemindLater,
  onMarkUnread,
  onClose,
}) {
  if (!alert) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {alert.title}
        <span style={{ float: 'right', fontWeight: 'bold', color: '#888' }}>
          #{alert.priority}
        </span>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {alert.description}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Complete by: {formatTimestamp(alert.completeBy)}
        </Typography>
        <Typography
          variant="body2"
          color={alert.unread ? 'error' : 'success.main'}
          sx={{ mt: 2 }}
        >
          {alert.unread ? 'This alert is unread.' : 'This alert is read.'}
        </Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="remind-label">Remind Me Later</InputLabel>
          <Select
            labelId="remind-label"
            value={remindValue}
            label="Remind Me Later"
            onChange={(e) => onRemindChange(e.target.value)}
            variant="outlined"
          >
            {REMINDER_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onMarkDone} color="primary">
          Mark as Done
        </Button>
        <Button onClick={onRemindLater} color="info" disabled={!remindValue}>
          Remind Me Later
        </Button>
        <Button onClick={onMarkUnread} color="warning">
          Mark as Unread
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function DashboardPage() {
  const navigate = useNavigate();

  // State
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [remindDropdown, setRemindDropdown] = useState('');

  // Derived data using helpers
  const activeTasks = useMemo(() => countActiveTasks(tasks), [tasks]);
  const criticalTasks = useMemo(() => countCriticalTasks(tasks), [tasks]);
  const alerts = useMemo(() => getTaskAlerts(tasks, 5), [tasks]);

  // Fetch tasks function (reusable)
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTasks();
      setTasks(data || []);
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auth check and data fetch
  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      navigate(BASE_APP_PATH_LOGIN);
      return;
    }

    fetchTasks();
  }, [navigate, fetchTasks]);

  // Dashboard refresh handler - refreshes all dashboard data
  const handleDashboardRefresh = useCallback(async () => {
    // Refresh cache data (notifications, alerts, etc.)
    await refreshAllDashboardData();
    // Also refresh local tasks
    await fetchTasks();
  }, [fetchTasks]);

  // Task update handler
  const updateTask = useCallback(
    async (taskId, changes) => {
      try {
        await updateTaskApi(taskId, changes);
        setTasks((prev) =>
          prev.map((t) => (t.task_id === taskId ? { ...t, ...changes } : t))
        );
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  // Dialog handlers
  const handleAlertClick = useCallback((alert) => {
    setSelectedAlert(alert);
    setDialogOpen(true);
    setRemindDropdown('');
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setSelectedAlert(null);
    setRemindDropdown('');
  }, []);

  const handleMarkAsDone = useCallback(async () => {
    if (selectedAlert) {
      await updateTask(selectedAlert.task_id, { status: 'completed' });
      handleDialogClose();
    }
  }, [selectedAlert, updateTask, handleDialogClose]);

  const handleRemindLater = useCallback(async () => {
    if (selectedAlert && remindDropdown) {
      // Calculate reminder time based on selection
      const now = new Date();
      let reminderTime;

      switch (remindDropdown) {
        case '5min':
          reminderTime = new Date(now.getTime() + 5 * 60 * 1000);
          break;
        case '30min':
          reminderTime = new Date(now.getTime() + 30 * 60 * 1000);
          break;
        case '1hour':
          reminderTime = new Date(now.getTime() + 60 * 60 * 1000);
          break;
        case 'custom':
          reminderTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours
          break;
        default:
          reminderTime = new Date(now.getTime() + 30 * 60 * 1000);
      }

      try {
        // Update task with reminder settings
        await updateTask(selectedAlert.task_id, {
          reminder: true,
          reminderTime: reminderTime.toISOString(),
          remindBefore: remindDropdown === '5min' ? 5 : remindDropdown === '30min' ? 30 : remindDropdown === '1hour' ? 60 : 120,
        });

        // Store reminder in localStorage for local notification
        const reminders = JSON.parse(localStorage.getItem('tc_task_reminders') || '[]');
        reminders.push({
          taskId: selectedAlert.task_id,
          taskTitle: selectedAlert.title,
          reminderTime: reminderTime.toISOString(),
          createdAt: now.toISOString(),
        });
        localStorage.setItem('tc_task_reminders', JSON.stringify(reminders));

        console.log(`[DashboardPage] Reminder set for ${reminderTime.toLocaleString()}`);
        handleDialogClose();
      } catch (err) {
        console.error('[DashboardPage] Failed to set reminder:', err);
      }
    }
  }, [selectedAlert, remindDropdown, updateTask, handleDialogClose]);

  const handleMarkAsUnread = useCallback(async () => {
    if (selectedAlert) {
      await updateTask(selectedAlert.task_id, { unread: true });
      handleDialogClose();
    }
  }, [selectedAlert, updateTask, handleDialogClose]);

  // Navigation handler
  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate]
  );

  return (
    <>
      <DashboardHeader
        title="Dashboard"
        subtitle="Overview of your tasks and alerts"
        onRefresh={handleDashboardRefresh}
      />

      <CriticalSummary criticalCount={criticalTasks} alertCount={alerts.length} />

      <DashboardStats activeTasks={activeTasks} criticalTasks={criticalTasks} />

      {/* Unified Alerts Section (System Alerts + Task Alerts) */}
      <SystemAlertsSection maxItems={8} showTaskAlerts={true} taskAlerts={alerts} onTaskAlertClick={handleAlertClick} />

      {/* Notifications and Messages - Mobile responsive */}
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 2, sm: 3 },
          flexDirection: { xs: 'column', md: 'row' },
          mb: 3,
        }}
      >
        <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 300 } }}>
          <NotificationsSection maxItems={5} />
        </Box>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 300 } }}>
          <UnreadMessagesSection maxItems={5} />
        </Box>
      </Box>

      <ActionsSection actions={QUICK_ACTIONS} onNavigate={handleNavigate} />

      <AlertDetailDialog
        open={dialogOpen}
        alert={selectedAlert}
        remindValue={remindDropdown}
        onRemindChange={setRemindDropdown}
        onMarkDone={handleMarkAsDone}
        onRemindLater={handleRemindLater}
        onMarkUnread={handleMarkAsUnread}
        onClose={handleDialogClose}
      />
    </>
  );
}
