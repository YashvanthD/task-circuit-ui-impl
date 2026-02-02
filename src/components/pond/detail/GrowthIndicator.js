/**
 * GrowthIndicator - Visual growth status (on track, slow, fast)
 */
import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { ProgressBar } from '../../common/enhanced';

export default function GrowthIndicator({
  stock,
  targetGrowth, // Expected weight at this age
  currentGrowth, // Current avg weight
  size = 'small',
  showDetails = false,
}) {
  if (!currentGrowth || !targetGrowth) return null;

  const percentage = (currentGrowth / targetGrowth) * 100;

  const getStatus = () => {
    if (percentage >= 105) return { label: 'Fast Growth', color: 'success', icon: <TrendingUpIcon /> };
    if (percentage >= 95) return { label: 'On Track', color: 'success', icon: <TrendingFlatIcon /> };
    if (percentage >= 85) return { label: 'Slightly Slow', color: 'warning', icon: <TrendingDownIcon /> };
    return { label: 'Slow Growth', color: 'error', icon: <TrendingDownIcon /> };
  };

  const status = getStatus();

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
           <Typography variant="caption" sx={{ fontWeight: 600, color: `${status.color}.main` }}>
             {status.label}
           </Typography>
        </Box>
        {showDetails && (
           <Typography variant="caption" color="text.secondary">
             {Math.round(percentage)}% of target
           </Typography>
        )}
      </Box>

      <Tooltip title={`Target: ${targetGrowth}g | Current: ${currentGrowth}g`}>
        <Box sx={{ width: '100%' }}>
            <ProgressBar
                value={currentGrowth}
                max={targetGrowth * 1.2}
                color={status.color}
                height={6}
                showValue={false}
            />
        </Box>
      </Tooltip>
    </Box>
  );
}
