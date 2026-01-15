/**
 * ReportChart Component
 * Simple chart display for report data.
 *
 * @module components/reports/ReportChart
 */

import React from 'react';
import { Paper, Typography, Box, Stack } from '@mui/material';

/**
 * ReportChart - Simple bar chart representation.
 *
 * @param {Object} props
 * @param {Array} props.data - Chart data [{ label, value, color }]
 * @param {string} props.title - Chart title
 * @param {number} props.height - Chart height
 */
export default function ReportChart({ data = [], title = 'Chart', height = 200 }) {
  if (data.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">No chart data available</Typography>
      </Paper>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>

      <Box sx={{ height, display: 'flex', alignItems: 'flex-end', gap: 1 }}>
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

          return (
            <Stack
              key={index}
              sx={{ flex: 1, alignItems: 'center' }}
              spacing={0.5}
            >
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 60,
                  height: `${barHeight}%`,
                  minHeight: 4,
                  bgcolor: item.color || 'primary.main',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s ease-in-out',
                }}
              />
              <Typography variant="caption" color="text.secondary" noWrap>
                {item.label}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {item.value.toLocaleString()}
              </Typography>
            </Stack>
          );
        })}
      </Box>
    </Paper>
  );
}

