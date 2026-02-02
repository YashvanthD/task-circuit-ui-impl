/**
 * Sparkline - Mini trend chart for cards
 */
import React from 'react';
import { useTheme } from '@mui/material/styles';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function Sparkline({
  data,
  dataKey = 'value',
  color,
  height = 40,
  width = 100,
}) {
  const theme = useTheme();
  const lineColor = color || theme.palette.primary.main;

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={lineColor}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
