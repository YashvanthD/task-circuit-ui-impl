/**
 * StockCard Component
 * Displays a stock with its sampling history and analytics
 *
 * @module components/stock/StockCard
 */

import React from 'react';
import {
  Typography,
  Box,
  Grid,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { BaseCard, StatusChip, ActionButton, DataTable } from '../common';
import { formatWeight, formatCount, formatGrowth, formatDate } from '../../utils/formatters';
import {getPondName} from "../../utils/cache/pondsCache";

/**
 * StockCard - Comprehensive stock display with sampling history
 *
 * @param {Object} props
 * @param {Object} props.stock - Stock model instance
 * @param {Array} props.samplings - Array of sampling records for this stock
 * @param {Function} props.onAddSampling - Callback when add sampling clicked
 * @param {Function} props.onViewDetails - Callback when view details clicked
 * @param {Function} props.onEditSampling - Callback when edit sampling clicked
 * @param {Function} props.onTerminate - Callback when terminate stock clicked
 * @param {boolean} props.showAllSamplings - Whether to show all samplings (default: false)
 */
export default function StockCard({
  stock,
  samplings = [],
  onAddSampling,
  onViewDetails,
  onEditSampling,
  onTerminate,
  showAllSamplings = false,
}) {

  if (!stock) return null;

  // Ensure samplings are sorted by date (newest first)
  const sortedSamplings = [...samplings].sort((a, b) => {
    const dateA = new Date(a.sample_date || a.sampling_date);
    const dateB = new Date(b.sample_date || b.sampling_date);
    return dateB - dateA; // Newest first
  });

  const latestSampling = sortedSamplings.length > 0 ? sortedSamplings[0] : null;
  const currentAvgWeight = latestSampling?.avg_weight_g || latestSampling?.avg_weight || stock.initial_avg_weight_g || 0;
  const analytics = stock.getAnalytics(currentAvgWeight, sortedSamplings);
  const isActive = stock.isActive();

  const pondName = stock.pond_name || (stock.pond_id ? getPondName(stock.pond_id) : 'Unknown Pond');
  const speciesName = stock.species_name || stock.common_name || stock.name || 'Unknown Species';

  // Define table columns
  const tableColumns = [
    {
      id: 'date',
      label: 'Date',
      align: 'left', // Explicitly left-aligned
      sortable: true,
      sortKey: 'sample_date',
      render: (sampling) => formatDate(sampling.sample_date || sampling.sampling_date),
    },
    {
      id: 'pond',
      label: 'Pond',
      align: 'left',
      render: (sampling) => sampling.pond_name || (sampling.pond_id ? getPondName(sampling.pond_id) : '-'),
    },
    {
      id: 'samples',
      label: 'Samples',
      align: 'right', // Numbers right-aligned
      sortable: true,
      sortKey: 'sample_count',
      render: (sampling) => formatCount(sampling.sample_count || sampling.sample_size),
    },
    {
      id: 'avgWeight',
      label: 'Avg Weight',
      align: 'right', // Numbers right-aligned
      sortable: true,
      sortKey: 'avg_weight_g',
      render: (sampling) => formatWeight(sampling.avg_weight_g || sampling.avg_weight || 0),
    },
    {
      id: 'growth',
      label: 'Growth',
      align: 'right', // Numbers right-aligned
      render: (sampling) => {
        const samplingIndex = sortedSamplings.findIndex(s => s.sampling_id === sampling.sampling_id);
        const previousSampling = samplingIndex >= 0 && samplingIndex < sortedSamplings.length - 1
          ? sortedSamplings[samplingIndex + 1]
          : null;

        const avgWeight = sampling.avg_weight_g || sampling.avg_weight || 0;
        const prevAvgWeight = previousSampling?.avg_weight_g || previousSampling?.avg_weight || 0;
        const growth = sampling.weight_gain_g || (previousSampling ? (avgWeight - prevAvgWeight) : 0);

        return previousSampling ? (
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
        );
      },
    }
  ];

  // Define row actions
  const rowActions = [
    {
      icon: <EditIcon fontSize="small" />,
      label: 'Edit',
      type: 'edit',
      onClick: (sampling) => onEditSampling && onEditSampling(sampling, stock),
    },
  ];

  return (
    <BaseCard
      title={`🐟 ${speciesName} | ${pondName}`}
      subtitle={`Stock ID: ${stock.stock_id} | Stocked: ${formatDate(stock.stocking_date)}`}
      headerAction={
        <StatusChip
          status={isActive ? 'active' : 'inactive'}
          size="small"
        />
      }
      divider
      sx={{
        mb: 2,
        border: isActive ? '2px solid' : '1px solid',
        borderColor: isActive ? 'primary.main' : 'divider',
        '&:hover': {
          boxShadow: 4,
        },
      }}
    >
      {/* Stock Metrics Grid */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={3}>
          <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Count
            </Typography>
            <Typography variant="h6">{formatCount(stock.current_count)}</Typography>
            <Typography variant="caption" color="text.secondary">
              fish
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Avg Weight
            </Typography>
            <Typography variant="h6">{formatWeight(currentAvgWeight)}</Typography>
            <Typography variant="caption" color="text.secondary">
              current
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Biomass
            </Typography>
            <Typography variant="h6">{formatWeight(analytics.biomass * 1000)}</Typography>
            <Typography variant="caption" color="text.secondary">
              total
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Days
            </Typography>
            <Typography variant="h6">{analytics.days}</Typography>
            <Typography variant="caption" color="text.secondary">
              since stocking
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Growth Info */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'background.default',
          border: 1,
          borderColor: analytics.growthStatus.color === 'success' ? 'success.main' :
                       analytics.growthStatus.color === 'warning' ? 'warning.main' :
                       analytics.growthStatus.color === 'error' ? 'error.main' : 'info.main',
          borderRadius: 1,
          mb: 2,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography component="span" variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Growth Rate:
              </Typography>
              <Typography component="span" variant="body2" sx={{ fontWeight: 600 }}>
                {analytics.growthRate.toFixed(2)}g/day
              </Typography>
              <StatusChip
                status={analytics.growthStatus.label.toLowerCase()}
                size="small"
                label={`${analytics.growthStatus.icon} ${analytics.growthStatus.label}`}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <Box component="span" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Total Growth:
              </Box>{' '}
              <Box
                component="span"
                sx={{
                  fontWeight: 600,
                  color: analytics.totalGrowth >= 0 ? 'success.main' : 'error.main',
                }}
              >
                {formatGrowth(analytics.totalGrowth)}
              </Box>
              {' | '}
              <Box component="span" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Initial:
              </Box>{' '}
              {formatWeight(stock.initial_avg_weight_g || 0)}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Sampling History Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            📊 Sampling History ({sortedSamplings.length})
          </Typography>
          {isActive && (
            <ActionButton
              size="small"
              variant="contained"
              color="primary"
              icon={<AddIcon />}
              onClick={() => onAddSampling && onAddSampling(stock)}
            >
              Add
            </ActionButton>
          )}
        </Box>

        <DataTable
          columns={tableColumns}
          data={sortedSamplings}
          rowActions={rowActions}
          getRowKey={(sampling) => sampling.sampling_id}
          emptyMessage={
            isActive
              ? "No samplings recorded yet"
              : "No samplings recorded"
          }
          initialRowCount={3}
          loadMoreCount={10}
          showPagination={!showAllSamplings}
          exportable={true}
          exportFormats={['pdf', 'csv']}
          exportFilename={`${stock.species_name || 'stock'}-${stock.stock_id}-samplings`}
          exportPosition="right"
        />
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <ActionButton
          variant="outlined"
          icon={<VisibilityIcon />}
          onClick={() => onViewDetails && onViewDetails(stock)}
        >
          View Details
        </ActionButton>

        {isActive && (
          <ActionButton
            variant="outlined"
            color="error"
            icon={<BlockIcon />}
            onClick={() => onTerminate && onTerminate(stock)}
          >
            Terminate Stock
          </ActionButton>
        )}
      </Box>
    </BaseCard>
  );
}
