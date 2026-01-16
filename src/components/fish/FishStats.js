/**
 * FishStats Component
 * Displays fish statistics and analytics.
 *
 * @module components/fish/FishStats
 */

import React from 'react';
import {
  Paper,
  Typography,
  Stack,
  Box,
  Grid,
  Divider,
} from '@mui/material';
import SetMealIcon from '@mui/icons-material/SetMeal';
import PoolIcon from '@mui/icons-material/Pool';
import ScaleIcon from '@mui/icons-material/Scale';
import CategoryIcon from '@mui/icons-material/Category';

// ============================================================================
// Sub-components
// ============================================================================

function StatBox({ icon, label, value, subValue, color = 'primary.main' }) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        borderRadius: 2,
        flex: 1,
        minWidth: 150,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          {subValue && (
            <Typography variant="caption" color="text.secondary">
              {subValue}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * FishStats - Display fish statistics
 *
 * @param {Object} props
 * @param {Array} props.fish - Array of fish objects
 * @param {Object} props.analytics - Optional analytics data from API
 */
export default function FishStats({ fish = [], analytics = null }) {
  // Calculate stats from fish array
  const stats = React.useMemo(() => {
    const totalSpecies = fish.length;
    const totalCount = fish.reduce((sum, f) => sum + (f.count || f.total_count || 0), 0);
    const totalWeight = fish.reduce((sum, f) => {
      const count = f.count || f.total_count || 0;
      const avgWeight = f.average_weight || f.avg_weight || 0;
      return sum + (count * avgWeight);
    }, 0);
    const uniquePonds = new Set(
      fish.flatMap((f) => (Array.isArray(f.ponds) ? f.ponds : [f.ponds]).filter(Boolean))
    ).size;

    const activeCount = fish.filter((f) => (f.status || 'active') === 'active').length;
    const avgWeight = totalCount > 0 ? (totalWeight / totalCount).toFixed(0) : 0;

    return {
      totalSpecies,
      totalCount,
      totalWeight: (totalWeight / 1000).toFixed(2), // in kg
      uniquePonds,
      activeCount,
      avgWeight,
    };
  }, [fish]);

  // Use analytics data if provided
  const displayStats = analytics || stats;

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatBox
            icon={<CategoryIcon />}
            label="Total Species"
            value={displayStats.totalSpecies || 0}
            subValue={`${stats.activeCount} active`}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatBox
            icon={<SetMealIcon />}
            label="Total Fish"
            value={formatNumber(displayStats.totalCount || stats.totalCount)}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatBox
            icon={<ScaleIcon />}
            label="Total Weight"
            value={`${displayStats.totalWeight || stats.totalWeight} kg`}
            subValue={`Avg: ${stats.avgWeight}g`}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatBox
            icon={<PoolIcon />}
            label="Ponds"
            value={displayStats.uniquePonds || stats.uniquePonds}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Species breakdown if analytics available */}
      {analytics?.speciesBreakdown && (
        <Paper sx={{ mt: 2, p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Species Breakdown
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {analytics.speciesBreakdown.map((species, idx) => (
              <Grid item xs={6} sm={4} md={3} key={idx}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: getSpeciesColor(idx),
                    }}
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {species.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatNumber(species.count)} fish
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatNumber(num) {
  if (!num && num !== 0) return '-';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

function getSpeciesColor(index) {
  const colors = [
    '#1976d2',
    '#2e7d32',
    '#ed6c02',
    '#9c27b0',
    '#d32f2f',
    '#0288d1',
    '#388e3c',
    '#f57c00',
  ];
  return colors[index % colors.length];
}

