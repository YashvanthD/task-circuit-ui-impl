/**
 * StatusChip Component
 * Centralized, reusable status indicator chip
 * Theme-aware with built-in status presets
 *
 * @module components/common/StatusChip
 */

import React from 'react';
import { Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

// Default status configurations (theme-aware)
const DEFAULT_STATUS_CONFIG = {
  active: {
    label: 'Active',
    color: '#fff',
    bg: 'success.main',
    icon: <CheckCircleIcon sx={{ fontSize: '1rem' }} />,
  },
  inactive: {
    label: 'Inactive',
    color: '#fff',
    bg: 'grey.500',
    icon: <CancelIcon sx={{ fontSize: '1rem' }} />,
  },
  pending: {
    label: 'Pending',
    color: '#000',
    bg: 'warning.main',
    icon: <WarningIcon sx={{ fontSize: '1rem' }} />,
  },
  completed: {
    label: 'Completed',
    color: '#fff',
    bg: 'success.main',
    icon: <CheckCircleIcon sx={{ fontSize: '1rem' }} />,
  },
  failed: {
    label: 'Failed',
    color: '#fff',
    bg: 'error.main',
    icon: <CancelIcon sx={{ fontSize: '1rem' }} />,
  },
  draft: {
    label: 'Draft',
    color: '#fff',
    bg: 'info.main',
    icon: <InfoIcon sx={{ fontSize: '1rem' }} />,
  },
  success: {
    label: 'Success',
    color: '#fff',
    bg: 'success.main',
    icon: <CheckCircleIcon sx={{ fontSize: '1rem' }} />,
  },
  error: {
    label: 'Error',
    color: '#fff',
    bg: 'error.main',
    icon: <CancelIcon sx={{ fontSize: '1rem' }} />,
  },
  warning: {
    label: 'Warning',
    color: '#000',
    bg: 'warning.main',
    icon: <WarningIcon sx={{ fontSize: '1rem' }} />,
  },
  info: {
    label: 'Info',
    color: '#fff',
    bg: 'info.main',
    icon: <InfoIcon sx={{ fontSize: '1rem' }} />,
  },
};

/**
 * StatusChip - Reusable status chip with auto-styling
 *
 * @param {Object} props
 * @param {string} props.status - Status value (active, inactive, pending, etc.)
 * @param {Object} props.config - Custom status config { bg, color, label, icon }
 * @param {string} props.label - Override label
 * @param {string} props.size - Chip size ('small'|'medium')
 * @param {string} props.variant - Chip variant ('filled'|'outlined')
 * @param {boolean} props.showIcon - Show status icon (default: true)
 * @param {Object} props.sx - Additional sx styles
 */
export default function StatusChip({
  status,
  config,
  label,
  size = 'small',
  variant = 'filled',
  showIcon = true,
  sx = {},
  ...rest
}) {
  // Use provided config or default config
  const statusConfig = config || DEFAULT_STATUS_CONFIG[status?.toLowerCase()];

  const displayLabel = label || statusConfig?.label || status;
  const icon = showIcon && statusConfig?.icon;

  const chipSx = statusConfig
    ? {
        bgcolor: variant === 'filled' ? statusConfig.bg : 'transparent',
        color: statusConfig.color,
        borderColor: statusConfig.borderColor || statusConfig.bg,
        fontWeight: 600,
        '& .MuiChip-label': { px: 1.5 },
        '& .MuiChip-icon': { color: 'inherit' },
        ...sx,
      }
    : {
        fontWeight: 600,
        ...sx,
      };

  return (
    <Chip
      label={displayLabel}
      size={size}
      variant={variant}
      icon={icon}
      sx={chipSx}
      {...rest}
    />
  );
}

