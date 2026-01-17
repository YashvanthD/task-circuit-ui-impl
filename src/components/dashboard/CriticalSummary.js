/**
 * CriticalSummary Component
 * Displays a critical alert banner with counts.
 *
 * @module components/dashboard/CriticalSummary
 */

import React from 'react';
import { Paper, Typography } from '@mui/material';

/**
 * CriticalSummary - Shows critical task and alert summary.
 *
 * @param {Object} props
 * @param {number} props.criticalCount - Number of critical tasks
 * @param {number} props.alertCount - Number of alerts
 */
export default function CriticalSummary({ criticalCount = 0, alertCount = 0 }) {
  if (criticalCount === 0 && alertCount === 0) {
    return null;
  }

  return (
    <Paper
      elevation={2}
      sx={{
        mb: 4,
        p: 2,
        bgcolor: 'error.light',
        border: '1px solid',
        borderColor: 'error.main',
      }}
    >
      <Typography variant="h6" color="error" sx={{ fontWeight: 'bold' }}>
        Critical: {criticalCount} actions & {alertCount} alerts
      </Typography>
      <Typography variant="body2" color="error">
        Immediate attention required for critical actions and alerts.
      </Typography>
    </Paper>
  );
}

