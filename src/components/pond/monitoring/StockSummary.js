/**
 * StockSummary - Brief stock info for pond card
 */
import React from 'react';
import { Box, Typography } from '@mui/material';
import SetMealIcon from '@mui/icons-material/SetMeal';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ScaleIcon from '@mui/icons-material/Scale';
import AssessmentIcon from '@mui/icons-material/Assessment'; // Added sampling icon
import { IconButton } from '@mui/material'; // Added IconButton
import GrowthIndicator from '../detail/GrowthIndicator';

export default function StockSummary({
  stock,
  stocks = [], // Handle multiple stocks
  analytics, // Added analytics prop
  showGrowth = true,
  compact = false,
  onClick,
  onNavigateToStock, // Nav handler
  onPerformSampling, // Sampling handler
}) {
  if (!stock && (!stocks || stocks.length === 0)) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">No active stock</Typography>
      </Box>
    );
  }

  // Use the primary stock or iterate
  const displayStock = stock || stocks[0];

  // Use passed analytics or fallback to local calculation
  const daysActive = analytics ? analytics.days : Math.floor((new Date() - new Date(displayStock.stocking_date)) / (1000 * 60 * 60 * 24));
  const currentWeight = analytics ? analytics.currentAvgWeight : (displayStock.current_avg_weight_g || displayStock.initial_avg_weight_g);
  const estimatedTarget = displayStock.initial_avg_weight_g + (daysActive * (displayStock.expected_daily_growth || 1.5));

  // Determine if multiple stocks
  const hasMultiple = stocks && stocks.length > 1;

  const handleStockClick = (e) => {
    if (onNavigateToStock) {
      e.stopPropagation();
      onNavigateToStock(displayStock);
    } else if (onClick) {
      onClick(e);
    }
  }

  return (
    <Box
      sx={{
        bgcolor: 'action.hover',
        p: compact ? 1 : 1.5,
        borderRadius: 1,
        cursor: (onClick || onNavigateToStock) ? 'pointer' : 'default',
        '&:hover': (onClick || onNavigateToStock) ? { bgcolor: 'action.selected' } : {}
      }}
      onClick={handleStockClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <SetMealIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {displayStock.species_name || 'Unknown Species'} {hasMultiple && `(+${stocks.length - 1} more)`}
        </Typography>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
           <Typography variant="caption" sx={{ bgcolor: 'background.paper', px: 1, py: 0.5, borderRadius: 10, alignSelf:'center' }}>
            {displayStock.current_count?.toLocaleString()} fish
          </Typography>
          {onPerformSampling && (
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onPerformSampling(displayStock); }}
              title="Perform Sampling"
              sx={{ p: 0.5, bgcolor: 'background.paper' }}
            >
              <AssessmentIcon fontSize="small"  color="secondary"/>
            </IconButton>
          )}
        </Box>
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
          stock={displayStock}
          currentGrowth={currentWeight}
          targetGrowth={estimatedTarget}
        />
      )}
    </Box>
  );
}
