/**
 * UserCard Component
 * Displays a single user with role, status, and actions.
 *
 * @module components/users/UserCard
 */

import React from 'react';
import {
  Paper,
  Typography,
  Stack,
  Chip,
  IconButton,
  Box,
  Avatar,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

import { getUserInitials, getUserDisplayName } from '../../utils/helpers/users';
import { USER_STATUS } from '../../constants';
import RoleChip from './RoleChip';

// ============================================================================
// Sub-components
// ============================================================================

function StatusIndicator({ status }) {
  const colors = {
    [USER_STATUS.ACTIVE]: 'success',
    [USER_STATUS.INACTIVE]: 'default',
    [USER_STATUS.PENDING]: 'warning',
  };

  const labels = {
    [USER_STATUS.ACTIVE]: 'Active',
    [USER_STATUS.INACTIVE]: 'Inactive',
    [USER_STATUS.PENDING]: 'Pending',
  };

  return (
    <Chip
      label={labels[status] || status}
      size="small"
      color={colors[status] || 'default'}
      variant="outlined"
    />
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * UserCard - A reusable user display card
 *
 * @param {Object} props
 * @param {Object} props.user - User object
 * @param {Function} props.onEdit - Edit callback
 * @param {Function} props.onDelete - Delete callback
 * @param {boolean} props.canEdit - Whether current user can edit this user
 * @param {boolean} props.compact - Compact view mode
 */
export default function UserCard({
  user,
  onEdit,
  onDelete,
  canEdit = true,
  compact = false,
}) {
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);
  const isInactive = user.status === USER_STATUS.INACTIVE;

  if (compact) {
    return (
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 2,
          backgroundColor: isInactive ? '#fafafa' : '#fff',
          opacity: isInactive ? 0.7 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          '&:hover': { boxShadow: 3 },
        }}
      >
        <Avatar sx={{ bgcolor: 'primary.main' }}>{initials}</Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }} noWrap>
            {displayName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user.email}
          </Typography>
        </Box>

        <RoleChip role={user.role} />
        <StatusIndicator status={user.status} />

        {canEdit && (
          <IconButton size="small" onClick={() => onEdit?.(user)}>
            <EditIcon fontSize="small" />
          </IconButton>
        )}
      </Paper>
    );
  }

  // Full card view
  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: isInactive ? '#fafafa' : '#fff',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
        opacity: isInactive ? 0.8 : 1,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          px: 2,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Avatar
          sx={{
            width: 56,
            height: 56,
            bgcolor: 'white',
            color: 'primary.main',
            fontSize: '1.25rem',
            fontWeight: 700,
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {displayName}
          </Typography>
          <RoleChip role={user.role} />
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={1}>
          {user.email && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <EmailIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" noWrap>
                {user.email}
              </Typography>
            </Stack>
          )}
          {user.phone && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <PhoneIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {user.phone}
              </Typography>
            </Stack>
          )}
          {user.department && (
            <Typography variant="body2" color="text.secondary">
              Department: {user.department}
            </Typography>
          )}
        </Stack>

        <Box sx={{ mt: 2 }}>
          <StatusIndicator status={user.status} />
        </Box>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Actions */}
        {canEdit && (
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit?.(user)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => onDelete?.(user)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Box>
    </Paper>
  );
}

