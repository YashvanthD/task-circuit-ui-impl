/**
 * MetricCard - Enhanced metric display card
 */
import React from 'react';
import { Card, CardContent, Typography, Box, Stack } from '@mui/material';
import TrendIndicator from './TrendIndicator';

export default function MetricCard({
  label,
  value,
  unit,
  color = 'text.primary',
  icon,
  trend,
  trendValue,
  subtitle,
  variant = 'outlined',
  onClick,
  sx = {},
}) {
  return (
    <Card
      variant={variant}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        '&:hover': onClick ? { boxShadow: 3 } : {},
        ...sx,
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
          {value}{unit && <Typography component="span" variant="h6"> {unit}</Typography>}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>

        {trend && (
          <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center" sx={{ mt: 1 }}>
            <TrendIndicator trend={trend} value={trendValue} />
          </Stack>
        )}

        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
