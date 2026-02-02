/**
 * StockSummary - Brief stock info for pond card
 */
import React from 'react';
import { Box, Typography } from '@mui/material';
import SetMealIcon from '@mui/icons-material/SetMeal';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ScaleIcon from '@mui/icons-material/Scale';
import GrowthIndicator from '../detail/GrowthIndicator';

export default function StockSummary({
  stock,
  analytics, // Added analytics prop
  showGrowth = true,
  compact = false,
  onClick,
}) {
  if (!stock) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">No active stock</Typography>
      </Box>
    );
  }

  // Use passed analytics or fallback to local calculation
  const daysActive = analytics ? analytics.days : Math.floor((new Date() - new Date(stock.stocking_date)) / (1000 * 60 * 60 * 24));
  const currentWeight = analytics ? analytics.currentAvgWeight : (stock.current_avg_weight_g || stock.initial_avg_weight_g);
  const estimatedTarget = stock.initial_avg_weight_g + (daysActive * (stock.expected_daily_growth || 1.5));

  return (
    <Box
      sx={{
        bgcolor: 'action.hover',
        p: compact ? 1 : 1.5,
        borderRadius: 1,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { bgcolor: 'action.selected' } : {}
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <SetMealIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {stock.species_name || 'Unknown Species'}
        </Typography>
        <Typography variant="caption" sx={{ ml: 'auto', bgcolor: 'background.paper', px: 1, borderRadius: 10 }}>
          {stock.current_count?.toLocaleString()} fish
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: showGrowth ? 1 : 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ScaleIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {currentWeight}g avg
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            Day {daysActive}
          </Typography>
        </Box>
      </Box>

      {showGrowth && (
        <GrowthIndicator
          stock={stock}
          currentGrowth={currentWeight}
          targetGrowth={estimatedTarget}
        />
      )}
    </Box>
  );
}
