import React from 'react';
import { Paper, Typography } from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import Profile from '../../components/Profile';

export default function SettingsPage() {
  const { user } = useOutletContext();
  return (
    <Paper sx={{ padding: 4, maxWidth: 600, margin: '40px auto' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Settings
      </Typography>
      <Profile user={user} />
    </Paper>
  );
}
