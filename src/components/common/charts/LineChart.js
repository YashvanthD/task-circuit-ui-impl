/**
 * LineChart - Reusable line chart component
 */
import React from 'react';
import { useTheme } from '@mui/material/styles';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function LineChart({
  data,
  xKey = 'name',
  lines = [],
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  height = 300,
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
      <RechartsLineChart data={data}>
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
        {lines.map((line, index) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name || line.key}
            stroke={line.color || defaultColors[index % defaultColors.length]}
            strokeWidth={2}
            dot={line.showDots !== false}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
