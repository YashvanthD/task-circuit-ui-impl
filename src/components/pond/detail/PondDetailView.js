/**
 * PondDetailView - Detailed monitoring view for a specific pond
 */
import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Stack, Button, CircularProgress } from '@mui/material';
import {
  MetricCard,
  ChartContainer,
  LineChart,
} from '../../common';
import { StockSummary, WaterQualitySnapshot, DailyTaskChecklist } from '../monitoring';
import { fetchPondHistory } from '../../../services/monitoringService';

export default function PondDetailView({
  pond,
  onBack,
  onAction
}) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState({
    samplings: [],
    feedings: [],
    waterQuality: []
  });

  useEffect(() => {
    if (pond?.pond_id) {
      loadHistory();
    }
  }, [pond?.pond_id]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchPondHistory(pond.pond_id);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!pond) return null;

  // Use real analytics from enriched pond model or default to empty
  const analytics = pond.analytics || {
    days: 0,
    biomass: 0,
    currentAvgWeight: 0,
    survivalRate: 100,
    growthRate: 0
  };

  // Prepare chart data from history
  const growthData = history.samplings.map(s => ({
    name: new Date(s.sample_date || s.sampling_date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    weight: s.avg_weight_g || s.avg_weight || 0
  })).reverse(); // Oldest first

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
            {growthData.length > 0 ? (
              <ChartContainer title="Growth Progress" subtitle="Average weight over time (g)">
                <LineChart
                  data={growthData}
                  lines={[{ key: 'weight', name: 'Avg. Weight (g)', color: '#2196f3' }]}
                />
              </ChartContainer>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover' }}>
                <Typography color="text.secondary">No sampling history for growth tracking</Typography>
              </Paper>
            )}

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
              <StockSummary stock={pond.stock} />
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => onAction('sampling', pond)}
              >
                Perform Sampling
              </Button>
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
