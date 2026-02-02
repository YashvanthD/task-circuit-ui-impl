/**
 * DataTableErrorState Component
 * Error state with retry option
 */

import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import ActionButton from '../ActionButton';

export default function DataTableErrorState({ error, onRetry }) {
  return (
    <Box sx={{ py: 3 }}>
      <Alert
        severity="error"
        action={
          onRetry && (
            <ActionButton size="small" variant="outlined" onClick={onRetry}>
              Retry
            </ActionButton>
          )
        }
      >
        <Typography variant="body2">
          {error?.message || error || 'Failed to load data'}
        </Typography>
      </Alert>
    </Box>
  );
}
