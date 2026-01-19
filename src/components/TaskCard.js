/**
 * TaskCard Component
 * Reusable task card with responsive design for mobile and desktop.
 *
 * @module components/TaskCard
 */

import React, { useState } from 'react';
import {
  Paper, Typography, Button, Stack, Chip, IconButton, Box, Avatar, Tooltip,
  Divider, Dialog, DialogTitle, DialogContent, DialogActions,
  useMediaQuery, useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WarningIcon from '@mui/icons-material/Warning';
import NotesIcon from '@mui/icons-material/Notes';
import AlarmIcon from '@mui/icons-material/Alarm';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import FlagIcon from '@mui/icons-material/Flag';

// Import users cache for name resolution
import { getUsersSync } from '../utils/cache/usersCache';

// ============================================================================
// Constants
// ============================================================================

const STATUS_CONFIG = {
  pending: {
    bg: 'warning.light',
    color: 'warning.dark',
    borderColor: 'warning.main',
    label: 'Pending',
    icon: '⏳',
  },
  inprogress: {
    bg: 'info.light',
    color: 'info.dark',
    borderColor: 'info.main',
    label: 'In Progress',
    icon: '🔄',
  },
  completed: {
    bg: 'success.light',
    color: 'success.dark',
    borderColor: 'success.main',
    label: 'Completed',
    icon: '✅',
  },
};

const PRIORITY_CONFIG = {
  1: { label: 'Critical', color: 'error', bg: 'error.light', icon: '🔴' },
  2: { label: 'High', color: 'warning', bg: 'warning.light', icon: '🟠' },
  3: { label: 'Medium', color: 'info', bg: 'info.light', icon: '🔵' },
  4: { label: 'Low', color: 'success', bg: 'success.light', icon: '🟢' },
  5: { label: 'Normal', color: 'default', bg: 'action.hover', icon: '⚪' },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get assignee userKey from task (handles different field names from BE)
 */
function getAssigneeKey(task) {
  return task.assigned_to || task.assignedTo || task.assignee || task.userKey || task.user_key || null;
}

/**
 * Resolve user name from userKey using cached users list
 */
function resolveUserName(userKey) {
  if (!userKey) return 'Unassigned';

  const users = getUsersSync() || [];
  const user = users.find((u) =>
    String(u.user_key) === String(userKey) ||
    String(u.userKey) === String(userKey) ||
    String(u.id) === String(userKey)
  );

  if (user) {
    return user.display_name || user.name || user.username || user.email || userKey;
  }

  return userKey; // Return key if no user found
}

/**
 * Get time remaining until due date
 */
function getTimeLeft(endDate) {
  if (!endDate) return { text: 'No due date', urgent: false, overdue: false };

  try {
    const end = new Date(endDate.replace(' ', 'T'));
    const now = new Date();
    const diff = end - now;

    if (diff < 0) {
      const overdueDays = Math.ceil(Math.abs(diff) / (1000 * 60 * 60 * 24));
      return { text: `${overdueDays}d overdue`, urgent: true, overdue: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return { text: `${days}d ${hours}h left`, urgent: days <= 1, overdue: false };
    }
    if (hours > 0) {
      return { text: `${hours}h left`, urgent: hours <= 6, overdue: false };
    }

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { text: `${minutes}m left`, urgent: true, overdue: false };
  } catch {
    return { text: 'Invalid date', urgent: false, overdue: false };
  }
}

/**
 * Check if task is overdue
 */
function isTaskOverdue(task) {
  if (task.status === 'completed') return false;

  const endDate = task.end_date || task.endDate || task.endTime;
  if (!endDate) return false;

  try {
    return new Date(endDate.replace(' ', 'T')) < new Date();
  } catch {
    return false;
  }
}

/**
 * Get next action label
 */
function getNextActionLabel(status) {
  switch (status) {
    case 'pending': return 'Start';
    case 'inprogress': return 'Complete';
    case 'completed': return 'Done';
    default: return 'Action';
  }
}

/**
 * Format date for display
 */
function formatDate(dateStr, includeTime = false) {
  if (!dateStr) return 'No date';
  try {
    const date = new Date(dateStr.replace(' ', 'T'));
    const options = {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    };
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    return date.toLocaleDateString('en-US', options);
  } catch {
    return dateStr;
  }
}

/**
 * Format full date with time
 */
function formatFullDate(dateStr) {
  if (!dateStr) return 'Not set';
  try {
    const date = new Date(dateStr.replace(' ', 'T'));
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

// ============================================================================
// TaskDetailDialog - Mobile friendly detail view
// ============================================================================

function TaskDetailDialog({
  open,
  onClose,
  task,
  onEdit,
  onAction,
  onDelete,
  getAssigneeName,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!task) return null;

  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG[3];
  const isCompleted = task.status === 'completed';
  const overdue = isTaskOverdue(task);
  const timeInfo = getTimeLeft(task.end_date || task.endDate);

  // Resolve assignee name - use helper or resolve from cache
  const assigneeKey = getAssigneeKey(task);
  const assigneeName = getAssigneeName
    ? getAssigneeName(assigneeKey)
    : resolveUserName(assigneeKey);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: { borderRadius: isMobile ? 0 : 3 }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: overdue ? 'error.light' : status.bg,
          borderBottom: `3px solid`,
          borderColor: overdue ? 'error.main' : status.borderColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography sx={{ fontSize: '1.5rem' }}>{status.icon}</Typography>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {task.title}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <Chip
                label={status.label}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.8)', fontWeight: 600, height: 22 }}
              />
              {overdue && (
                <Chip label="OVERDUE" size="small" color="error" sx={{ height: 22, fontWeight: 700 }} />
              )}
            </Stack>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Priority & Time Banner */}
        <Box sx={{ p: 2, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" spacing={2} justifyContent="space-around">
            <Box sx={{ textAlign: 'center' }}>
              <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                <FlagIcon sx={{ fontSize: 18, color: `${priority.color}.main` }} />
                <Typography variant="body2" color="text.secondary">Priority</Typography>
              </Stack>
              <Typography variant="h6" fontWeight={700} color={`${priority.color}.main`}>
                {priority.icon} {priority.label}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ textAlign: 'center' }}>
              <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                <AlarmIcon sx={{ fontSize: 18, color: timeInfo.urgent ? 'error.main' : 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">Time Left</Typography>
              </Stack>
              <Typography
                variant="h6"
                fontWeight={700}
                color={timeInfo.overdue ? 'error.main' : timeInfo.urgent ? 'warning.main' : 'text.primary'}
              >
                {timeInfo.text}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Details Section */}
        <Box sx={{ p: 2 }}>
          <Stack spacing={2.5}>
            {/* Description */}
            {task.description && (
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <DescriptionIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                    Description
                  </Typography>
                </Stack>
                <Typography variant="body1" sx={{ pl: 3.5, whiteSpace: 'pre-wrap' }}>
                  {task.description}
                </Typography>
              </Box>
            )}

            <Divider />

            {/* Due Date */}
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <CalendarTodayIcon sx={{ fontSize: 20, color: overdue ? 'error.main' : 'primary.main', mt: 0.25 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                  Due Date
                </Typography>
                <Typography variant="body1" fontWeight={500} color={overdue ? 'error.main' : 'text.primary'}>
                  {formatFullDate(task.end_date)}
                </Typography>
              </Box>
            </Stack>

            {/* Task Date */}
            {task.task_date && (
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <AccessTimeIcon sx={{ fontSize: 20, color: 'text.secondary', mt: 0.25 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                    Task Date
                  </Typography>
                  <Typography variant="body1">
                    {formatFullDate(task.task_date)}
                  </Typography>
                </Box>
              </Stack>
            )}

            {/* Assignee */}
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <PersonIcon sx={{ fontSize: 20, color: 'primary.main', mt: 0.25 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                  Assigned To
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                    {assigneeName?.[0]?.toUpperCase() || '?'}
                  </Avatar>
                  <Typography variant="body1" fontWeight={500}>
                    {assigneeName}
                  </Typography>
                </Stack>
              </Box>
            </Stack>

            {/* Notes */}
            {task.notes && (
              <>
                <Divider />
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <NotesIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                      Notes
                    </Typography>
                  </Stack>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {task.notes}
                    </Typography>
                  </Paper>
                </Box>
              </>
            )}

            {/* Task ID */}
            <Box sx={{ pt: 1 }}>
              <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace' }}>
                Task ID: {task.task_id || 'N/A'}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', gap: 1, flexWrap: 'wrap' }}>
        {!isCompleted && (
          <Button
            variant="contained"
            color={task.status === 'pending' ? 'primary' : 'success'}
            startIcon={task.status === 'pending' ? <PlayArrowIcon /> : <CheckCircleIcon />}
            onClick={() => { onAction?.(task); onClose(); }}
            sx={{ flex: isMobile ? 1 : 'auto' }}
          >
            {getNextActionLabel(task.status)}
          </Button>
        )}
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => { onEdit?.(task); onClose(); }}
          sx={{ flex: isMobile ? 1 : 'auto' }}
        >
          Edit
        </Button>
        {(isCompleted || true) && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => { onDelete?.(task); onClose(); }}
            sx={{ flex: isMobile ? 1 : 'auto' }}
          >
            Delete
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// ============================================================================
// TaskCard Component
// ============================================================================

/**
 * TaskCard - A reusable task card component
 *
 * @param {object} props
 * @param {object} props.task - Task object with title, description, status, priority, end_date, assigned_to, task_id
 * @param {function} props.onEdit - Callback when edit button is clicked
 * @param {function} props.onAction - Callback when action button (Start/Complete) is clicked
 * @param {function} props.onDelete - Callback when delete button is clicked
 * @param {function} props.getAssigneeName - Function to get assignee name from user key
 * @param {boolean} props.compact - Whether to show compact version (for mobile/list views)
 * @param {boolean} props.showDelete - Whether to show delete button (default: only when completed)
 */
export default function TaskCard({
  task,
  onEdit,
  onAction,
  onDelete,
  getAssigneeName,
  compact = false,
  showDelete = false,
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG[3];
  const isCompleted = task.status === 'completed';
  const overdue = isTaskOverdue(task);

  // Handle different date field names from BE
  const endDate = task.end_date || task.endDate || task.endTime;
  const timeInfo = getTimeLeft(endDate);

  // Resolve assignee name - use provided function or resolve from cache
  const assigneeKey = getAssigneeKey(task);
  const assigneeName = getAssigneeName
    ? getAssigneeName(assigneeKey)
    : resolveUserName(assigneeKey);

  const handleCardClick = () => {
    if (isMobile || compact) {
      setDetailOpen(true);
    }
  };

  // Compact view for mobile/list - Enhanced with more info
  if (compact || isMobile) {
    return (
      <>
        <Paper
          elevation={1}
          onClick={handleCardClick}
          sx={{
            p: 2,
            borderRadius: 2,
            borderLeft: (theme) => `4px solid ${overdue ? theme.palette.error.main : theme.palette[status.borderColor.split('.')[0]][status.borderColor.split('.')[1]]}`,
            bgcolor: isCompleted ? 'action.disabledBackground' : 'background.paper',
            opacity: isCompleted ? 0.8 : 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            transition: 'all 0.2s',
            cursor: 'pointer',
            '&:hover': { boxShadow: 3 },
            '&:active': { transform: 'scale(0.98)' },
          }}
        >
          {/* Top Row: Priority + Title + Status */}
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            {/* Priority indicator */}
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: priority.bg,
                color: priority.color === 'default' ? 'text.secondary' : `${priority.color}.main`,
                fontSize: '0.8rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {priority.icon}
            </Avatar>

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  color: isCompleted ? 'text.secondary' : 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.3,
                }}
              >
                {task.title}
              </Typography>

              {/* Status + Priority chips */}
              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap">
                <Chip
                  label={status.label}
                  size="small"
                  sx={{ bgcolor: status.bg, color: status.color, height: 20, fontSize: '0.65rem' }}
                />
                <Chip
                  label={priority.label}
                  size="small"
                  color={priority.color}
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
                {overdue && <Chip label="Overdue" size="small" color="error" sx={{ height: 20, fontSize: '0.65rem' }} />}
              </Stack>
            </Box>
          </Stack>

          {/* Middle Row: Due Date + Time Left + Assignee */}
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ pl: 0.5 }}>
            {/* Due Date */}
            <Tooltip title="Due Date">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CalendarTodayIcon sx={{ fontSize: 14, color: overdue ? 'error.main' : 'text.secondary' }} />
                <Typography variant="caption" sx={{ fontWeight: 500, color: overdue ? 'error.main' : 'text.secondary' }}>
                  {formatDate(task.end_date)}
                </Typography>
              </Stack>
            </Tooltip>

            {/* Time Left */}
            <Stack direction="row" spacing={0.5} alignItems="center">
              {timeInfo.overdue ? (
                <WarningIcon sx={{ fontSize: 14, color: 'error.main' }} />
              ) : (
                <AccessTimeIcon sx={{ fontSize: 14, color: timeInfo.urgent ? 'warning.main' : 'text.secondary' }} />
              )}
              <Typography
                variant="caption"
                sx={{
                  fontWeight: timeInfo.urgent ? 600 : 500,
                  color: timeInfo.overdue ? 'error.main' : timeInfo.urgent ? 'warning.main' : 'text.secondary',
                }}
              >
                {timeInfo.text}
              </Typography>
            </Stack>

            {/* Assignee */}
            <Tooltip title={`Assigned to: ${assigneeName}`}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography
                  variant="caption"
                  sx={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {assigneeName}
                </Typography>
              </Stack>
            </Tooltip>
          </Stack>

          {/* Bottom Row: Actions */}
          <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
            {!isCompleted && (
              <Button
                variant="contained"
                size="small"
                color={task.status === 'pending' ? 'primary' : 'success'}
                startIcon={task.status === 'pending' ? <PlayArrowIcon /> : <CheckCircleIcon />}
                onClick={(e) => { e.stopPropagation(); onAction?.(task); }}
                sx={{ textTransform: 'none', borderRadius: 2, fontSize: '0.75rem', py: 0.5 }}
              >
                {getNextActionLabel(task.status)}
              </Button>
            )}
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit?.(task); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Paper>

        {/* Detail Dialog for mobile */}
        <TaskDetailDialog
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          task={task}
          onEdit={onEdit}
          onAction={onAction}
          onDelete={onDelete}
          getAssigneeName={getAssigneeName}
        />
      </>
    );
  }

  // Full card view for desktop - existing implementation with slight improvements
  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: isCompleted ? 'action.disabledBackground' : 'background.paper',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
        opacity: isCompleted ? 0.85 : 1,
      }}
    >
      {/* Status Header Bar */}
      <Box
        sx={{
          px: 2,
          py: 1,
          bgcolor: overdue ? 'error.light' : status.bg,
          borderBottom: (theme) => `2px solid ${overdue ? theme.palette.error.main : theme.palette[status.borderColor.split('.')[0]][status.borderColor.split('.')[1]]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography sx={{ fontSize: '1rem' }}>{status.icon}</Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: overdue ? 'error.dark' : status.color,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {overdue ? '⚠️ OVERDUE' : status.label}
          </Typography>
        </Stack>
        <Chip
          label={`${priority.icon} ${priority.label}`}
          size="small"
          color={priority.color}
          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
        />
      </Box>

      {/* Card Content */}
      <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '0.95rem', sm: '1.05rem' },
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textDecoration: isCompleted ? 'line-through' : 'none',
            color: isCompleted ? 'text.secondary' : 'text.primary',
          }}
          title={task.title}
        >
          {task.title}
        </Typography>

        {/* Description */}
        {task.description && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.5,
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
            }}
            title={task.description}
          >
            {task.description}
          </Typography>
        )}

        {/* Meta Info */}
        <Stack spacing={1} sx={{ mt: 'auto', pt: 1 }}>
          {/* Due Date & Time Left */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
            <Tooltip title="Due Date">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CalendarTodayIcon sx={{ fontSize: 16, color: overdue ? 'error.main' : 'text.secondary' }} />
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  {formatDate(task.end_date)}
                </Typography>
              </Stack>
            </Tooltip>
            <Tooltip title="Time Remaining">
              <Stack direction="row" spacing={0.5} alignItems="center">
                {timeInfo.overdue ? (
                  <WarningIcon sx={{ fontSize: 16, color: 'error.main' }} />
                ) : (
                  <AccessTimeIcon sx={{ fontSize: 16, color: timeInfo.urgent ? 'warning.main' : 'text.secondary' }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: timeInfo.urgent ? 700 : 500,
                    color: timeInfo.overdue ? 'error.main' : timeInfo.urgent ? 'warning.main' : 'text.secondary',
                  }}
                >
                  {timeInfo.text}
                </Typography>
              </Stack>
            </Tooltip>
          </Stack>

          {/* Assignee */}
          <Tooltip title="Assigned To">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Avatar sx={{ width: 20, height: 20, fontSize: '0.65rem', bgcolor: 'primary.main' }}>
                {assigneeName?.[0]?.toUpperCase() || '?'}
              </Avatar>
              <Typography
                variant="caption"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: 500,
                }}
              >
                {assigneeName}
              </Typography>
            </Stack>
          </Tooltip>
        </Stack>
      </Box>

      {/* Action Footer */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        {/* Action Buttons */}
        <Stack direction="row" spacing={1}>
          {!isCompleted && (
            <Button
              variant="contained"
              size="small"
              color={task.status === 'pending' ? 'primary' : 'success'}
              startIcon={task.status === 'pending' ? <PlayArrowIcon /> : <CheckCircleIcon />}
              onClick={() => onAction?.(task)}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              }}
            >
              {getNextActionLabel(task.status)}
            </Button>
          )}
          {(isCompleted || showDelete) && (
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => onDelete?.(task)}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              }}
            >
              Delete
            </Button>
          )}
        </Stack>

        {/* Edit & Task ID */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Edit Task">
            <IconButton
              size="small"
              onClick={() => onEdit?.(task)}
              sx={{
                '&:hover': { backgroundColor: 'primary.light', color: 'white' },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography
            variant="caption"
            sx={{
              color: 'text.disabled',
              fontSize: '0.65rem',
              fontFamily: 'monospace',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            #{task.task_id?.slice(-6) || 'N/A'}
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
}

// ============================================================================
// Additional Exports
// ============================================================================

export { STATUS_CONFIG, PRIORITY_CONFIG, getTimeLeft, isTaskOverdue, getNextActionLabel, formatDate };

