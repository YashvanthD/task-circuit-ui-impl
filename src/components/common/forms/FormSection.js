/**
 * FormSection Component
 * Reusable section header for organizing form fields
 * Theme-aware for dark/light mode support
 *
 * @module components/common/forms/FormSection
 */

import React from 'react';
import { Grid, Typography, Divider } from '@mui/material';

/**
 * FormSection - Section header with visual separator
 *
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string} props.subtitle - Optional subtitle/description
 * @param {React.ReactNode} props.children - Section content (form fields)
 * @param {boolean} props.divider - Show bottom border (default: true)
 * @param {number} props.spacing - Grid spacing (default: 3)
 */
export default function FormSection({
  title,
  subtitle,
  children,
  divider = true,
  spacing = 3,
}) {
  return (
    <>
      {/* Section Header - Dedicated Full Width Row */}
      <Grid item xs={12}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: 'primary.main',
            mb: 0.25,
            mt: { xs: 2, sm: 3 },
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'block',
              mb: 1.5,
            }}
          >
            {subtitle}
          </Typography>
        )}
        {/* Full-width divider */}
        {divider && (
          <Divider
            sx={{
              borderColor: 'primary.main',
              borderWidth: '1px',
              mt: subtitle ? 0 : 1.5,
              mb: 2,
            }}
          />
        )}
      </Grid>

      {/* Section Content - Full-width wrapper to force new row, children rendered inside */}
      <Grid item xs={12} sx={{ width: '100%' }}>
        <Grid container spacing={spacing}>
          {children}
        </Grid>
      </Grid>
    </>
  );
}
