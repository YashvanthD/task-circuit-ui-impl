/**
 * DataTablePagination Component
 * Pagination controls with Load More and Show Less buttons
 */

import React from 'react';
import { Box } from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import ActionButton from '../ActionButton';

export default function DataTablePagination({
  visibleCount,
  totalCount,
  initialRowCount,
  loadMoreCount,
  onLoadMore,
  onShowLess,
  showPagination,
}) {
  if (!showPagination || totalCount <= initialRowCount) {
    return null;
  }

  const hasMoreRows = totalCount > visibleCount;
  const canShowLess = visibleCount > initialRowCount;

  return (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
      {canShowLess && (
        <ActionButton
          size="small"
          variant="text"
          onClick={onShowLess}
          icon={<ExpandLessIcon />}
        >
          Show Less
        </ActionButton>
      )}
      {hasMoreRows && (
        <ActionButton
          size="small"
          variant="text"
          onClick={onLoadMore}
          icon={<ExpandMoreIcon />}
        >
          Load More ({Math.min(loadMoreCount, totalCount - visibleCount)} more)
        </ActionButton>
      )}
    </Box>
  );
}
