/**
 * SamplingStats Component
 * Displays sampling statistics summary.
 *
 * @module components/sampling/SamplingStats
 */

import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import { computeSamplingStats } from '../../utils/helpers/sampling';

/**
 * SamplingStats - Displays sampling statistics.
 *
 * @param {Object} props
 * @param {Array} props.samplings - List of samplings
 */
export default function SamplingStats({ samplings = [] }) {
  const stats = computeSamplingStats(samplings);

  const statItems = [
    { label: 'Total', value: stats.total, color: 'text.primary' },
    { label: 'Scheduled', value: stats.scheduled, color: 'warning.main' },
    { label: 'In Progress', value: stats.inProgress, color: 'info.main' },
    { label: 'Completed', value: stats.completed, color: 'success.main' },
    { label: 'Overdue', value: stats.overdue, color: 'error.main' },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {statItems.map((item) => (
        <Grid item xs={6} sm={4} md={2.4} key={item.label}>
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

