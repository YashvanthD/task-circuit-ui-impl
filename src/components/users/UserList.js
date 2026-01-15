/**
 * UserList Component
 * Renders a grid/list of user cards.
 *
 * @module components/users/UserList
 */

import React from 'react';
import { Grid, Typography, CircularProgress, Stack } from '@mui/material';
import UserCard from './UserCard';

/**
 * UserList - Renders a list of users as cards.
 *
 * @param {Object} props
 * @param {Array} props.users - List of users
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onEdit - Edit user handler
 * @param {Function} props.onDelete - Delete user handler
 * @param {Object} props.currentUser - Current logged-in user (for permission checks)
 * @param {boolean} props.compact - Compact view mode
 */
export default function UserList({
  users = [],
  loading = false,
  onEdit,
  onDelete,
  currentUser,
  compact = false,
}) {
  if (loading) {
    return (
      <Stack alignItems="center" sx={{ py: 4 }}>
        <CircularProgress />
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Loading users...
        </Typography>
      </Stack>
    );
  }

  if (users.length === 0) {
    return (
      <Stack alignItems="center" sx={{ py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          👤
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No users found.
        </Typography>
      </Stack>
    );
  }

  if (compact) {
    return (
      <Stack spacing={2}>
        {users.map((user) => (
          <UserCard
            key={user.user_id || user.user_key || user.id}
            user={user}
            onEdit={onEdit}
            onDelete={onDelete}
            currentUser={currentUser}
            compact
          />
        ))}
      </Stack>
    );
  }

  return (
    <Grid container spacing={3}>
      {users.map((user) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={user.user_id || user.user_key || user.id}>
          <UserCard
            user={user}
            onEdit={onEdit}
            onDelete={onDelete}
            currentUser={currentUser}
          />
        </Grid>
      ))}
    </Grid>
  );
}

