/**
 * StatusChip Component
 * Reusable status indicator chip.
 *
 * @module components/common/StatusChip
 */

import React from 'react';
import { Chip } from '@mui/material';

/**
 * StatusChip - Reusable status chip with auto-styling
 *
 * @param {Object} props
 * @param {string} props.status - Status value
 * @param {Object} props.config - Status config { bg, color, label, icon }
 * @param {string} props.label - Override label
 * @param {string} props.size - Chip size ('small' | 'medium')
 * @param {string} props.variant - Chip variant ('filled' | 'outlined')
 */
export default function StatusChip({
  status,
  config,
  label,
  size = 'small',
  variant = 'filled',
}) {
  const displayLabel = label || config?.label || status;
  const icon = config?.icon;

  const chipSx = config
    ? {
        bgcolor: variant === 'filled' ? config.bg : 'transparent',
        color: config.color,
        borderColor: config.borderColor || config.color,
        fontWeight: 600,
        '& .MuiChip-label': { px: 1 },
      }
    : {};

  return (
    <Chip
      label={displayLabel}
      size={size}
      variant={variant}
      sx={chipSx}
      icon={
        icon ? (
          <span style={{ fontSize: '0.9rem', marginLeft: 8 }}>{icon}</span>
        ) : undefined
      }
    />
  );
}

