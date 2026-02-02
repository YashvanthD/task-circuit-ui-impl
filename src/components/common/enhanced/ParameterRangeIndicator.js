/**
 * ParameterRangeIndicator - Visual range indicator for parameters
 */
import React from 'react';
import { Box, Typography } from '@mui/material';

export default function ParameterRangeIndicator({
  value,
  min,
  max,
  optimal = [min, max],
  showValue = true,
  height = 8,
  label,
}) {
  const percentage = ((value - min) / (max - min)) * 100;
  const optimalStart = ((optimal[0] - min) / (max - min)) * 100;
  const optimalEnd = ((optimal[1] - min) / (max - min)) * 100;

  const getColor = () => {
    if (value >= optimal[0] && value <= optimal[1]) return '#4caf50';
    if (value >= min && value <= max) return '#ff9800';
    return '#f44336';
  };

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          {label}
        </Typography>
      )}
      <Box sx={{ position: 'relative', height, bgcolor: '#e0e0e0', borderRadius: 1 }}>
        {/* Optimal range background */}
        <Box
          sx={{
            position: 'absolute',
            left: `${optimalStart}%`,
            width: `${optimalEnd - optimalStart}%`,
            height: '100%',
            bgcolor: '#c8e6c9',
            borderRadius: 1,
          }}
        />
        {/* Value indicator */}
        <Box
          sx={{
            position: 'absolute',
            left: `${Math.max(0, Math.min(100, percentage))}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 12,
            height: 12,
            bgcolor: getColor(),
            borderRadius: '50%',
            border: '2px solid white',
            boxShadow: 1,
          }}
        />
      </Box>
      {showValue && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">{min}</Typography>
          <Typography variant="caption" fontWeight={600} color={getColor()}>{value}</Typography>
          <Typography variant="caption" color="text.secondary">{max}</Typography>
        </Box>
      )}
    </Box>
  );
}
