/**
 * TaskStats Component
 * Displays task statistics in a card grid.
 *
 * @module components/tasks/TaskStats
 */

import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import { computeTaskStats } from '../../utils/helpers/tasks';

/**
 * TaskStats - Displays task statistics.
 *
 * @param {Object} props
 * @param {Array} props.tasks - List of tasks
 */
export default function TaskStats({ tasks = [] }) {
  const stats = computeTaskStats(tasks);

  const statItems = [
    { label: 'Total', value: stats.total, color: 'text.primary' },
    { label: 'Pending', value: stats.pending, color: 'warning.main' },
    { label: 'In Progress', value: stats.inprogress, color: 'info.main' },
    { label: 'Completed', value: stats.completed, color: 'success.main' },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {statItems.map((item) => (
        <Grid item xs={6} sm={3} key={item.label}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color={item.color}>
                {item.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

