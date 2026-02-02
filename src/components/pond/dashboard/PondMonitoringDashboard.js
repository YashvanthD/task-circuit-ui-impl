/**
 * PondMonitoringDashboard - Main dashboard page container
 */
import React, { useState } from 'react';
import { Box, Grid } from '@mui/material';
import PondDashboardStats from './PondDashboardStats';
import DashboardFilters from './DashboardFilters';
import PondMonitorCard from '../monitoring/PondMonitorCard';
import QuickActionsBar from './QuickActionsBar';
import { EmptyState, LoadingState } from '../../common';

export default function PondMonitoringDashboard({
  ponds = [],
  stats,
  farms = [],
  loading = false,
  onPondAction, // { type, pond }
}) {
  const [filters, setFilters] = useState({
    search: '',
    farm_id: '',
    status: '',
    quick_filter: 'All'
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredPonds = ponds.filter(pond => {
    if (filters.search && !pond.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.farm_id && pond.farm_id !== filters.farm_id) return false;
    if (filters.status && pond.status !== filters.status) return false;
    if (filters.quick_filter === 'Empty' && pond.status !== 'empty') return false;
    // Add logic for 'Needs Attention' etc.
    return true;
  });

  if (loading && ponds.length === 0) {
    return <LoadingState />;
  }

  return (
    <Box sx={{ pb: { xs: 8, md: 2 } }}>
      <PondDashboardStats stats={stats} />

      <DashboardFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        availableFarms={farms}
      />

      {filteredPonds.length === 0 ? (
        <EmptyState message="No ponds found matching filters" />
      ) : (
        <Grid container spacing={2}>
          {filteredPonds.map(pond => (
            <Grid item xs={12} sm={6} md={4} key={pond.pond_id}>
              <PondMonitorCard
                pond={pond}
                health={pond.health} // Assumes enriched pond object
                currentStock={pond.stock}
                lastWaterQuality={pond.waterQuality}
                todaysTasks={pond.tasks}
                onLogWQ={() => onPondAction('log_wq', pond)}
                onFeed={() => onPondAction('feed', pond)}
                onViewDetails={() => onPondAction('view', pond)}
                onEdit={() => onPondAction('edit_pond', pond)} // Passed onEdit
              />
            </Grid>
          ))}
        </Grid>
      )}

      <QuickActionsBar
        onAction={(type) => onPondAction(type, null)}
      />
    </Box>
  );
}
