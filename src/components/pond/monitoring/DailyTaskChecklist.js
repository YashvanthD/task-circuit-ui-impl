/**
 * DailyTaskChecklist - Track today's pond tasks
 */
import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import TaskItem from '../shared/TaskItem';

export default function DailyTaskChecklist({
  tasks = [],
  onComplete,
  onTaskClick,
  showProgress = true,
  compact = false,
}) {
  if (!tasks || tasks.length === 0) {
    return (
      <Box sx={{ py: 1 }}>
         <Typography variant="caption" color="text.secondary">No tasks for today</Typography>
      </Box>
    );
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = (completedCount / tasks.length) * 100;

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, alignItems: 'center' }}>
        <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', color: 'text.secondary' }}>
          TODAY'S TASKS
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {completedCount}/{tasks.length}
        </Typography>
      </Box>

      {showProgress && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ mb: 1, borderRadius: 1, height: 4 }}
          color={progress === 100 ? 'success' : 'primary'}
        />
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onComplete={() => onComplete && onComplete(task.id)}
            onClick={() => onTaskClick && onTaskClick(task)}
            compact={compact}
          />
        ))}
      </Box>
    </Box>
  );
}
