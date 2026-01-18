/**
 * SystemAlertDetailDialog Component
 * Popup dialog for system alert actions: Acknowledge, Resolve, Assign as Task, Add Note.
 * Mobile-first responsive design.
 *
 * @module components/dashboard/SystemAlertDetailDialog
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Divider,
  alpha,
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as AcknowledgeIcon,
  Done as ResolveIcon,
  Assignment as TaskIcon,
  Note as NoteIcon,
  Warning as AlertIcon,
  Error as CriticalIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { formatDistanceToNow, format, addDays } from 'date-fns';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../../constants';

// Severity configuration
const SEVERITY_CONFIG = {
  critical: { color: '#9c27b0', icon: CriticalIcon, label: 'Critical' },
  high: { color: '#d32f2f', icon: AlertIcon, label: 'High' },
  medium: { color: '#ed6c02', icon: AlertIcon, label: 'Medium' },
  low: { color: '#0288d1', icon: InfoIcon, label: 'Low' },
};

// Map alert severity to task priority
const SEVERITY_TO_PRIORITY = {
  critical: '1',
  high: '2',
  medium: '3',
  low: '4',
};

/**
 * Get alert ID from various possible field names
 */
function getAlertId(alert) {
  return alert?.alert_id || alert?.alertId || alert?.id || null;
}

/**
 * SystemAlertDetailDialog - Dialog for alert actions
 *
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Object} props.alert - Alert data
 * @param {Array} props.users - List of users for assignment
 * @param {Object} props.currentUser - Current logged-in user
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onAcknowledge - Acknowledge handler
 * @param {Function} props.onResolve - Resolve handler
 * @param {Function} props.onAssignTask - Assign as task handler
 * @param {Function} props.onAddNote - Add note handler
 */
export default function SystemAlertDetailDialog({
  open,
  alert,
  users = [],
  currentUser,
  onClose,
  onAcknowledge,
  onResolve,
  onAssignTask,
  onAddNote,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Default dates
  const today = format(new Date(), 'yyyy-MM-dd');
  const defaultEndDate = format(addDays(new Date(), 3), 'yyyy-MM-dd'); // 3 days from now

  // Initial task form state
  const getInitialTaskForm = useCallback(() => {
    const alertId = getAlertId(alert);
    return {
      title: alert?.title || '',
      description: alert?.message || '',
      status: 'pending',
      priority: SEVERITY_TO_PRIORITY[alert?.severity] || '2',
      assigned_to: currentUser?.user_key || '',
      end_date: defaultEndDate,
      task_date: today,
      notes: `Created from alert: ${alertId || ''}`,
    };
  }, [alert, currentUser, today, defaultEndDate]);

  // Local state for actions
  const [activeAction, setActiveAction] = useState(null); // 'assign' | 'note' | null
  const [taskForm, setTaskForm] = useState(getInitialTaskForm);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state when dialog closes or alert changes
  const handleClose = useCallback(() => {
    setActiveAction(null);
    setTaskForm(getInitialTaskForm());
    setNote('');
    setLoading(false);
    setError('');
    onClose?.();
  }, [onClose, getInitialTaskForm]);

  // Handle task form changes
  const handleTaskFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setTaskForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  }, []);

  // Acknowledge alert
  const handleAcknowledge = useCallback(async () => {
    if (!alert) return;
    const alertId = getAlertId(alert);
    if (!alertId) {
      setError('Alert ID not found');
      return;
    }
    setLoading(true);
    try {
      await onAcknowledge?.(alertId);
      handleClose();
    } catch (e) {
      console.error('Failed to acknowledge:', e);
      setError('Failed to acknowledge alert');
    } finally {
      setLoading(false);
    }
  }, [alert, onAcknowledge, handleClose]);

  // Resolve alert
  const handleResolve = useCallback(async () => {
    if (!alert) return;
    const alertId = getAlertId(alert);
    if (!alertId) {
      setError('Alert ID not found');
      return;
    }
    setLoading(true);
    try {
      await onResolve?.(alertId);
      handleClose();
    } catch (e) {
      console.error('Failed to resolve:', e);
      setError('Failed to resolve alert');
    } finally {
      setLoading(false);
    }
  }, [alert, onResolve, handleClose]);

  // Validate task form
  const validateTaskForm = useCallback(() => {
    if (!taskForm.title?.trim()) {
      setError('Title is required');
      return false;
    }
    if (!taskForm.assigned_to) {
      setError('Please select a user to assign the task');
      return false;
    }
    if (!taskForm.end_date) {
      setError('End date is required');
      return false;
    }
    return true;
  }, [taskForm]);

  // Assign as task
  const handleAssignTask = useCallback(async () => {
    if (!alert) return;
    if (!validateTaskForm()) return;

    setLoading(true);
    setError('');
    try {
      await onAssignTask?.({
        ...taskForm,
        source_alert_id: alert.alert_id,
        source_alert: alert,
      });
      handleClose();
    } catch (e) {
      console.error('Failed to assign task:', e);
      setError(e.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  }, [alert, taskForm, validateTaskForm, onAssignTask, handleClose]);

  // Add note
  const handleAddNote = useCallback(async () => {
    if (!alert || !note.trim()) return;
    setLoading(true);
    setError('');
    try {
      await onAddNote?.(alert.alert_id, note.trim());
      setNote('');
      setActiveAction(null);
    } catch (e) {
      console.error('Failed to add note:', e);
      setError('Failed to add note');
    } finally {
      setLoading(false);
    }
  }, [alert, note, onAddNote]);

  // Reset task form when opening assign action
  const handleOpenAssign = useCallback(() => {
    setTaskForm(getInitialTaskForm());
    setActiveAction('assign');
    setError('');
  }, [getInitialTaskForm]);

  if (!alert) return null;

  const severity = alert.severity || 'medium';
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.medium;
  const SeverityIcon = config.icon;
  const isAcknowledged = alert.acknowledged;
  const isResolved = alert.resolved;
  const createdAt = alert.created_at || alert.createdAt;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100%' : '90vh',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          pb: 1,
          bgcolor: alpha(config.color, 0.05),
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: alpha(config.color, 0.15),
            color: config.color,
            flexShrink: 0,
          }}
        >
          <SeverityIcon />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={600} sx={{ lineHeight: 1.3 }}>
            {alert.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
            <Chip
              label={config.label}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 600,
                bgcolor: alpha(config.color, 0.15),
                color: config.color,
              }}
            />
            {alert.alert_type && (
              <Chip
                label={alert.alert_type.replace(/_/g, ' ')}
                size="small"
                variant="outlined"
                sx={{ height: 22, fontSize: '0.7rem', textTransform: 'capitalize' }}
              />
            )}
            {isAcknowledged && !isResolved && (
              <Chip label="Acknowledged" size="small" color="info" sx={{ height: 22, fontSize: '0.7rem' }} />
            )}
            {isResolved && (
              <Chip label="Resolved" size="small" color="success" sx={{ height: 22, fontSize: '0.7rem' }} />
            )}
          </Box>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ mt: -0.5, mr: -1 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ pt: 2 }}>
        {/* Message */}
        {!activeAction && (
          <>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {alert.message}
            </Typography>

            {/* Meta info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              {createdAt && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ScheduleIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                  </Typography>
                </Box>
              )}
              {alert.source && (
                <Typography variant="caption" color="text.secondary">
                  Source: {alert.source}
                </Typography>
              )}
            </Box>
          </>
        )}

        {/* Action Forms */}
        {activeAction === 'assign' && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <TaskIcon sx={{ fontSize: 20, mr: 1 }} />
              Create Task from Alert
            </Typography>

            <Stack spacing={2}>
              <TextField
                fullWidth
                label={<span>Title <span style={{ color: 'red' }}>*</span></span>}
                name="title"
                value={taskForm.title}
                onChange={handleTaskFormChange}
                size="small"
                required
              />

              <TextField
                fullWidth
                label="Description"
                name="description"
                value={taskForm.description}
                onChange={handleTaskFormChange}
                multiline
                rows={2}
                size="small"
              />

              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={taskForm.status}
                  label="Status"
                  onChange={handleTaskFormChange}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={taskForm.priority}
                  label="Priority"
                  onChange={handleTaskFormChange}
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <MenuItem key={p} value={String(p)}>
                      {p === 1 ? 'Critical' : p === 2 ? 'High' : p === 3 ? 'Medium' : 'Low'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" required>
                <InputLabel>Assign To *</InputLabel>
                <Select
                  name="assigned_to"
                  value={taskForm.assigned_to}
                  label="Assign To *"
                  onChange={handleTaskFormChange}
                >
                  {users.map((u) => (
                    <MenuItem key={u.user_key || u.id} value={u.user_key || u.id}>
                      {u.username || u.name || u.user_key}
                      {currentUser?.user_key === u.user_key ? ' (You)' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label={<span>End Date <span style={{ color: 'red' }}>*</span></span>}
                name="end_date"
                type="date"
                value={taskForm.end_date}
                onChange={handleTaskFormChange}
                size="small"
                required
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Task Date"
                name="task_date"
                type="date"
                value={taskForm.task_date}
                onChange={handleTaskFormChange}
                size="small"
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={taskForm.notes}
                onChange={handleTaskFormChange}
                multiline
                rows={2}
                size="small"
              />

              {error && (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              )}

              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', pt: 1 }}>
                <Button onClick={() => setActiveAction(null)} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleAssignTask}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </Button>
              </Box>
            </Stack>
          </Box>
        )}

        {activeAction === 'note' && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <NoteIcon sx={{ fontSize: 20, mr: 1 }} />
              Add Note
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter your note..."
              size="small"
              sx={{ mb: 2 }}
            />

            {error && (
              <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button onClick={() => setActiveAction(null)} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleAddNote}
                disabled={loading || !note.trim()}
              >
                {loading ? 'Saving...' : 'Save Note'}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>

      {/* Actions */}
      {!activeAction && (
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            gap: 1,
            flexWrap: 'wrap',
            justifyContent: isMobile ? 'stretch' : 'flex-end',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          {error && (
            <Typography color="error" variant="body2" sx={{ width: '100%', mb: 1 }}>
              {error}
            </Typography>
          )}

          {/* Add Note Button */}
          <Button
            startIcon={<NoteIcon />}
            onClick={() => {
              setActiveAction('note');
              setError('');
            }}
            disabled={loading}
            sx={{ flex: isMobile ? 1 : 'none' }}
          >
            Add Note
          </Button>

          {/* Assign as Task Button */}
          <Button
            startIcon={<TaskIcon />}
            onClick={handleOpenAssign}
            disabled={loading}
            sx={{ flex: isMobile ? 1 : 'none' }}
          >
            Create Task
          </Button>

          {/* Acknowledge Button */}
          {!isAcknowledged && !isResolved && (
            <Button
              variant="outlined"
              color="info"
              startIcon={<AcknowledgeIcon />}
              onClick={handleAcknowledge}
              disabled={loading}
              sx={{ flex: isMobile ? 1 : 'none' }}
            >
              Acknowledge
            </Button>
          )}

          {/* Resolve Button */}
          {!isResolved && (
            <Button
              variant="contained"
              color="success"
              startIcon={<ResolveIcon />}
              onClick={handleResolve}
              disabled={loading}
              sx={{ flex: isMobile ? 1 : 'none' }}
            >
              Resolve
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
}

