/**
 * AlertsSection Component
 * Displays top alerts with loading and empty states.
 * Mobile-first responsive design.
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
  Box,
} from '@mui/material';
import {
  NotificationsActive as AlertIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import AlertCard from './AlertCard';

/**
 * AlertsSection - Top alerts display section.
 * Responsive grid layout for mobile and desktop.
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
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: { xs: 2, sm: 2.5 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'warning.lighter',
              color: 'warning.main',
            }}
          >
            <AlertIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Alerts
            </Typography>
            {alerts.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                {alerts.length} alert{alerts.length !== 1 ? 's' : ''} requiring attention
              </Typography>
            )}
          </Box>
        </Box>

        <Button
          size="small"
          endIcon={<ArrowForwardIcon />}
          onClick={onSeeMore}
          sx={{ textTransform: 'none' }}
        >
          View All
        </Button>
      </Box>

      {/* Content */}
      {loading ? (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress size={32} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading alerts...
          </Typography>
        </Stack>
      ) : error ? (
        <Typography color="error" sx={{ py: 2 }}>
          {error}
        </Typography>
      ) : alerts.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            color: 'text.secondary',
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 48, color: 'success.light', mb: 1 }} />
          <Typography variant="body2">No alerts to show</Typography>
          <Typography variant="caption" color="text.disabled">
            All caught up!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          {alerts.map((alert, idx) => (
            <Grid item xs={12} sm={6} md={4} key={alert.task_id || idx}>
              <AlertCard alert={alert} onClick={() => onAlertClick?.(alert, idx)} />
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
}

