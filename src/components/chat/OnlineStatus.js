/**
 * OnlineStatus Component
 * Shows online/offline status indicator.
 *
 * @module components/chat/OnlineStatus
 */

import React from 'react';
import { Box, Tooltip } from '@mui/material';

export default function OnlineStatus({ isOnline, size = 12, showTooltip = true }) {
  const indicator = (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: isOnline ? 'success.main' : 'grey.400',
        border: '2px solid',
        borderColor: 'background.paper',
        boxShadow: isOnline ? '0 0 4px rgba(76, 175, 80, 0.5)' : 'none',
      }}
    />
  );

  if (!showTooltip) return indicator;

  return (
    <Tooltip title={isOnline ? 'Online' : 'Offline'}>
      {indicator}
    </Tooltip>
  );
}

