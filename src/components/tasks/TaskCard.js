/**
 * TaskCard Component
 * Reusable task card with responsive design for mobile and desktop.
 * Uses centralized helpers for business logic.
 *
 * @module components/tasks/TaskCard
 */

import React from 'react';
import {
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  IconButton,
  Box,
  Avatar,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WarningIcon from '@mui/icons-material/Warning';

// Import from centralized helpers
import {
  getStatusConfig,
  getPriorityConfig,
  getNextAction,
  getTimeLeft,
  isTaskOverdue,
} from '../../utils/helpers/tasks';
import { formatDate } from '../../utils/helpers/date';
import { TASK_STATUS } from '../../constants';

// ============================================================================
// Sub-components
// ============================================================================

function StatusHeader({ status, isOverdue }) {
  const config = getStatusConfig(status);

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${config.bg} 0%, ${config.borderColor}22 100%)`,
        borderBottom: `3px solid ${isOverdue ? '#f44336' : config.borderColor}`,
        px: 2,
        py: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography sx={{ fontSize: '1.2rem' }}>{config.icon}</Typography>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: config.color,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {config.label}
        </Typography>
      </Stack>
      {isOverdue && (
        <Chip
          icon={<WarningIcon sx={{ fontSize: '0.9rem' }} />}
          label="Overdue"
          size="small"
          color="error"
          sx={{ fontWeight: 600 }}
        />
      )}
    </Box>
  );
}

function PriorityBadge({ priority }) {
  const config = getPriorityConfig(priority);

  return (
    <Avatar
      sx={{
        width: 36,
        height: 36,
        bgcolor: config.bg,
        color:
          config.color === 'default'
            ? 'text.secondary'
            : `${config.color}.main`,
        fontSize: '0.75rem',
        fontWeight: 700,
      }}
    >
      P{priority}
    </Avatar>
  );
}

function TaskMeta({ endDate, assigneeName, timeLeft, isOverdue }) {
  return (
    <Stack spacing={1} sx={{ mb: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <CalendarTodayIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary">
          Due: {formatDate(endDate)}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        <AccessTimeIcon
          sx={{
            fontSize: '0.9rem',
            color: isOverdue ? 'error.main' : 'text.secondary',
          }}
        />
        <Typography
          variant="body2"
          sx={{
            color: isOverdue ? 'error.main' : 'text.secondary',
            fontWeight: isOverdue ? 600 : 400,
          }}
        >
          {timeLeft}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        <PersonIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary">
          {assigneeName}
        </Typography>
      </Stack>
    </Stack>
  );
}

function TaskActions({ task, onEdit, onAction, onDelete, showDelete }) {
  const isCompleted = task.status === TASK_STATUS.COMPLETED;
  const nextAction = getNextAction(task.status);

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {!isCompleted && (
        <Button
          variant="contained"
          size="small"
          startIcon={
            task.status === TASK_STATUS.PENDING ? (
              <PlayArrowIcon />
            ) : (
              <CheckCircleIcon />
            )
          }
          onClick={() => onAction?.(task)}
          sx={{ flex: 1, fontWeight: 600 }}
        >
          {nextAction}
        </Button>
      )}
      <Tooltip title="Edit">
        <IconButton size="small" onClick={() => onEdit?.(task)}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {(showDelete || isCompleted) && (
        <Tooltip title="Delete">
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete?.(task)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * TaskCard - A reusable task card component
 *
 * @param {Object} props
 * @param {Object} props.task - Task object
 * @param {Function} props.onEdit - Edit callback
 * @param {Function} props.onAction - Action (Start/Complete) callback
 * @param {Function} props.onDelete - Delete callback
 * @param {Function} props.getAssigneeName - Get assignee name from key
 * @param {boolean} props.compact - Compact view mode
 * @param {boolean} props.showDelete - Show delete button
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
  const isCompleted = task.status === TASK_STATUS.COMPLETED;
  const isOverdue = isTaskOverdue(task);
  const timeLeft = getTimeLeft(task.end_date);
  const assigneeName = getAssigneeName(task.assigned_to);
  const priorityConfig = getPriorityConfig(task.priority);
  const statusConfig = getStatusConfig(task.status);

  // Compact view for mobile/list
  if (compact) {
    return (
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 2,
          borderLeft: `4px solid ${isOverdue ? '#f44336' : statusConfig.borderColor}`,
          backgroundColor: isCompleted ? '#fafafa' : '#fff',
          opacity: isCompleted ? 0.8 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          transition: 'all 0.2s',
          '&:hover': { boxShadow: 3 },
        }}
      >
        <PriorityBadge priority={task.priority} />

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
            <Chip
              label={statusConfig.label}
              size="small"
              sx={{
                bgcolor: statusConfig.bg,
                color: statusConfig.color,
                height: 20,
                fontSize: '0.65rem',
              }}
            />
            {isOverdue && (
              <Chip
                label="Overdue"
                size="small"
                color="error"
                sx={{ height: 20, fontSize: '0.65rem' }}
              />
            )}
            <Typography variant="caption" color="text.secondary">
              {timeLeft}
            </Typography>
          </Stack>
        </Box>

        <Stack direction="row" spacing={0.5}>
          {!isCompleted && (
            <IconButton
              size="small"
              color="primary"
              onClick={() => onAction?.(task)}
            >
              {task.status === TASK_STATUS.PENDING ? (
                <PlayArrowIcon />
              ) : (
                <CheckCircleIcon />
              )}
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
        backgroundColor: isCompleted ? '#fafafa' : '#fff',
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
      <StatusHeader status={task.status} isOverdue={isOverdue} />

      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 1.5 }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              lineHeight: 1.3,
              flex: 1,
              textDecoration: isCompleted ? 'line-through' : 'none',
              color: isCompleted ? 'text.secondary' : 'text.primary',
            }}
          >
            {task.title}
          </Typography>
          <Chip
            label={`P${task.priority}`}
            size="small"
            sx={{
              bgcolor: priorityConfig.bg,
              fontWeight: 700,
              ml: 1,
            }}
          />
        </Stack>

        {/* Description */}
        {task.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.5,
            }}
          >
            {task.description}
          </Typography>
        )}

        {/* Meta info */}
        <TaskMeta
          endDate={task.end_date}
          assigneeName={assigneeName}
          timeLeft={timeLeft}
          isOverdue={isOverdue}
        />

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Actions */}
        <TaskActions
          task={task}
          onEdit={onEdit}
          onAction={onAction}
          onDelete={onDelete}
          showDelete={showDelete}
        />
      </Box>
    </Paper>
  );
}

