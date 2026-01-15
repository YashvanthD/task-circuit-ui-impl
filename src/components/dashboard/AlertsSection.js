/**
 * AlertsSection Component
 * Displays top alerts with loading and empty states.
 *
 * @module components/dashboard/AlertsSection
 */

import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Stack,
  Button,
  CircularProgress,
} from '@mui/material';
import AlertCard from './AlertCard';

/**
 * AlertsSection - Top alerts display section.
 *
 * @param {Object} props
 * @param {Array} props.alerts - List of alerts
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {Function} props.onAlertClick - Alert click handler
 * @param {Function} props.onSeeMore - See more button handler
 */
export default function AlertsSection({
  alerts = [],
  loading = false,
  error = '',
  onAlertClick,
  onSeeMore,
}) {
  return (
    <Paper elevation={2} sx={{ mb: 4, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Top 5 Alerts
      </Typography>

      {loading ? (
        <Stack alignItems="center" sx={{ mt: 2, mb: 2 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Loading alerts...
          </Typography>
        </Stack>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : alerts.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No alerts to show.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {alerts.map((alert, idx) => (
            <Grid item xs={12} sm={6} md={4} key={alert.task_id || idx}>
              <AlertCard alert={alert} onClick={() => onAlertClick?.(alert, idx)} />
            </Grid>
          ))}
        </Grid>
      )}

      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
        <Button variant="outlined" onClick={onSeeMore}>
          See More
        </Button>
      </Stack>
    </Paper>
  );
}

