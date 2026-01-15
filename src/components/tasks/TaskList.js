/**
 * TaskList Component
 * Renders a grid of task cards with empty state handling.
 *
 * @module components/tasks/TaskList
 */

import React from 'react';
import { Grid, Typography, CircularProgress, Stack } from '@mui/material';
import TaskCard from '../TaskCard';

/**
 * TaskList - Renders a list of tasks as cards.
 *
 * @param {Object} props
 * @param {Array} props.tasks - List of tasks to display
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onEdit - Edit task handler
 * @param {Function} props.onDelete - Delete task handler
 * @param {Function} props.onStatusChange - Status change handler
 * @param {boolean} props.isMobile - Mobile view flag
 */
export default function TaskList({
  tasks = [],
  loading = false,
  onEdit,
  onDelete,
  onStatusChange,
  isMobile = false,
}) {
  if (loading) {
    return (
      <Stack alignItems="center" sx={{ py: 4 }}>
        <CircularProgress />
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Loading tasks...
        </Typography>
      </Stack>
    );
  }

  if (tasks.length === 0) {
    return (
      <Stack alignItems="center" sx={{ py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No tasks found.
        </Typography>
      </Stack>
    );
  }

  return (
    <Grid container spacing={2}>
      {tasks.map((task) => (
        <Grid item xs={12} sm={6} md={4} key={task.task_id || task.id}>
          <TaskCard
            task={task}
            onEdit={() => onEdit?.(task)}
            onDelete={() => onDelete?.(task)}
            onNext={() => onStatusChange?.(task)}
            variant={isMobile ? 'compact' : 'default'}
          />
        </Grid>
      ))}
    </Grid>
  );
}

