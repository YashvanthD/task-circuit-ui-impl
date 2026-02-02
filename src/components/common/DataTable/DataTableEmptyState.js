/**
 * DataTableEmptyState Component
 * Empty state when no data is available
 */

import React from 'react';
import { Box, Typography } from '@mui/material';

export default function DataTableEmptyState({ message, action }) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 6,
        px: 2,
        bgcolor: 'background.default',
        borderRadius: 1,
      }}
    >
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {message || 'No data available'}
      </Typography>
      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
    </Box>
  );
}
