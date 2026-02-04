/**
 * ChartWidget Component
 * Renders different chart types based on configuration.
 *
 * @module components/reports/widgets/ChartWidget
 */

import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, LineChart } from '../../common/charts';
import WidgetContainer from './WidgetContainer';

/**
 * ChartWidget - Configurable chart widget
 *
 * @param {Object} props
 * @param {string} props.type - Chart type ('bar', 'line', 'pie')
 * @param {string} props.title - Widget title
 * @param {Array} props.data - Chart data
 * @param {Object} props.config - Chart configuration
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onRemove - Remove callback
 * @param {Function} props.onEdit - Edit callback
 * @param {Function} props.onRefresh - Refresh callback
 */
export default function ChartWidget({
  type = 'bar',
  title,
  subtitle,
  data = [],
  config = {},
  loading = false,
  onRemove,
  onEdit,
  onRefresh,
  onHide,
  sx = {},
}) {
  // Process data for chart format
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data;
  }, [data]);

  const renderChart = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
          }}
        >
          <Typography color="text.secondary">No data available</Typography>
        </Box>
      );
    }

    switch (type) {
      case 'line':
        return (
          <LineChart
            data={chartData}
            xKey={config.xKey || 'name'}
            lines={config.lines || [{ key: 'value', name: 'Value' }]}
            height={config.height || 250}
            showGrid={config.showGrid !== false}
            showLegend={config.showLegend !== false}
            showTooltip={config.showTooltip !== false}
          />
        );

      case 'bar':
      default:
        return (
          <BarChart
            data={chartData}
            xKey={config.xKey || 'name'}
            bars={config.bars || [{ key: 'value', name: 'Value' }]}
            height={config.height || 250}
            showGrid={config.showGrid !== false}
            showLegend={config.showLegend !== false}
            showTooltip={config.showTooltip !== false}
            stacked={config.stacked || false}
          />
        );
    }
  };

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
      {renderChart()}
    </WidgetContainer>
  );
}
