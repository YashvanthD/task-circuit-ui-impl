/**
 * CriticalSummary Component
 * Displays a critical alert banner with counts.
 * Mobile-first responsive design.
 *
 * @module components/dashboard/CriticalSummary
 */

import React from 'react';
import { Paper, Typography, Box, useTheme, useMediaQuery, alpha } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

/**
 * CriticalSummary - Shows critical task and alert summary.
 * Responsive banner that adapts to mobile and desktop.
 *
 * @param {Object} props
 * @param {number} props.criticalCount - Number of critical tasks
 * @param {number} props.alertCount - Number of alerts
 */
export default function CriticalSummary({ criticalCount = 0, alertCount = 0 }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (criticalCount === 0 && alertCount === 0) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        p: { xs: 1.5, sm: 2 },
        bgcolor: alpha(theme.palette.error.main, 0.1),
        border: '1px solid',
        borderColor: alpha(theme.palette.error.main, 0.3),
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: { xs: 1, sm: 2 },
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: { xs: 36, sm: 44 },
            height: { xs: 36, sm: 44 },
            borderRadius: 2,
            bgcolor: theme.palette.error.main,
            color: 'white',
            flexShrink: 0,
          }}
        >
          <WarningIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant={isMobile ? 'subtitle1' : 'h6'}
            fontWeight={600}
            color="error.dark"
            sx={{ lineHeight: 1.3 }}
          >
            {criticalCount > 0 && alertCount > 0
              ? `${criticalCount} Critical Task${criticalCount !== 1 ? 's' : ''} & ${alertCount} Alert${alertCount !== 1 ? 's' : ''}`
              : criticalCount > 0
              ? `${criticalCount} Critical Task${criticalCount !== 1 ? 's' : ''}`
              : `${alertCount} Alert${alertCount !== 1 ? 's' : ''}`}
          </Typography>
          <Typography
            variant="body2"
            color="error.dark"
            sx={{
              opacity: 0.85,
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            }}
          >
            Immediate attention required
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

