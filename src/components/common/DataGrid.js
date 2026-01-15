/**
 * DataGrid Component
 * Reusable grid/list layout for cards.
 *
 * @module components/common/DataGrid
 */

import React from 'react';
import { Grid, Stack } from '@mui/material';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';

/**
 * DataGrid - Reusable data grid/list layout
 *
 * @param {Object} props
 * @param {Array} props.items - Array of items to render
 * @param {Function} props.renderItem - Render function for each item
 * @param {Function} props.getKey - Key extraction function
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {Function} props.onRetry - Retry handler
 * @param {boolean} props.compact - Compact (list) mode
 * @param {number} props.spacing - Grid spacing
 * @param {Object} props.gridProps - Grid item props { xs, sm, md, lg }
 * @param {string} props.emptyIcon - Empty state icon
 * @param {string} props.emptyTitle - Empty state title
 * @param {string} props.emptyMessage - Empty state message
 * @param {string} props.loadingMessage - Loading message
 * @param {Object} props.sx - Additional sx styles
 */
export default function DataGrid({
  items = [],
  renderItem,
  getKey = (item, index) => item.id || item._id || index,
  loading = false,
  error = '',
  onRetry,
  compact = false,
  spacing = 3,
  gridProps = { xs: 12, sm: 6, md: 4 },
  emptyIcon = '📭',
  emptyTitle = 'No items found',
  emptyMessage,
  loadingMessage = 'Loading...',
  sx = {},
}) {
  // Loading state
  if (loading) {
    return <LoadingState message={loadingMessage} variant={compact ? 'skeleton' : 'circular'} />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} compact />;
  }

  // Empty state
  if (items.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} message={emptyMessage} />;
  }

  // Compact (list) mode
  if (compact) {
    return (
      <Stack spacing={2} sx={sx}>
        {items.map((item, index) => (
          <React.Fragment key={getKey(item, index)}>
            {renderItem(item, index)}
          </React.Fragment>
        ))}
      </Stack>
    );
  }

  // Grid mode
  return (
    <Grid container spacing={spacing} sx={sx}>
      {items.map((item, index) => (
        <Grid
          item
          xs={gridProps.xs}
          sm={gridProps.sm}
          md={gridProps.md}
          lg={gridProps.lg}
          key={getKey(item, index)}
        >
          {renderItem(item, index)}
        </Grid>
      ))}
    </Grid>
  );
}

