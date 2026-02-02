/**
 * TrendIndicator - Shows trend direction with arrow and percentage
 */
import React from 'react';
import { Box, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

export default function TrendIndicator({
  trend = 'stable',
  value,
  inverted = false,
  size = 'small',
  showIcon = true,
  showValue = true,
}) {
  const getColor = () => {
    if (trend === 'stable') return 'text.secondary';
    const isPositive = trend === 'up';
    const shouldBeGreen = inverted ? !isPositive : isPositive;
    return shouldBeGreen ? 'success.main' : 'error.main';
  };

  const getIcon = () => {
    const iconProps = { fontSize: size, sx: { color: getColor() } };
    if (trend === 'up') return <TrendingUpIcon {...iconProps} />;
    if (trend === 'down') return <TrendingDownIcon {...iconProps} />;
    return <TrendingFlatIcon {...iconProps} />;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {showIcon && getIcon()}
      {showValue && value !== undefined && (
        <Typography variant="caption" sx={{ color: getColor(), fontWeight: 600 }}>
          {value > 0 ? '+' : ''}{value}%
        </Typography>
      )}
    </Box>
  );
}
