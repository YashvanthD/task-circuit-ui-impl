import React from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

/**
 * ViewHeader Component
 * Consistent header for in-page views with a back button
 *
 * @param {Object} props
 * @param {string} props.title - Title of the current view
 * @param {string} props.subtitle - Optional subtitle
 * @param {Function} props.onBack - Back button click handler
 * @param {React.ReactNode} props.action - Optional action button on the right
 */
export default function ViewHeader({ title, subtitle, onBack, action }) {
  return (
    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
      {onBack && (
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{
            color: 'text.secondary',
            minWidth: 'auto',
            px: { xs: 1, sm: 2 }
          }}
        >
          Back
        </Button>
      )}

      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <Typography
          variant="h5"
          fontWeight={700}
          noWrap
          sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {subtitle}
          </Typography>
        )}
      </Box>

      {action && (
        <Box sx={{ ml: 'auto' }}>
          {action}
        </Box>
      )}
    </Box>
  );
}
