/**
 * BarChart - Reusable bar chart component
 */
import React from 'react';
import { useTheme } from '@mui/material/styles';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function BarChart({
  data,
  xKey = 'name',
  bars = [],
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  height = 300,
  stacked = false,
}) {
  const theme = useTheme();

  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data}>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        )}
        <XAxis
          dataKey={xKey}
          stroke={theme.palette.text.secondary}
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke={theme.palette.text.secondary}
          style={{ fontSize: '12px' }}
        />
        {showTooltip && (
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
            }}
          />
        )}
        {showLegend && <Legend />}
        {bars.map((bar, index) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name || bar.key}
            fill={bar.color || defaultColors[index % defaultColors.length]}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
