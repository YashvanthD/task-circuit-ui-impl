/**
 * PondDetailView - Detailed monitoring view for a specific pond
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Grid, Paper, Stack, Button, CircularProgress, ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  MetricCard,
  ChartContainer,
  LineChart,
} from '../../common';
import { StockSummary, WaterQualitySnapshot, DailyTaskChecklist } from '../monitoring';
import { fetchPondHistory } from '../../../services/monitoringService';

export default function PondDetailView({
  pond,
  onBack, // Kept for consistency but unused
  onAction
}) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState({
    samplings: [],
    feedings: [],
    waterQuality: []
  });
  const [dateFilter, setDateFilter] = useState('ALL');

  const loadHistory = useCallback(async () => {
    if (!pond?.pond_id) return;
    setLoading(true);
    try {
      const data = await fetchPondHistory(pond.pond_id);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  }, [pond]);

  useEffect(() => {
    if (pond?.pond_id) {
      loadHistory();
    }
  }, [loadHistory, pond?.pond_id]);

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setDateFilter(newFilter);
    }
  };

  // Use real analytics from enriched pond model or default to empty
  const analytics = pond?.analytics || {
    days: 0,
    biomass: 0,
    currentAvgWeight: 0,
    survivalRate: 100,
    growthRate: 0
  };

  // Prepare chart data from history
  const activeStocks = pond?.all_stocks || (pond?.stock ? [pond.stock] : []);

  // Group samplings by date
  const samplingsByDate = {};

  history.samplings.forEach(s => {
    const dateStr = new Date(s.sample_date || s.sampling_date).toLocaleDateString([], { month: 'short', day: 'numeric' });
    const timestamp = new Date(s.sample_date || s.sampling_date).getTime();

    if (!samplingsByDate[dateStr]) {
      samplingsByDate[dateStr] = { name: dateStr, timestamp };
    }

    // Use stock_id to differentiate lines if available
    // If no stock_id but we have only one active stock, assume it belongs to it
    let stockKey = 'weight';
    if (s.stock_id) {
        stockKey = `weight_${s.stock_id}`;
    } else if (activeStocks.length === 1) {
        stockKey = `weight_${activeStocks[0].stock_id || activeStocks[0].id}`;
    } else if (activeStocks.length > 1) {
        // Multiple stocks but no ID on sampling?
        // We can't safely assign it, but we should show it.
        // Assign to a generic 'unknown' line if disjoint
        stockKey = `weight_unknown`;
    }

    // Use the value for this stock on this date
    samplingsByDate[dateStr][stockKey] = s.avg_weight_g || s.avg_weight || 0;
  });

  const fullGrowthData = Object.values(samplingsByDate)
    .sort((a, b) => a.timestamp - b.timestamp);

  // Filter data based on dateFilter
  const growthData = useMemo(() => {
    if (dateFilter === 'ALL') return fullGrowthData;

    const now = new Date();
    let cutoffDate = new Date();

    if (dateFilter === '1M') cutoffDate.setMonth(now.getMonth() - 1);
    if (dateFilter === '3M') cutoffDate.setMonth(now.getMonth() - 3);
    if (dateFilter === '6M') cutoffDate.setMonth(now.getMonth() - 6);

    return fullGrowthData.filter(d => d.timestamp >= cutoffDate.getTime());
  }, [fullGrowthData, dateFilter]);

  if (!pond) return null;

  // Generate chart lines based on active stocks or present data
  let growthLines = [];

  if (activeStocks.length > 0) {
    growthLines = activeStocks.map((stock, index) => ({
      key: `weight_${stock.stock_id || stock.id}`,
      name: stock.species_name || stock.name || `Stock ${index + 1}`,
      color: ['#2196f3', '#4caf50', '#ff9800', '#e91e63'][index % 4],
      connectNulls: true // Ensure dots are connected even if data is sparse
    }));
  }

  // Check for unknown stock data points (check full data to see if line needed)
  if (fullGrowthData.some(d => d.weight_unknown)) {
    growthLines.push({
      key: 'weight_unknown',
      name: 'Unassigned Stock',
      color: '#9e9e9e',
      strokeDasharray: '5 5',
      connectNulls: true
    });
  }

  // Fallback if no stocks could be mapped but we have generic 'weight' data
  if (growthLines.length === 0 || (!fullGrowthData.some(d => Object.keys(d).some(k => k.startsWith('weight_'))) && fullGrowthData.some(d => d.weight))) {
    growthLines = [{ key: 'weight', name: 'Avg. Weight (g)', color: '#2196f3', connectNulls: true }];
  }

  const wqData = history.waterQuality.map(w => ({
    name: new Date(w.created_at || w.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temp: w.temperature,
    do: w.dissolved_oxygen,
    ph: w.ph
  })).reverse();

  if (loading && history.samplings.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Main Stats */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <MetricCard
                label="Days Active"
                value={analytics.days}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <MetricCard
                label="Growth Rate"
                value={analytics.growthRate.toFixed(2)}
                unit="g/day"
                variant="outlined"
                color={analytics.growthStatus?.color || 'primary.main'}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <MetricCard
                label="Est. Biomass"
                value={analytics.biomass.toFixed(1)}
                unit="kg"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <MetricCard
                label="Survival Rate"
                value={analytics.survivalRate.toFixed(1)}
                unit="%"
                variant="outlined"
                color="success.main"
              />
            </Grid>
          </Grid>

          {/* Charts */}
          <Stack spacing={3}>
            <ChartContainer
              title="Growth Progress"
              subtitle="Average weight over time (g)"
              actions={
                <ToggleButtonGroup
                  value={dateFilter}
                  exclusive
                  onChange={handleFilterChange}
                  size="small"
                  aria-label="date range"
                >
                  <ToggleButton value="1M">1M</ToggleButton>
                  <ToggleButton value="3M">3M</ToggleButton>
                  <ToggleButton value="6M">6M</ToggleButton>
                  <ToggleButton value="ALL">All</ToggleButton>
                </ToggleButtonGroup>
              }
            >
              {growthData.length > 0 ? (
                <LineChart
                  data={growthData}
                  lines={growthLines}
                />
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No sampling data for selected period</Typography>
                </Paper>
              )}
            </ChartContainer>

            {wqData.length > 0 ? (
              <ChartContainer title="Water Quality Trends" subtitle="Temperature and Dissolved Oxygen">
                <LineChart
                  data={wqData}
                  lines={[
                    { key: 'temp', name: 'Temp (°C)', color: '#ff9800' },
                    { key: 'do', name: 'DO (mg/L)', color: '#03a9f4' }
                  ]}
                />
              </ChartContainer>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover' }}>
                <Typography color="text.secondary">No recent water quality recordings</Typography>
              </Paper>
            )}
          </Stack>
        </Grid>

        {/* Sidebar Info */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>Current Stock</Typography>
              <StockSummary
                stock={pond.stock}
                stocks={pond.all_stocks}
                analytics={pond.analytics}
                onNavigateToStock={(stock) => onAction('view_stock', { pond, stock })}
                onPerformSampling={(stock) => onAction('perform_sampling', { pond, stock })}
              />
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>Water Quality</Typography>
              <WaterQualitySnapshot waterQuality={pond.waterQuality} showTimestamp />
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => onAction('log_wq', pond)}
              >
                Log New Test
              </Button>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <DailyTaskChecklist tasks={pond.tasks} />
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
