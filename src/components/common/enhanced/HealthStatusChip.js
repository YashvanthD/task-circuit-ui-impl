/**
 * HealthStatusChip - Pond/Stock health status indicator
 */
import React from 'react';
import { Chip } from '@mui/material';

export default function HealthStatusChip({
  status = 'unknown',
  size = 'small',
  showLabel = true,
  showIcon = true,
  onClick,
}) {
  const statusConfig = {
    healthy: {
      label: 'Healthy',
      icon: '🟢',
      color: 'success',
    },
    attention: {
      label: 'Needs Attention',
      icon: '🟡',
      color: 'warning',
    },
    critical: {
      label: 'Critical',
      icon: '🔴',
      color: 'error',
    },
    unknown: {
      label: 'Unknown',
      icon: '⚪',
      color: 'default',
    },
  };

  const config = statusConfig[status] || statusConfig.unknown;

  return (
    <Chip
      label={`${showIcon ? config.icon + ' ' : ''}${showLabel ? config.label : ''}`}
      color={config.color}
      size={size}
      onClick={onClick}
    />
  );
}
