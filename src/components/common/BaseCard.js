/**
 * BaseCard Component
 * Centralized, reusable base card with consistent styling
 * Theme-aware, responsive, and follows MUI best practices
 *
 * @module components/common/BaseCard
 */

import React from 'react';
import { Paper, Box, Typography, Stack, Divider } from '@mui/material';

/**
 * BaseCard - Reusable card component with best practices
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {React.ReactNode} props.header - Header content (custom)
 * @param {React.ReactNode} props.footer - Footer content (actions, etc.)
 * @param {string} props.title - Card title
 * @param {string} props.subtitle - Card subtitle
 * @param {React.ReactNode} props.headerAction - Header action (button, icon)
 * @param {boolean} props.hoverable - Enable hover effect (default: false)
 * @param {boolean} props.clickable - Enable click effect (default: false)
 * @param {Function} props.onClick - Click handler
 * @param {number} props.elevation - Paper elevation (default: 2)
 * @param {boolean} props.noPadding - Remove padding from body (default: false)
 * @param {boolean} props.divider - Show divider after header (default: false)
 * @param {Object} props.sx - Additional sx styles
 */
export default function BaseCard({
  children,
  header,
  footer,
  title,
  subtitle,
  headerAction,
  hoverable = false,
  clickable = false,
  onClick,
  elevation = 2,
  noPadding = false,
  divider = false,
  sx = {},
  ...rest
}) {
  const cardSx = {
    borderRadius: 2,
    overflow: 'hidden',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.2s ease-in-out',
    bgcolor: 'background.paper',
    ...(hoverable && {
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 8,
      },
    }),
    ...(clickable && {
      cursor: 'pointer',
      '&:hover': {
        bgcolor: 'action.hover',
      },
    }),
    ...sx,
  };

  return (
    <Paper
      elevation={elevation}
      onClick={clickable ? onClick : undefined}
      sx={cardSx}
      {...rest}
    >
      {/* Header */}
      {(header || title || subtitle) && (
        <>
          <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
            {header || (
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {title && (
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: subtitle ? 0.5 : 0,
                      }}
                    >
                      {title}
                    </Typography>
                  )}
                  {subtitle && (
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                    >
                      {subtitle}
                    </Typography>
                  )}
                </Box>
                {headerAction && <Box>{headerAction}</Box>}
              </Stack>
            )}
          </Box>
          {divider && <Divider />}
        </>
      )}

      {/* Body */}
      <Box
        sx={{
          flex: 1,
          p: noPadding ? 0 : { xs: 2, sm: 2.5 },
          overflow: 'auto',
        }}
      >
        {children}
      </Box>

      {/* Footer */}
      {footer && (
        <>
          <Divider />
          <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
            {footer}
          </Box>
        </>
      )}
    </Paper>
  );
}

