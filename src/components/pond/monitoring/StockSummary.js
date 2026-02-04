/**
 * StockSummary - Brief stock info for pond card
 */
import React from 'react';
import { Box, Typography } from '@mui/material';
import SetMealIcon from '@mui/icons-material/SetMeal';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ScaleIcon from '@mui/icons-material/Scale';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { IconButton, Divider, Stack } from '@mui/material';
import GrowthIndicator from '../detail/GrowthIndicator';

export default function StockSummary({
  stock,
  stocks = [],
  analytics,
  showGrowth = true,
  compact = false,
  onClick,
  onNavigateToStock,
  onPerformSampling,
}) {
  const activeStocks = (stocks && stocks.length > 0) ? stocks : (stock ? [stock] : []);

  if (activeStocks.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">No active stock</Typography>
      </Box>
    );
  }

  // Render a single stock item row
  const StockItem = ({ item, isLast, itemAnalytics }) => {
    const isClickable = !!onNavigateToStock || !!onClick;

    // Calculate stats if analytics not provided or for specific item if list
    const daysActive = itemAnalytics ? itemAnalytics.days :
      Math.floor((new Date() - new Date(item.stocking_date)) / (1000 * 60 * 60 * 24));

    const currentWeight = itemAnalytics ? itemAnalytics.currentAvgWeight :
      (item.current_avg_weight_g || item.initial_avg_weight_g || 0);

    const initialWeight = item.initial_avg_weight_g || 0;
    const estimatedTarget = initialWeight + (daysActive * (item.expected_daily_growth || 1.5));

    const handleClick = (e) => {
      e.stopPropagation();
      if (onNavigateToStock) onNavigateToStock(item);
      else if (onClick) onClick(e);
    };

    return (
      <Box
        onClick={handleClick}
        sx={{
          cursor: isClickable ? 'pointer' : 'default',
          '&:hover': isClickable ? { bgcolor: 'action.hover' } : {},
          py: 1,
          mb: isLast ? 0 : 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <SetMealIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {item.species_name || 'Unknown Species'}
          </Typography>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
             <Typography variant="caption" sx={{ bgcolor: 'background.default', px: 1, py: 0.5, borderRadius: 4 }}>
              {item.current_count?.toLocaleString()} fish
            </Typography>
            {onPerformSampling && (
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onPerformSampling(item); }}
                title="Perform Sampling"
                sx={{ p: 0.5, bgcolor: 'background.paper', ml: 0.5 }}
              >
                <AssessmentIcon fontSize="small" color="secondary"/>
              </IconButton>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: showGrowth ? 0.5 : 0, pl: 3.5 }}>
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
          <Box sx={{ pl: 3.5, mt: 0.5 }}>
            <GrowthIndicator
              stock={item}
              currentGrowth={currentWeight}
              targetGrowth={estimatedTarget}
              mini={true}
            />
          </Box>
        )}

        {!isLast && <Divider sx={{ mt: 1 }} />}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        bgcolor: 'action.hover', // card background for the whole block
        p: compact ? 1 : 1.5,
        borderRadius: 1,
      }}
    >
      {activeStocks.map((item, index) => (
        <StockItem
          key={item.stock_id || item.id || index}
          item={item}
          isLast={index === activeStocks.length - 1}
          itemAnalytics={activeStocks.length === 1 ? analytics : null} // Only pass global analytics if single stock, else calc locally
        />
      ))}
    </Box>
  );
}
