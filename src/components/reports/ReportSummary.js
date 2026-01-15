/**
 * ReportSummary Component
 * Displays report summary statistics.
 *
 * @module components/reports/ReportSummary
 */

import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Stack } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

/**
 * Format currency helper
 */
function formatCurrency(value) {
  if (value === null || value === undefined) return '₹0';
  return `₹${Number(value).toLocaleString()}`;
}

/**
 * ReportSummary - Displays key metrics.
 *
 * @param {Object} props
 * @param {Object} props.summary - Summary data { total, count, average, growth }
 * @param {string} props.title - Summary title
 * @param {string} props.period - Period label
 */
export default function ReportSummary({ summary = {}, title = 'Summary', period = '' }) {
  const { total = 0, count = 0, average = 0, growth = {} } = summary;

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon sx={{ color: 'success.main' }} />;
      case 'down':
        return <TrendingDownIcon sx={{ color: 'error.main' }} />;
      default:
        return <TrendingFlatIcon sx={{ color: 'text.secondary' }} />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'success.main';
      case 'down':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">{title}</Typography>
          {period && (
            <Typography variant="body2" color="text.secondary">
              {period}
            </Typography>
          )}
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={6} sm={3}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {formatCurrency(total)}
              </Typography>
              {growth.percentage !== undefined && (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  {getTrendIcon(growth.trend)}
                  <Typography variant="caption" color={getTrendColor(growth.trend)}>
                    {growth.percentage > 0 ? '+' : ''}
                    {growth.percentage}%
                  </Typography>
                </Stack>
              )}
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Count
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {count}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Average
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {formatCurrency(average)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Min / Max
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {formatCurrency(summary.min || 0)} / {formatCurrency(summary.max || 0)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

