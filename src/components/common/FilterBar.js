/**
 * FilterBar Component
 * Reusable filter bar with search, filters, and actions.
 *
 * @module components/common/FilterBar
 */

import React from 'react';
import { Stack, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchInput from './SearchInput';
import FilterSelect from './FilterSelect';
import DateRangeFilter from './DateRangeFilter';
import ActionButton from './ActionButton';

/**
 * FilterBar - Reusable filter bar
 *
 * @param {Object} props
 * @param {string} props.searchTerm - Search term
 * @param {Function} props.onSearchChange - Search change handler
 * @param {string} props.searchPlaceholder - Search placeholder
 * @param {Array} props.filters - Filter configs [{ name, label, value, options, onChange }]
 * @param {Object} props.dateRange - Date range { start, end, onStartChange, onEndChange }
 * @param {Function} props.onAddNew - Add new handler
 * @param {string} props.addLabel - Add button label
 * @param {Function} props.onRefresh - Refresh handler
 * @param {boolean} props.loading - Loading state
 * @param {React.ReactNode} props.extraActions - Extra action buttons
 * @param {Object} props.sx - Additional sx styles
 */
export default function FilterBar({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  dateRange,
  onAddNew,
  addLabel = 'Add New',
  onRefresh,
  loading = false,
  extraActions,
  sx = {},
}) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      alignItems={{ xs: 'stretch', md: 'center' }}
      flexWrap="wrap"
      sx={{ mb: 3, ...sx }}
    >
      {/* Search */}
      {onSearchChange && (
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
      )}

      {/* Filters */}
      {filters.map((filter) => (
        <FilterSelect
          key={filter.name}
          label={filter.label}
          value={filter.value}
          onChange={filter.onChange}
          options={filter.options}
          showAll={filter.showAll !== false}
        />
      ))}

      {/* Date Range */}
      {dateRange && (
        <DateRangeFilter
          startDate={dateRange.start}
          onStartChange={dateRange.onStartChange}
          endDate={dateRange.end}
          onEndChange={dateRange.onEndChange}
        />
      )}

      {/* Spacer for desktop */}
      <Stack direction="row" spacing={1} sx={{ ml: { md: 'auto' } }}>
        {/* Refresh */}
        {onRefresh && (
          <ActionButton
            icon={<RefreshIcon />}
            onClick={onRefresh}
            variant="outlined"
            color="inherit"
            loading={loading}
            tooltip="Refresh"
            iconOnly
          />
        )}

        {/* Extra Actions */}
        {extraActions}

        {/* Add New */}
        {onAddNew && (
          <ActionButton
            icon={<AddIcon />}
            onClick={onAddNew}
            variant="contained"
          >
            {addLabel}
          </ActionButton>
        )}
      </Stack>
    </Stack>
  );
}

