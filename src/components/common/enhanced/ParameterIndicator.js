/**
 * ParameterIndicator - Water quality parameter with status
 */
import React from 'react';
import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

export default function ParameterIndicator({
  parameter,
  value,
  unit,
  status = 'optimal',
  size = 'medium',
  showIcon = true,
  showRange = false,
  range,
}) {
  const getStatusIcon = () => {
    const iconSize = size === 'small' ? 16 : 20;
    if (status === 'optimal') {
      return <CheckCircleIcon sx={{ fontSize: iconSize, color: 'success.main' }} />;
    }
    if (status === 'acceptable') {
      return <WarningIcon sx={{ fontSize: iconSize, color: 'warning.main' }} />;
    }
    return <ErrorIcon sx={{ fontSize: iconSize, color: 'error.main' }} />;
  };

  const fontSize = size === 'small' ? 'caption' : 'body2';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {showIcon && getStatusIcon()}
      <Box>
        <Typography variant={fontSize} sx={{ fontWeight: 600 }}>
          {value !== null && value !== undefined ? `${value}${unit || ''}` : '-'}
        </Typography>
        {parameter && (
          <Typography variant="caption" color="text.secondary">
            {parameter}
          </Typography>
        )}
        {showRange && range && (
          <Typography variant="caption" color="text.secondary">
            ({range[0]}-{range[1]})
          </Typography>
        )}
      </Box>
    </Box>
  );
}
