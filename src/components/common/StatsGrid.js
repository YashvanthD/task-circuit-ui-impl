/**
 * StatsGrid Component
 * Reusable statistics grid layout.
 *
 * @module components/common/StatsGrid
 */

import React from 'react';
import { Grid } from '@mui/material';
import StatCard from './StatCard';

/**
 * StatsGrid - Reusable statistics grid
 *
 * @param {Object} props
 * @param {Array} props.stats - Array of stat configs { label, value, color, icon, trend, change }
 * @param {number} props.columns - Number of columns (default: 5)
 * @param {number} props.spacing - Grid spacing
 * @param {Object} props.sx - Additional sx styles
 */
export default function StatsGrid({
  stats = [],
  columns = 5,
  spacing = 2,
  sx = {},
}) {
  // Calculate grid item size based on columns
  const getGridSize = () => {
    return {
      xs: 6,
      sm: Math.max(4, Math.floor(12 / Math.min(columns, 3))),
      md: Math.floor(12 / Math.min(columns, 4)),
      lg: 12 / columns,
    };
  };

  const gridSize = getGridSize();

  return (
    <Grid container spacing={spacing} sx={{ mb: 3, ...sx }}>
      {stats.map((stat, index) => (
        <Grid
          item
          xs={gridSize.xs}
          sm={gridSize.sm}
          md={gridSize.md}
          lg={gridSize.lg}
          key={stat.label || index}
        >
          <StatCard
            label={stat.label}
            value={stat.value}
            color={stat.color}
            icon={stat.icon}
            trend={stat.trend}
            change={stat.change}
            subtitle={stat.subtitle}
            onClick={stat.onClick}
          />
        </Grid>
      ))}
    </Grid>
  );
}

