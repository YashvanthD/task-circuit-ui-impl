/**
 * DateRangeFilter Component
 * Reusable date range filter with start/end date inputs.
 *
 * @module components/common/DateRangeFilter
 */

import React from 'react';
import { Stack, TextField } from '@mui/material';

/**
 * DateRangeFilter - Reusable date range filter
 *
 * @param {Object} props
 * @param {string} props.startDate - Start date value (YYYY-MM-DD)
 * @param {Function} props.onStartChange - Start date change handler
 * @param {string} props.endDate - End date value (YYYY-MM-DD)
 * @param {Function} props.onEndChange - End date change handler
 * @param {string} props.startLabel - Start date label
 * @param {string} props.endLabel - End date label
 * @param {string} props.size - Size ('small' | 'medium')
 * @param {string} props.direction - Stack direction
 * @param {number} props.spacing - Spacing between inputs
 */
export default function DateRangeFilter({
  startDate = '',
  onStartChange,
  endDate = '',
  onEndChange,
  startLabel = 'From',
  endLabel = 'To',
  size = 'small',
  direction = 'row',
  spacing = 2,
}) {
  return (
    <Stack direction={direction} spacing={spacing}>
      <TextField
        label={startLabel}
        type="date"
        size={size}
        value={startDate}
        onChange={(e) => onStartChange?.(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 140 }}
      />
      <TextField
        label={endLabel}
        type="date"
        size={size}
        value={endDate}
        onChange={(e) => onEndChange?.(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 140 }}
      />
    </Stack>
  );
}

