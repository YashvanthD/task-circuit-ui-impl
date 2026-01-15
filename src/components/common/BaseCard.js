/**
 * BaseCard Component
 * Reusable base card with consistent styling.
 *
 * @module components/common/BaseCard
 */

import React from 'react';
import { Paper, Box, Typography, Stack } from '@mui/material';

/**
 * BaseCard - Reusable card component
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {React.ReactNode} props.header - Header content (title, badges, etc.)
 * @param {React.ReactNode} props.footer - Footer content (actions, etc.)
 * @param {string} props.title - Card title
 * @param {string} props.subtitle - Card subtitle
 * @param {Object} props.headerStyle - Header background style
 * @param {boolean} props.hoverable - Enable hover effect
 * @param {boolean} props.clickable - Enable click effect
 * @param {Function} props.onClick - Click handler
 * @param {number} props.elevation - Paper elevation
 * @param {Object} props.sx - Additional sx styles
 */
export default function BaseCard({
  children,
  header,
  footer,
  title,
  subtitle,
  headerStyle,
  hoverable = false,
  clickable = false,
  onClick,
  elevation = 2,
  sx = {},
}) {
  const cardSx = {
    borderRadius: 3,
    overflow: 'hidden',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.2s ease-in-out',
    ...(hoverable && {
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 6,
      },
    }),
    ...(clickable && {
      cursor: 'pointer',
      '&:hover': {
        boxShadow: 4,
      },
    }),
    ...sx,
  };

  return (
    <Paper elevation={elevation} sx={cardSx} onClick={onClick}>
      {/* Header */}
      {(header || title) && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            ...headerStyle,
          }}
        >
          {header || (
            <Stack>
              {title && (
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Stack>
          )}
        </Box>
      )}

      {/* Content */}
      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>

      {/* Footer */}
      {footer && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          {footer}
        </Box>
      )}
    </Paper>
  );
}

