/**
 * StockDetailsModal Component
 * Full stock details view with complete sampling history and growth chart
 *
 * @module components/stock/StockDetailsModal
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import { ActionButton, StatusChip } from '../common';
import { formatWeight, formatCount, formatGrowth, formatDate, formatDuration, formatPercentage } from '../../utils/formatters';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';

/**
 * StockDetailsModal - Complete stock information view
 *
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onClose - Close callback
 * @param {Object} props.stock - Stock model instance
 * @param {Array} props.samplings - Array of sampling records
 * @param {Function} props.onEditSampling - Edit sampling callback
 */
export default function StockDetailsModal({
  open,
  onClose,
  stock,
  samplings = [],
  onEditSampling,
}) {
  if (!stock) return null;

  // Get current average weight from latest sampling
  const latestSampling = samplings.length > 0 ? samplings[0] : null;
  const currentAvgWeight = latestSampling?.avg_weight_g || latestSampling?.avg_weight || stock.initial_avg_weight_g || 0;

  // Calculate analytics
  const analytics = stock.getAnalytics(currentAvgWeight, samplings);
  const isActive = stock.isActive();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '80vh',
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" component="span" sx={{ fontWeight: 'bold' }}>
              🐟 {stock.species_name || 'Unknown Species'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Stock ID: {stock.stock_id} | Pond: {stock.pond_name || stock.pond_id}
            </Typography>
          </Box>
          <StatusChip status={isActive ? 'active' : 'inactive'} />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Overview Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            📊 Overview
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Stocking Date</Typography>
                <Typography variant="h6">{formatDate(stock.stocking_date)}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDuration(analytics.days)} ago
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Initial Count</Typography>
                <Typography variant="h6">{formatCount(stock.initial_count)}</Typography>
                <Typography variant="caption" color="text.secondary">fish</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Current Count</Typography>
                <Typography variant="h6">{formatCount(stock.current_count)}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Survival: {formatPercentage(analytics.survivalRate)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Mortality</Typography>
                <Typography variant="h6" color="error.main">{formatCount(analytics.mortalityCount)}</Typography>
                <Typography variant="caption" color="text.secondary">fish lost</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Weight & Growth Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            📈 Weight & Growth
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Initial Avg Weight</Typography>
                <Typography variant="h6">{formatWeight(stock.initial_avg_weight_g)}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Current Avg Weight</Typography>
                <Typography variant="h6">{formatWeight(currentAvgWeight)}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Total Growth</Typography>
                <Typography variant="h6" color="success.main">
                  {formatGrowth(analytics.totalGrowth)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Growth Rate</Typography>
                <Typography variant="h6">
                  {analytics.growthRate.toFixed(2)}g/day
                </Typography>
                <Chip
                  label={analytics.growthStatus.label}
                  size="small"
                  color={analytics.growthStatus.color}
                  sx={{ mt: 0.5 }}
                  icon={<span>{analytics.growthStatus.icon}</span>}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Current Biomass</Typography>
                <Typography variant="h6">{formatWeight(analytics.biomass * 1000)}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatCount(stock.current_count)} fish × {formatWeight(currentAvgWeight)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Source</Typography>
                <Typography variant="body1">{stock.source || 'Not specified'}</Typography>
                {stock.source_contact && (
                  <Typography variant="caption" color="text.secondary">
                    Contact: {stock.source_contact}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Pond Details Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            🏞️ Pond Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Pond Name</Typography>
                <Typography variant="h6">{stock.pond_name || stock.pond_id || 'N/A'}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Pond Type</Typography>
                <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                  {stock.pond_type || 'N/A'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Pond Status</Typography>
                <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                  {stock.pond_status || 'N/A'}
                </Typography>
              </Box>
            </Grid>

            {stock.pond_area_sqm && (
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">Pond Area</Typography>
                  <Typography variant="h6">{stock.pond_area_sqm} m²</Typography>
                </Box>
              </Grid>
            )}

            {stock.pond_capacity_liters && (
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">Capacity</Typography>
                  <Typography variant="h6">{(stock.pond_capacity_liters / 1000).toFixed(0)} m³</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatCount(stock.pond_capacity_liters)} liters
                  </Typography>
                </Box>
              </Grid>
            )}

            {stock.pond_depth_m && (
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">Depth</Typography>
                  <Typography variant="h6">{stock.pond_depth_m} m</Typography>
                </Box>
              </Grid>
            )}

            {stock.farm_name && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">Farm</Typography>
                  <Typography variant="body1">{stock.farm_name}</Typography>
                  {stock.farm_location && (
                    <Typography variant="caption" color="text.secondary">
                      Location: {stock.farm_location}
                    </Typography>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Complete Sampling History */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            📋 Complete Sampling History ({samplings.length})
          </Typography>

          {samplings.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography color="text.secondary">No samplings recorded yet</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Samples</TableCell>
                    <TableCell align="right">Avg Weight</TableCell>
                    <TableCell align="right">Min</TableCell>
                    <TableCell align="right">Max</TableCell>
                    <TableCell align="right">Growth</TableCell>
                    <TableCell align="right">Rate (g/day)</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {samplings.map((sampling, index) => {
                    const previousSampling = samplings[index + 1];
                    const avgWeight = sampling.avg_weight_g || sampling.avg_weight || 0;
                    const prevAvgWeight = previousSampling?.avg_weight_g || previousSampling?.avg_weight || 0;
                    const growth = sampling.weight_gain_g || (avgWeight - prevAvgWeight);
                    const growthRate = sampling.growth_rate_g_per_day || 0;

                    return (
                      <TableRow key={sampling.sampling_id || index} hover>
                        <TableCell>{formatDate(sampling.sample_date || sampling.sampling_date)}</TableCell>
                        <TableCell align="right">{formatCount(sampling.sample_count || sampling.sample_size)}</TableCell>
                        <TableCell align="right">{formatWeight(avgWeight)}</TableCell>
                        <TableCell align="right">{sampling.min_weight_g ? formatWeight(sampling.min_weight_g) : '-'}</TableCell>
                        <TableCell align="right">{sampling.max_weight_g ? formatWeight(sampling.max_weight_g) : '-'}</TableCell>
                        <TableCell align="right">
                          {previousSampling || sampling.weight_gain_g ? (
                            <Box
                              component="span"
                              sx={{
                                color: growth >= 0 ? 'success.main' : 'error.main',
                                fontWeight: 'bold',
                              }}
                            >
                              {formatGrowth(growth)}
                            </Box>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {growthRate > 0 ? `${growthRate.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ maxWidth: 200, display: 'block' }} noWrap>
                            {sampling.notes || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => onEditSampling && onEditSampling(sampling, stock)}
                            title="Edit Sampling"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Additional Info */}
        {stock.notes && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                📝 Notes
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {stock.notes}
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <ActionButton
          onClick={onClose}
          variant="outlined"
          icon={<CloseIcon />}
        >
          Close
        </ActionButton>
      </DialogActions>
    </Dialog>
  );
}
