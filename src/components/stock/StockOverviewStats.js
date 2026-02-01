/**
 * StockOverviewStats Component
 * Displays aggregate statistics for all stocks
 *
 * @module components/stock/StockOverviewStats
 */

import React from 'react';
import { StatsGrid, StatCard } from '../common';
import { formatCount, formatWeight } from '../../utils/formatters';

/**
 * StockOverviewStats - Aggregate stock statistics
 *
 * @param {Object} props
 * @param {Array} props.stocks - Array of stock instances
 * @param {boolean} props.loading - Loading state
 */
export default function StockOverviewStats({ stocks = [], loading = false }) {
  // Calculate aggregates
  const totalStocks = stocks.length;
  const activeStocks = stocks.filter(s => s.isActive()).length;
  const terminatedStocks = totalStocks - activeStocks;
  const totalFish = stocks.reduce((sum, s) => sum + (s.current_count || 0), 0);
  const totalBiomass = stocks.reduce((sum, s) => sum + (s.getCurrentBiomass() || 0), 0);

  const stats = [
    {
      title: 'Total Stocks',
      value: formatCount(totalStocks),
      icon: '📊',
      color: 'primary',
    },
    {
      title: 'Active Stocks',
      value: formatCount(activeStocks),
      icon: '🟢',
      color: 'success',
    },
    {
      title: 'Terminated',
      value: formatCount(terminatedStocks),
      icon: '⚫',
      color: 'default',
    },
    {
      title: 'Total Fish',
      value: formatCount(totalFish),
      icon: '🐟',
      color: 'info',
    },
    {
      title: 'Total Biomass',
      value: formatWeight(totalBiomass * 1000),
      icon: '⚖️',
      color: 'secondary',
    },
  ];

  return (
    <StatsGrid
      stats={stats}
      loading={loading}
      gridProps={{ xs: 6, sm: 4, md: 2.4 }}
    />
  );
}
