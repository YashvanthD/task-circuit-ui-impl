/**
 * StockDetailView Component
 * Full stock details view with complete sampling history and growth chart.
 * Replaces the modal view with an inline container layout.
 *
 * @module components/stock/detail/StockDetailView
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Stack,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';

import { StatusChip, StatsGrid, ItemCard, ViewHeader } from '../../common';
import samplingUtil from '../../../utils/sampling';
import { formatWeight, formatDate, formatCount } from '../../../utils/formatters';

// Charts
import { LineChart } from '../../common/charts';

export default function StockDetailView({
  stock,
  pond,
  onBack,
  onEditStock,
  onAddSampling,
  onTerminateStock,
  onEditSampling, // Added onEditSampling prop
}) {
  const [loading, setLoading] = useState(false);
  const [samplings, setSamplings] = useState([]);
  const [analyzedStats, setAnalyzedStats] = useState(null);
  // Add displayedSamplings count to manage load more
  const [displayCount, setDisplayCount] = useState(10);

  const loadHistory = useCallback(async () => {
    if (!stock?.stock_id) return;
    setLoading(true);
    try {
      // Fetch samplings for this stock
      // Increased limit to 500 to fetch more history initially
      const data = await samplingUtil.getSamplings({
        stockId: stock.stock_id,
        limit: 500, 
        sort: 'sample_date:desc'
      });

      const history = Array.isArray(data) ? data : (data.samplings || []);
      setSamplings(history);

      // Refresh stock analytics based on latest data
      if (stock.getAnalytics) {
        const latest = history[0];
        const currentWeight = latest?.avg_weight_g || latest?.avg_weight || stock.current_avg_weight_g || 0;
        setAnalyzedStats(stock.getAnalytics(currentWeight, history));
      }
    } catch (err) {
      console.error("Failed to load samplings", err);
    } finally {
      setLoading(false);
    }
  }, [stock]);

  // Load samplings on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  if (!stock) return null;

  // Use props or computed analytics
  const analytics = analyzedStats || (stock.getAnalytics ? stock.getAnalytics() : {});
  const daysActive = analytics.days || 0;
  const currentWeight = analytics.currentAvgWeight || stock.current_avg_weight_g || 0;
  const growthRate = analytics.growthRate || 0;
  const biomass = analytics.biomass || 0;

  // Stats for the grid
  const stats = [
    { label: 'Current Avg Weight', value: formatWeight(currentWeight), color: 'primary.main' },
    { label: 'Total Biomass', value: formatWeight(biomass, 'kg'), color: 'success.main' },
    { label: 'Days Active', value: `${daysActive}d`, color: 'info.main' },
    { label: 'Growth Rate', value: `${growthRate.toFixed(2)} g/day`, color: 'warning.main', trend: growthRate > 0 ? 'up' : 'stable' },
  ];

  // Use samplings slice for display
  const displayedSamplings = samplings.slice(0, displayCount);
  const hasMore = samplings.length > displayCount;

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 10);
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <ViewHeader
        title={stock.species_name || 'Unknown Species'}
        subtitle={`Stock ID: ${stock.stock_id} • Stocked: ${formatDate(stock.stocking_date)}`}
        onBack={onBack}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <StatusChip status={stock.status} />
            <IconButton onClick={loadHistory} disabled={loading} size="small">
              <RefreshIcon />
            </IconButton>
          </Stack>
        }
      />

      {/* Main Content Info */}
      <Grid container spacing={3}>
        {/* Top Section: Charts & Details */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Quick Stats */}
            <StatsGrid stats={stats} columns={4} />

            {/* Growth Chart */}
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Growth Trajectory
                </Typography>
              </Box>
              <Box sx={{ height: 350, width: '100%' }}>
                 <LineChart
                    data={samplings}
                    xKey="sample_date"
                    lines={[
                      { key: 'avg_weight_g', name: 'Avg Weight (g)', color: '#2196f3' }
                    ]}
                 />
              </Box>
            </Paper>
          </Stack>
        </Grid>

        {/* Right Column: Details & Actions */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <ItemCard
              title="Stock Details"
              compact={false}
              elevation={1}
              actions={
                <Stack direction="row" spacing={1}>
                  {onEditStock && (
                    <IconButton
                      size="small"
                      onClick={() => onEditStock(stock)}
                      title="Edit Stock Details"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                </Stack>
              }
            >
              <Stack spacing={2} divider={<Divider />}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Pond</Typography>
                  <Typography variant="body1" fontWeight="500">{pond?.name || stock.pond_id || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Initial Stock</Typography>
                  <Typography variant="body1">{stock.initial_count?.toLocaleString()} fish @ {stock.initial_avg_weight_g}g</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Current Count (Est)</Typography>
                  <Typography variant="body1">{stock.current_count?.toLocaleString()} fish</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Supplier</Typography>
                  <Typography variant="body1">{stock.supplier_name || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Notes</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{stock.notes || 'No notes'}</Typography>
                </Box>
              </Stack>
            </ItemCard>

            <Stack spacing={1}>
              {onEditStock && (
                <Button variant="outlined" fullWidth onClick={() => onEditStock(stock)}>
                  Edit Stock Details
                </Button>
              )}
              {onTerminateStock && (
                <Button variant="outlined" color="error" fullWidth onClick={() => onTerminateStock(stock)}>
                  Harvest / Terminate
                </Button>
              )}
            </Stack>
          </Stack>
        </Grid>

        {/* Sampling History Table - Always Start Next Fresh Row Grid */}
        <Grid item xs={12}>
          <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold">Sampling History ({samplings.length})</Typography>
              {onAddSampling && (
                <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={() => onAddSampling(stock)}>
                  Add Sampling
                </Button>
              )}
            </Box>

            {samplings.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">No samplings recorded yet.</Typography>
              </Box>
            ) : (
              <>
              <TableContainer>
                <Table size="medium" sx={{ minWidth: 600 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Count</TableCell>
                      <TableCell align="right">Avg Weight</TableCell>
                      <TableCell align="right">Growth</TableCell>
                      <TableCell align="right">Rate</TableCell>
                      <TableCell align="right">Biomass</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedSamplings.map((sampling, index) => {
                      const previousSampling = samplings[index + 1];
                      const avgWeight = sampling.avg_weight_g || sampling.avg_weight || 0;
                      const prevAvgWeight = previousSampling?.avg_weight_g || previousSampling?.avg_weight || 0;
                      const growth = sampling.weight_gain_g || (prevAvgWeight ? (avgWeight - prevAvgWeight) : 0);
                      const growthRate = sampling.growth_rate_g_per_day || 0;
                      const biomass = (avgWeight * (sampling.sample_count ? stock.current_count : 0)) / 1000; // estimated

                      return (
                        <TableRow key={sampling.sampling_id || index} hover>
                          <TableCell sx={{ minWidth: 120 }}>{formatDate(sampling.sample_date || sampling.sampling_date)}</TableCell>
                          <TableCell align="right">{formatCount(sampling.sample_count || sampling.sample_size)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500 }}>{formatWeight(avgWeight)}</TableCell>
                          <TableCell align="right">
                            {growth !== 0 ? (
                              <Box component="span" sx={{ color: growth > 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
                                {growth > 0 ? '+' : ''}{formatWeight(growth)}
                              </Box>
                            ) : '-'}
                          </TableCell>
                          <TableCell align="right">
                            {growthRate > 0 ? `${growthRate.toFixed(2)} g/d` : '-'}
                          </TableCell>
                          <TableCell align="right">
                             {formatWeight(biomass, 'kg')}
                          </TableCell>
                          <TableCell align="right">
                            {onEditSampling && (
                              <IconButton
                                size="small"
                                onClick={() => onEditSampling(sampling, stock)}
                                title="Edit Sampling"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Load More Button */}
              {hasMore && (
                <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                  <Button onClick={handleLoadMore} disabled={loading}>
                    Load More History
                  </Button>
                </Box>
              )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
