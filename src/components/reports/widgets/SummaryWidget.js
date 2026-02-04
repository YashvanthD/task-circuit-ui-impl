/**
 * SummaryWidget Component
 * Displays summary statistics for report data.
 *
 * @module components/reports/widgets/SummaryWidget
 */

import React, { useMemo } from 'react';
import { Box, Typography, Stack, Divider, useTheme } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import WidgetContainer from './WidgetContainer';

/**
 * StatBox - Individual statistic display
 */
function StatBox({ label, value, subtitle, trend, format = 'number', color }) {
  const theme = useTheme();

  const formattedValue = useMemo(() => {
    if (value === null || value === undefined) return '-';
    switch (format) {
      case 'currency':
        return `$${parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'percentage':
        return `${parseFloat(value).toFixed(1)}%`;
      case 'decimal':
        return parseFloat(value).toFixed(2);
      default:
        return typeof value === 'number' ? value.toLocaleString() : value;
    }
  }, [value, format]);

  const trendIcon = useMemo(() => {
    if (!trend) return null;
    if (trend > 0) return <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />;
    if (trend < 0) return <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />;
    return <TrendingFlatIcon sx={{ fontSize: 16, color: 'text.secondary' }} />;
  }, [trend]);

  return (
    <Box sx={{ textAlign: 'center', flex: 1 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 0.5, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}
      >
        {label}
      </Typography>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: color || theme.palette.primary.main }}
      >
        {formattedValue}
      </Typography>
      {(subtitle || trend != null) && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
          {trendIcon}
          <Typography variant="caption" color="text.secondary">
            {subtitle || (trend != null ? `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%` : '')}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

/**
 * SummaryWidget - Summary statistics widget
 *
 * @param {Object} props
 * @param {string} props.title - Widget title
 * @param {Object} props.summary - Summary data { total, count, average, min, max }
 * @param {Object} props.config - Configuration options
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onRemove - Remove callback
 * @param {Function} props.onRefresh - Refresh callback
 */
export default function SummaryWidget({
  title,
  subtitle,
  summary = {},
  config = {},
  loading = false,
  onRemove,
  onEdit,
  onRefresh,
  onHide,
  sx = {},
}) {
  const { total, count, average, min, max, growth } = summary;

  // Build stats array based on config
  const stats = useMemo(() => {
    const defaultStats = [
      { label: 'Total', value: total, format: config.totalFormat || 'number', show: config.showTotal !== false },
      { label: 'Count', value: count, format: 'number', show: config.showCount !== false },
      { label: 'Average', value: average, format: config.averageFormat || 'decimal', show: config.showAverage !== false },
      { label: 'Min', value: min, format: config.minFormat || 'number', show: config.showMin === true },
      { label: 'Max', value: max, format: config.maxFormat || 'number', show: config.showMax === true },
    ];

    // Add custom stats from config
    const customStats = config.customStats || [];

    return [
      ...defaultStats.filter(s => s.show && s.value != null),
      ...customStats,
    ];
  }, [total, count, average, min, max, config]);

  return (
    <WidgetContainer
      title={title}
      subtitle={subtitle}
      loading={loading}
      onRemove={onRemove}
      onEdit={onEdit}
      onRefresh={onRefresh}
      onHide={onHide}
      sx={sx}
    >
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        spacing={2}
        sx={{
          py: 2,
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {stats.length > 0 ? (
          stats.map((stat, index) => (
            <StatBox
              key={stat.label || index}
              label={stat.label}
              value={stat.value}
              subtitle={stat.subtitle}
              trend={stat.trend}
              format={stat.format}
              color={stat.color}
            />
          ))
        ) : (
          <Typography color="text.secondary" sx={{ textAlign: 'center', width: '100%' }}>
            No summary data available
          </Typography>
        )}
      </Stack>

      {/* Growth indicator */}
      {growth && (
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          {growth.percentage > 0 ? (
            <TrendingUpIcon sx={{ color: 'success.main' }} />
          ) : growth.percentage < 0 ? (
            <TrendingDownIcon sx={{ color: 'error.main' }} />
          ) : (
            <TrendingFlatIcon sx={{ color: 'text.secondary' }} />
          )}
          <Typography
            variant="body2"
            sx={{
              color: growth.percentage > 0 ? 'success.main' : growth.percentage < 0 ? 'error.main' : 'text.secondary',
              fontWeight: 600,
            }}
          >
            {growth.percentage > 0 ? '+' : ''}{growth.percentage?.toFixed(1)}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            vs previous period
          </Typography>
        </Box>
      )}
    </WidgetContainer>
  );
}
