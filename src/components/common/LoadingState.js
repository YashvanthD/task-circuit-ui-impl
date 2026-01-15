/**
 * LoadingState Component
 * Reusable loading state display.
 *
 * @module components/common/LoadingState
 */

import React from 'react';
import { Stack, Typography, CircularProgress, LinearProgress, Skeleton } from '@mui/material';

/**
 * LoadingState - Reusable loading state display
 *
 * @param {Object} props
 * @param {string} props.message - Loading message
 * @param {string} props.variant - Variant ('circular' | 'linear' | 'skeleton')
 * @param {number} props.size - Circular progress size
 * @param {number} props.py - Vertical padding
 * @param {number} props.skeletonCount - Number of skeleton rows
 * @param {number} props.skeletonHeight - Height of skeleton rows
 */
export default function LoadingState({
  message = 'Loading...',
  variant = 'circular',
  size = 40,
  py = 4,
  skeletonCount = 3,
  skeletonHeight = 60,
}) {
  if (variant === 'skeleton') {
    return (
      <Stack spacing={2} sx={{ py }}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rounded"
            height={skeletonHeight}
            animation="wave"
          />
        ))}
      </Stack>
    );
  }

  if (variant === 'linear') {
    return (
      <Stack alignItems="center" sx={{ py, width: '100%' }}>
        <LinearProgress sx={{ width: '100%', maxWidth: 400, mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </Stack>
    );
  }

  // Default: circular
  return (
    <Stack alignItems="center" sx={{ py }}>
      <CircularProgress size={size} />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Stack>
  );
}

