/**
 * ExpenseFilters Component
 * Filter controls for expense list.
 *
 * @module components/expenses/ExpenseFilters
 */

import React from 'react';
import {
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

import { EXPENSE_CATEGORY_OPTIONS, EXPENSE_STATUS_OPTIONS } from '../../constants';

/**
 * ExpenseFilters - Filter and search controls for expense list.
 *
 * @param {Object} props
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.onSearchChange - Search change handler
 * @param {string} props.categoryFilter - Current category filter
 * @param {Function} props.onCategoryChange - Category filter change handler
 * @param {string} props.statusFilter - Current status filter
 * @param {Function} props.onStatusChange - Status filter change handler
 * @param {string} props.startDate - Start date filter
 * @param {Function} props.onStartDateChange - Start date change handler
 * @param {string} props.endDate - End date filter
 * @param {Function} props.onEndDateChange - End date change handler
 * @param {Function} props.onAddNew - Add new expense handler
 */
export default function ExpenseFilters({
  searchTerm = '',
  onSearchChange,
  categoryFilter = 'all',
  onCategoryChange,
  statusFilter = 'all',
  onStatusChange,
  startDate = '',
  onStartDateChange,
  endDate = '',
  onEndDateChange,
  onAddNew,
}) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      alignItems={{ xs: 'stretch', md: 'center' }}
      flexWrap="wrap"
      sx={{ mb: 3 }}
    >
      <TextField
        placeholder="Search expenses..."
        size="small"
        value={searchTerm}
        onChange={(e) => onSearchChange?.(e.target.value)}
        sx={{ minWidth: 200, flex: 1, maxWidth: 300 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <FormControl size="small" sx={{ minWidth: 130 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={categoryFilter}
          label="Category"
          onChange={(e) => onCategoryChange?.(e.target.value)}
        >
          <MenuItem value="all">All Categories</MenuItem>
          {EXPENSE_CATEGORY_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.icon} {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 130 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={statusFilter}
          label="Status"
          onChange={(e) => onStatusChange?.(e.target.value)}
        >
          <MenuItem value="all">All Status</MenuItem>
          {EXPENSE_STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="From"
        type="date"
        size="small"
        value={startDate}
        onChange={(e) => onStartDateChange?.(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ width: 140 }}
      />

      <TextField
        label="To"
        type="date"
        size="small"
        value={endDate}
        onChange={(e) => onEndDateChange?.(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ width: 140 }}
      />

      {onAddNew && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddNew}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Add Expense
        </Button>
      )}
    </Stack>
  );
}

