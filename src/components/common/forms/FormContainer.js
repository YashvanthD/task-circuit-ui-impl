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
 * @param {boolean} props.isForm - Whether to render as a form element (default: true)
 */
export default function FormContainer({
  title,
  children,
  maxWidth = 1000,
  elevation = 2,
  onSubmit,
  isForm = true,
  // Destructure common non-DOM props to avoid passing them to Paper
  onCancel,
  submitText,
  loading,
  ...rest
}) {
  const handleSubmit = (e) => {
    if (onSubmit) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  const sx = {
    p: { xs: 2, sm: 4, md: 5 }, // Reduced padding on mobile from 3 to 2
    m: { xs: 0, sm: 2 }, // Removed margin on mobile from 1 to 0
    maxWidth,
    mx: 'auto',
    borderRadius: { xs: 0, sm: 2 }, // Square corners on mobile for flush look
    bgcolor: 'background.paper', // Theme-aware background
    boxShadow: { xs: 'none', sm: rest.elevation || 2 }, // Remove shadow on mobile if flush
    ...rest.sx,
  };

  return (
    <Paper
      elevation={elevation}
      sx={sx}
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
      {isForm ? (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {children}
        </Box>
      ) : (
        <Box noValidate>
          {children}
        </Box>
      )}
    </Paper>
  );
}
