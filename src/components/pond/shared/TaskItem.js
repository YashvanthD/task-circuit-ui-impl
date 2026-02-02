/**
 * TaskItem - Single task item for checklists
 */
import React from 'react';
import { Box, Typography, Checkbox, Chip } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function TaskItem({
  task,
  onComplete,
  onClick,
  showTime = true,
  compact = false,
}) {
  const isOverdue = !task.completed && task.overdue;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: compact ? 0.5 : 1,
        px: compact ? 0 : 1,
        borderRadius: 1,
        bgcolor: isOverdue ? 'error.lighter' : 'transparent',
        '&:hover': { bgcolor: 'action.hover' },
        transition: 'background-color 0.2s'
      }}
      onClick={onClick}
    >
      <Checkbox
        checked={task.completed}
        onChange={(e) => {
          e.stopPropagation();
          onComplete && onComplete(task.id);
        }}
        size={compact ? "small" : "medium"}
        color={isOverdue ? "error" : "primary"}
      />

      <Box sx={{ flex: 1, ml: 1, cursor: onClick ? 'pointer' : 'default' }}>
        <Typography
          variant={compact ? "caption" : "body2"}
          sx={{
            textDecoration: task.completed ? 'line-through' : 'none',
            color: task.completed ? 'text.disabled' : (isOverdue ? 'error.main' : 'text.primary'),
            fontWeight: isOverdue ? 600 : 400
          }}
        >
          {task.title}
        </Typography>
      </Box>

      {showTime && task.dueTime && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {!compact && <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5, color: isOverdue ? 'error.main' : 'text.secondary' }} />}
          <Typography
            variant="caption"
            sx={{
              color: isOverdue ? 'error.main' : 'text.secondary',
              fontWeight: isOverdue ? 600 : 400
            }}
          >
            {task.dueTime}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
