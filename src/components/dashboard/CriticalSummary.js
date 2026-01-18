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
      elevation={3}
      sx={{
        mb: 4,
        p: 2,
        bgcolor: '#d32f2f',
        border: '2px solid',
        borderColor: '#b71c1c',
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff' }}>
        ⚠️ Critical: {criticalCount} actions & {alertCount} alerts
      </Typography>
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
        Immediate attention required for critical actions and alerts.
      </Typography>
    </Paper>
  );
}

