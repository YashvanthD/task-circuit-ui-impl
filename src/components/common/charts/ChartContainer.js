/**
 * ChartContainer - Wrapper for all charts with common features
 */
import React from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';

export default function ChartContainer({
  title,
  subtitle,
  children,
  loading = false,
  height = 300,
  error = null,
  actions,
  sx = {},
}) {
  if (loading) {
    return (
      <Paper sx={{ p: 3, height, display: 'flex', alignItems: 'center', justifyContent: 'center', ...sx }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, height, display: 'flex', alignItems: 'center', justifyContent: 'center', ...sx }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: 'auto', ...sx }}>
      {(title || actions) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            {title && <Typography variant="h6">{title}</Typography>}
            {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
          </Box>
          {actions && <Box>{actions}</Box>}
        </Box>
      )}
      <Box sx={{ height }}>
        {children}
      </Box>
    </Paper>
  );
}
