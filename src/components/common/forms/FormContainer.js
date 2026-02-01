/**
 * FormContainer Component
 * Reusable form wrapper with consistent styling for all forms
 * Responsive design for mobile, tablet, and desktop
 * Theme-aware for dark/light mode support
 *
 * @module components/common/forms/FormContainer
 */

import React from 'react';
import { Paper, Box, Typography, Divider } from '@mui/material';

/**
 * FormContainer - Wrapper for all forms with consistent styling
 *
 * @param {Object} props
 * @param {string} props.title - Form title (e.g., "Add Fish", "Edit Pond")
 * @param {React.ReactNode} props.children - Form content
 * @param {number} props.maxWidth - Maximum width (default: 1000)
 * @param {number} props.elevation - Paper elevation (default: 2)
 * @param {Function} props.onSubmit - Form submit handler
 */
export default function FormContainer({
  title,
  children,
  maxWidth = 1000,
  elevation = 2,
  onSubmit,
  ...rest
}) {
  const handleSubmit = (e) => {
    if (onSubmit) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  return (
    <Paper
      elevation={elevation}
      sx={{
        p: { xs: 3, sm: 4, md: 5 },
        m: { xs: 1, sm: 2 },
        maxWidth,
        mx: 'auto',
        borderRadius: 2,
        bgcolor: 'background.paper', // Theme-aware background
        ...rest.sx,
      }}
      {...rest}
    >
      {/* Form Title */}
      {title && (
        <>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              mb: { xs: 2, sm: 3 },
              fontWeight: 600,
              color: 'text.primary', // Theme-aware text
            }}
          >
            {title}
          </Typography>
          <Divider sx={{ mb: { xs: 3, sm: 4 } }} />
        </>
      )}

      {/* Form Content */}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {children}
      </Box>
    </Paper>
  );
}
