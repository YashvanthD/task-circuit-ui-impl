/**
 * DataGrid Component
 * Centralized, reusable grid/list layout for data display
 * Theme-aware, responsive, with built-in loading/error/empty states
 *
 * @module components/common/DataGrid
 */

import React from 'react';
import { Grid, Stack, Box } from '@mui/material';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';

/**
 * DataGrid - Reusable data grid/list layout with best practices
 *
 * @param {Object} props
 * @param {Array} props.items - Array of items to render
 * @param {Function} props.renderItem - Render function for each item (item, index) => ReactNode
 * @param {Function} props.getKey - Key extraction function (item, index) => string
 * @param {boolean} props.loading - Loading state
 * @param {string|Error} props.error - Error message or error object
 * @param {Function} props.onRetry - Retry handler for error state
 * @param {boolean} props.compact - Compact (list) mode instead of grid
 * @param {number} props.spacing - Grid/Stack spacing (default: 3)
 * @param {Object} props.gridProps - Grid item props { xs, sm, md, lg, xl }
 * @param {string} props.emptyIcon - Empty state icon
 * @param {string} props.emptyTitle - Empty state title
 * @param {string} props.emptyMessage - Empty state message
 * @param {string} props.emptyActionLabel - Empty state action button label
 * @param {Function} props.onEmptyAction - Empty state action handler
 * @param {string} props.loadingMessage - Loading message
 * @param {string} props.loadingVariant - Loading variant (circular|linear|skeleton)
 * @param {Object} props.sx - Additional sx styles
 */
export default function DataGrid({
  items = [],
  renderItem,
  getKey = (item, index) => item.id || item._id || item.key || index,
  loading = false,
  error = '',
  onRetry,
  compact = false,
  spacing = 3,
  gridProps = { xs: 12, sm: 6, md: 4, lg: 3 },
  emptyIcon = '📭',
  emptyTitle = 'No items found',
  emptyMessage,
  emptyActionLabel,
  onEmptyAction,
  loadingMessage = 'Loading...',
  loadingVariant = 'skeleton',
  sx = {},
}) {
  // Loading state
  if (loading) {
    return (
      <LoadingState
        message={loadingMessage}
        variant={loadingVariant}
        skeletonCount={compact ? 5 : 6}
      />
    );
  }

  // Error state
  if (error) {
    const errorMessage = typeof error === 'string' ? error : error?.message || 'An error occurred';
    return <ErrorState message={errorMessage} onRetry={onRetry} compact />;
  }

  // Empty state
  if (items.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        message={emptyMessage}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  // Compact (list) mode
  if (compact) {
    return (
      <Stack spacing={spacing} sx={{ ...sx }}>
        {items.map((item, index) => (
          <Box key={getKey(item, index)}>
            {renderItem(item, index)}
          </Box>
        ))}
      </Stack>
    );
  }

  // Grid mode
  return (
    <Grid container spacing={spacing} sx={sx}>
      {items.map((item, index) => (
        <Grid item {...gridProps} key={getKey(item, index)}>
          {renderItem(item, index)}
        </Grid>
      ))}
    </Grid>
  );
}

