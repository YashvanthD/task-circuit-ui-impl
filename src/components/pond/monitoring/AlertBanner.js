/**
 * AlertBanner - Prominent issue/alert display for cards
 */
import React from 'react';
import { Box, Typography, Button, Collapse, IconButton } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

export default function AlertBanner({
  issues = [],
  severity = 'warning', // critical|warning|info
  onAction,
  onDismiss,
  compact = false,
}) {
  if (!issues || issues.length === 0) return null;

  const getConfig = () => {
    switch (severity) {
      case 'critical':
        return {
          bgcolor: 'error.lighter',
          color: 'error.dark',
          icon: <ErrorIcon color="error" fontSize={compact ? "small" : "medium"} />,
          borderColor: 'error.main'
        };
      case 'info':
        return {
          bgcolor: 'info.lighter',
          color: 'info.dark',
          icon: <InfoIcon color="info" fontSize={compact ? "small" : "medium"} />,
          borderColor: 'info.main'
        };
      default: // warning
        return {
          bgcolor: 'warning.lighter',
          color: 'warning.dark',
          icon: <WarningIcon color="warning" fontSize={compact ? "small" : "medium"} />,
          borderColor: 'warning.main'
        };
    }
  };

  const config = getConfig();

  return (
    <Box
      sx={{
        bgcolor: config.bgcolor,
        color: config.color,
        p: compact ? 1 : 1.5,
        borderRadius: 1,
        borderLeft: `4px solid`,
        borderColor: config.borderColor,
        display: 'flex',
        alignItems: 'flex-start',
        mb: 2,
      }}
    >
      <Box sx={{ mr: 1.5, mt: 0.25, display: 'flex' }}>
        {config.icon}
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
          {severity === 'critical' ? 'Attention Needed' : 'Alert'}
        </Typography>
        {issues.map((issue, idx) => (
          <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
            • {issue}
          </Typography>
        ))}
        {onAction && (
          <Button
            size="small"
            variant="outlined"
            color={severity === 'critical' ? 'error' : severity === 'info' ? 'info' : 'warning'}
            onClick={onAction}
            sx={{ mt: 0.5, bg: 'white' }}
          >
            Take Action
          </Button>
        )}
      </Box>

      {onDismiss && (
        <IconButton size="small" onClick={onDismiss} sx={{ color: config.color }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
