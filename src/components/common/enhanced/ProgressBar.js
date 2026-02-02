/**
 * ProgressBar - Styled progress bar
 */
import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

export default function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  color = 'primary',
  height = 8,
  sx = {},
}) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <Box sx={{ width: '100%', ...sx }}>
      {(label || showValue) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          {label && <Typography variant="caption">{label}</Typography>}
          {showValue && (
            <Typography variant="caption" fontWeight={600}>
              {value}/{max}
            </Typography>
          )}
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={percentage}
        color={color}
        sx={{
          height,
          borderRadius: 1,
          bgcolor: 'action.hover',
        }}
      />
    </Box>
  );
}
