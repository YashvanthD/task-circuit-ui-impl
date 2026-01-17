/**
 * TaskCard Component
 * Reusable task card with responsive design for mobile and desktop.
 *
 * @module components/TaskCard
 */

import React from 'react';
import {
  Paper, Typography, Button, Stack, Chip, IconButton, Box, Avatar, Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WarningIcon from '@mui/icons-material/Warning';

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
  1: { label: 'Critical', color: 'error', bg: 'error.light' },
  2: { label: 'High', color: 'warning', bg: 'warning.light' },
  3: { label: 'Medium', color: 'info', bg: 'info.light' },
  4: { label: 'Low', color: 'success', bg: 'success.light' },
  5: { label: 'Normal', color: 'default', bg: 'action.hover' },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get time remaining until due date
 */
function getTimeLeft(endDate) {
  if (!endDate) return 'No due date';

  try {
    const end = new Date(endDate.replace(' ', 'T'));
    const now = new Date();
    const diff = end - now;

    if (diff < 0) {
      const overdueDays = Math.ceil(Math.abs(diff) / (1000 * 60 * 60 * 24));
      return `${overdueDays}d overdue`;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m left`;
  } catch {
    return 'Invalid date';
  }
}

/**
 * Check if task is overdue
 */
function isTaskOverdue(task) {
  if (task.status === 'completed' || !task.end_date) return false;
  try {
    return new Date(task.end_date.replace(' ', 'T')) < new Date();
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
function formatDate(dateStr) {
  if (!dateStr) return 'No date';
  try {
    const date = new Date(dateStr.replace(' ', 'T'));
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return dateStr;
  }
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
  getAssigneeName = (key) => key || 'Unassigned',
  compact = false,
  showDelete = false,
}) {
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG[3];
  const isCompleted = task.status === 'completed';
  const overdue = isTaskOverdue(task);
  const timeLeft = getTimeLeft(task.end_date);
  const assigneeName = getAssigneeName(task.assigned_to);

  // Compact view for mobile/list
  if (compact) {
    return (
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 2,
          borderLeft: (theme) => `4px solid ${overdue ? theme.palette.error.main : theme.palette[status.borderColor.split('.')[0]][status.borderColor.split('.')[1]]}`,
          bgcolor: isCompleted ? 'action.disabledBackground' : 'background.paper',
          opacity: isCompleted ? 0.8 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          transition: 'all 0.2s',
          '&:hover': { boxShadow: 3 },
        }}
      >
        {/* Priority indicator */}
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: priority.bg,
            color: priority.color === 'default' ? 'text.secondary' : `${priority.color}.main`,
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          P{task.priority}
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
              whiteSpace: 'nowrap',
            }}
          >
            {task.title}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={status.label} size="small" sx={{ bgcolor: status.bg, color: status.color, height: 20, fontSize: '0.65rem' }} />
            {overdue && <Chip label="Overdue" size="small" color="error" sx={{ height: 20, fontSize: '0.65rem' }} />}
            <Typography variant="caption" color="text.secondary">{timeLeft}</Typography>
          </Stack>
        </Box>

        {/* Actions */}
        <Stack direction="row" spacing={0.5}>
          {!isCompleted && (
            <IconButton size="small" color="primary" onClick={() => onAction?.(task)}>
              {task.status === 'pending' ? <PlayArrowIcon /> : <CheckCircleIcon />}
            </IconButton>
          )}
          <IconButton size="small" onClick={() => onEdit?.(task)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Paper>
    );
  }

  // Full card view
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
          label={`P${task.priority} - ${priority.label}`}
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
                <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  {formatDate(task.end_date)}
                </Typography>
              </Stack>
            </Tooltip>
            <Tooltip title="Time Remaining">
              <Stack direction="row" spacing={0.5} alignItems="center">
                {overdue ? (
                  <WarningIcon sx={{ fontSize: 16, color: 'error.main' }} />
                ) : (
                  <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: overdue ? 700 : 500,
                    color: overdue ? 'error.main' : 'text.secondary',
                  }}
                >
                  {timeLeft}
                </Typography>
              </Stack>
            </Tooltip>
          </Stack>

          {/* Assignee */}
          <Tooltip title="Assigned To">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography
                variant="caption"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
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

