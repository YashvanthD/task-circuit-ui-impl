/**
 * StatCard Component
 * Reusable statistics card for dashboards.
 *
 * @module components/common/StatCard
 */

import React from 'react';
import { Card, CardContent, Typography, Box, Stack } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

/**
 * StatCard - Reusable statistics display card
 *
 * @param {Object} props
 * @param {string} props.label - Stat label
 * @param {string|number} props.value - Stat value
 * @param {string} props.color - Value color (MUI color path like 'primary.main')
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {number} props.change - Change percentage (optional)
 * @param {string} props.trend - Trend direction ('up' | 'down' | 'stable')
 * @param {string} props.subtitle - Additional subtitle
 * @param {string} props.variant - Card variant ('outlined' | 'elevation')
 * @param {Function} props.onClick - Click handler
 */
export default function StatCard({
  label,
  value,
  color = 'text.primary',
  icon,
  change,
  trend,
  subtitle,
  variant = 'outlined',
  onClick,
}) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />;
    if (trend === 'down') return <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />;
    return <TrendingFlatIcon sx={{ fontSize: 16, color: 'text.secondary' }} />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'success.main';
    if (trend === 'down') return 'error.main';
    return 'text.secondary';
  };

  return (
    <Card
      variant={variant}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        '&:hover': onClick ? { boxShadow: 3 } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ textAlign: 'center', py: 2 }}>
        {icon && (
          <Box sx={{ mb: 1, color: 'text.secondary' }}>
            {icon}
          </Box>
        )}

        <Typography variant="h4" color={color} sx={{ fontWeight: 700 }}>
          {value}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>

        {(change !== undefined || trend) && (
          <Stack
            direction="row"
            spacing={0.5}
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 1 }}
          >
            {getTrendIcon()}
            {change !== undefined && (
              <Typography variant="caption" color={getTrendColor()}>
                {change > 0 ? '+' : ''}{change}%
              </Typography>
            )}
          </Stack>
        )}

        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

