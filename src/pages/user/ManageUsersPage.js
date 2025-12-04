import React from 'react';
import { Paper, Typography } from '@mui/material';

export default function ManageUsersPage() {
  return (
    <Paper sx={{ padding: 4, maxWidth: 1000, margin: '40px auto' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Manage Users
      </Typography>
      <Typography variant="body1">
        This is the Manage Users page. Add your user management features here.
      </Typography>
    </Paper>
  );
}

