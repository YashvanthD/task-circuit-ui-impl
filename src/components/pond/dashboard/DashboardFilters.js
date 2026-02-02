/**
 * DashboardFilters - Filter controls for dashboard
 */
import React from 'react';
import { Box, Chip, Stack } from '@mui/material';
import { FilterBar, FilterSelect, SearchInput } from '../../common';

export default function DashboardFilters({
  filters,
  onFilterChange,
  availableFarms = [],
  quickFilters = ['All', 'Needs Attention', 'Not Fed Today', 'Empty'],
}) {
  const handleFarmChange = (e) => {
    onFilterChange('farm_id', e.target.value);
  };

  const handleStatusChange = (e) => {
    onFilterChange('status', e.target.value);
  };

  const handleQuickFilter = (filter) => {
    let newStatus = '';
    if (filter === 'Empty') newStatus = 'empty';
    if (filter === 'Needs Attention') newStatus = 'attention'; // Logic needed in parent

    // Simple filter logic mapping
    onFilterChange('quick_filter', filter);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <FilterBar>
        <SearchInput
          placeholder="Search ponds..."
          value={filters.search}
          onChange={(val) => onFilterChange('search', val)}
          sx={{ width: { xs: '100%', sm: 300 } }}
        />

        <FilterSelect
          label="Farm"
          value={filters.farm_id}
          onChange={handleFarmChange}
          options={availableFarms.map(f => ({ value: f.farm_id, label: f.name }))}
          minWidth={150}
        />

        <FilterSelect
          label="Status"
          value={filters.status}
          onChange={handleStatusChange}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'empty', label: 'Empty' },
            { value: 'maintenance', label: 'Maintenance' },
          ]}
          minWidth={150}
        />
      </FilterBar>

      <Stack direction="row" spacing={1} sx={{ mt: 2, overflowX: 'auto', pb: 1 }}>
        {quickFilters.map(filter => (
          <Chip
            key={filter}
            label={filter}
            onClick={() => handleQuickFilter(filter)}
            color={filters.quick_filter === filter ? 'primary' : 'default'}
            variant={filters.quick_filter === filter ? 'filled' : 'outlined'}
            clickable
          />
        ))}
      </Stack>
    </Box>
  );
}
