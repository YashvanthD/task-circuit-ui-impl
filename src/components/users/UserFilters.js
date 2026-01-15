/**
 * UserFilters Component
 * Filter controls for user list.
 *
 * @module components/users/UserFilters
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
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import { USER_ROLE_OPTIONS, USER_STATUS_OPTIONS } from '../../constants';

/**
 * UserFilters - Filter and search controls for user list.
 *
 * @param {Object} props
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.onSearchChange - Search change handler
 * @param {string} props.roleFilter - Current role filter
 * @param {Function} props.onRoleChange - Role filter change handler
 * @param {string} props.statusFilter - Current status filter
 * @param {Function} props.onStatusChange - Status filter change handler
 * @param {Function} props.onAddNew - Add new user handler
 */
export default function UserFilters({
  searchTerm = '',
  onSearchChange,
  roleFilter = 'all',
  onRoleChange,
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
        placeholder="Search users..."
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
        <InputLabel>Role</InputLabel>
        <Select
          value={roleFilter}
          label="Role"
          onChange={(e) => onRoleChange?.(e.target.value)}
        >
          <MenuItem value="all">All Roles</MenuItem>
          {USER_ROLE_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
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
          {USER_STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {onAddNew && (
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={onAddNew}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Add User
        </Button>
      )}
    </Stack>
  );
}

