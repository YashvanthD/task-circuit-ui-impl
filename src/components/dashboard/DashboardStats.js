/**
 * DashboardStats Component
 * Displays active and critical task statistics.
 *
 * @module components/dashboard/DashboardStats
 */

import React from 'react';
import { Grid, Card, CardContent, Typography, Paper } from '@mui/material';

/**
 * DashboardStats - Shows task statistics cards.
 *
 * @param {Object} props
 * @param {number} props.activeTasks - Number of active tasks
 * @param {number} props.criticalTasks - Number of critical tasks
 */
export default function DashboardStats({ activeTasks = 0, criticalTasks = 0 }) {
  if (activeTasks === 0 && criticalTasks === 0) {
    return (
      <Paper elevation={2} sx={{ mb: 4, p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No tasks available.
        </Typography>
      </Paper>
    );
  }

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6}>
        <Card sx={{ p: 2, m: 2 }}>
          <CardContent>
            <Typography variant="h6">Active Tasks</Typography>
            <Typography variant="h3" color="primary">
              {activeTasks}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Card sx={{ p: 2, m: 2 }}>
          <CardContent>
            <Typography variant="h6">Critical Tasks</Typography>
            <Typography variant="h3" color="error">
              {criticalTasks}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

