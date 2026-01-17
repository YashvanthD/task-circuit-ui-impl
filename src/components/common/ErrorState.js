/**
 * ErrorState Component
 * Reusable error state display.
 *
 * @module components/common/ErrorState
 */

import React from 'react';
import { Paper, Typography, Button, Stack } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

/**
 * ErrorState - Reusable error state display
 *
 * @param {Object} props
 * @param {string} props.title - Error title
 * @param {string} props.message - Error message
 * @param {Function} props.onRetry - Retry handler
 * @param {string} props.retryLabel - Retry button label
 * @param {boolean} props.compact - Compact mode (inline)
 */
export default function ErrorState({
  title = 'Error',
  message = 'Something went wrong. Please try again.',
  onRetry,
  retryLabel = 'Retry',
  compact = false,
}) {
  if (compact) {
    return (
      <Paper
        sx={{
          p: 2,
          bgcolor: 'error.light',
          border: '1px solid',
          borderColor: 'error.main',
          borderRadius: 2,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <ErrorOutlineIcon color="error" fontSize="small" />
            <Typography color="error" variant="body2">
              {message}
            </Typography>
          </Stack>
          {onRetry && (
            <Button size="small" onClick={onRetry}>
              {retryLabel}
            </Button>
          )}
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack
      alignItems="center"
      sx={{
        py: 4,
        px: 2,
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />

      <Typography variant="h6" color="error" sx={{ mb: 1 }}>
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary" textAlign="center">
        {message}
      </Typography>

      {onRetry && (
        <Button
          variant="contained"
          color="primary"
          onClick={onRetry}
          sx={{ mt: 2 }}
        >
          {retryLabel}
        </Button>
      )}
    </Stack>
  );
}

