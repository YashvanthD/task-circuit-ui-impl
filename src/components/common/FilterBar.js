/**
 * FilterBar Component
 * Centralized, reusable filter bar with search, filters, and actions
 * Theme-aware, responsive, and follows MUI best practices
 *
 * @module components/common/FilterBar
 */

import React from 'react';
import { Stack, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchInput from './SearchInput';
import FilterSelect from './FilterSelect';
import DateRangeFilter from './DateRangeFilter';
import ActionButton from './ActionButton';

/**
 * FilterBar - Reusable filter bar with best practices
 *
 * @param {Object} props
 * @param {string} props.searchTerm - Search term
 * @param {Function} props.onSearchChange - Search change handler
 * @param {string} props.searchPlaceholder - Search placeholder (default: "Search...")
 * @param {Array} props.filters - Filter configs [{ name, label, value, options, onChange }]
 * @param {Object} props.dateRange - Date range { start, end, onStartChange, onEndChange }
 * @param {Function} props.onAddNew - Add new handler
 * @param {string} props.addLabel - Add button label (default: "Add New")
 * @param {React.ReactNode} props.addIcon - Custom add icon
 * @param {Function} props.onRefresh - Refresh handler
 * @param {boolean} props.loading - Loading state
 * @param {React.ReactNode} props.extraActions - Extra action buttons
 * @param {boolean} props.showDivider - Show divider below bar (default: false)
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
  addIcon,
  onRefresh,
  loading = false,
  extraActions,
  showDivider = false,
  sx = {},
}) {
  return (
    <Box
      sx={{
        mb: 3,
        pb: showDivider ? 2 : 0,
        borderBottom: showDivider ? '1px solid' : 'none',
        borderColor: 'divider',
        ...sx,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        flexWrap="wrap"
      >
        {/* Left side: Search and Filters */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          sx={{ flex: 1, minWidth: 0 }}
        >
          {/* Search */}
          {onSearchChange && (
            <SearchInput
              value={searchTerm}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              fullWidth={false}
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
              allLabel={filter.allLabel}
              size="small"
            />
          ))}

          {/* Date Range */}
          {dateRange && (
            <DateRangeFilter
              startDate={dateRange.start}
              onStartChange={dateRange.onStartChange}
              endDate={dateRange.end}
              onEndChange={dateRange.onEndChange}
              size="small"
            />
          )}
        </Stack>

        {/* Right side: Actions */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ flexShrink: 0 }}
        >
          {/* Refresh Button */}
          {onRefresh && (
            <ActionButton
              icon={<RefreshIcon />}
              onClick={onRefresh}
              variant="outlined"
              tooltip="Refresh"
              loading={loading}
              iconOnly
            />
          )}

          {/* Extra Actions */}
          {extraActions}

          {/* Add New Button */}
          {onAddNew && (
            <ActionButton
              icon={addIcon || <AddIcon />}
              onClick={onAddNew}
              variant="contained"
              color="primary"
            >
              {addLabel}
            </ActionButton>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

