/**
 * PageHeader Component
 * Centralized, reusable page header with consistent styling
 * Theme-aware, responsive, and follows MUI best practices
 *
 * @module components/common/PageHeader
 */

import React from 'react';
import { Box, Typography, Stack, Breadcrumbs, Link, Divider } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

/**
 * PageHeader - Reusable page header with best practices
 *
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle/description
 * @param {React.ReactNode} props.actions - Action buttons
 * @param {Array} props.breadcrumbs - Breadcrumb items [{ label, href }]
 * @param {React.ReactNode} props.icon - Title icon
 * @param {boolean} props.divider - Show divider below header (default: true)
 * @param {Object} props.sx - Additional sx styles
 */
export default function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
  icon,
  divider = true,
  sx = {},
}) {
  return (
    <Box sx={{ mb: { xs: 2, sm: 3 }, ...sx }}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 1.5, color: 'text.secondary' }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography key={index} color="text.primary" variant="body2" fontWeight={600}>
                {crumb.label}
              </Typography>
            ) : (
              <Link
                key={index}
                href={crumb.href}
                underline="hover"
                color="inherit"
                variant="body2"
                sx={{
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      {/* Title and Actions */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={{ xs: 2, sm: 3 }}
      >
        {/* Title Section */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {icon && (
              <Box sx={{ color: 'primary.main', display: 'flex' }}>
                {icon}
              </Box>
            )}
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    mt: 0.5,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Stack>
        </Box>

        {/* Actions */}
        {actions && (
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              flexShrink: 0,
              alignSelf: { xs: 'flex-end', sm: 'center' },
            }}
          >
            {actions}
          </Stack>
        )}
      </Stack>

      {/* Divider */}
      {divider && <Divider sx={{ mt: { xs: 2, sm: 3 } }} />}
    </Box>
  );
}

