/**
 * FishList Component
 * Displays a list of fish with filtering and sorting capabilities.
 *
 * @module components/fish/FishList
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import SortIcon from '@mui/icons-material/Sort';

import FishCard from './FishCard';
import { LoadingState, EmptyState } from '../common';

// ============================================================================
// Main Component
// ============================================================================

/**
 * FishList - A list of fish cards with search and filter
 *
 * @param {Object} props
 * @param {Array} props.fish - Array of fish objects
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onEdit - Edit callback
 * @param {Function} props.onDelete - Delete callback
 * @param {Function} props.onClick - Click callback
 * @param {Function} props.onViewDetails - View details callback
 * @param {string} props.emptyMessage - Message to show when list is empty
 */
export default function FishList({
  fish = [],
  loading = false,
  onEdit,
  onDelete,
  onClick,
  onViewDetails,
  emptyMessage = 'No fish found',
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [compactView, setCompactView] = useState(false);

  // Filter and sort fish
  const filteredFish = useMemo(() => {
    let result = [...fish];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (f) =>
          (f.common_name || f.name || '').toLowerCase().includes(term) ||
          (f.scientific_name || '').toLowerCase().includes(term) ||
          (f.id || '').toString().toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((f) => (f.status || 'active').toLowerCase() === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.common_name || a.name || '').localeCompare(b.common_name || b.name || '');
        case 'count':
          return (b.count || 0) - (a.count || 0);
        case 'date':
          return new Date(b.capture_date || 0) - new Date(a.capture_date || 0);
        case 'scientific':
          return (a.scientific_name || '').localeCompare(b.scientific_name || '');
        default:
          return 0;
      }
    });

    return result;
  }, [fish, searchTerm, statusFilter, sortBy]);

  // Get unique statuses for filter
  const statuses = useMemo(() => {
    const unique = new Set(fish.map((f) => (f.status || 'active').toLowerCase()));
    return Array.from(unique);
  }, [fish]);

  if (loading) {
    return <LoadingState message="Loading fish..." />;
  }

  return (
    <Box>
      {/* Filters and Search Bar */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 3 }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
          <TextField
            size="small"
            placeholder="Search fish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
              startAdornment={<SortIcon sx={{ mr: 0.5, color: 'action.active' }} />}
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="scientific">Scientific Name</MenuItem>
              <MenuItem value="count">Count</MenuItem>
              <MenuItem value="date">Capture Date</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={`${filteredFish.length} fish`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Tooltip title={compactView ? 'Grid View' : 'List View'}>
            <IconButton
              size="small"
              onClick={() => setCompactView(!compactView)}
            >
              {compactView ? <ViewModuleIcon /> : <ViewListIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Fish Cards */}
      {filteredFish.length === 0 ? (
        <EmptyState
          message={searchTerm || statusFilter !== 'all' ? 'No fish match your filters' : emptyMessage}
          icon="🐟"
        />
      ) : (
        <Stack spacing={compactView ? 1 : 2}>
          {filteredFish.map((fishItem) => (
            <FishCard
              key={fishItem.id || fishItem._id || `${fishItem.common_name}-${fishItem.scientific_name}`}
              fish={fishItem}
              onEdit={onEdit}
              onDelete={onDelete}
              onClick={onClick ? () => onClick(fishItem) : undefined}
              onViewDetails={onViewDetails}
              compact={compactView}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

