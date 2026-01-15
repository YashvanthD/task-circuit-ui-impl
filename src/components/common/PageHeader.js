/**
 * PageHeader Component
 * Reusable page header with title, subtitle, and actions.
 *
 * @module components/common/PageHeader
 */

import React from 'react';
import { Box, Typography, Stack, Breadcrumbs, Link } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

/**
 * PageHeader - Reusable page header
 *
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle
 * @param {React.ReactNode} props.actions - Action buttons
 * @param {Array} props.breadcrumbs - Breadcrumb items [{ label, href }]
 * @param {React.ReactNode} props.icon - Title icon
 * @param {Object} props.sx - Additional sx styles
 */
export default function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
  icon,
  sx = {},
}) {
  return (
    <Box sx={{ mb: 3, ...sx }}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 1 }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography key={index} color="text.primary" variant="body2">
                {crumb.label}
              </Typography>
            ) : (
              <Link
                key={index}
                href={crumb.href}
                underline="hover"
                color="inherit"
                variant="body2"
              >
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      {/* Title Row */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            {icon}
            <Typography variant="h4" fontWeight={700}>
              {title}
            </Typography>
          </Stack>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {actions && (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {actions}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

