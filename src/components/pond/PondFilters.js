/**
 * PondFilters Component
 * Filter controls for pond list.
 *
 * @module components/pond/PondFilters
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

import { POND_STATUS_OPTIONS } from '../../constants';

/**
 * PondFilters - Filter and search controls for pond list.
 *
 * @param {Object} props
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.onSearchChange - Search change handler
 * @param {string} props.statusFilter - Current status filter
 * @param {Function} props.onStatusChange - Status filter change handler
 * @param {Function} props.onAddNew - Add new pond handler
 */
export default function PondFilters({
  searchTerm = '',
  onSearchChange,
  statusFilter = 'all',
  onStatusChange,
  onAddNew,
}) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      sx={{ mb: 3 }}
    >
      <TextField
        placeholder="Search ponds..."
        size="small"
        value={searchTerm}
        onChange={(e) => onSearchChange?.(e.target.value)}
        sx={{ minWidth: 200, flex: 1, maxWidth: 400 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={statusFilter}
          label="Status"
          onChange={(e) => onStatusChange?.(e.target.value)}
        >
          <MenuItem value="all">All Status</MenuItem>
          {POND_STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {onAddNew && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddNew}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Add Pond
        </Button>
      )}
    </Stack>
  );
}

